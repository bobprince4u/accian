"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
//import routes
const contactRoutes_1 = __importDefault(require("./routes/contactRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const serviceRoutes_1 = __importDefault(require("./routes/serviceRoutes"));
const testimonialRoutes_1 = __importDefault(require("./routes/testimonialRoutes"));
//import middleware
const errorHandler_1 = __importStar(require("./middleware/errorHandler"));
const rateLimiter = __importStar(require("./middleware/rateLimiter"));
const app = (0, express_1.default)();
//security middleware
// One proxy hop (the platform load balancer) is trusted so req.ip and the
// rate limiter see the real client address. This matches a single-proxy PaaS
// deployment; it was NOT verifiable from this repository, which contains no
// deployment manifest. If the API sits behind more than one proxy (e.g. a CDN
// in front of the platform), this number must be raised to match, and if it
// sits behind none it should be 0 — a value that is too high lets a client
// spoof its IP through X-Forwarded-For and evade the rate limiter.
app.set("trust proxy", 1);
app.use((0, helmet_1.default)());
//CORS configuration
const parseOrigins = (value) => value
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
const resolveAllowedOrigins = () => {
    if (process.env.FRONTEND_URL) {
        const origins = parseOrigins(process.env.FRONTEND_URL);
        if (origins.length > 0)
            return origins;
    }
    if (process.env.NODE_ENV === "production") {
        throw new Error("FRONTEND_URL must be set in production: it defines the CORS allowlist. " +
            "Provide a comma-separated list of allowed origins, e.g. " +
            "FRONTEND_URL=https://example.com,https://admin.example.com");
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
const corsOptions = {
    origin: (origin, callback) => {
        // Requests with no Origin header (curl, server-to-server, uptime probes,
        // and the /health check) are allowed: browsers always send Origin on the
        // cross-origin requests this list exists to control.
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // A rejected origin is a client error, not a server fault. Throwing a bare
        // Error here produced a 500 from the error handler, which made a
        // misconfigured client look like backend downtime.
        return callback(new errorHandler_1.AppError("Not allowed by CORS", 403));
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
app.use("/", (0, cors_1.default)(corsOptions));
//Body parser middleware
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
//compression middleware
app.use((0, compression_1.default)());
//Logging middleware
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
else {
    app.use((0, morgan_1.default)("combined"));
}
//Rate Limiting middleware
app.use(rateLimiter.general);
//Welcome route
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to the Accian Nigeria Limited Backend API",
        version: "1.0.0",
        endpoints: {
            health: "/health",
            projects: "/api/projects",
            contact: "/api/contact",
            admin: "/api/admin",
            services: "/api/services",
            testimonials: "/api/testimonials",
        },
    });
});
// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
    });
});
// API Routes
app.use("/api/contact", contactRoutes_1.default);
app.use("/api/projects", projectRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
app.use("/api/services", serviceRoutes_1.default);
app.use("/api/testimonials", testimonialRoutes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found",
        path: req.path,
    });
});
// Error handling middleware (must be last)
app.use(errorHandler_1.default);
exports.default = app;
