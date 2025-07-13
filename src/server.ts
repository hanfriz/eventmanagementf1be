import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { initializeCronJobs } from "./jobs/scheduler";
import authRoutes from "./routes/auth";
import eventRoutes from "./routes/events";
import userRoutes from "./routes/users";
import transactionRoutes from "./routes/transactions";
import reviewRoutes from "./routes/reviews";
import promotionRoutes from "./routes/promotions";
import uploadRoutes from "./routes/upload";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration for multiple origins
const allowedOrigins = [
  config.clientUrl, // From config file
  config.clientUrl, // Fallback from single client URL
].filter(Boolean); // Remove any undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log(`🚫 CORS blocked origin: ${origin}`);
        console.log("✅ Allowed origins:", allowedOrigins);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/upload", uploadRoutes);

// Root endpoint - Welcome message
app.get("/", (req, res) => {
  res.json({
    message: "🎉 Event Management API Server",
    status: "✅ Server is running",
    version: "1.0.0",
    port: config.port,
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      events: "/api/events",
      users: "/api/users",
      transactions: "/api/transactions",
      reviews: "/api/reviews",
      promotions: "/api/promotions",
    },
    documentation: "Visit the endpoints above for API functionality",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "🚀 Server is healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    port: config.port,
    environment: config.nodeEnv,
  });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      message: "Internal server error",
      error: config.isDevelopment ? err.message : undefined,
    });
  }
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(config.port, () => {
  console.log("🎉 ===============================================");
  console.log("🚀 Event Management API Server Started!");
  console.log("🎉 ===============================================");
  console.log(`📍 Server URL: http://localhost:${config.port}`);
  console.log(`🌐 Health Check: http://localhost:${config.port}/api/health`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);


   // Log CORS configuration

   console.log("🔐 CORS Configuration:");

   console.log(`   ✅ Allowed Origins:`, allowedOrigins);
  // Initialize cron jobs
  initializeCronJobs();

  console.log("🎉 ===============================================");
  console.log("📚 Available Endpoints:");
  console.log(`   🏠 Root: http://localhost:${config.port}/`);
  console.log(`   🔐 Auth: http://localhost:${config.port}/api/auth`);
  console.log(`   🎫 Events: http://localhost:${config.port}/api/events`);
  console.log(`   👤 Users: http://localhost:${config.port}/api/users`);
  console.log(
    `   💳 Transactions: http://localhost:${config.port}/api/transactions`
  );
  console.log(`   ⭐ Reviews: http://localhost:${config.port}/api/reviews`);
  console.log(
    `   🎁 Promotions: http://localhost:${config.port}/api/promotions`
  );
  console.log("🎉 ===============================================");
  console.log("✅ Server is ready to accept connections!");
  console.log("🔗 Open http://localhost:" + config.port + " in your browser");
  console.log("🎉 ===============================================");
});
