# Vercel Deployment Guide

This guide will help you deploy TaskMate to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A MongoDB database (MongoDB Atlas recommended for production)
- GitHub account (for connecting your repository)

## Important Notes

### Socket.io Limitation

**Vercel serverless functions do not support persistent WebSocket connections.** This means Socket.io real-time features (like live chat and task updates) will not work with the standard Vercel deployment.

**Options for Socket.io:**
1. **Deploy Socket.io server separately** on a platform that supports WebSockets (Railway, Render, Heroku, etc.)
2. **Use Vercel's Edge Functions** with alternative real-time solutions (Pusher, Ably, etc.)
3. **Disable real-time features** temporarily

For now, the API routes have been converted to work without Socket.io. Real-time features will need to be handled separately.

## Step-by-Step Deployment

### 1. Prepare Your Repository

1. Push your code to GitHub if you haven't already
2. Ensure all changes are committed

### 2. Set Up MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use `0.0.0.0/0` for Vercel)
5. Get your connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)

### 3. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `client`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### 4. Configure Environment Variables

In the Vercel project settings, add these environment variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmate
JWT_SECRET=your-super-secret-random-string-min-32-characters
JWT_EXPIRE=7d
CLIENT_URL=https://your-app.vercel.app
NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.com (if using separate Socket.io server)
NODE_ENV=production
```

**Important:**
- Generate a strong `JWT_SECRET` (use a random string generator)
- Update `CLIENT_URL` after your first deployment
- `NEXT_PUBLIC_*` variables are exposed to the browser

### 5. Deploy

1. Click **"Deploy"**
2. Wait for the build to complete
3. Your app will be live at `https://your-app.vercel.app`

### 6. Update Environment Variables

After deployment:
1. Copy your Vercel deployment URL
2. Go to Project Settings → Environment Variables
3. Update `CLIENT_URL` to your Vercel URL
4. Redeploy (or wait for automatic redeploy)

## Project Structure

The project has been restructured for Vercel compatibility:

```
client/
├── src/
│   ├── app/
│   │   └── api/          # Next.js API routes (converted from Express)
│   ├── lib/
│   │   └── server/        # Server-side utilities
│   │       ├── db.ts      # Database connection
│   │       ├── models/    # Mongoose models
│   │       └── middleware/ # Auth & group middleware
│   └── ...
├── package.json           # Includes server dependencies
└── ...
```

## API Routes Converted

The following Express routes have been converted to Next.js API routes:

- ✅ `/api/auth/signup` - User registration
- ✅ `/api/auth/login` - User login
- ✅ `/api/auth/me` - Get current user
- ✅ `/api/auth/logout` - Logout
- ✅ `/api/groups` - List/Create groups
- ✅ `/api/groups/[id]` - Get group details
- ✅ `/api/tasks` - Create task
- ✅ `/api/tasks/my-tasks` - Get user tasks
- ✅ `/api/health` - Health check

**Note:** Additional routes (users, messages, notifications, leaderboard, admin) can be converted following the same pattern. See existing routes in `client/src/app/api/` for examples.

## Converting Additional Routes

To convert remaining Express routes to Next.js API routes:

1. Create route file: `client/src/app/api/[route]/route.ts`
2. Use the pattern from existing routes
3. Import middleware: `import { protect } from '@/lib/server/middleware/auth'`
4. Use `NextRequest` and `NextResponse` from `next/server`
5. Export async functions: `GET`, `POST`, `PUT`, `DELETE`

Example:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/server/db';
import { protect } from '@/lib/server/middleware/auth';

export async function GET(req: NextRequest) {
  await connectDB();
  const authResult = await protect(req);
  if (authResult instanceof NextResponse) return authResult;
  
  // Your route logic here
  return NextResponse.json({ success: true });
}
```

## Troubleshooting

### Build Errors

- **Module not found**: Ensure all dependencies are in `client/package.json`
- **Type errors**: Check that TypeScript paths are configured in `tsconfig.json`

### Runtime Errors

- **Database connection**: Verify `MONGODB_URI` is correct and MongoDB allows connections from Vercel IPs
- **JWT errors**: Ensure `JWT_SECRET` is set and consistent
- **CORS errors**: Check `CLIENT_URL` matches your Vercel deployment URL

### Socket.io Not Working

This is expected. Vercel serverless functions don't support WebSockets. You'll need to:
1. Deploy Socket.io server separately (Railway, Render, etc.)
2. Update `NEXT_PUBLIC_SOCKET_URL` to point to your Socket.io server
3. Or use an alternative real-time solution

## Next Steps

1. Convert remaining API routes (users, messages, notifications, etc.)
2. Set up separate Socket.io server if real-time features are needed
3. Configure custom domain in Vercel
4. Set up monitoring and error tracking
5. Configure automatic deployments from main branch

## Support

For issues specific to:
- **Vercel**: Check [Vercel Documentation](https://vercel.com/docs)
- **Next.js**: Check [Next.js Documentation](https://nextjs.org/docs)
- **MongoDB**: Check [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)

