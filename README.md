# 🔄 SkillsVersa — Peer-to-Peer Skill Exchange & Time-Banking Platform

> **SkillsVersa** is a full-stack, peer-to-peer skill exchange ecosystem built on the concept of time-banking. It empowers students, creators, and professionals to exchange knowledge seamlessly without using monetary transactions. Users earn credits by teaching what they know and spend those credits to learn new skills from others.

---

## 🌟 Overview

Traditional learning platforms often impose steep subscription fees or per-course charges, creating a barrier for passionate learners. **SkillsVersa** replaces currency with a collaborative time-banking economy. 

### Why SkillsVersa?
* **Zero Monetary Cost:** Trade skills directly or earn time credits by mentoring others.
* **Smart AI-Driven Matching:** Get matched with ideal exchange partners based on skill overlap, user ratings, and compatibility.
* **Verified Skills & Badges:** Take interactive skill assessment quizzes to earn verified badges and boost community credibility.
* **Real-time Peer Interaction:** Instant messaging, live presence indicators, typing status, and real-time notifications keep users connected.
* **Fair & Secure Time Economy:** Dual-confirmation session completion backed by atomic MongoDB database transactions ensures credits are only transferred when both participants are satisfied.

---

## ✨ Comprehensive Feature Breakdown

### 🔐 1. Authentication & Security
* **Dual Auth Options:** Local email/password registration alongside seamless **Google OAuth 2.0** integration via Passport.js.
* **JWT Authorization:** Stateful token-based authorization stored securely on the client side with protected routes.
* **Welcome Credit Bonus:** Automatically grants new users a **50-credit welcome bonus** upon registration to start learning right away.
* **Role-Based Access Control (RBAC):** Native support for `user` and `admin` roles across frontend routing and backend endpoints.

### 👤 2. Profile & Skill Management
* **Dual-Skill Categorization:** Users maintain two lists: **Skills to Teach** and **Skills to Learn**.
* **Rich Skill Metadata:** Define skills with customized experience levels (*Beginner*, *Intermediate*, *Advanced*, *Expert*), categories, and hourly credit costs.
* **Personalized Profiles:** Custom bio, social media links, profile avatars (with live image uploads handled via Cloudinary), and earned verification badges.
* **Public Profiles:** Searchable public views displaying user ratings, teaching stats, reviews, and direct booking options.

### 🧠 3. Smart Matching & Exploration Engine
* **Match Scoring Algorithm:** Evaluates potential exchange partners based on:
  * **Mutual Skill Overlap** (+5 points per reciprocal skill match)
  * **One-Way Skill Relevance** (+3 points for teaching match, +2 points for learning match)
  * **User Trust & Rating Bonus** (+1 point per 0.5 stars of average rating)
  * **Reliability Bonus** (+1 point for active exchangers with credit balances > 30)
* **Interactive Explore Hub:** Search users by keyword or filter by skill categories (*Development*, *Design*, *Languages*, *Music*, *Business*, etc.) with paginated results.

### ⌛ 4. Session Lifecycle & Time-Banking Economy
* **End-to-End Booking Flow:** Request, accept, reject, complete, or cancel skill exchange sessions.
* **Dual Confirmation Protocol:** Both the mentor and learner must independently mark a session as complete before credits are released.
* **Atomic Credit Transfers:** Session transactions are executed inside MongoDB ACID transactions, guaranteeing that credit deductions and earnings remain 100% consistent.
* **Mutual Skill Swaps:** Automatic zero-credit handling when two users perform a reciprocal skill exchange session.
* **Ledger History:** Comprehensive transaction logging (`signup_bonus`, `session_payment`, `session_earning`, `mutual_exchange`, `refund`).

### 💬 5. Real-Time Chat & Communication
* **Instant Messaging:** WebSockets powered by **Socket.io** for real-time 1-on-1 conversations.
* **Live Presence:** Dynamic online/offline indicators for connected community members.
* **Typing Notifications:** Live typing state feedback (`userTyping` / `userStopTyping`).
* **Message History:** Persistent MongoDB conversation records accessible at any time.

