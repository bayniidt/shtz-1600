import type { Express } from "express";
import request from "supertest";

import { createApp } from "@/app";
import { HomeContent } from "@/models/HomeContent.model";
import {
  HOME_FIXTURE,
  HOME_HERO_FIXTURE,
  HOME_MEDIA_FIXTURE,
} from "./fixtures/site-data";
import { bearer, loginAsAdmin, resetTestDB, seedFixtureContent, setupTestDB, teardownTestDB } from "./helpers/db";

const HOME = "/api/v1/home";
const SECTIONS = ["hero", "media", "flow", "clients", "strength", "honors"] as const;

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

describe("GET /home —— 读取首页 6 大板块", () => {
  it("T1 正常：一次性返回 hero/media/flow/clients/strength/honors", async () => {
    await seedFixtureContent();
    const res = await request(app).get(HOME);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(0);
    expect(Object.keys(res.body.data)).toEqual(
      expect.arrayContaining([...SECTIONS, "updatedAt"]),
    );
    expect(res.body.data.hero.title).toBe(HOME_HERO_FIXTURE.title);
    expect(res.body.data.hero.stats).toHaveLength(2);
    expect(res.body.data.media.partners[0].category).toBe("Social");
    expect(res.body.data.strength.nodes[0].x).toBe("82");
    expect(res.body.data.honors.groups).toHaveLength(2);
    expect(res.body.data._id).toBeUndefined();
    expect(res.body.data.key).toBeUndefined();
  });

  it("T2 异常：未初始化返回 404 / 4040", async () => {
    const res = await request(app).get(HOME);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe(4040);
    expect(res.body.message).toContain("seed");
  });
});

