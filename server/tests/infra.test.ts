import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { createApp } from "@/app";
import { parseBool, parseNumber } from "@/config";
import { openApiDocument, placeholderEndpoints } from "@/docs/swagger";
import { errorHandler, notFoundHandler } from "@/middlewares/error";
import { extractToken, protect, requireRole } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { User, hashPassword, verifyPasswordHash } from "@/models/User.model";
import { createApiRouter } from "@/routes";
import { createAuthRouter } from "@/routes/auth.routes";
import { ApiError, ErrorCode } from "@/utils/ApiError";
import { clearRevokedTokens, isRevoked, revokeToken, signToken, verifyToken } from "@/utils/jwt";
import { sendCreated, sendNoContent, sendOk } from "@/utils/respond";
import { setupTestDB, teardownTestDB } from "./helpers/db";

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

function mockRes() {
  const state: { statusCode?: number; body?: unknown; sent?: unknown } = {};
  const res = {
    status(code: number) {
      state.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      state.body = payload;
      return res;
    },
    send(payload?: unknown) {
      state.sent = payload;
      return res;
    },
    state,
  };
  return res;
}

const req = (extra: Record<string, unknown> = {}) =>
  ({ headers: {}, ...extra }) as unknown as Request;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop: NextFunction = () => {};

describe("I1 ApiError 工厂", () => {
  it("各工厂返回正确的 HTTP 状态与业务码", () => {
    expect([ApiError.badRequest().httpStatus, ApiError.badRequest().code]).toEqual([400, ErrorCode.VALIDATION]);
    expect([ApiError.unauthorized().httpStatus, ApiError.unauthorized().code]).toEqual([401, ErrorCode.UNAUTHORIZED]);
    expect([ApiError.forbidden().httpStatus, ApiError.forbidden().code]).toEqual([403, ErrorCode.FORBIDDEN]);
    expect([ApiError.notFound().httpStatus, ApiError.notFound().code]).toEqual([404, ErrorCode.NOT_FOUND]);
    expect([ApiError.conflict().httpStatus, ApiError.conflict().code]).toEqual([409, ErrorCode.CONFLICT]);
    expect([ApiError.tooManyRequests().httpStatus, ApiError.tooManyRequests().code]).toEqual([429, ErrorCode.TOO_MANY_REQUESTS]);
    expect([ApiError.internal().httpStatus, ApiError.internal().code]).toEqual([500, ErrorCode.INTERNAL]);
    expect([ApiError.notImplemented().httpStatus, ApiError.notImplemented().code]).toEqual([501, ErrorCode.NOT_IMPLEMENTED]);
  });

  it("支持携带字段级错误与 details", () => {
    const error = new ApiError(400, ErrorCode.VALIDATION, "参数校验失败", {
      errors: [{ path: "title", message: "必填" }],
      details: { field: "title" },
    });
    expect(error.errors).toEqual([{ path: "title", message: "必填" }]);
    expect(error.details).toEqual({ field: "title" });
    expect(error.name).toBe("ApiError");
  });
});

describe("I2 响应封装", () => {
  it("sendOk 输出统一信封", () => {
    const res = mockRes();
    sendOk(res as unknown as Response, { id: 1 });
    expect(res.state.statusCode).toBe(200);
    expect(res.state.body).toEqual({ code: 0, message: "ok", data: { id: 1 } });
  });

  it("sendOk 支持自定义状态与消息", () => {
    const res = mockRes();
    sendOk(res as unknown as Response, null, { status: 202, message: "accepted" });
    expect(res.state.statusCode).toBe(202);
    expect(res.state.body).toEqual({ code: 0, message: "accepted", data: null });
  });

  it("sendCreated / sendNoContent", () => {
    const created = mockRes();
    sendCreated(created as unknown as Response, { id: "x" });
    expect(created.state.statusCode).toBe(201);

    const empty = mockRes();
    sendNoContent(empty as unknown as Response);
    expect(empty.state.statusCode).toBe(204);
  });
});