### 🏆 6. Verification, Gamification & Skill Maps
* **Interactive Skill Quizzes:** Built-in skill verification quizzes (React, Python, JavaScript, UI/UX, Data Science) with instant auto-grading.
* **Verification Badges:** Scoring 70% or higher awards a verified skill badge displayed on the user profile.
* **XP & Leveling System:** Earn +100 XP per passed verification test, driving user progression and levels.
* **Global Leaderboard:** Ranks top mentors, active learners, and top credit earners across the platform.
* **Interactive Skill Map:** Visual node-based roadmap displaying skill connections, prerequisite concepts, and learning pathways.

### 📊 7. Learning Analytics & Insights
* **Personal Dashboard:** Comprehensive visual overview of total hours taught, hours learned, session statuses, credit wallet balance, and recent activities.
* **Analytics Page:** Breakdown of user learning progress, ratings distribution, and historical transaction trends.

### 🛡️ 8. Admin Management Portal
* **Platform Overview:** High-level metrics showing total registered users, active sessions, completed exchanges, and credit circulation.
* **User Governance:** Inspect, modify roles, or delete users with cascading cleanup of associated sessions and messages.
* **Session Auditing:** Monitor active and completed sessions across the platform.

### ✉️ 9. Automated Email Notifications
* **HTML Email Alerts:** Styled emails sent via Nodemailer for critical session events (new booking request, session acceptance, completion confirmation, cancellation).

---

## 🛠 Tech Stack & Architecture

### **Frontend**
* **Framework:** React 19 + Vite 8
* **Styling:** Tailwind CSS 3 + PostCSS + Autoprefixer
* **UI Components & Icons:** Lucide React, React Icons, Framer Motion
* **Routing & Toast:** React Router DOM v7, React Hot Toast
* **HTTP & Sockets:** Axios, Socket.io Client

### **Backend**
* **Runtime & Framework:** Node.js v18+ & Express 5
* **Database & ODM:** MongoDB Atlas + Mongoose 9
* **Real-time WebSockets:** Socket.io Server 4
* **Authentication:** JWT (JSON Web Tokens), Passport.js (Google OAuth 2.0), bcryptjs
* **Storage & Uploads:** Cloudinary API + Multer
* **Email Service:** Nodemailer

```
                   ┌─────────────────────────────────────────┐
                   │           SkillsVersa Client            │
                   │      (React 19 + Vite + Tailwind)      │
                   └───────────────────┬─────────────────────┘
                                       │
                         HTTP / REST   │   WebSockets (Socket.io)
                                       │
                   ┌───────────────────▼─────────────────────┐
                   │           SkillsVersa Server            │
                   │         (Express 5 + Socket.io)         │
                   └─┬──────────────┬──────────────┬───────┬─┘
                     │              │              │       │
        ┌────────────▼──┐   ┌───────▼───────┐  ┌───▼──┐  ┌─▼─────────────┐
        │ MongoDB Atlas │   │ Cloudinary    │  │Google│  │ Nodemailer    │
        │  (Database)   │   │Avatar Storage │  │OAuth │  │(Email Alerts) │
        └───────────────┘   └───────────────┘  └──────┘  └───────────────┘
```

---

## 📁 Repository Directory Structure

