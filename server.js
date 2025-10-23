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
        status
      });
    }

    res.status(200).json({
      success: true,
      message: "Token retrieved successfully",
      token,
      status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve token",
      error: error.message
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
        status: tokenManager.getTokenStatus()
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Token refresh failed",
      error: error.message
    });
  }
});

app.get("/api/token/status", (req, res) => {
  try {
    const status = tokenManager.getTokenStatus();
    res.status(200).json({
      success: true,
      status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get token status",
      error: error.message
    });
  }
});

try {
  app.listen(PORT, () => {
    console.log(`🚀 Server connected to port ${PORT}`);
    console.log(`📊 Token management endpoints available:`);
    console.log(`   GET  /api/token - Get current token`);
    console.log(`   POST /api/token/refresh - Manually refresh token`);
    console.log(`   GET  /api/token/status - Get token status`);
  });
} catch (error) {
  console.log("❌ ERROR IN connecting", error.message);
}

// Export tokenManager for use in other modules
export { tokenManager };
export default tokenManager;
