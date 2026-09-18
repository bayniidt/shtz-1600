import type { Express } from "express";
import request from "supertest";

import { createApp } from "@/app";
import { CaseItem } from "@/models/CaseItem.model";
import { CasesPageContent } from "@/models/CasesPageContent.model";
import { bearer, loginAsAdmin, resetTestDB, seedFixtureContent, setupTestDB, teardownTestDB } from "./helpers/db";

const LIST = "/api/v1/cases";
const PAGE = "/api/v1/cases/page";

let app: Express;
let token: string;

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await resetTestDB();
  app = createApp();
  token = await loginAsAdmin(app);
});

/** 一份满足 Zod 校验的完整案例载荷。 */
function casePayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "case-100",
    title: "测试案例",
    client: "测试客户",
    industry: "game",
    region: "日本",
    summary: "测试简介",
    cover: "/images/case-100.png",
    awards: ["年度大奖"],
    tags: ["日本", "游戏"],
    year: "2024",
    featured: false,
    stats: [{ value: "320", unit: "%", label: "ROI 提升" }],
    blocks: [
      { key: "background", title: "项目背景", body: ["正文段落"], points: ["要点一"] },
    ],
    ...overrides,
  };
}

describe("GET /cases/page —— 读取案例列表页文案", () => {
  it("T1 正常：返回文案且不暴露内部字段", async () => {
    await seedFixtureContent();
    const res = await request(app).get(PAGE);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(0);
    expect(res.body.data.title).toBe("海外营销成功案例");
    expect(res.body.data.filters).toHaveLength(2);
    expect(res.body.data._id).toBeUndefined();
    expect(res.body.data.key).toBeUndefined();
    expect(res.body.data.updatedAt).toBeDefined();
  });

  it("T2 异常：未初始化返回 404 / 4040 并提示 seed", async () => {
    const res = await request(app).get(PAGE);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe(4040);
    expect(res.body.message).toContain("seed");
  });
});

describe("PUT /cases/page —— 更新案例列表页文案", () => {
  it("T3 正常：保存后 GET 能读到新值", async () => {
    await seedFixtureContent();
    const res = await request(app)
      .put(PAGE)
      .set(bearer(token))
      .send({
        title: "新的案例页标题",
        subtitle: "副标题",
        filters: [
          { key: "all", label: "全部" },
          { key: "app", label: "APP" },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("案例列表页文案已保存");
    expect(res.body.data.title).toBe("新的案例页标题");

    const after = await request(app).get(PAGE);
    expect(after.body.data.filters[1]).toEqual({ key: "app", label: "APP" });
  });

  it("T4 异常：未登录返回 401 / 4010", async () => {
    const res = await request(app).put(PAGE).send({ title: "x", subtitle: "", filters: [] });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe(4010);
  });

  it("T5 异常：未知字段被拒绝（strict）", async () => {
    const res = await request(app)
      .put(PAGE)
      .set(bearer(token))
      .send({ title: "t", subtitle: "s", filters: [], hacker: 1 });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe(4000);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ message: expect.stringContaining("hacker") })]),
    );
  });

  it("T6 异常：筛选项 key 非法返回 400", async () => {
    const res = await request(app)
      .put(PAGE)
      .set(bearer(token))
      .send({ title: "t", subtitle: "s", filters: [{ key: "music", label: "音乐" }] });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "filters.0.key" })]),
    );
  });
});

