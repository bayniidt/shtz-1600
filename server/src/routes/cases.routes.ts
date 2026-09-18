import { Router } from "express";

import {
  createCase,
  deleteCase,
  getCase,
  getCasesPage,
  listCases,
  toggleCaseFeatured,
  updateCase,
  updateCasesPage,
} from "@/controllers/cases.controller";
import { protect } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { catchAsync } from "@/utils/catchAsync";
import {
  caseFeaturedSchema,
  caseItemSchema,
  caseListQuerySchema,
  casesPageSchema,
} from "@/validations/cases.validation";

/** 客户案例：列表页文案 + 案例 CRUD。 */
const router = Router();

// 列表页文案（单文档）
router.get("/page", catchAsync(getCasesPage));
router.put("/page", protect, validate({ body: casesPageSchema }), catchAsync(updateCasesPage));

// 案例 CRUD（静态 /page 必须排在动态 /:id 之前）
router.get("/", validate({ query: caseListQuerySchema }), catchAsync(listCases));
router.post("/", protect, validate({ body: caseItemSchema }), catchAsync(createCase));
router.get("/:id", catchAsync(getCase));
router.put("/:id", protect, validate({ body: caseItemSchema }), catchAsync(updateCase));
router.delete("/:id", protect, catchAsync(deleteCase));
router.post("/:id/featured", protect, validate({ body: caseFeaturedSchema }), catchAsync(toggleCaseFeatured));

export default router;
