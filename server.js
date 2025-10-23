import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { postRouter } from "./routes/postRoute.js";
import tokenManager from "./lib/tokenManager.js";
import { set } from "mongoose";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// middlewares
app.use(cors());
app.use(express.json());

// api
app.use("/api/post", postRouter);

// Token management endpoints
app.get("/api/token", async (req, res) => {
  try {
    const token = tokenManager.getToken();
    const status = tokenManager.getTokenStatus();

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "No token available",
        status,
      });
    }

    res.status(200).json({
      success: true,
      message: "Token retrieved successfully",
      token,
      status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve token",
      error: error.message,
    });
  }
});

app.post("/api/token/refresh", async (req, res) => {
  try {
    const result = await tokenManager.manualRefresh();

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        token: result.token,
        status: tokenManager.getTokenStatus(),
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Token refresh failed",
      error: error.message,
    });
  }
});

app.get("/api/token/status", (req, res) => {
  try {
    const status = tokenManager.getTokenStatus();
    res.status(200).json({
      success: true,
      status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get token status",
      error: error.message,
    });
  }
});

// Health check endpoint for monitoring
app.get("/api/health", (req, res) => {
  try {
    const tokenStatus = tokenManager.getTokenStatus();
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      token: {
        hasToken: tokenStatus.hasToken,
        isExpired: tokenStatus.isExpired,
        minutesUntilExpiry: tokenStatus.minutesUntilExpiry,
      },
    };

    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Range Backend API is running",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/health",
      token: "/api/token",
      tokenRefresh: "/api/token/refresh",
      tokenStatus: "/api/token/status",
    },
  });
});

try {
  app.listen(PORT, () => {
    console.log(`🚀 Server connected to port ${PORT}`);
    console.log(`📊 Token management endpoints available:`);
    console.log(`   GET  /api/token - Get current token`);
    console.log(`   POST /api/token/refresh - Manually refresh token`);
    console.log(`   GET  /api/token/status - Get token status`);
    console.log(`   GET  /api/health - Health check`);
    console.log(`   GET  / - Root endpoint`);
  });
} catch (error) {
  console.log("❌ ERROR IN connecting", error.message);
}

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully...");
  tokenManager.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully...");
  tokenManager.stop();
  process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  tokenManager.stop();
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  // Don't exit on unhandled rejections in production
});

// Export tokenManager for use in other modules
export { tokenManager };
export default tokenManager;
