# 🔄 Skill Exchange Platform — Backend API

A peer-to-peer platform where students exchange skills instead of money.  
Built with **Node.js**, **Express 5**, **MongoDB**, **Socket.io**, **JWT + Google OAuth**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Console project (for OAuth)
- Cloudinary account (for avatar uploads)

### Installation

```bash
cd server
npm install
```

### Environment Variables

Copy `.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/skillexchange
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:5173
```

### Run Development Server

```bash
npm run dev
```

Server starts at `http://localhost:5000`  
Health check: `http://localhost:5000/api/health`

---

## 📁 Project Structure

```
server/
├── config/          # DB connection, Cloudinary, Passport OAuth
├── controllers/     # Request handlers (9 controllers)
├── middleware/       # Auth, error handling, file upload
├── models/          # Mongoose schemas (7 models)
├── routes/          # Express route definitions (9 route files)
├── socket/          # Socket.io real-time event handlers
├── utils/           # Token generation, matching algorithm, credit manager, email
└── server.js        # Entry point
```

---

## 📡 API Endpoints (31 total)

### Auth (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ✗ | Register with email/password |
| POST | `/login` | ✗ | Login → JWT token |
| GET | `/me` | ✓ | Get current user |
| GET | `/google` | ✗ | Google OAuth redirect |
| GET | `/google/callback` | ✗ | Google OAuth callback |

### Users (`/api/users`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/search` | ✓ | Search users by skill/name |
| GET | `/:id` | ✓ | Get public profile |
| PUT | `/profile` | ✓ | Update own profile |
| PUT | `/skills` | ✓ | Update skills (teach/learn) |
| PUT | `/avatar` | ✓ | Upload avatar image |

### Matching (`/api/matches`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✓ | Get smart-matched users |
| GET | `/explore` | ✓ | Browse with filters |

### Sessions (`/api/sessions`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✓ | Create session request |
| GET | `/` | ✓ | List my sessions |
| GET | `/:id` | ✓ | Session detail |
| PUT | `/:id/accept` | ✓ | Accept request |
| PUT | `/:id/reject` | ✓ | Reject request |
| PUT | `/:id/complete` | ✓ | Mark completed |
| PUT | `/:id/cancel` | ✓ | Cancel session |

### Reviews (`/api/reviews`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✓ | Create review |
| GET | `/user/:id` | ✓ | Get user's reviews |

### Messages (`/api/messages`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/conversations` | ✓ | List conversations |
| GET | `/conversations/:userId` | ✓ | Get/create conversation |
| GET | `/:conversationId` | ✓ | Get messages |
| POST | `/` | ✓ | Send message |

### Credits (`/api/credits`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/balance` | ✓ | Credit balance |
| GET | `/transactions` | ✓ | Transaction history |

### Notifications (`/api/notifications`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✓ | Get notifications |
| GET | `/unread-count` | ✓ | Unread count |
| PUT | `/read-all` | ✓ | Mark all read |
| PUT | `/:id/read` | ✓ | Mark one read |

### Admin (`/api/admin`) — requires admin role
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users |
| GET | `/users/:id` | Get user details |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user + cascade |
| GET | `/sessions` | List all sessions |
| GET | `/stats` | Platform statistics |

---

## 🔌 Socket.io Events (10 events)

| Event | Direction | Description |
|-------|-----------|-------------|
| `join` | Client → Server | Register user online |
| `sendMessage` | Client → Server | Send chat message |
| `receiveMessage` | Server → Client | Deliver message |
| `typing` | Client → Server | Start typing |
| `userTyping` | Server → Client | Typing indicator |
| `stopTyping` | Client → Server | Stop typing |
| `userStopTyping` | Server → Client | Stop typing indicator |
| `notification` | Server → Client | Push notification |
| `userOnline` | Server → All | User came online |
| `userOffline` | Server → All | User went offline |

---

## 💡 Key Features

- **Smart Matching Algorithm** — Scores users based on skill overlap, ratings, and credit balance
- **Dual-Confirmation Session Completion** — Both participants must confirm before credits transfer
- **Atomic Credit Transfers** — MongoDB transactions ensure credits are never lost
- **Real-time Messaging** — Socket.io with typing indicators and online status
- **Email Notifications** — Styled HTML emails for session lifecycle events
- **Admin Panel APIs** — Full user/session management with platform stats
- **Google OAuth** — Seamless social login alongside email/password

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| Express 5 | Web framework |
| MongoDB + Mongoose | Database + ODM |
| Socket.io | Real-time communication |
| JWT | Authentication |
| Passport.js | Google OAuth |
| Cloudinary | Image uploads |
| Nodemailer | Email notifications |
| bcryptjs | Password hashing |
| Morgan | HTTP request logging |

---

## 📜 License

ISC
