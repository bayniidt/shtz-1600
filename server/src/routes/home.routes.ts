import { Router } from "express";

import { getHome, updateHomeSection } from "@/controllers/home.controller";
import { protect } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { catchAsync } from "@/utils/catchAsync";
import { HOME_SECTION_SCHEMAS, HOME_SECTIONS } from "@/validations/home.validation";

/** 首页 6 大板块：GET 全量，PUT 按板块更新。 */
const router = Router();

router.get("/", catchAsync(getHome));

for (const section of HOME_SECTIONS) {
  router.put(
    `/${section}`,
    protect,
    validate({ body: HOME_SECTION_SCHEMAS[section] }),
    catchAsync(updateHomeSection(section)),
  );
}

export default router;
