# Project Structure

This document describes the cleaned project structure optimized for Vercel deployment.

## Root Directory

```
TaskMate/
├── client/                 # Next.js application (root for Vercel)
├── vercel.json            # Vercel configuration
├── README.md              # Main project documentation
├── DEPLOYMENT.md          # Deployment options guide
├── VERCEL_DEPLOYMENT.md   # Detailed Vercel deployment guide
├── DOCUMENTATION.md       # Technical documentation
├── USER_GUIDE.md          # User guide
└── .gitignore             # Git ignore rules
```

## Client Directory (`client/`)

```
client/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes (Serverless Functions)
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── groups/         # Group management endpoints
│   │   │   ├── tasks/          # Task management endpoints
│   │   │   └── health/         # Health check endpoint
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── login/              # Login page
│   │   ├── signup/             # Signup page
│   │   └── ...                 # Other pages
│   ├── components/             # React components
│   ├── contexts/               # React contexts (Auth, Socket)
│   ├── lib/                    # Utility libraries
│   │   ├── server/             # Server-side utilities
│   │   │   ├── db.ts           # Database connection
│   │   │   ├── middleware/     # Auth & group middleware
│   │   │   └── models/         # Mongoose models
│   │   ├── api.ts              # Client-side API client
│   │   ├── auth.ts             # Auth utilities
│   │   ├── socket.ts           # Socket.io client (optional)
│   │   └── utils.ts            # General utilities
│   ├── middleware.ts           # Next.js middleware
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
├── package.json                # Dependencies (includes server deps)
├── tsconfig.json               # TypeScript configuration
├── next.config.ts              # Next.js configuration
└── ...                         # Other config files
```

## Key Files

### Configuration
- `vercel.json` - Vercel deployment configuration
- `client/package.json` - All dependencies (frontend + backend)
- `client/tsconfig.json` - TypeScript configuration
- `client/next.config.ts` - Next.js configuration

### API Routes
All API routes are in `client/src/app/api/`:
- `auth/` - Authentication (signup, login, logout, me)
- `groups/` - Group management
- `tasks/` - Task management
- `health/` - Health check

### Server Utilities
Server-side code is in `client/src/lib/server/`:
- `db.ts` - MongoDB connection with connection pooling
- `middleware/` - Authentication and authorization middleware
- `models/` - Mongoose models (User, Group, Task, etc.)

## What Was Removed

- ✅ `server/` directory - All Express backend code removed
- ✅ `client/README.md` - Default Next.js template removed
- ✅ `VERCEL_SETUP_SUMMARY.md` - Consolidated into main docs

## Deployment Notes

- **Root Directory for Vercel**: `client`
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Environment Variables**: Set in Vercel dashboard (see VERCEL_DEPLOYMENT.md)

## Socket.io Note

Socket.io client code remains in `client/src/lib/socket.ts` and `client/src/contexts/SocketContext.tsx` but will only work if a separate Socket.io server is deployed. The code will fail gracefully if no socket server is configured.

