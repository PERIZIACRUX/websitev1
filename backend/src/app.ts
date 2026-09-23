import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/error-handler";
import { registrationRouter } from "./routes/registration.routes";
import { paymentRouter } from "./routes/payment.routes";
import { workshopsRouter } from "./routes/workshops.routes";
import staffAuthRouter from "./routes/staff/auth.routes";
import staffVolunteersRouter from "./routes/staff/volunteers.routes";
import staffScannerRouter from "./routes/staff/scanner.routes";
import staffDashboardRouter from "./routes/staff/dashboard.routes";

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',') 
  : ["http://localhost:3000"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(null, false as unknown as string);
  },
  credentials: true
}));

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later." }
});
app.use(globalLimiter);

app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const originOrReferer = req.headers.origin || req.headers.referer;
    if (originOrReferer) {
      const isAllowed = allowedOrigins.some(o => originOrReferer.startsWith(o));
      if (!isAllowed) {
        res.status(403).json({ success: false, error: 'Forbidden by CSRF protection' });
        return;
      }
    }
  }
  next();
});
app.use(express.json());
app.use(cookieParser());

app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/registration", registrationRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/workshops", workshopsRouter);
app.use("/api/v1/staff/auth", staffAuthRouter);
app.use("/api/v1/staff/volunteers", staffVolunteersRouter);
app.use("/api/v1/staff/scanner", staffScannerRouter);
app.use("/api/v1/staff/dashboard", staffDashboardRouter);

app.use(errorHandler);

export default app;