```
SkillsVersa/
├── client/                      # Frontend Application (React + Vite)
│   ├── public/                  # Static web assets
│   ├── src/
│   │   ├── api/                 # Axios configuration & interceptors
│   │   │   └── axios.js
│   │   ├── assets/              # App images and vector graphics
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Footer.jsx       # App footer navigation
│   │   │   ├── Navbar.jsx       # Header bar with notification badge
│   │   │   ├── SwapModal.jsx    # Session request booking modal
│   │   │   └── UserProfileModal.jsx # Quick profile preview modal
│   │   ├── context/             # Global React context providers
│   │   │   ├── AuthContext.jsx  # User authentication state
│   │   │   └── SocketContext.jsx# WebSockets connection state
│   │   ├── pages/               # Application page views
│   │   │   ├── Analytics.jsx    # User statistics & learning metrics
│   │   │   ├── Chat.jsx         # Real-time direct messaging page
│   │   │   ├── Dashboard.jsx    # User dashboard & session manager
│   │   │   ├── Explore.jsx      # Skill finder & search explorer
│   │   │   ├── GoogleSuccess.jsx# OAuth callback handler
│   │   │   ├── Home.jsx         # Landing page & feature showcase
│   │   │   ├── Leaderboard.jsx  # Community leaderboards
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── ProfilePage.jsx  # User profile editor
│   │   │   ├── PublicProfilePage.jsx # Public user view
│   │   │   ├── Register.jsx     # Registration page
│   │   │   ├── SkillMap.jsx     # Interactive skill dependency map
│   │   │   └── SkillQuizzes.jsx # Assessment & verification quizzes
│   │   ├── App.jsx              # Main routes & layout configuration
│   │   ├── main.jsx             # React DOM entry point
│   │   └── index.css            # Global CSS styles & Tailwind imports
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vercel.json              # Client deployment config
│   └── vite.config.js
│
└── server/                      # Backend Application (Node + Express)
    ├── config/                  # Core services initialization
    │   ├── db.js                # MongoDB connection handler
    │   ├── cloudinary.js        # Cloudinary SDK setup
    │   └── passport.js          # Google OAuth Strategy setup
    ├── controllers/             # Request handling logic
    │   ├── adminController.js   # Admin portal management
    │   ├── authController.js    # Login, Register, Google OAuth
    │   ├── creditController.js  # Credit balances & ledger
    │   ├── matchController.js   # Smart matching endpoints
    │   ├── messageController.js # Conversations & chat history
    │   ├── notificationController.js # In-app user notifications
    │   ├── quizController.js    # Skill verification quizzes
    │   ├── reviewController.js  # Ratings & review submissions
    │   ├── sessionController.js # Session lifecycle management
    │   └── userController.js    # Profile updates & search
    ├── middleware/              # Express middlewares
    │   ├── authMiddleware.js    # JWT verification & admin guard
    │   ├── errorHandler.js      # Global error handler
    │   └── uploadMiddleware.js  # Multer file handling
    ├── models/                  # Mongoose schemas
    │   ├── Conversation.js      # Direct chat conversations
    │   ├── Message.js           # Chat message schema
    │   ├── Notification.js      # Notification schema
    │   ├── Review.js            # User session reviews
    │   ├── Session.js           # Skill swap session schema
    │   ├── Transaction.js       # Credit ledger schema
    │   └── User.js              # User account & profile schema
    ├── routes/                  # Express API route modules
    │   ├── adminRoutes.js
    │   ├── authRoutes.js
    │   ├── creditRoutes.js
    │   ├── matchRoutes.js
    │   ├── messageRoutes.js
    │   ├── notificationRoutes.js
    │   ├── quizRoutes.js
    │   ├── reviewRoutes.js
    │   ├── sessionRoutes.js
    │   └── userRoutes.js
    ├── socket/                  # WebSockets event handlers
    │   └── socketHandler.js     # Real-time chat & status events
    ├── utils/                   # Helper algorithms & utilities
    │   ├── creditManager.js     # Atomic credit transactions
    │   ├── generateToken.js     # JWT token generator
    │   ├── matchAlgorithm.js    # Matching scoring engine
    │   └── sendEmail.js         # Nodemailer email dispatching
    ├── package.json
    └── server.js                # Express app entry point
```

---

