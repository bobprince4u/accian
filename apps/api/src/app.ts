import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import cors, { CorsOptions } from "cors";
import morgan from "morgan";
import compression from "compression";

//import routes
import contactRoutes from "./routes/contactRoutes";
import preConsultationRoutes from "./routes/preConsultationRoutes";
import adminRoutes from "./routes/adminRoutes";
import projectRoutes from "./routes/projectRoutes";
import serviceRoutes from "./routes/serviceRoutes";
import testimonialRoutes from "./routes/testimonialRoutes";

//import middleware
import errorHandler, { AppError } from "./middleware/errorHandler";
import * as rateLimiter from "./middleware/rateLimiter";

const app: Application = express();

//security middleware
// One proxy hop (the platform load balancer) is trusted so req.ip and the
// rate limiter see the real client address. This matches a single-proxy PaaS
// deployment; it was NOT verifiable from this repository, which contains no
// deployment manifest. If the API sits behind more than one proxy (e.g. a CDN
// in front of the platform), this number must be raised to match, and if it
// sits behind none it should be 0 — a value that is too high lets a client
// spoof its IP through X-Forwarded-For and evade the rate limiter.
app.set("trust proxy", 1);
app.use(helmet());

//CORS configuration
const parseOrigins = (value: string): string[] =>
  value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

/**
 * Allowed origins come from FRONTEND_URL (comma-separated).
 *
 * There used to be a hard-coded production fallback list. That meant a
 * production deployment with FRONTEND_URL missing or misspelt silently served
 * a baked-in origin list instead of failing, so a configuration error was
 * invisible until a client was mysteriously blocked. In production the
 * variable is now required.
 */
const resolveAllowedOrigins = (): string[] => {
  if (process.env.FRONTEND_URL) {
    const origins = parseOrigins(process.env.FRONTEND_URL);
    if (origins.length > 0) return origins;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "FRONTEND_URL must be set in production: it defines the CORS allowlist. " +
        "Provide a comma-separated list of allowed origins, e.g. " +
        "FRONTEND_URL=https://example.com,https://admin.example.com",
    );
  }

  return [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:2025",
    "http://localhost:2024",
    "http://localhost:2023",
  ];
};

const allowedOrigins = resolveAllowedOrigins();

console.log("🌐 CORS allowed origins:", allowedOrigins);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Requests with no Origin header (curl, server-to-server, uptime probes,
    // and the /health check) are allowed: browsers always send Origin on the
    // cross-origin requests this list exists to control.
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // A rejected origin is a client error, not a server fault. Throwing a bare
    // Error here produced a 500 from the error handler, which made a
    // misconfigured client look like backend downtime.
    return callback(new AppError("Not allowed by CORS", 403));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-security-token",
    "x-timestamp",
  ],
};

app.use("/", cors(corsOptions));

//Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

//compression middleware
app.use(compression());

//Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

//Rate Limiting middleware
app.use(rateLimiter.general);

//Welcome route
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to the Accian Nigeria Limited Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      projects: "/api/projects",
      contact: "/api/contact",
      preConsultation: "/api/pre-consultation",
      admin: "/api/admin",
      services: "/api/services",
      testimonials: "/api/testimonials",
    },
  });
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use("/api/contact", contactRoutes);
app.use("/api/pre-consultation", preConsultationRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/testimonials", testimonialRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.path,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
