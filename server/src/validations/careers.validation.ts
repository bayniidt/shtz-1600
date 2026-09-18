import { z } from "zod";

import { optionalEmail, requiredText, text, titledItemSchema } from "@/validations/common.validation";

/** PUT /careers/content —— 加入我们页面文案（不含 cities / positions）。 */
export const careersContentSchema = z
  .object({
    heroTitle: requiredText(200, "主标题"),
    heroSubtitle: text(300, "副标题"),
    heroDescription: text(2000, "简介"),
    citiesEyebrow: text(200, "城市眉标"),
    citiesTitle: requiredText(200, "城市标题"),
    citiesDescription: text(1000, "城市说明"),
    cultureTitle: requiredText(200, "文化标题"),
    culture: z.array(titledItemSchema).max(12, "企业文化最多 12 项"),
    benefitsTitle: requiredText(200, "福利标题"),
    benefits: z
      .array(
        z
          .object({
            group: requiredText(80, "福利分组"),
            items: text(1000, "福利条目"),
          })
          .strict(),
      )
      .max(12, "福利分组最多 12 组"),
    jobsEyebrow: text(200, "职位眉标"),
    jobsTitle: requiredText(200, "职位标题"),
    portalUrl: text(500, "招聘系统地址"),
    applyEmail: optionalEmail,
  })
  .strict();

export type CareersContentInput = z.infer<typeof careersContentSchema>;
