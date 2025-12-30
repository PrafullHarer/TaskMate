# Accountable - Student Accountability Platform

A comprehensive platform where student groups hold each other accountable through daily tasks, verification, and a gamified coin-based reward system.

## 🌟 Features

### 👥 Group Management
- **Create & Join**: Create private groups or join existing ones via invite codes.
- **Admin Controls**: Group admins can manage members and configure group settings.
- **Configurable Reset**: Admins can set leaderboard reset frequencies to **Weekly**, **Bi-weekly**, or **Monthly**.

### ✅ Task Management
- **Smart Tasks**: Create tasks with customizable Priority (Low/Medium/High) and Effort (1-5) levels.
- **Due Dates**: Set deadlines for your goals.
- **Verification**: Support for self-verification.

### 🪙 Gamified Economy
- **Earn Coins**: Complete tasks to earn coins. Higher priority and effort tasks yield more coins.
- **Real-time Updates**: Coin balances update instantly upon task completion, providing immediate feedback.
- **Per-Group Economy**: Your coin balance is tracked separately for each group you belong to.
- **⛔ Penalties**: Accountability matters! Overdue tasks incur a **20 coin penalty** by default.
- **Global Points**: Convert your hard work into Global Points (10 Coins = 1 Point) to climb the platform-wide rankings.

### 🏆 Leaderboards
- **Weekly Leaderboard**: See who is winning the current sprint in your group.
- **Lifetime Leaderboard**: Track long-term consistency within your group.
- **Global Leaderboard**: Compete with all users on the platform based on your Global Points.
- **Hall of Shame**: "Lowest Performer" highlights users who need a nudge.

### 💬 Real-time Collaboration
- **Group Chat**: Built-in real-time messaging using Socket.io to stay connected with your accountability partners.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS v4, Lucide Icons |
| **Backend** | Node.js, Express.js (Serverless) |
| **Database** | MongoDB with Mongoose |
| **Auth** | JWT (JSON Web Tokens) + BCrypt |
| **Scheduling** | Vercel Cron (for weekly resets) |

## 📁 Project Structure

```
TaskMate/
├── client/                 # Next.js frontend + Express API
│   ├── src/               # Next.js pages and components
│   └── api/               # Express backend (serverless)
│       ├── routes/        # API routes
│       ├── models/        # MongoDB models
│       ├── middleware/    # Auth middleware
│       └── config/        # Database config
├── vercel.json            # Vercel deployment config
├── package.json           # Root package with dependencies
└── .env.example           # Environment variables template
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taskmate
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

### Configuration

Create a `.env` file in the root directory (copy from `.env.example`):
```env
MONGODB_URI=mongodb://localhost:27017/taskmate
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### Running the Application

```bash
npm run dev
# App runs on http://localhost:3000
```

## 🚀 Deployment

Deploy to Vercel as a **single project** - see [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) for step-by-step instructions.

## 📡 API Overview

| Feature | Method | Endpoint | Description |
|---------|--------|----------|-------------|
| **Auth** | POST | `/api/auth/login` | Authenticate user |
| | GET | `/api/auth/me` | Get current user profile |
| **Groups** | GET | `/api/groups` | List user's groups |
| | POST | `/api/groups` | Create new group |
| | PUT | `/api/groups/:id` | Update group settings (Admin only) |
| **Tasks** | POST | `/api/tasks` | Create a task |
| | PUT | `/api/tasks/:id/complete` | Complete a task (Awards coins) |
| **LB** | GET | `/api/leaderboard/:groupId` | Get group leaderboard |
| | GET | `/api/leaderboard/global/top` | Get global point rankings |

## 🛡️ Security Features

- **Authentication**: Secure cookie/header based JWT auth.
- **Authorization**: Role-based access control (Admin vs Member) for group settings.
- **Data Integrity**: Rate limiting and input validation.

## 👥 Credits

Developed by [Prafull Harer](https://github.com/PrafullHarer)

## 📄 License

MIT
