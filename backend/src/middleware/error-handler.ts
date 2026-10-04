import type { Request, Response, NextFunction } from "express";
import { formatErrorResponse } from "../utils/error-handler";

const DEMO_MODE = (process.env.DEMO_MODE ?? "false").toLowerCase() === "true";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const formatted = formatErrorResponse(err);

  if (DEMO_MODE) {
    console.warn("[DEMO_MODE] failed request", {
      method: req.method,
      route: req.originalUrl || req.url,
      status: formatted.status,
      origin: req.headers.origin || req.headers.referer || "unknown",
      category: err?.name || err?.code || "request-error",
    });
  }

  // Do not expose 'status' in JSON output if it's meant only for HTTP status, 
  // but existing formatErrorResponse puts it in the returned object. 
  // Next.js API ignored the 'status' property inside the body if they didn't send it explicitly, 
  // but we can just send the whole formatted object.
  res.status(formatted.status).json(formatted);
};