describe("I3 全局错误处理", () => {
  it("ZodError → 400 / 4000，展开 issues", () => {
    const zodError = z.object({ title: z.string() }).safeParse({}).error!;
    const res = mockRes();
    errorHandler(zodError, req(), res as unknown as Response, noop);

    expect(res.state.statusCode).toBe(400);
    expect(res.state.body).toMatchObject({ code: 4000 });
    expect((res.state.body as { errors: unknown[] }).errors[0]).toEqual({
      path: "title",
      message: "Required",
    });
  });

  it("ApiError → 对应状态码，并带 errors", () => {
    const res = mockRes();
    errorHandler(
      ApiError.badRequest("参数校验失败", [{ path: "a", message: "b" }]),
      req(),
      res as unknown as Response,
      noop,
    );
    expect(res.state.statusCode).toBe(400);
    expect(res.state.body).toEqual({
      code: 4000,
      message: "参数校验失败",
      errors: [{ path: "a", message: "b" }],
    });
  });

  it("ApiError.details 在非生产环境返回", () => {
    const res = mockRes();
    errorHandler(
      new ApiError(400, ErrorCode.VALIDATION, "x", { details: { hint: 1 } }),
      req(),
      res as unknown as Response,
      noop,
    );
    expect(res.state.body).toMatchObject({ details: { hint: 1 } });
  });

  it("Mongo 唯一键冲突（11000）→ 409 / 4090", () => {
    const dup = Object.assign(new Error("duplicate"), { code: 11000, keyValue: { id: "case-001" } });
    const res = mockRes();
    errorHandler(dup, req(), res as unknown as Response, noop);
    expect(res.state.statusCode).toBe(409);
    expect(res.state.body).toMatchObject({ code: 4090, details: { id: "case-001" } });
  });

  it("未知错误 → 500 / 5000", () => {
    const res = mockRes();
    errorHandler(new Error("boom"), req(), res as unknown as Response, noop);
    expect(res.state.statusCode).toBe(500);
    expect(res.state.body).toEqual({ code: 5000, message: "boom" });
  });

  it("非 Error 抛出物 → 500 且使用默认文案", () => {
    const res = mockRes();
    errorHandler("oops", req(), res as unknown as Response, noop);
    expect(res.state.body).toEqual({ code: 5000, message: "服务器内部错误" });
  });

  it("notFoundHandler → 404 ApiError", () => {
    let captured: unknown;
    const next: NextFunction = (err) => {
      captured = err;
    };
    notFoundHandler(req({ method: "GET", originalUrl: "/nope" }) as Request, mockRes() as unknown as Response, next);
    expect(captured).toBeInstanceOf(ApiError);
    expect((captured as ApiError).code).toBe(ErrorCode.NOT_FOUND);
    expect((captured as ApiError).message).toContain("GET /nope");
  });
});

describe("I4 validate 中间件", () => {
  const schema = z.object({ name: z.string() });

  it("body 校验通过后用解析结果覆盖", () => {
    const request = req({ body: { name: "a", extra: 1 } });
    let called = false;
    validate({ body: schema })(request, mockRes() as unknown as Response, () => {
      called = true;
    });
    expect(called).toBe(true);
    expect(request.body).toEqual({ name: "a" });
  });

  it("query 校验通过后覆盖 req.query", () => {
    const request = req({ query: { name: "q" } });
    validate({ query: schema })(request, mockRes() as unknown as Response, noop);
    expect(request.query).toEqual({ name: "q" });
  });

  it("params 校验通过后覆盖 req.params", () => {
    const request = req({ params: { name: "p" } });
    validate({ params: schema })(request, mockRes() as unknown as Response, noop);
    expect(request.params).toEqual({ name: "p" });
  });

  it("校验失败 → next(ApiError 400/4000)，errors 含 path", () => {
    let captured: unknown;
    const next: NextFunction = (err) => {
      captured = err;
    };
    validate({ body: schema })(req({ body: {} }), mockRes() as unknown as Response, next);
    const error = captured as ApiError;
    expect(error.httpStatus).toBe(400);
    expect(error.code).toBe(ErrorCode.VALIDATION);
    expect(error.errors?.[0]).toEqual({ path: "name", message: "该字段必填" });
  });

  it("字段类型错误 → 中文提示；服务端托管字段被剔除（strict schema）", () => {
    const strict = z.object({ name: z.string() }).strict();
    let captured: unknown;
    const next: NextFunction = (err) => {
      captured = err;
    };
    validate({ body: strict })(req({ body: { name: 123 } }), mockRes() as unknown as Response, next);
    const error = captured as ApiError;
    expect(error.httpStatus).toBe(400);
    expect(error.errors?.[0]?.message).toBe("字段类型或格式不正确");

    const okBody = req({
      body: { name: "x", _id: "1", __v: 0, key: "default", createdAt: 1, updatedAt: 2 },
    });
    validate({ body: strict })(okBody, mockRes() as unknown as Response, noop);
    expect(okBody.body).toEqual({ name: "x" });

    // 未知业务字段仍应报错
    let unknownKey: unknown;
    validate({ body: strict })(
      req({ body: { name: "x", hacker: 1 } }),
      mockRes() as unknown as Response,
      (err) => {
        unknownKey = err;
      },
    );
    expect((unknownKey as ApiError).httpStatus).toBe(400);
  });
});

