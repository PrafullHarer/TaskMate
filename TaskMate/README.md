# TaskMate - Student Accountability Platform

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
- **Group Chat**: Built-in real-time messaging (requires separate Socket.io server for full functionality).

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Lucide Icons |
| **Backend** | Next.js API Routes (Serverless Functions) |
| **Database** | MongoDB with Mongoose |
| **Auth** | JWT (JSON Web Tokens) + BCrypt |
| **Real-time** | Socket.io (requires separate server) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TaskMate
   ```

2. **Install Dependencies**
   ```bash
   cd client
   npm install
   ```

### Configuration

Create a file named `.env.local` in the `client` directory:
```env
MONGODB_URI=mongodb://localhost:27017/taskmate
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NODE_ENV=development
```

### Running the Application

```bash
cd client
npm run dev
# App runs on http://localhost:3000
```

## 📡 API Routes

The API is built using Next.js API Routes (App Router):

| Feature | Method | Endpoint | Description |
|---------|--------|----------|-------------|
| **Auth** | POST | `/api/auth/signup` | Register new user |
| | POST | `/api/auth/login` | Authenticate user |
| | GET | `/api/auth/me` | Get current user profile |
| | POST | `/api/auth/logout` | Logout user |
| **Groups** | GET | `/api/groups` | List user's groups |
| | POST | `/api/groups` | Create new group |
| | GET | `/api/groups/[id]` | Get group details |
| **Tasks** | POST | `/api/tasks` | Create a task |
| | GET | `/api/tasks/my-tasks` | Get user's tasks |
| **Health** | GET | `/api/health` | Health check endpoint |

## 🚀 Deployment

### Deploy to Vercel (Recommended)

This project is optimized for Vercel deployment. See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

**Quick Steps:**
1. Push your code to GitHub
2. Import project in Vercel
3. Set root directory to `client`
4. Configure environment variables
5. Deploy!

**Note:** Socket.io real-time features require a separate server deployment (Railway, Render, etc.) as Vercel serverless functions don't support WebSockets.

### Alternative Deployment

For traditional frontend/backend separation, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🛡️ Security Features

- **Authentication**: Secure cookie/header based JWT auth.
- **Authorization**: Role-based access control (Admin vs Member) for group settings.
- **Data Integrity**: Input validation and error handling.

## 📚 Documentation

- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Detailed Vercel deployment guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Alternative deployment options
- [DOCUMENTATION.md](./DOCUMENTATION.md) - Technical documentation
- [USER_GUIDE.md](./USER_GUIDE.md) - User guide and features

## 👥 Credits

Developed by [Prafull Harer](https://github.com/PrafullHarer)

## 📄 License

MIT
