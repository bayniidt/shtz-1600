import { Router } from "express";

import { getTheme, resetTheme, updateTheme } from "@/controllers/theme.controller";
import { protect } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { catchAsync } from "@/utils/catchAsync";
import { themeUpdateSchema } from "@/validations/theme.validation";

const router = Router();

router.get("/theme", catchAsync(getTheme));
router.put("/theme", protect, validate({ body: themeUpdateSchema }), catchAsync(updateTheme));
router.post("/theme/reset", protect, catchAsync(resetTheme));

export default router;
