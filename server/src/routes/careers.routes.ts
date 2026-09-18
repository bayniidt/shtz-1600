import { Router } from "express";

import { getCareersContent, updateCareersContent } from "@/controllers/careers.controller";
import { protect } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { catchAsync } from "@/utils/catchAsync";
import { notImplemented } from "@/utils/notImplemented";
import { careersContentSchema } from "@/validations/careers.validation";

/** 招聘管理：页面文案（Stage 2） + 城市 CRUD（Stage 4） + 岗位 CRUD（Stage 4）。 */
const router = Router();

// 6.1 页面文案
router.get("/content", catchAsync(getCareersContent));
router.put("/content", protect, validate({ body: careersContentSchema }), catchAsync(updateCareersContent));

// 6.2 招聘城市 CRUD
router.get("/cities", notImplemented("读取招聘城市列表"));
router.post("/cities", protect, notImplemented("新建招聘城市"));
router.get("/cities/:id", notImplemented("读取招聘城市详情"));
router.put("/cities/:id", protect, notImplemented("编辑招聘城市"));
router.delete("/cities/:id", protect, notImplemented("删除招聘城市"));

// 6.3 招聘岗位 CRUD
router.get("/positions", notImplemented("读取招聘岗位列表"));
router.post("/positions", protect, notImplemented("新建招聘岗位"));
router.get("/positions/:id", notImplemented("读取招聘岗位详情"));
router.put("/positions/:id", protect, notImplemented("编辑招聘岗位"));
router.delete("/positions/:id", protect, notImplemented("删除招聘岗位"));

export default router;
