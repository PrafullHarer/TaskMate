# Quick Deploy to Vercel via GitHub

This guide walks you through deploying TaskMate to Vercel from your GitHub repository.

## Prerequisites

1. A [GitHub](https://github.com) account with this repository pushed
2. A [Vercel](https://vercel.com) account (free tier works)
3. A [MongoDB Atlas](https://mongodb.com/atlas) database (or other cloud MongoDB)

---

## Step 1: Push to GitHub

If you haven't already, push your code to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

## Step 2: Deploy Backend (API Server)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `TaskMate` repository
4. Configure the project:
   - **Project Name**: `taskmate-api` (or your preference)
   - **Root Directory**: Click "Edit" and enter `server`
   - **Framework Preset**: Other
5. Expand **"Environment Variables"** and add:

   | Variable | Value |
   |----------|-------|
   | `MONGODB_URI` | Your MongoDB connection string |
   | `JWT_SECRET` | A secure random string (32+ characters) |
   | `JWT_EXPIRE` | `7d` |
   | `NODE_ENV` | `production` |
   | `CLIENT_URL` | (Leave empty for now, add after frontend deploy) |
   | `CRON_SECRET` | A secure random string for cron jobs |

6. Click **"Deploy"**
7. **Copy the deployment URL** (e.g., `https://taskmate-api.vercel.app`)

---

## Step 3: Deploy Frontend (Next.js Client)

1. Go to [vercel.com/new](https://vercel.com/new) again
2. Import the **same** repository
3. Configure the project:
   - **Project Name**: `taskmate-app` (or your preference)
   - **Root Directory**: Click "Edit" and enter `client`
   - **Framework Preset**: Next.js (auto-detected)
4. Expand **"Environment Variables"** and add:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_API_URL` | Your backend URL + `/api` (e.g., `https://taskmate-api.vercel.app/api`) |
   | `NEXT_PUBLIC_SOCKET_URL` | (Optional) WebSocket server URL if using a persistent server |

5. Click **"Deploy"**
6. **Copy the deployment URL** (e.g., `https://taskmate-app.vercel.app`)

---

## Step 4: Update Backend CORS

1. Go to your **backend project** in Vercel dashboard
2. Navigate to **Settings → Environment Variables**
3. Add/Update `CLIENT_URL` with your frontend URL (e.g., `https://taskmate-app.vercel.app`)
4. Click **Redeploy** from the Deployments tab (select "Redeploy" from the `...` menu)

---

## Step 5: Verify Deployment

### Backend Health Check
Visit: `https://your-backend-url.vercel.app/api/health`

Expected response:
```json
{"status":"OK","timestamp":"2025-12-30T..."}
```

### Frontend
Visit your frontend URL and:
1. Check the login page loads
2. Try creating an account
3. Verify API calls work (check browser DevTools → Network tab)

---

## Automatic Deployments

Once connected, Vercel will **automatically deploy** when you:
- Push to your `main` branch
- Create pull requests (preview deployments)

---

## Environment Variables Reference

### Backend (`server/`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret for JWT token signing |
| `JWT_EXPIRE` | ✅ | Token expiration (e.g., `7d`) |
| `NODE_ENV` | ✅ | Set to `production` |
| `CLIENT_URL` | ✅ | Frontend URL for CORS |
| `CRON_SECRET` | ⚠️ | Required if using cron jobs |

### Frontend (`client/`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API base URL |
| `NEXT_PUBLIC_SOCKET_URL` | ❌ | WebSocket server (if using) |

---

## Troubleshooting

### "API routes not working"
- Ensure `NEXT_PUBLIC_API_URL` ends with `/api`
- Check browser DevTools for CORS errors
- Verify `CLIENT_URL` in backend matches frontend exactly

### "CORS errors"
- Update `CLIENT_URL` in backend with exact frontend URL (no trailing slash)
- Redeploy the backend after updating

### "Database connection failed"
- Verify `MONGODB_URI` is correct
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### "Build failed"
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`

---

## WebSocket Limitation

> ⚠️ **Note**: Vercel Serverless Functions do NOT support persistent WebSocket connections.

For real-time features (chat, live notifications), deploy the server to:
- [Railway](https://railway.app)
- [Render](https://render.com)
- [Fly.io](https://fly.io)

Then update `NEXT_PUBLIC_SOCKET_URL` in the frontend to point to that server.
