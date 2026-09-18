import { Router } from "express";

import { getAbout, updateAbout } from "@/controllers/about.controller";
import { protect } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { catchAsync } from "@/utils/catchAsync";
import { aboutContentSchema } from "@/validations/about.validation";

/** 关于我们（单文档，Get / Put）。 */
const router = Router();

router.get("/", catchAsync(getAbout));
router.put("/", protect, validate({ body: aboutContentSchema }), catchAsync(updateAbout));

export default router;
