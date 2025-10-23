import axios from "axios";
import fs from "fs";
import path from "path";
import { getTokenConfig } from "./tokenConfig.js";

class TokenManager {
  constructor() {
    this.accessToken = null;
    this.tokenExpiryTime = null;
    this.refreshInterval = null;
    this.isRefreshing = false;
    this.initializationAttempts = 0;
    this.maxInitializationAttempts = 5;
    this.logFile = path.join(process.cwd(), "logs", "token-logs.txt");
    this.config = getTokenConfig();

    // Ensure logs directory exists
    this.ensureLogsDirectory();

    // Initialize token on startup with delay for production
    const initDelay = process.env.NODE_ENV === "production" ? 5000 : 1000;
    setTimeout(() => this.initializeToken(), initDelay);
  }

  ensureLogsDirectory() {
    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  log(message, level = "INFO") {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${this.config.logPrefix} ${message}\n`;

    // Console log
    console.log(`[${level}] ${this.config.logPrefix} ${message}`);

    // File log
    try {
      fs.appendFileSync(this.logFile, logMessage);
    } catch (error) {
      console.error("Failed to write to log file:", error.message);
    }
  }

  async initializeToken() {
    this.initializationAttempts++;

    try {
      this.log(
        `🚀 Initializing token manager (attempt ${this.initializationAttempts}/${this.maxInitializationAttempts})...`
      );
      await this.refreshToken();
      this.startTokenRefresh();
      this.log("✅ Token manager initialized successfully");
      this.initializationAttempts = 0; // Reset counter on success
    } catch (error) {
      this.log(
        `❌ Failed to initialize token manager (attempt ${this.initializationAttempts}): ${error.message}`,
        "ERROR"
      );

      // Handle rate limiting specifically
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data &&
        error.response.data.error === "Access Denied"
      ) {
        this.log(
          "⏳ Rate limited by Zoho API, retrying after 2 minutes...",
          "WARN"
        );
        setTimeout(() => this.initializeToken(), 2 * 60 * 1000); // 2 minutes
      } else if (this.initializationAttempts < this.maxInitializationAttempts) {
        // Other errors - retry with exponential backoff
        const delay = Math.min(
          30000 * Math.pow(2, this.initializationAttempts - 1),
          300000
        ); // Max 5 minutes
        this.log(
          `⏳ Retrying initialization in ${delay / 1000} seconds...`,
          "WARN"
        );
        setTimeout(() => this.initializeToken(), delay);
      } else {
        this.log(
          "❌ Max initialization attempts reached. Token manager failed to start.",
          "ERROR"
        );
        // Still try to start refresh interval in case we get a token later
        this.startTokenRefresh();
      }
    }
  }

  async refreshToken() {
    if (this.isRefreshing) {
      this.log("⏳ Token refresh already in progress, skipping...", "WARN");
      return;
    }

    this.isRefreshing = true;
    const startTime = Date.now();

    try {
      this.log("🔄 Refreshing access token...");

      const response = await axios.post(
        "https://accounts.zoho.com/oauth/v2/token",
        null,
        {
          params: {
            refresh_token:
              process.env.ZOHO_REFRESH_TOKEN ||
              "1000.89df4173347843c9188e4761ebea3d23.73fc2e4cf5f43ab24d22faf014328d60",
            client_secret:
              process.env.ZOHO_CLIENT_SECRET ||
              "7f606f4851e64d48437dd2a965c974e79932df8eb4",
            client_id:
              process.env.ZOHO_CLIENT_ID ||
              "1000.Y7C03TSOIAH5MGGO422CYCMKM71VTL",
            redirect_uri:
              process.env.ZOHO_REDIRECT_URI || "https://crm.zoho.in/",
            grant_type: "refresh_token",
          },
          timeout: 10000, // 10 second timeout
        }
      );

      const { access_token, expires_in } = response.data;

      if (!access_token) {
        throw new Error("No access token received from Zoho");
      }

      this.accessToken = access_token;
      this.tokenExpiryTime = Date.now() + expires_in * 1000;

      const refreshDuration = Date.now() - startTime;
      this.log(`✅ Token refreshed successfully in ${refreshDuration}ms`);
      this.log(
        `📅 Token expires at: ${new Date(this.tokenExpiryTime).toISOString()}`
      );
      this.log(`⏰ Token expires in: ${Math.round(expires_in / 60)} minutes`);

      return access_token;
    } catch (error) {
      const refreshDuration = Date.now() - startTime;
      this.log(
        `❌ Token refresh failed after ${refreshDuration}ms: ${error.message}`,
        "ERROR"
      );

      if (error.response) {
        this.log(
          `❌ Zoho API Error: ${error.response.status} - ${JSON.stringify(
            error.response.data
          )}`,
          "ERROR"
        );

        // Handle rate limiting
        if (
          error.response.status === 400 &&
          error.response.data &&
          error.response.data.error === "Access Denied"
        ) {
          this.log("⏳ Rate limited by Zoho API", "WARN");
        }
      }

      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  startTokenRefresh() {
    // Clear existing interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Use configuration for refresh interval
    const refreshIntervalMs = this.config.refreshIntervalMinutes * 60 * 1000;

    this.log(
      `⏰ Starting automatic token refresh every ${this.config.refreshIntervalMinutes} minute(s)`
    );

    this.refreshInterval = setInterval(async () => {
      try {
        await this.refreshToken();
      } catch (error) {
        this.log(
          `❌ Scheduled token refresh failed: ${error.message}`,
          "ERROR"
        );
        // Continue trying - don't stop the interval
      }
    }, refreshIntervalMs);
  }

  getToken() {
    if (!this.accessToken) {
      this.log("⚠️ No access token available", "WARN");
      return null;
    }

    // Check if token is close to expiry (use configuration)
    const timeUntilExpiry = this.tokenExpiryTime - Date.now();
    if (timeUntilExpiry < this.config.proactiveRefreshSeconds * 1000) {
      this.log(
        `⚠️ Token expires soon (${Math.round(
          timeUntilExpiry / 1000
        )}s), triggering refresh`,
        "WARN"
      );
      // Trigger immediate refresh
      this.refreshToken().catch((error) => {
        this.log(
          `❌ Immediate token refresh failed: ${error.message}`,
          "ERROR"
        );
      });
    }

    return this.accessToken;
  }

  getTokenStatus() {
    if (!this.accessToken || !this.tokenExpiryTime) {
      return {
        hasToken: false,
        expiresAt: null,
        timeUntilExpiry: null,
        isExpired: true,
      };
    }

    const timeUntilExpiry = this.tokenExpiryTime - Date.now();
    const isExpired = timeUntilExpiry <= 0;

    return {
      hasToken: true,
      expiresAt: new Date(this.tokenExpiryTime).toISOString(),
      timeUntilExpiry: Math.max(0, timeUntilExpiry),
      isExpired,
      minutesUntilExpiry: Math.round(timeUntilExpiry / (60 * 1000)),
    };
  }

  stop() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      this.log("🛑 Token refresh stopped");
    }
  }

  // Manual refresh method for API endpoints
  async manualRefresh() {
    try {
      const token = await this.refreshToken();
      return { success: true, token, message: "Token refreshed successfully" };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Token refresh failed",
      };
    }
  }
}

// Create singleton instance
const tokenManager = new TokenManager();

export default tokenManager;
