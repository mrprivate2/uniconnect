# 🎓 UniConnect

**The Student Operating System** — A full-stack campus social platform with E2EE chat, marketplace, event management, and recruitment features. Built with React, Express, Supabase, and Socket.IO.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **E2EE Chat** | End-to-end encrypted messaging via WebSocket |
| 📰 **Campus Feed** | Real-time posts with likes, comments, and media |
| 🏪 **Marketplace** | Rent and trade items within your campus |
| 📅 **Events** | Create, discover, and RSVP to campus events |
| 💼 **Recruitment** | Job listings, applications, and hiring pipeline |
| 👥 **Network** | Follow peers, discover students in your college |
| 🔔 **Notifications** | Real-time alerts for likes, follows, and comments |
| 🛡️ **Admin Dashboard** | User management, reports, announcements |
| 🌙 **Dark Mode** | Full theme support |
| 📱 **Mobile Responsive** | Fully responsive design across all devices |

---

## 🏗 Architecture

```
uniconnect/
├── uniconnect/               # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/            # Route pages
│   │   ├── components/       # Shared UI components
│   │   ├── context/          # React contexts (Auth, Theme)
│   │   ├── utils/            # Helpers (crypto, media)
│   │   └── api.js            # API client config
│   └── ...
├── uniconnect-backend/       # Backend (Express + Socket.IO)
│   ├── config/               # Supabase, env config
│   ├── controllers/          # Route handlers
│   ├── middleware/            # Auth, rate limiting, error handling
│   ├── routes/               # API route definitions
│   └── server.js             # Entry point
├── schema.sql                # Supabase/PostgreSQL schema
└── start.js                  # Dev runner (starts both servers)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Supabase** account (free tier works) — [sign up](https://supabase.com)
- A Supabase project with PostgreSQL database

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/mrprivate2/uniconnect.git
cd uniconnect

# Install backend dependencies
cd uniconnect-backend && npm install && cd ..

# Install frontend dependencies
cd uniconnect && npm install && cd ..
```

### 2. Configure Environment Variables

#### Backend (`uniconnect-backend/.env`)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BUCKET=uniconnect
PORT=5001
JWT_SECRET=your-secret-key-change-in-production
```

> **Where to find these in Supabase:**
> - `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`: Project Settings → API
> - `SUPABASE_SERVICE_ROLE_KEY`: Project Settings → API → `service_role` (keep secret!)
> - `JWT_SECRET`: Any strong random string for signing auth tokens
> - `SUPABASE_BUCKET`: Name of your Supabase Storage bucket (create one in Storage)

#### Frontend (`uniconnect/.env`)

```env
VITE_API_URL=http://localhost:5001/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set Up Supabase Database

1. Go to your Supabase project → **SQL Editor**
2. Copy the entire contents of `schema.sql`
3. Paste and run the query to create all tables, indexes, and RLS policies

### 4. Run the App

```bash
# From the project root — starts both servers concurrently
npm run dev

# Or start them individually:
# Backend:  cd uniconnect-backend && npm run dev
# Frontend: cd uniconnect && npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5001

---

## 📦 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (admin) |
| `SUPABASE_BUCKET` | ✅ | Supabase Storage bucket name |
| `PORT` | ❌ | Backend port (default: 5001) |
| `JWT_SECRET` | ✅ | Secret key for JWT token signing |
| `CLIENT_URL` | ❌ | Frontend URL for CORS (default: http://localhost:5173) |
| `VITE_API_URL` | ✅ (frontend) | Backend API URL (default: http://localhost:5001/api) |

---

## 🧪 API Endpoints

| Route | Description |
|---|---|
| `POST /api/auth/register` | Register a new user |
| `POST /api/auth/login` | Login |
| `GET /api/auth/me` | Get current user profile |
| `GET/POST /api/posts` | List / Create posts |
| `PUT /api/posts/:id/like` | Toggle like on a post |
| `POST /api/posts/:id/comment` | Add comment to a post |
| `GET /api/users` | List all users |
| `GET /api/users/:id` | Get user profile |
| `POST /api/friends/:id/follow` | Follow a user |
| `GET /api/chat/:userId` | Get chat messages |
| `POST /api/colleges` | Add college (admin) |
| `GET /api/reports` | List reports (admin) |

Full API documentation is available at the `/` endpoint when the server is running.

---

## 📱 Mobile Responsiveness

The app is fully responsive across all breakpoints:

| Breakpoint | Width | Optimized For |
|---|---|---|
| Default | < 640px | Mobile phones |
| `sm` | ≥ 640px | Large phones |
| `md` | ≥ 768px | Tablets |
| `lg` | ≥ 1024px | Desktops |
| `xl` | ≥ 1280px | Large screens |

Key responsive features:
- **Bottom sheet modals** on mobile, centered dialogs on desktop
- **Collapsible sidebars** in Chat and FindFriends
- **Condensed navigation** with icons only on mobile
- **Adaptive grids** (1→2→3 columns) for feeds and marketplace
- **Touch-optimized** tap targets (min 44px)

---

## ⚡ Performance Optimizations

- **Code splitting** — Chat and Admin pages lazy-loaded via `React.lazy`
- **React.memo** — Card components (PostCard, MarketCard, FriendCard, MessageBubble) skip unnecessary re-renders
- **Background animations** — GPU-heavy animated backgrounds disabled on mobile via `hidden lg:block`
- **Framer Motion** — Spring animations for performant transitions
- **Custom scrollbars** — Hardware-accelerated scrolling

---

## 🛠 Tech Stack

### Frontend
- **React 19** + Vite (rolldown)
- **Tailwind CSS 3** for styling
- **Framer Motion** for animations
- **Socket.IO Client** for real-time features
- **Lucide React** for icons
- **React Router v7** for routing
- **Axios** for HTTP requests
- **React Hot Toast** for notifications

### Backend
- **Express** web framework
- **Socket.IO** for WebSocket communication
- **Supabase** (PostgreSQL + Storage)
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Helmet** for security headers
- **Express Rate Limit** for API protection
- **Nodemailer** for password reset emails

---

## 🚢 Deployment

### Backend (Render / Railway / Fly.io)

1. Set all environment variables from the table above
2. Start command: `cd uniconnect-backend && npm start`
3. Update `VITE_API_URL` in the frontend to point to your deployed backend

### Frontend (Vercel)

1. Connect your GitHub repo to Vercel
2. Set root directory to `uniconnect`
3. Build command: `npm run build` (already set to `vite build`)
4. Output directory: `dist`
5. Set environment variables:
   - `VITE_API_URL` → your deployed backend URL + `/api`
   - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Database

The Supabase database should be set up once and shared across all environments.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [DiceBear Avatars](https://dicebear.com) for avatar generation
- [Supabase](https://supabase.com) for backend infrastructure
- All the open-source libraries that made this possible