describe("I5 鉴权中间件", () => {
  const validToken = () =>
    signToken({ id: "64b000000000000000000001", username: "admin", role: "admin" });

  it("extractToken：Bearer / Cookie / 空值", () => {
    expect(extractToken(req({ headers: { authorization: "Bearer abc" } }))).toBe("abc");
    expect(extractToken(req({ headers: { authorization: "Bearer " } }))).toBeNull();
    expect(extractToken(req({ headers: { authorization: "Basic x" } }))).toBeNull();
    expect(extractToken(req({ headers: {}, cookies: { access_token: "cookie-token" } }))).toBe("cookie-token");
    expect(extractToken(req())).toBeNull();
  });

  it("protect：无 Token → 401 / 4010", () => {
    let captured: unknown;
    protect(req(), mockRes() as unknown as Response, (err) => {
      captured = err;
    });
    expect((captured as ApiError).code).toBe(ErrorCode.UNAUTHORIZED);
  });

  it("protect：有效 Token → 写入 req.user 并放行", () => {
    clearRevokedTokens();
    const request = req({ headers: { authorization: `Bearer ${validToken()}` } });
    let called = false;
    protect(request, mockRes() as unknown as Response, () => {
      called = true;
    });
    expect(called).toBe(true);
    expect(request.user).toMatchObject({ username: "admin", role: "admin" });
  });

  it("protect：已登出的 Token → 401", () => {
    const token = validToken();
    revokeToken(verifyToken(token).jti);
    let captured: unknown;
    protect(req({ headers: { authorization: `Bearer ${token}` } }), mockRes() as unknown as Response, (err) => {
      captured = err;
    });
    expect((captured as ApiError).code).toBe(ErrorCode.UNAUTHORIZED);
    clearRevokedTokens();
  });

  it("protect：非法 Token → 401", () => {
    let captured: unknown;
    protect(req({ headers: { authorization: "Bearer bad" } }), mockRes() as unknown as Response, (err) => {
      captured = err;
    });
    expect((captured as ApiError).code).toBe(ErrorCode.UNAUTHORIZED);
  });

  it("requireRole：未登录 401 / 角色不符 403 / 匹配放行", () => {
    let unauth: unknown;
    requireRole("admin")(req(), mockRes() as unknown as Response, (err) => {
      unauth = err;
    });
    expect((unauth as ApiError).code).toBe(ErrorCode.UNAUTHORIZED);

    let forbidden: unknown;
    requireRole("admin")(req({ user: { id: "1", username: "e", role: "editor" } }), mockRes() as unknown as Response, (err) => {
      forbidden = err;
    });
    expect((forbidden as ApiError).code).toBe(ErrorCode.FORBIDDEN);

    let ok = false;
    requireRole("admin", "editor")(req({ user: { id: "1", username: "e", role: "editor" } }), mockRes() as unknown as Response, () => {
      ok = true;
    });
    expect(ok).toBe(true);
  });
});

