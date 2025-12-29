# Deployment Guide

## Deploying to Vercel

This project is configured for deployment on [Vercel](https://vercel.com).

### Prerequisites

1.  A Vercel account.
2.  A MongoDB Atlas database (or other cloud MongoDB).
3.  **Optional but Recommended**: A separate server for WebSockets (e.g., Render, Railway) if you need real-time features. Vercel Serverless functions do **not** support persistent WebSockets.

### 1. Backend Deployment (Serverless API)

The `server` directory is configured to run as a Serverless function.

1.  Push this repository to GitHub.
2.  Import the project into Vercel.
3.  **Root Directory**: Select `server` as the root directory for the backend project.
4.  **Build Command**: `npm install` (or leave default).
5.  **Output Directory**: Leave default.
6.  **Environment Variables**:
    *   `MONGODB_URI`: Your MongoDB connection string.
    *   `JWT_SECRET`: A secure random string.
    *   `JWT_EXPIRE`: `7d`.
    *   `CLIENT_URL`: The URL of your deployed frontend (add this after deploying frontend).
    *   `CRON_SECRET`: A secure random string for protecting cron jobs.

#### Cron Jobs (Weekly Reset & Penalties)
Vercel Cron is configured in `vercel.json` to trigger `/api/admin/cron/reset`.
*   You **must** set the `CRON_SECRET` environment variable in Vercel to match the one you use in your request header, but Vercel manages this automatically if you use their Cron settings or just secure the endpoint. The implementation checks for `Bearer <CRON_SECRET>`.
*   **Important**: In the standard Vercel Cron setup, Vercel sends a specific header. For this custom implementation, ensure you set up a customized job or use a service like GitHub Actions or EasyCron to hit `GET /api/admin/cron/reset` with `Authorization: Bearer <YOUR_CRON_SECRET>`.
*   *Correction*: The `vercel.json` `crons` field automatically configures it. Vercel will attempt to call these endpoints. Note that Vercel Cron requests might need validation adjustments if using the built-in feature.

### 2. Frontend Deployment (Client)

1.  Import the project into Vercel (create a **new** project in Vercel, separate from the server).
2.  **Root Directory**: Select `client` as the root directory.
3.  **Framework Preset**: Next.js.
4.  **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: The URL of your deployed backend (e.g., `https://your-server-app.vercel.app/api`).
    *   `NEXT_PUBLIC_SOCKET_URL`: The URL of your persistent WebSocket server (if you have one). If you don't have one, real-time features will not work.

### WebSocket Limitation
Since Vercel Serverless functions spin down, they cannot maintain open WebSocket connections.
- **Impact**: Real-time chat and notifications will not work with the Vercel-deployed server.
- **Solution**: Deploy the `server` directory to a platform like **Render**, **Railway**, or **Heroku** which supports persistent Node.js processes. If you do this, you don't need the `vercel.json` or `api/index.js` adaptations, but they won't hurt.

### 3. Final Configuration
After both are deployed:
1.  Update the **Backend** `CLIENT_URL` var to point to the Frontend URL.
2.  Update the **Frontend** `NEXT_PUBLIC_API_URL` var to point to the Backend URL.
