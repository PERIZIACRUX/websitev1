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

const DEMO_MODE = (process.env.DEMO_MODE ?? "false").toLowerCase() === "true";
const DEMO_ALLOWED_ORIGINS = [
  "https://websitev1-frontend-9kjmgee3t-cruxperizia.vercel.app",
  "http://localhost:3000",
];

const normalizeOrigin = (value?: string | null) => {
  if (!value) return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    return new URL(trimmed).origin;
  } catch {
    return trimmed.replace(/\/+$/, "");
  }
};

const parseAllowedOrigins = (raw?: string) => {
  const configured = raw
    ? raw.split(",").map((entry) => normalizeOrigin(entry)).filter(Boolean)
    : [];

  const demoOrigins = DEMO_MODE ? DEMO_ALLOWED_ORIGINS : [];
  return Array.from(new Set([...configured, ...demoOrigins, "http://localhost:3000"]));
};

const allowedOrigins = parseAllowedOrigins(process.env.FRONTEND_URL);

const logDemoFailure = (req: express.Request, status: number, category: string) => {
  if (!DEMO_MODE) return;

  const origin = req.headers.origin || req.headers.referer || "unknown";
  console.warn("[DEMO_MODE] failed request", {
    method: req.method,
    route: req.originalUrl || req.url,
    status,
    origin,
    category,
  });
};

const app = express();

app.set("trust proxy", 1);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = normalizeOrigin(origin);
    const isAllowed = allowedOrigins.includes(normalizedOrigin);

    if (isAllowed) {
      return callback(null, true);
    }

    if (DEMO_MODE && DEMO_ALLOWED_ORIGINS.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(null, false as unknown as string);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
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
  if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    const originOrReferer = req.headers.origin || req.headers.referer;
    const requestOrigin = normalizeOrigin(originOrReferer);

    if (requestOrigin) {
      const isAllowed = allowedOrigins.includes(requestOrigin);

      if (!isAllowed) {
        if (DEMO_MODE) {
          const isDemoAllowed = DEMO_ALLOWED_ORIGINS.includes(requestOrigin);
          if (!isDemoAllowed) {
            logDemoFailure(req, 403, "origin-validation");
            res.status(403).json({ success: false, error: "Forbidden by CSRF protection" });
            return;
          }
        } else {
          logDemoFailure(req, 403, "origin-validation");
          res.status(403).json({ success: false, error: "Forbidden by CSRF protection" });
          return;
        }
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
