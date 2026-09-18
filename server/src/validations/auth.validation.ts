import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string({ required_error: "username 不能为空" })
    .trim()
    .min(1, "username 不能为空")
    .max(64, "username 长度不能超过 64 个字符"),
  password: z
    .string({ required_error: "password 不能为空" })
    .min(1, "password 不能为空")
    .max(100, "password 长度不能超过 100 个字符"),
});

export type LoginInput = z.infer<typeof loginSchema>;
