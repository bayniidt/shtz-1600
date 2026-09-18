import { Router } from "express";

import {
  createCareersCity,
  createCareersPosition,
  deleteCareersCity,
  deleteCareersPosition,
  getCareersCity,
  getCareersContent,
  getCareersPosition,
  listCareersCities,
  listCareersPositions,
  updateCareersCity,
  updateCareersContent,
  updateCareersPosition,
} from "@/controllers/careers.controller";
import { protect } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { catchAsync } from "@/utils/catchAsync";
import {
  careerIdParamsSchema,
  careersCityDeleteSchema,
  careersCityListQuerySchema,
  careersCitySchema,
  careersContentSchema,
  careersPositionListQuerySchema,
  careersPositionSchema,
} from "@/validations/careers.validation";

/** 招聘管理：页面文案（Stage 2） + 城市 CRUD（Stage 4） + 岗位 CRUD（Stage 4）。 */
const router = Router();

// 6.1 页面文案
router.get("/content", catchAsync(getCareersContent));
router.put("/content", protect, validate({ body: careersContentSchema }), catchAsync(updateCareersContent));

// 6.2 招聘城市 CRUD
router.get("/cities", validate({ query: careersCityListQuerySchema }), catchAsync(listCareersCities));
router.post("/cities", protect, validate({ body: careersCitySchema }), catchAsync(createCareersCity));
router.get("/cities/:id", validate({ params: careerIdParamsSchema }), catchAsync(getCareersCity));
router.put("/cities/:id", protect, validate({ params: careerIdParamsSchema, body: careersCitySchema }), catchAsync(updateCareersCity));
router.delete(
  "/cities/:id",
  protect,
  validate({ params: careerIdParamsSchema, body: careersCityDeleteSchema }),
  catchAsync(deleteCareersCity),
);

// 6.3 招聘岗位 CRUD
router.get("/positions", validate({ query: careersPositionListQuerySchema }), catchAsync(listCareersPositions));
router.post("/positions", protect, validate({ body: careersPositionSchema }), catchAsync(createCareersPosition));
router.get("/positions/:id", validate({ params: careerIdParamsSchema }), catchAsync(getCareersPosition));
router.put("/positions/:id", protect, validate({ params: careerIdParamsSchema, body: careersPositionSchema }), catchAsync(updateCareersPosition));
router.delete("/positions/:id", protect, validate({ params: careerIdParamsSchema }), catchAsync(deleteCareersPosition));

export default router;