describe("POST /cases —— 新建案例", () => {
  it("T7 正常：创建成功（201）且 GET 一致", async () => {
    const res = await request(app).post(LIST).set(bearer(token)).send(casePayload());

    expect(res.status).toBe(201);
    expect(res.body.code).toBe(0);
    expect(res.body.message).toBe("案例已创建");
    expect(res.body.data.id).toBe("case-100");
    expect(res.body.data.featured).toBe(false);
    expect(res.body.data._id).toBeUndefined();

    const after = await request(app).get(`${LIST}/case-100`);
    expect(after.status).toBe(200);
    expect(after.body.data.blocks[0].body).toEqual(["正文段落"]);
  });

  it("T8 正常：三态 featured（\"yes\"）归一化为布尔 true", async () => {
    const res = await request(app)
      .post(LIST)
      .set(bearer(token))
      .send(casePayload({ featured: "yes" }));

    expect(res.status).toBe(201);
    expect(res.body.data.featured).toBe(true);
  });

  it("T9 异常：id 重复返回 409 / 4090", async () => {
    await seedFixtureContent();
    const res = await request(app)
      .post(LIST)
      .set(bearer(token))
      .send(casePayload({ id: "case-001" }));

    expect(res.status).toBe(409);
    expect(res.body.code).toBe(4090);
  });

  it("T10 异常：industry 非法返回 400", async () => {
    const res = await request(app)
      .post(LIST)
      .set(bearer(token))
      .send(casePayload({ industry: "music" }));

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "industry" })]),
    );
  });

  it("T11 异常：未登录返回 401 / 4010", async () => {
    const res = await request(app).post(LIST).send(casePayload());
    expect(res.status).toBe(401);
    expect(res.body.code).toBe(4010);
  });

  it("T12 异常：缺少必填字段（title / client）返回 400", async () => {
    const { title, client, ...rest } = casePayload();
    void title;
    void client;
    const res = await request(app).post(LIST).set(bearer(token)).send(rest);

    expect(res.status).toBe(400);
    const paths = (res.body.errors as { path: string }[]).map((e) => e.path);
    expect(paths).toEqual(expect.arrayContaining(["title", "client"]));
  });

  it("T13 异常：未知字段被拒绝（strict）", async () => {
    const res = await request(app)
      .post(LIST)
      .set(bearer(token))
      .send(casePayload({ extra: "x" }));

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ message: expect.stringContaining("extra") })]),
    );
  });

  it("T14 边界：stats 为空、blocks 100 项均可保存", async () => {
    const blocks = Array.from({ length: 100 }, (_, index) => ({
      key: `block-${index}`,
      title: `板块 ${index}`,
      body: ["正文"],
    }));

    const res = await request(app)
      .post(LIST)
      .set(bearer(token))
      .send(casePayload({ stats: [], blocks }));

    expect(res.status).toBe(201);
    expect(res.body.data.stats).toEqual([]);
    expect(res.body.data.blocks).toHaveLength(100);

    const tooMany = await request(app)
      .post(LIST)
      .set(bearer(token))
      .send(casePayload({ id: "case-101", blocks: [...blocks, { key: "extra", title: "x", body: [] }] }));
    expect(tooMany.status).toBe(400);
  });

  it("T15 边界：cover 超过 2000 字符返回 400", async () => {
    const res = await request(app)
      .post(LIST)
      .set(bearer(token))
      .send(casePayload({ cover: `/${"a".repeat(2001)}` }));

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "cover" })]),
    );
  });
});

describe("GET /cases —— 列表分页 / 筛选 / 搜索", () => {
  beforeEach(async () => {
    await seedFixtureContent();
  });

  it("T16 正常：默认分页返回全部并带 total", async () => {
    const res = await request(app).get(LIST);

    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(2);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.pageSize).toBe(10);
    expect(res.body.data.items).toHaveLength(2);
  });

  it("T17 正常：置顶优先 + 最近更新倒序", async () => {
    await request(app).post(LIST).set(bearer(token)).send(casePayload({ id: "case-003" }));

    const res = await request(app).get(LIST);
    // case-001 featured=true 排最前；其余按 updatedAt 倒序（case-003 最新）
    expect(res.body.data.items.map((item: { id: string }) => item.id)).toEqual([
      "case-001",
      "case-003",
      "case-002",
    ]);
  });

  it("T18 正常：分页 page=2&pageSize=1 返回第 2 条", async () => {
    const res = await request(app).get(LIST).query({ page: 2, pageSize: 1 });

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].id).toBe("case-002");
  });

  it("T19 正常：industry=game 只返回游戏行业", async () => {
    const res = await request(app).get(LIST).query({ industry: "game" });
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].industry).toBe("game");
  });

  it("T20 正常：industry=all 不做过滤", async () => {
    const res = await request(app).get(LIST).query({ industry: "all" });
    expect(res.body.data.total).toBe(2);
  });

  it("T21 正常：keyword 模糊匹配 title / client / summary", async () => {
    const byTitle = await request(app).get(LIST).query({ keyword: "长线买量" });
    expect(byTitle.body.data.items).toHaveLength(1);

    const byClient = await request(app).get(LIST).query({ keyword: "测试电商" });
    expect(byClient.body.data.items[0].id).toBe("case-002");

    const bySummary = await request(app).get(LIST).query({ keyword: "工业化" });
    expect(bySummary.body.data.items[0].id).toBe("case-001");
  });

  it("T22 正常：featured=true 只返回置顶案例", async () => {
    const res = await request(app).get(LIST).query({ featured: "true" });
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].featured).toBe(true);
  });

  it("T23 边界：空字符串筛选视为未提供；pageSize 超限返回 400", async () => {
    const empty = await request(app).get(LIST).query({ industry: "", keyword: "", featured: "" });
    expect(empty.status).toBe(200);
    expect(empty.body.data.total).toBe(2);

    const tooLarge = await request(app).get(LIST).query({ pageSize: 101 });
    expect(tooLarge.status).toBe(400);
    expect(tooLarge.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "pageSize" })]),
    );
  });
});

