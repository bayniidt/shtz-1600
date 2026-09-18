import type { NextFunction, Request, RequestHandler, Response } from "express";

/** 包装 async 路由，自动把 reject 交给全局错误中间件。 */
export function catchAsync(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
