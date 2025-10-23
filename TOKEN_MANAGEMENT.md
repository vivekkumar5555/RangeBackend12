# Token Management System

This backend now includes an enhanced token management system that automatically refreshes Zoho CRM access tokens every 9 minutes.

## Features

- ✅ **Automatic Token Refresh**: Tokens are refreshed every 9 minutes automatically
- ✅ **Comprehensive Logging**: All token operations are logged to console and file
- ✅ **Error Handling**: Robust error handling with retry mechanisms
- ✅ **Token Status Monitoring**: Real-time token status and expiry information
- ✅ **Manual Refresh**: API endpoints for manual token refresh
- ✅ **Environment Variables**: Secure credential management

## Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Zoho CRM API Configuration
ZOHO_REFRESH_TOKEN=your_refresh_token_here
ZOHO_CLIENT_ID=your_client_id_here
ZOHO_CLIENT_SECRET=your_client_secret_here
ZOHO_REDIRECT_URI=https://crm.zoho.in/

# Server Configuration
PORT=3001
NODE_ENV=production
```

## API Endpoints

### Get Current Token

```
GET /api/token
```

Returns the current access token and its status.

### Manually Refresh Token

```
POST /api/token/refresh
```

Manually triggers a token refresh.

### Get Token Status

```
GET /api/token/status
```

Returns detailed token status including expiry information.

## Logging

All token operations are logged to:

- **Console**: Real-time logs with emojis for easy identification
- **File**: `logs/token-logs.txt` for persistent logging

### Log Levels

- 🚀 **INFO**: Normal operations
- ⚠️ **WARN**: Warnings (e.g., token expiring soon)
- ❌ **ERROR**: Errors and failures

## Token Lifecycle

1. **Initialization**: Token manager starts and fetches initial token
2. **Automatic Refresh**: Every 1 minute, token is refreshed automatically
3. **Proactive Refresh**: If token expires within 30 seconds, immediate refresh is triggered
4. **Error Recovery**: Failed refreshes are retried with exponential backoff

## Deployment on Render

1. Set environment variables in Render dashboard:

   - `ZOHO_REFRESH_TOKEN`
   - `ZOHO_CLIENT_ID`
   - `ZOHO_CLIENT_SECRET`
   - `ZOHO_REDIRECT_URI`
   - `PORT` (optional, defaults to 3001)

2. Deploy your application - the token manager will start automatically

3. Monitor logs in Render dashboard to see token refresh operations

## Monitoring

Check token status by calling:

```bash
curl https://your-app.onrender.com/api/token/status
```

This will return:

```json
{
  "success": true,
  "status": {
    "hasToken": true,
    "expiresAt": "2024-01-15T10:30:00.000Z",
    "timeUntilExpiry": 540000,
    "isExpired": false,
    "minutesUntilExpiry": 9
  }
}
```
