# Render Deployment Guide - Token Management System

## 🚀 Deployment Steps for Render

### 1. Environment Variables Setup

In your Render dashboard, set these environment variables:

```env
NODE_ENV=production
PORT=3001

# Zoho CRM API Configuration
ZOHO_REFRESH_TOKEN=your_refresh_token_here
ZOHO_CLIENT_ID=your_client_id_here
ZOHO_CLIENT_SECRET=your_client_secret_here
ZOHO_REDIRECT_URI=https://crm.zoho.in/
```

### 2. Build Settings

- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Node Version**: 18.x or higher

### 3. Monitoring Endpoints

After deployment, you can monitor your token management system using these endpoints:

#### Health Check

```bash
GET https://your-app.onrender.com/api/health
```

Returns:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "memory": {...},
  "token": {
    "hasToken": true,
    "isExpired": false,
    "minutesUntilExpiry": 45
  }
}
```

#### Token Status

```bash
GET https://your-app.onrender.com/api/token/status
```

#### Manual Token Refresh

```bash
POST https://your-app.onrender.com/api/token/refresh
```

### 4. Common Issues and Solutions

#### Issue: Token not refreshing after first time

**Causes:**

1. Rate limiting from Zoho API
2. Environment variables not set correctly
3. Server restarting frequently

**Solutions:**

- ✅ **Rate Limiting**: The system now handles this automatically with exponential backoff
- ✅ **Environment Variables**: Ensure all Zoho credentials are set in Render dashboard
- ✅ **Server Stability**: Added graceful shutdown handling

#### Issue: Server crashes on startup

**Causes:**

1. Missing dependencies
2. Invalid environment variables
3. Port conflicts

**Solutions:**

- ✅ **Dependencies**: All required packages are in package.json
- ✅ **Environment**: Added validation and fallback values
- ✅ **Port**: Uses Render's PORT environment variable

### 5. Logging and Monitoring

#### Console Logs in Render

The system logs all token operations to console. In Render dashboard, you can see:

- 🚀 Token manager initialization
- 🔄 Token refresh attempts
- ✅ Successful token refreshes
- ❌ Error messages with details
- ⏰ Automatic refresh schedule

#### Log File

Token operations are also logged to `logs/token-logs.txt` (if file system is available).

### 6. Token Refresh Schedule

- **Automatic Refresh**: Every 1 minute
- **Proactive Refresh**: When token expires within 30 seconds
- **Error Recovery**: Exponential backoff for failed attempts
- **Rate Limit Handling**: 2-minute delay for Zoho rate limits

### 7. Testing Your Deployment

1. **Check Health**: `GET /api/health`
2. **Verify Token**: `GET /api/token/status`
3. **Test Manual Refresh**: `POST /api/token/refresh`
4. **Monitor Logs**: Check Render console for token operations

### 8. Troubleshooting

If tokens are not refreshing:

1. **Check Environment Variables**:

   ```bash
   curl https://your-app.onrender.com/api/health
   ```

2. **Check Logs**: Look for error messages in Render console

3. **Manual Refresh**: Try manual refresh endpoint

4. **Verify Zoho Credentials**: Ensure refresh token is valid and not expired

### 9. Performance Optimization

The system is optimized for production:

- ✅ **Memory Efficient**: Single token manager instance
- ✅ **Error Resilient**: Continues operation even with token failures
- ✅ **Rate Limit Aware**: Respects Zoho API limits
- ✅ **Graceful Shutdown**: Proper cleanup on server restart

### 10. Security Notes

- 🔒 **Environment Variables**: Never commit credentials to code
- 🔒 **HTTPS Only**: All API calls use HTTPS
- 🔒 **Token Rotation**: Tokens are refreshed automatically
- 🔒 **Error Handling**: Sensitive information is not logged
