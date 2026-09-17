import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error-handler";
import { registrationRouter } from "./routes/registration.routes";
import { paymentRouter } from "./routes/payment.routes";
import { workshopsRouter } from "./routes/workshops.routes";
import staffAuthRouter from "./routes/staff/auth.routes";
import staffVolunteersRouter from "./routes/staff/volunteers.routes";
import staffScannerRouter from "./routes/staff/scanner.routes";
import staffDashboardRouter from "./routes/staff/dashboard.routes";

const app = express();

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors({ origin: frontendUrl, credentials: true }));
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