describe("GET /cases/:id —— 案例详情", () => {
  it("T24 正常：按业务 id 返回详情", async () => {
    await seedFixtureContent();
    const res = await request(app).get(`${LIST}/case-002`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe("case-002");
    expect(res.body.data.client).toBe("测试电商");
    expect(res.body.data.__v).toBeUndefined();
  });

  it("T25 异常：不存在返回 404 / 4040", async () => {
    const res = await request(app).get(`${LIST}/not-exist`);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe(4040);
  });
});

describe("PUT /cases/:id —— 编辑案例", () => {
  it("T26 正常：保存后 GET 读到新标题", async () => {
    await seedFixtureContent();
    const before = await request(app).get(`${LIST}/case-002`);

    const res = await request(app)
      .put(`${LIST}/case-002`)
      .set(bearer(token))
      .send({ ...before.body.data, title: "改后的标题" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("案例已保存");

    const after = await request(app).get(`${LIST}/case-002`);
    expect(after.body.data.title).toBe("改后的标题");
  });

  it("T27 正常：GET → PUT 回环幂等（服务端托管字段被剥离）", async () => {
    await seedFixtureContent();
    const before = await request(app).get(`${LIST}/case-001`);

    const res = await request(app)
      .put(`${LIST}/case-001`)
      .set(bearer(token))
      .send(before.body.data);

    expect(res.status).toBe(200);
    expect(res.body.data.blocks).toEqual(before.body.data.blocks);
    expect(await CaseItem.countDocuments({ id: "case-001" })).toBe(1);
  });

  it("T28 异常：修改 id 返回 400 且提示 id 不可修改", async () => {
    await seedFixtureContent();
    const res = await request(app)
      .put(`${LIST}/case-001`)
      .set(bearer(token))
      .send(casePayload({ id: "case-999" }));

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("id 不可修改");
  });

  it("T29 异常：不存在的 id 返回 404", async () => {
    const res = await request(app)
      .put(`${LIST}/nope`)
      .set(bearer(token))
      .send(casePayload({ id: "nope" }));

    expect(res.status).toBe(404);
    expect(res.body.code).toBe(4040);
  });

  it("T30 异常：未登录返回 401", async () => {
    const res = await request(app).put(`${LIST}/case-001`).send(casePayload({ id: "case-001" }));
    expect(res.status).toBe(401);
    expect(res.body.code).toBe(4010);
  });
});

describe("DELETE /cases/:id —— 删除案例", () => {
  it("T31 正常：删除后详情返回 404，总数减少", async () => {
    await seedFixtureContent();
    const res = await request(app).delete(`${LIST}/case-002`).set(bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ id: "case-002", success: true });

    const after = await request(app).get(`${LIST}/case-002`);
    expect(after.status).toBe(404);

    const list = await request(app).get(LIST);
    expect(list.body.data.total).toBe(1);
  });

  it("T32 异常：删除不存在返回 404", async () => {
    const res = await request(app).delete(`${LIST}/nope`).set(bearer(token));
    expect(res.status).toBe(404);
    expect(res.body.code).toBe(4040);
  });

  it("T33 异常：未登录返回 401", async () => {
    const res = await request(app).delete(`${LIST}/case-001`);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe(4010);
  });
});

describe("POST /cases/:id/featured —— 切换首页置顶", () => {
  it("T34 正常：置顶后列表顺序变化，可再次取消", async () => {
    await seedFixtureContent();

    const on = await request(app)
      .post(`${LIST}/case-002/featured`)
      .set(bearer(token))
      .send({ featured: true });
    expect(on.status).toBe(200);
    expect(on.body.message).toBe("已置顶");
    expect(on.body.data.featured).toBe(true);

    const list = await request(app).get(LIST).query({ featured: "true" });
    // 两条都置顶，按 updatedAt 倒序：刚切换的 case-002 最新
    expect(list.body.data.items.map((item: { id: string }) => item.id)).toEqual([
      "case-002",
      "case-001",
    ]);

    const off = await request(app)
      .post(`${LIST}/case-002/featured`)
      .set(bearer(token))
      .send({ featured: false });
    expect(off.body.message).toBe("已取消置顶");
    expect(off.body.data.featured).toBe(false);
  });

  it("T35 异常：不存在的案例返回 404", async () => {
    const res = await request(app)
      .post(`${LIST}/nope/featured`)
      .set(bearer(token))
      .send({ featured: true });
    expect(res.status).toBe(404);
  });

  it("T36 异常：未登录返回 401；缺 featured 字段返回 400", async () => {
    const unauth = await request(app).post(`${LIST}/case-001/featured`).send({ featured: true });
    expect(unauth.status).toBe(401);

    const invalid = await request(app)
      .post(`${LIST}/case-001/featured`)
      .set(bearer(token))
      .send({});
    expect(invalid.status).toBe(400);
    expect(invalid.body.code).toBe(4000);
  });
});

describe("案例列表页文案与案例集合互不影响", () => {
  it("T37 正常工作流：更新文案不影响案例；删除案例不影响文案", async () => {
    await seedFixtureContent();
    const before = await request(app).get(PAGE);

    await request(app).delete(`${LIST}/case-001`).set(bearer(token));
    await request(app)
      .put(PAGE)
      .set(bearer(token))
      .send({ ...before.body.data, title: "更新后的标题" });

    expect(await CaseItem.countDocuments()).toBe(1);
    expect(await CasesPageContent.countDocuments()).toBe(1);
    const after = await request(app).get(PAGE);
    expect(after.body.data.title).toBe("更新后的标题");
  });
});
