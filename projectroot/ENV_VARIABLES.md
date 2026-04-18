# Environment Variables Reference

## Quick Setup

Copy and fill in the values below in your `.env.local`:

```bash
# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Backend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
API_SECRET_KEY=

# Email Service
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@vitalid.com

# Security
JWT_SECRET=
JWT_EXPIRY=24h

# Feature Flags
ENABLE_DOCTOR_VERIFICATION=true
ENABLE_MFA=false
DEMO_MODE=false

# Optional: Blockchain/Credentials
BLOCKCHAIN_API_KEY=
BLOCKCHAIN_NETWORK=testnet
```

## Environment Variable Definitions

| Variable | Required | Type | Description |
|----------|----------|------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | string | Your Supabase project URL (ends with `.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | string | Supabase anonymous public key for frontend auth |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | string | Server-side secret key (NEVER expose in frontend) |
| `NEXT_PUBLIC_API_URL` | ✅ | string | Backend API endpoint (localhost for dev, production URL for prod) |
| `API_SECRET_KEY` | ✅ | string | Secret key for backend API authentication |
| `SENDGRID_API_KEY` | ✅ | string | SendGrid email service API key |
| `SENDGRID_FROM_EMAIL` | ✅ | string | Default sender email address |
| `JWT_SECRET` | ✅ | string | Secret key for signing JWT tokens |
| `JWT_EXPIRY` | ✅ | string | JWT expiration time (e.g., "24h", "7d") |
| `ENABLE_DOCTOR_VERIFICATION` | ❌ | boolean | Enable doctor license verification feature |
| `ENABLE_MFA` | ❌ | boolean | Enable multi-factor authentication |
| `DEMO_MODE` | ❌ | boolean | Run in demo mode (without real Supabase) |
| `BLOCKCHAIN_API_KEY` | ❌ | string | Blockchain service API key (optional) |
| `BLOCKCHAIN_NETWORK` | ❌ | string | Blockchain network (testnet/mainnet) |

## Getting Started

### 1. Supabase Keys
Go to [https://app.supabase.com](https://app.supabase.com)
- Settings > API > Copy `Project URL` and `anon public` key

### 2. SendGrid Key
1. Sign up at [https://sendgrid.com](https://sendgrid.com)
2. Go to Settings > API Keys
3. Create new API key with Mail Send permission

### 3. JWT Secret
Generate with:
```bash
openssl rand -base64 32
```

### 4. API Secret Key
Generate with:
```bash
openssl rand -hex 32
```

## Development vs Production

- **Development**: Uses `localhost:3001` for API, can use test SendGrid key
- **Production**: Uses production domain, requires verified SendGrid sender, strong secrets

## Security Notes

⚠️ **Never commit `.env.local` to git**
- `.env.local` is already in `.gitignore`
- Service role key should ONLY be in server-side `.env` files
- Never expose `API_SECRET_KEY` in frontend code
