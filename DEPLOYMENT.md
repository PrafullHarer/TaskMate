# Deployment Guide

## Overview

TaskMate is a monorepo with two deployable components:
- **Frontend** (`client/`) - Next.js application
- **Backend** (`server/`) - Express.js API (Serverless on Vercel)

Both are deployed as **separate Vercel projects** from the same GitHub repository.

---

## Quick Start

👉 **For step-by-step instructions, see [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)**

---

## Deployment Architecture

```
GitHub Repository
       │
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
┌─────────────────┐            ┌─────────────────┐
│  Vercel Project │            │  Vercel Project │
│   (Frontend)    │            │    (Backend)    │
│                 │            │                 │
│  Root: client/  │◄──────────►│  Root: server/  │
│  Framework:     │    API     │  Runtime:       │
│  Next.js        │   Calls    │  Node.js        │
└─────────────────┘            └─────────────────┘
        │                              │
        │                              │
        ▼                              ▼
   User Browser               MongoDB Atlas
```

---

## Prerequisites

1. **GitHub Account** with this repository pushed
2. **Vercel Account** (free tier available)
3. **MongoDB Atlas** database (free tier available)

---

## Environment Variables

### Backend (`server/`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGODB_URI` | ✅ | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | ✅ | Secret for JWT signing (32+ chars) | `your-super-secret-key-here` |
| `JWT_EXPIRE` | ✅ | Token expiration period | `7d` |
| `NODE_ENV` | ✅ | Environment mode | `production` |
| `CLIENT_URL` | ✅ | Frontend URL (for CORS) | `https://taskmate.vercel.app` |
| `CRON_SECRET` | ⚠️ | Secret for cron job authentication | `cron-secret-key` |

### Frontend (`client/`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API base URL | `https://taskmate-api.vercel.app/api` |
| `NEXT_PUBLIC_SOCKET_URL` | ❌ | WebSocket server URL | `wss://your-ws-server.com` |

---

## Vercel Project Configuration

### Backend Project Settings
- **Root Directory**: `server`
- **Framework Preset**: Other
- **Build Command**: `npm install` (default)
- **Output Directory**: (leave empty)
- **Install Command**: `npm install` (default)

### Frontend Project Settings
- **Root Directory**: `client`
- **Framework Preset**: Next.js (auto-detected)
- **Build Command**: `npm run build` (default)
- **Output Directory**: (auto-configured)
- **Install Command**: `npm install` (default)

---

## Cron Jobs

The backend is configured with a weekly reset cron job:

```json
{
  "crons": [
    {
      "path": "/api/admin/cron/reset",
      "schedule": "0 0 * * 0"
    }
  ]
}
```

This runs every Sunday at midnight UTC. Vercel will automatically call this endpoint.

> **Note**: For Pro/Enterprise plans, you can add more cron jobs. Free tier has limitations.

---

## WebSocket Limitation

⚠️ **Important**: Vercel Serverless Functions do **NOT** support persistent WebSocket connections.

### Impact
- Real-time chat will not work
- Live notifications will not work
- Any Socket.io features will be unavailable

### Solution
If you need real-time features, deploy the server to a persistent hosting platform:
- [Railway](https://railway.app) - Easy setup, free tier
- [Render](https://render.com) - Free tier with sleep
- [Fly.io](https://fly.io) - Good free tier
- [DigitalOcean App Platform](https://digitalocean.com) - Paid

Then update `NEXT_PUBLIC_SOCKET_URL` in the frontend to point to that server.

---

## Local Development

### Running Both Services

```bash
# Terminal 1: Backend
cd server
npm install
npm run dev

# Terminal 2: Frontend
cd client
npm install
npm run dev
```

### Local Environment Files

Create `.env` files for local development:

**server/.env**
```env
MONGODB_URI=mongodb://localhost:27017/taskmate
JWT_SECRET=local-dev-secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

**client/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Troubleshooting

### Build Failures
1. Check Vercel build logs
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version compatibility

### CORS Errors
1. Ensure `CLIENT_URL` in backend matches frontend URL exactly
2. No trailing slashes
3. Redeploy backend after updating env vars

### API 404 Errors
1. Verify `NEXT_PUBLIC_API_URL` ends with `/api`
2. Check backend deployment logs
3. Test `/api/health` endpoint directly

### Database Connection Issues
1. Verify `MONGODB_URI` is correct
2. Check MongoDB Atlas Network Access (allow 0.0.0.0/0)
3. Ensure database user credentials are correct

---

## Automatic Deployments

Once connected to GitHub, Vercel provides:
- **Production deployments** on pushes to `main`
- **Preview deployments** on pull requests
- **Instant rollbacks** to any previous deployment

---

## Security Checklist

- [ ] `JWT_SECRET` is a strong, unique value
- [ ] `CRON_SECRET` is set if using cron jobs
- [ ] MongoDB Atlas IP whitelist is configured
- [ ] Environment variables are NOT committed to Git
- [ ] HTTPS is enforced (Vercel does this automatically)