## ⚡ Quick Start & Setup Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **MongoDB**: A local MongoDB instance or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
* **Cloudinary Account**: For avatar image hosting ([Cloudinary Dashboard](https://cloudinary.com/))
* **Google Cloud Console Project**: For Google OAuth 2.0 client ID and secret ([Google Cloud Console](https://console.cloud.google.com/))
* **SMTP Server / Gmail**: For sending session email notifications

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/SkillsVersa.git
cd SkillsVersa
```

---

### Step 2: Backend Configuration & Installation

1. Navigate to the server folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `server` directory and add your credentials:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173

   # Database
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/skillsversa?retryWrites=true&w=majority

   # Authentication
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=30d

   # Google OAuth 2.0
   GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

   # Cloudinary Media Uploads
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Email Notifications (Nodemailer)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

---

### Step 3: Frontend Configuration & Installation

1. Open a new terminal window and navigate to the client folder:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

---

### Step 4: Launching Development Servers

1. **Start Backend Server:**
   ```bash
   cd server
   npm run dev
   ```
   *The Express server will start on `http://localhost:5000`.*

2. **Start Frontend Development Server:**
   ```bash
   cd client
   npm run dev
   ```
   *The Vite application will start on `http://localhost:5173`.*

3. Open your browser and navigate to `http://localhost:5173` to start using SkillsVersa!

---

## 📡 Complete REST API Documentation

### Auth Endpoints (`/api/auth`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/register` | ❌ | Create a new user account (grants +50 signup credits) |
| `POST` | `/login` | ❌ | Authenticate user & return JWT token |
| `GET` | `/me` | ✅ | Fetch details of currently logged-in user |
| `GET` | `/google` | ❌ | Initiate Google OAuth 2.0 redirect flow |
| `GET` | `/google/callback` | ❌ | Handle Google OAuth callback & issue JWT |

### User Endpoints (`/api/users`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/search` | ✅ | Search registered users by skill or name |
| `GET` | `/:id` | ✅ | Retrieve public profile details of a user |
| `PUT` | `/profile` | ✅ | Update authenticated user's profile information |
| `PUT` | `/skills` | ✅ | Update skills to teach and skills to learn |
| `PUT` | `/avatar` | ✅ | Upload profile avatar to Cloudinary |

### Smart Matching Endpoints (`/api/matches`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/` | ✅ | Get AI-scored smart matches for authenticated user |
| `GET` | `/explore` | ✅ | Search & browse community users with filter parameters |

### Session Management (`/api/sessions`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/` | ✅ | Create a new skill exchange session request |
| `GET` | `/` | ✅ | List all sessions involving the authenticated user |
| `GET` | `/:id` | ✅ | Fetch detailed breakdown of a single session |
| `PUT` | `/:id/accept` | ✅ | Accept a pending session request |
| `PUT` | `/:id/reject` | ✅ | Reject a pending session request |
| `PUT` | `/:id/complete` | ✅ | Mark session completed (triggers credit transfer upon dual confirmation) |
| `PUT` | `/:id/cancel` | ✅ | Cancel a session request |

### Verification & Quizzes (`/api/quizzes`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/` | ✅ | Fetch available skill verification quizzes |
| `POST` | `/submit` | ✅ | Submit quiz answers to receive score, XP & verified badges |

### Direct Messages (`/api/messages`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/conversations` | ✅ | Retrieve all active chat conversations for user |
| `GET` | `/conversations/:userId` | ✅ | Get or initiate conversation with a specific user |
| `GET` | `/:conversationId` | ✅ | Fetch message history for a conversation |
| `POST` | `/` | ✅ | Send a new message to a conversation |

### Credit Wallet & Transactions (`/api/credits`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/balance` | ✅ | Get current credit wallet balance |
| `GET` | `/transactions` | ✅ | Fetch full ledger transaction history |

### Reviews & Ratings (`/api/reviews`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/` | ✅ | Create a review & rating for a completed session |
| `GET` | `/user/:id` | ✅ | Get all reviews received by a user |

### Notifications (`/api/notifications`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/` | ✅ | Get list of user notifications |
| `GET` | `/unread-count` | ✅ | Get total unread notifications count |
| `PUT` | `/read-all` | ✅ | Mark all unread notifications as read |
| `PUT` | `/:id/read` | ✅ | Mark a specific notification as read |

### Admin Endpoints (`/api/admin` — Admin Access Only)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/users` | List all registered users on the platform |
| `GET` | `/users/:id` | Retrieve comprehensive user details |
| `PUT` | `/users/:id` | Update user details or change user role |
| `DELETE` | `/users/:id` | Delete user and perform cascading resource cleanup |
| `GET` | `/sessions` | View all platform sessions across all users |
| `GET` | `/stats` | View aggregated system metrics & platform statistics |

---

## 🔌 Socket.io Event Documentation

| Event Name | Direction | Description |
| :--- | :--- | :--- |
| `join` | Client ➔ Server | Registers connected user's ID for socket routing |
| `sendMessage` | Client ➔ Server | Dispatches a real-time message to a recipient |
| `receiveMessage` | Server ➔ Client | Delivers a message to the target connected client |
| `typing` | Client ➔ Server | Notifies that the user is currently typing |
| `userTyping` | Server ➔ Client | Displays typing feedback in recipient's chat window |
| `stopTyping` | Client ➔ Server | Notifies that the user stopped typing |
| `userStopTyping` | Server ➔ Client | Removes typing indicator from recipient's chat |
| `notification` | Server ➔ Client | Pushes instant notification (session update, credit change) |
| `userOnline` | Server ➔ All | Broadcasts that a user has connected |
| `userOffline` | Server ➔ All | Broadcasts that a user has disconnected |

---

## 🗄 Database Models & Schemas

1. **User Schema (`User.js`)**
   - Core credentials, bio, avatar URL, credits balance (default: 50), role (`user`/`admin`), average rating, skills to teach, skills to learn, verification badges, XP, and level.
2. **Session Schema (`Session.js`)**
   - Teacher ID, Learner ID, Skill requested, Duration, Credit cost, Session status (`pending`, `accepted`, `rejected`, `completed`, `cancelled`), Scheduled date, and Dual-confirmation flags (`teacherConfirmed`, `learnerConfirmed`).
3. **Transaction Schema (`Transaction.js`)**
   - Sender ID (`from`), Receiver ID (`to`), Amount, Type (`signup_bonus`, `session_payment`, `session_earning`, `mutual_exchange`, `refund`), Session reference, Description, and Running balance snapshot.
4. **Message Schema (`Message.js`)**
   - Conversation reference, Sender ID, Message text, and Read status.
5. **Conversation Schema (`Conversation.js`)**
   - Participants array and Last message timestamp for quick inbox sorting.
6. **Review Schema (`Review.js`)**
   - Session reference, Reviewer ID, Reviewee ID, Rating (1-5 stars), and Comment string.
7. **Notification Schema (`Notification.js`)**
   - Recipient ID, Sender ID, Type, Title, Message, Read flag, and Associated link/resource ID.

---

## 🚀 Deployment Instructions

### Frontend (Vercel)
The project includes a pre-configured `vercel.json` file in the `client` directory for single-page app rewrite handling.
1. Connect your repository to [Vercel](https://vercel.com).
2. Set the root directory to `client`.
3. Configure the environment variable:
   - `VITE_API_URL` = `https://your-backend-domain.com`
4. Deploy!

### Backend (Render / Railway / AWS)
1. Deploy the `server` directory to your hosting provider.
2. Configure all environment variables listed in the **Step 2** section.
3. Ensure the start command is set to:
   ```bash
   npm start
   ```

---

## 📄 License

This project is open-source and released under the **ISC License**.

---

<p center>
  Made with ❤️ for collaborative learners everywhere by the <b>SkillsVersa Team</b>.
</p>
