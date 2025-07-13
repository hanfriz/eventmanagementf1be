import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",

  // Database Configuration
  databaseUrl: process.env.DATABASE_URL,

  // Authentication Configuration
  jwtSecret: process.env.JWT_SECRET || "fallback-secret-key",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  // Client Configuration
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  clientUrls: process.env.CLIENT_URLS 
    ? process.env.CLIENT_URLS.split(',').map(url => url.trim())
    : [
        "http://localhost:3000",
        "https://eventmanagementf1fe.vercel.app"
      ],

  // File Upload Configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || "100"), // limit each IP
  },

  // Email Configuration (if needed in the future)
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  },

  // Payment Configuration (if needed in the future)
  payment: {
    midtransServerKey: process.env.MIDTRANS_SERVER_KEY,
    midtransClientKey: process.env.MIDTRANS_CLIENT_KEY,
    midtransIsProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  },

  // Cron Job Configuration
  cronJobs: {
    enabled: process.env.CRON_JOBS_ENABLED !== "false",
    timezone: process.env.TIMEZONE || "Asia/Jakarta",
  },
};

// Validate required environment variables
export const validateConfig = () => {
  const required = ["DATABASE_URL", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
};

export default config;
