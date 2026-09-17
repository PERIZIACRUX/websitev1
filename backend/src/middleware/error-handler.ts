import type { Request, Response, NextFunction } from "express";
import { formatErrorResponse } from "../utils/error-handler";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const formatted = formatErrorResponse(err);
  // Do not expose 'status' in JSON output if it's meant only for HTTP status, 
  // but existing formatErrorResponse puts it in the returned object. 
  // Next.js API ignored the 'status' property inside the body if they didn't send it explicitly, 
  // but we can just send the whole formatted object.
  res.status(formatted.status).json(formatted);
};
