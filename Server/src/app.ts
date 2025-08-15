import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import authRoutes from "./routes/auth";
import marksRoutes from "./routes/marks";
import googleDriveRoutes from "./routes/googleDrive";
import adminRoutes from "./routes/admin";
import documentRoutes from "./routes/documents";
import courseAccessRoutes from "./routes/courseAccess";
import teacherRequestsRoutes from "./routes/teacherRequests";
import { errorHandler } from "./middleware/errorHandler";
import templatesRoutes from "./routes/templates";
import coursesRoutes from "./routes/courses";
import documentDistributionRoutes from "./routes/documentDistribution";
const app: Application = express();

// Security middleware
app.use(helmet());

app.use(
  cors({
    origin: ["http://localhost:5173", "https://t12resmartmarks.vercel.app"],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Welcome to Smart Marks" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/google-drive", googleDriveRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/templates", templatesRoutes);
app.use("/api/course-access", courseAccessRoutes);
app.use("/api/teacher-requests", teacherRequestsRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/document-distribution", documentDistributionRoutes);

// Global error Handler 
app.use(errorHandler);

app.use((req: Request, res: Response) => {
  res.status(404).send({
    statusCode: 404,
    success: false,
    message: "Sorry, We can't find that!",
  });
});

export default app;
