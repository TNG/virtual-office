import { logger } from "../../log";
import { NextFunction, Request, Response } from "express";

export default function exceptionHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const statusCode = err.statusCode || 500;
  logger.error(`An unexpected exception occurred: ${err}`);
  console.log(err);
  res.status(statusCode).json({
    error: {
      data: err.data,
      message: err.message,
      name: err.name,
    },
  });
  next("router");
}