describe("I6 JWT 工具", () => {
  it("签发 / 校验往返一致", () => {
    const token = signToken({ id: "1", username: "admin", role: "admin" }, "5m");
    const payload = verifyToken(token);
    expect(payload).toMatchObject({ id: "1", username: "admin", role: "admin" });
    expect(payload.jti).toBeTruthy();
  });

  it("过期 Token → 提示 Token 已过期", () => {
    const token = signToken({ id: "1", username: "admin", role: "admin" }, "-1s");
    expect(() => verifyToken(token)).toThrow("Token 已过期");
  });

  it("非法 Token → 登录凭证无效", () => {
    expect(() => verifyToken("not-a-token")).toThrow("登录凭证无效");
  });

  it("黑名单：撤销命中、空 jti 忽略、过期自动清理", () => {
    clearRevokedTokens();
    revokeToken("jti-1", Math.floor(Date.now() / 1000) + 60);
    expect(isRevoked("jti-1")).toBe(true);
    expect(isRevoked("jti-2")).toBe(false);

    revokeToken("", undefined);
    expect(isRevoked("")).toBe(false);

    revokeToken("jti-old", Math.floor(Date.now() / 1000) - 10);
    expect(isRevoked("jti-old")).toBe(false);
    clearRevokedTokens();
  });
});

describe("I7 User 模型", () => {
  it("hashPassword / verifyPasswordHash", async () => {
    const hash = await hashPassword("secret");
    expect(hash).not.toBe("secret");
    await expect(verifyPasswordHash("secret", hash)).resolves.toBe(true);
    await expect(verifyPasswordHash("wrong", hash)).resolves.toBe(false);
  });

  it("实例 comparePassword 与 toJSON 脱敏", async () => {
    const hash = await hashPassword("secret");
    const user = await User.create({ username: "tester", passwordHash: hash, role: "editor" });

    await expect(user.comparePassword("secret")).resolves.toBe(true);
    await expect(user.comparePassword("nope")).resolves.toBe(false);

    const json = user.toJSON() as Record<string, unknown>;
    expect(json.id).toBeTruthy();
    expect(json.passwordHash).toBeUndefined();
    expect(json._id).toBeUndefined();
  });
});

describe("I8 环境变量解析与路由工厂", () => {
  it("parseNumber：合法值转换、非法/缺失回退", () => {
    expect(parseNumber("3000", 4000)).toBe(3000);
    expect(parseNumber("abc", 4000)).toBe(4000);
    expect(parseNumber(undefined, 4000)).toBe(4000);
  });

  it("parseBool：true/1/yes 为真，其余为假，缺失用回退", () => {
    expect(parseBool("true", false)).toBe(true);
    expect(parseBool("1", false)).toBe(true);
    expect(parseBool("yes", false)).toBe(true);
    expect(parseBool("false", true)).toBe(false);
    expect(parseBool("0", true)).toBe(false);
    expect(parseBool(undefined, true)).toBe(true);
  });

  it("createAuthRouter：不传限流器也能正常创建", () => {
    expect(createAuthRouter()).toBeTruthy();
  });

  it("createApiRouter：默认参数可用，Swagger 文档生成正常", () => {
    expect(createApiRouter()).toBeTruthy();
    const specs = placeholderEndpoints();
    // Stage 4 完成后不应再有未实现的占位接口
    expect(specs.length).toBe(0);

    const documentedPaths = Object.keys(openApiDocument.paths);
    const distinctSpecPaths = [...new Set(specs.map((e) => e.path))];
    expect(documentedPaths).toEqual(expect.arrayContaining(distinctSpecPaths));
    // 认证 / 设置 / 健康检查等非骨架接口也必须在文档中
    expect(documentedPaths).toEqual(
      expect.arrayContaining(["/auth/login", "/auth/me", "/auth/logout", "/settings/theme", "/health"]),
    );
  });

  it("createApp：可通过参数覆盖登录限流阈值", () => {
    expect(createApp({ loginRateMax: 3, loginRateWindowMinutes: 1 })).toBeTruthy();
  });
});
