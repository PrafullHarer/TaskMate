# Deployment Guide

This project can be deployed in two ways:

## Option 1: Full Vercel Deployment (Recommended for Simplicity)

The project has been converted to be fully compatible with Vercel. API routes have been converted from Express to Next.js API routes. See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

**Note:** Socket.io real-time features require a separate server as Vercel serverless functions don't support WebSockets.

## Option 2: Separate Frontend/Backend (Original Setup)

Since this project consists of a **Next.js Frontend** and a separate **Express Backend** (with WebSockets), you can also host them on separate services that are optimized for their needs.

## 1. Deploy Backend (Server)
**Service**: Render, Railway, or Heroku (Platforms that support long-running Node.js processes).

1.  **Push your code to GitHub**.
2.  **Create a new Web Service** on your chosen platform (e.g., Render) and point it to your repository.
3.  **Root Directory**: Set to `server`.
4.  **Build Command**: `npm install`
5.  **Start Command**: `node server.js` (or `npm start`)
6.  **Environment Variables**: Add these key-value pairs in the dashboard:
    *   `PORT`: `5000` (or leave empty if platform assigns one)
    *   `MONGODB_URI`: `your_production_mongodb_connection_string`
    *   `JWT_SECRET`: `your_secure_random_production_secret`
    *   `CLIENT_URL`: `https://your-vercel-frontend-url.vercel.app` (You will update this *after* deploying frontend)

> **Note**: Copy the URL provided by the hosting service (e.g., `https://my-api.onrender.com`). This is your **Backend URL**.

## 2. Deploy Frontend (Client)
**Service**: Vercel.

1.  **Go to Vercel Dashboard** and click **"Add New..."** -> **"Project"**.
2.  **Import your GitHub Repository**.
3.  **Framework Preset**: Next.js (should detect automatically).
4.  **Root Directory**: Click "Edit" and select `client`.
5.  **Environment Variables**: Add these:
    *   `NEXT_PUBLIC_API_URL`: `https://my-api.onrender.com/api` (Point to your Backend URL + `/api`)
    *   `NEXT_PUBLIC_SOCKET_URL`: `https://my-api.onrender.com` (Point to your Backend URL base)
6.  **Click "Deploy"**.

## 3. Final Connection
1.  Once Vercel finishes, copy your new **Frontend URL** (e.g., `https://taskmate-app.vercel.app`).
2.  Go back to your **Backend Host (Render/Railway)** settings.
3.  Update the `CLIENT_URL` variable to your new Frontend URL.
4.  **Redeploy Backend** if necessary (most platforms auto-restart on env change).

## Verification
-   Open your Vercel URL.
-   Try `Login`/`Signup`. If it works, the API connection is successful.
-   Check real-time features (like joining a group) to verify Socket.io is working.