describe("PUT /home/:section —— 分板块更新", () => {
  it.each(SECTIONS.map((section) => [section] as const))(
    "T3 正常：PUT /home/%s 使用完整数据保存成功",
    async (section) => {
      await seedFixtureContent();
      const before = await request(app).get(HOME);

      const res = await request(app)
        .put(`${HOME}/${section}`)
        .set(bearer(token))
        .send(HOME_FIXTURE[section]);

      expect(res.status).toBe(200);
      expect(res.body.data[section]).toMatchObject(HOME_FIXTURE[section] as object);

      // 其他板块保持原样
      for (const other of SECTIONS) {
        if (other === section) continue;
        expect(res.body.data[other]).toEqual(before.body.data[other]);
      }
    },
  );

  it("T4 正常：GET → PUT 回写（幂等）", async () => {
    await seedFixtureContent();
    const before = await request(app).get(HOME);

    const res = await request(app)
      .put(`${HOME}/hero`)
      .set(bearer(token))
      .send(before.body.data.hero);

    expect(res.status).toBe(200);
    expect(res.body.data.hero.marquee).toEqual(before.body.data.hero.marquee);
  });

  it("T5 正常：未初始化时 PUT 自动创建（含其他板块默认值）", async () => {
    const res = await request(app)
      .put(`${HOME}/hero`)
      .set(bearer(token))
      .send(HOME_HERO_FIXTURE);

    expect(res.status).toBe(200);
    expect(await HomeContent.countDocuments()).toBe(1);

    const after = await request(app).get(HOME);
    expect(after.body.data.hero.title).toBe(HOME_HERO_FIXTURE.title);
    expect(after.body.data.media.title).toBe("");
  });

  it("T6 异常：未登录返回 401 / 4010", async () => {
    const res = await request(app).put(`${HOME}/hero`).send(HOME_HERO_FIXTURE);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe(4010);
  });

  it("T7 异常：未知板块返回 404 / 4040", async () => {
    const res = await request(app).put(`${HOME}/unknown`).set(bearer(token)).send({});
    expect(res.status).toBe(404);
    expect(res.body.code).toBe(4040);
  });

  it("T8 异常：hero 缺少必填字段返回 400", async () => {
    const { title, ...rest } = HOME_HERO_FIXTURE;
    void title;
    const res = await request(app).put(`${HOME}/hero`).set(bearer(token)).send(rest);

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "title" })]),
    );
  });

  it("T9 异常：媒体分类非法返回 400", async () => {
    const res = await request(app)
      .put(`${HOME}/media`)
      .set(bearer(token))
      .send({
        ...HOME_MEDIA_FIXTURE,
        partners: [{ name: "X", mark: "X", category: "Unknown" }],
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "partners.0.category" })]),
    );
  });

  it("T10 异常：strength 节点坐标非法返回 400", async () => {
    const res = await request(app)
      .put(`${HOME}/strength`)
      .set(bearer(token))
      .send({
        ...HOME_FIXTURE.strength,
        nodes: [{ city: "上海", role: "总部", x: { bad: true }, y: "42" }],
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "nodes.0.x" })]),
    );
  });

  it("T11 边界：hero.stats 最多 12 项，13 项被拒绝", async () => {
    const stats = Array.from({ length: 13 }, (_, index) => ({ value: `${index}`, label: "n" }));
    const res = await request(app)
      .put(`${HOME}/hero`)
      .set(bearer(token))
      .send({ ...HOME_HERO_FIXTURE, stats });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "stats" })]),
    );
  });

  it("T12 边界：flow.orbit 最多 20 项", async () => {
    const orbit = (count: number) => Array.from({ length: count }, () => ({ label: "标签" }));

    const ok = await request(app)
      .put(`${HOME}/flow`)
      .set(bearer(token))
      .send({ ...HOME_FIXTURE.flow, orbit: orbit(20) });
    expect(ok.status).toBe(200);

    const tooMany = await request(app)
      .put(`${HOME}/flow`)
      .set(bearer(token))
      .send({ ...HOME_FIXTURE.flow, orbit: orbit(21) });
    expect(tooMany.status).toBe(400);
  });

  it("T13 边界：clients.logos 最多 200 项", async () => {
    const logos = (count: number) =>
      Array.from({ length: count }, (_, index) => ({ name: `客户${index}`, industry: "game" }));

    const ok = await request(app)
      .put(`${HOME}/clients`)
      .set(bearer(token))
      .send({ ...HOME_FIXTURE.clients, logos: logos(200) });
    expect(ok.status).toBe(200);

    const tooMany = await request(app)
      .put(`${HOME}/clients`)
      .set(bearer(token))
      .send({ ...HOME_FIXTURE.clients, logos: logos(201) });
    expect(tooMany.status).toBe(400);
  });

  it("T14 边界：honors 分组内条目最多 20 项，21 项被拒绝", async () => {
    const items = Array.from({ length: 21 }, (_, index) => ({
      title: `荣誉${index}`,
      issuer: "机构",
      year: "2024",
    }));
    const res = await request(app)
      .put(`${HOME}/honors`)
      .set(bearer(token))
      .send({
        ...HOME_FIXTURE.honors,
        groups: [{ key: "qualification", title: "权威资质", items }],
      });

    expect(res.status).toBe(400);
  });

  it("T15 边界：strength 的 major 兼容 boolean 与 \"yes\" 两种写法", async () => {
    const base = HOME_FIXTURE.strength;
    const asBoolean = await request(app)
      .put(`${HOME}/strength`)
      .set(bearer(token))
      .send({
        ...base,
        nodes: [
          { city: "上海", role: "总部", x: "82", y: "42", major: true },
          { city: "东京", role: "子公司", x: "88", y: "26", major: false },
        ],
      });
    expect(asBoolean.status).toBe(200);
    expect(asBoolean.body.data.strength.nodes[0].major).toBe(true);

    const asString = await request(app)
      .put(`${HOME}/strength`)
      .set(bearer(token))
      .send({
        ...base,
        nodes: [{ city: "上海", role: "总部", x: "82", y: "42", major: "yes" }],
      });
    expect(asString.status).toBe(200);
    expect(asString.body.data.strength.nodes[0].major).toBe("yes");
  });
});
