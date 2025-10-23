// Token Management Configuration
export const TOKEN_CONFIG = {
  // Testing mode - refresh every 1 minute
  TESTING: {
    refreshIntervalMinutes: 1,
    proactiveRefreshSeconds: 30,
    logPrefix: "🧪 [TESTING]",
  },

  // Production mode - refresh every 9 minutes
  PRODUCTION: {
    refreshIntervalMinutes: 9,
    proactiveRefreshSeconds: 120, // 2 minutes
    logPrefix: "🚀 [PRODUCTION]",
  },
};

// Get current configuration based on environment
export const getTokenConfig = () => {
  const isTesting =
    process.env.NODE_ENV !== "production" ||
    process.env.TOKEN_TESTING_MODE === "true";
  return isTesting ? TOKEN_CONFIG.TESTING : TOKEN_CONFIG.PRODUCTION;
};
