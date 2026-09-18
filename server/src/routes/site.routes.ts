import { Router } from "express";

import { getSite, updateSite } from "@/controllers/site.controller";
import { protect } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { catchAsync } from "@/utils/catchAsync";
import { siteConfigSchema } from "@/validations/site.validation";

/** 站点与导航（单文档，Get / Put）。 */
const router = Router();

router.get("/", catchAsync(getSite));
router.put("/", protect, validate({ body: siteConfigSchema }), catchAsync(updateSite));

export default router;
