# FarmEase Backend - Security Configuration

## Production Deployment Guide

### Environment Variables (Recommended for Production)

Set these environment variables instead of using `appsettings.json` for sensitive data:

| Variable Name | Description | Example |
|---------------|-------------|---------|
| `ConnectionStrings__DefaultConnection` | Database connection string | `Server=prod-server;Database=FarmEaseDB;...` |
| `JWT_SECRET` | JWT signing key (min 32 chars) | `YourVeryLongSecretKeyHere...` |
| `JWT_ISSUER` | JWT issuer URL | `https://api.farmease.com` |
| `JWT_AUDIENCE` | JWT audience URL | `https://farmease.com` |
| `RAZORPAY_KEY` | Razorpay API key | `rzp_live_xxxxx` |
| `RAZORPAY_SECRET` | Razorpay API secret | `your-secret-key` |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook secret | `your-webhook-secret` |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_EMAIL` | SMTP email address | `noreply@farmease.com` |
| `SMTP_PASSWORD` | SMTP password/app password | `your-app-password` |
| `SMTP_ENABLE_SSL` | Enable SSL for SMTP | `true` |
| `ASPNETCORE_ENVIRONMENT` | Environment | `Production` |

### Security Features Implemented

1. **Secure Configuration** (`FECommon/Security/SecureConfiguration.cs`)
   - Environment variables take precedence over appsettings.json
   - Fallback to appsettings.json for development

2. **Input Sanitization** (`FECommon/Security/InputSanitizer.cs`)
   - Search input sanitization
   - Pagination validation
   - SQL injection pattern detection
   - XSS pattern detection
   - Email/phone validation

3. **Security Headers Middleware** (`FarmEase/Middleware/SecurityHeadersMiddleware.cs`)
   - X-Frame-Options: DENY (prevents clickjacking)
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection: 1; mode=block
   - Content-Security-Policy
   - Referrer-Policy
   - Permissions-Policy

4. **JWT Authentication**
   - HTTPS required in production
   - Token lifetime validation
   - Issuer/audience validation
   - Clock skew tolerance (5 minutes)

5. **Rate Limiting**
   - Auth endpoints: 5 requests/minute (strict)
   - General API: 100 requests/minute (moderate)
   - IP-based sliding window

6. **Identity Security**
   - Password: 8+ chars, requires digit
   - Lockout: 5 failed attempts, 5-minute lockout
   - Unique email required
   - 2FA support (TOTP, email, backup codes)

### Setting Environment Variables

#### Windows (PowerShell)
```powershell
$env:JWT_SECRET="YourVeryLongSecretKeyHere..."
$env:ASPNETCORE_ENVIRONMENT="Production"
```

#### Windows (Command Prompt)
```cmd
set JWT_SECRET=YourVeryLongSecretKeyHere...
set ASPNETCORE_ENVIRONMENT=Production
```

#### Linux/macOS
```bash
export JWT_SECRET="YourVeryLongSecretKeyHere..."
export ASPNETCORE_ENVIRONMENT="Production"
```

#### Docker
```bash
docker run -e JWT_SECRET="YourSecretKey..." -e ASPNETCORE_ENVIRONMENT=Production farmease-api
```

#### Azure App Service
Set in Configuration > Application settings or use Azure Key Vault.

### Production Checklist

- [ ] Set `ASPNETCORE_ENVIRONMENT=Production`
- [ ] Configure all environment variables
- [ ] Ensure HTTPS is enabled (automatic with `RequireHttpsMetadata=true` in production)
- [ ] Update CORS origins in `Program.cs` for production domains
- [ ] Remove or secure Swagger endpoint (consider API explorer only for authorized users)
- [ ] Configure proper logging level (Warning for production)
- [ ] Set up SSL certificate
- [ ] Configure database with proper connection pooling
- [ ] Enable Redis for distributed caching (recommended)
- [ ] Set up health check endpoints
- [ ] Configure backup and monitoring
