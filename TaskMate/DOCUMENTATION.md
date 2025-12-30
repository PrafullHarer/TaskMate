# 🛠️ Accountable - Technical Documentation

This document provides a technical overview of the Accountable platform, including architecture, database schemas, and system logic.

---

## 🏗️ System Architecture

The application follows a standard **Client-Server** architecture (MERN stack variant):

- **Frontend**: Next.js 14 (App Router)
  - Hosted on port `3000` (dev).
  - Uses `Tailwind CSS v4` for styling.
  - State management via React Context (`AuthContext`, `SocketContext`).
- **Backend**: Express.js / Node.js
  - Hosted on port `5000` (dev).
  - Exposes RESTful API endpoints at `/api`.
  - Manages real-time events via `Socket.io`.
- **Database**: MongoDB
  - Connected via `Mongoose` ODM.
  - Includes a `reset_db.js` utility for development resets.

---

## 🗄️ Database Schemas

### 1. User (`models/User.js`)
| Field | Type | Description |
|-------|------|-------------|
| `name` | String | User's full name |
| `email` | String | Unique email address |
| `password` | String | BCrypt hashed password |
| `groupCoins` | Array | **NEW**: Per-group coin tracking. Object: `{ group: ObjectId, weeklyCoins: Number, lifetimeCoins: Number }` |
| `achievements` | Array | List of earned badges/achievements |

### 2. Group (`models/Group.js`)
| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Group display name |
| `members` | Array<ObjectId> | References to User users |
| `admin` | ObjectId | Reference to User (Owner) |
| `settings.resetFrequency` | String | Enum: `['weekly', 'biweekly', 'monthly']`. Default: `'weekly'` |
| `lastResetDate` | Date | Timestamp of last leaderboard reset |
| `nextResetDate` | Date | Timestamp of scheduled next reset |

### 3. Task (`models/Task.js`)
| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Task summary |
| `status` | String | Enum: `['pending', 'completed', 'verified']` |
| `priority` | String | Enum: `['low', 'medium', 'high']`. Multiplier: 1x, 1.5x, 2x |
| `effort` | Number | 1-5 scale. Multiplier: `effort * 0.5` |
| `coinsEarned` | Number | Coins awarded on completion |
| `penalized` | Boolean | True if penalty has been applied for overdue status |

### 4. Notification (`models/Notification.js`)
| Field | Type | Description |
|-------|------|-------------|
| `user` | ObjectId | Recipient user |
| `type` | String | Notification type (e.g. 'system', 'task') |
| `content` | String | Display text |
| `read` | Boolean | Read status |

---

## ⚙️ System Logic

### Coin Calculation Algorithm
When a task is completed, coins are calculated as:
```javascript
BaseCoins (10) * PriorityMultiplier * EffortMultiplier
```
- **Priority Multipliers**: Low (1), Medium (1.5), High (2)
- **Effort Multiplier**: `EffortScore * 0.5`
- **Example**: High Priority (2x), Effort 3 (1.5x) => `10 * 2 * 1.5` = **30 Coins**.

### Real-time Updates
- **Task Completion**: Backend emits `coins-updated` event to the user's private socket room immediately upon completion.
- **Frontend**: Listens for `coins-updated`, updating the `AuthContext` user state instantly.

### Penalty System
- **Schedule**: Checked **hourly** (`0 * * * *`).
- **Trigger**: Task is `pending`, `dueDate < now`, and `penalized` is `false`.
- **Action**:
  1. Deduct **20 Coins** from User's weekly and lifetime balance for that group.
  2. Allow balance to go negative.
  3. Mark task as `penalized: true`.

### Leaderboard Reset System
- **Schedule**: Checked **daily at midnight** (`0 0 * * *`).
- **Logic**:
  1. Iterates through all groups.
  2. Checks if `group.nextResetDate <= now`.
  3. If due:
     - Calculates winner/loser for the cycle.
     - Resets `weeklyCoins` to 0 for all members in that group.
     - Updates `lastResetDate` and calculates new `nextResetDate` based on `resetFrequency`.

### Global Points Conversion
Global Leaderboard uses a simplified "Points" system to rank users across the entire platform.
- **Formula**: `Points = Math.floor(LifetimeCoins / 10)`
- **Display**: Shown on the Global Leaderboard view.

---

## 📡 API Reference

### Groups
- `GET /api/groups`: Fetch all groups for current user (injects user's coin data for UI).
- `PUT /api/groups/:id`: Updates group details. Payload: `{ name, description, resetFrequency }`. **Admin only**.
- `DELETE /api/groups/:groupId/members/:userId`: Remove a member. **Admin only**.

### Tasks
- `POST /api/tasks`: Create new task.
- `PUT /api/tasks/:id/complete`: Complete a task. Triggers coin update.

### Leaderboard
- `GET /api/leaderboard/:groupId`: Get group-specific rankings.
- `GET /api/leaderboard/global/top`: Get global rankings (Points based).

---

## 🔐 Environment Variables

### Backend (`.env`)
```env
PORT=5000                   # Server port
MONGODB_URI=...             # Database connection string
JWT_SECRET=...              # Secret for signing tokens
JWT_EXPIRE=7d               # Token validity duration
CLIENT_URL=...              # CORS origin URL
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=...    # Backend API URL (e.g. http://localhost:5000/api)
NEXT_PUBLIC_SOCKET_URL=... # Backend Socket URL (e.g. http://localhost:5000)
```
