# 🔐 SecureAuth Pro
### Enterprise-Grade Fullstack Authentication & Authorization System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Secured-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**A production-ready authentication system built with security-first principles.**  
JWT rotation · RBAC · Google OAuth2 · Email Verification · httpOnly Cookies

[🚀 Quick Start](#-quick-start-5-minutes) · [📖 Use Cases](#-use-cases--workflows) · [🛡️ Security](#-security-architecture) · [🧪 Testing](#-testing-guide) · [📡 API Reference](#-api-reference)

---

</div>

## ✨ What This Project Does

SecureAuth Pro solves the hardest part of building web apps — **identity and access management** — so you don't have to compromise on security.

| Feature | Implementation |
|---|---|
| 🔑 **Authentication** | JWT Access Tokens (15 min) + Refresh Token Rotation (7 days) |
| 🍪 **Token Storage** | httpOnly cookies — immune to XSS attacks |
| 👥 **Authorization** | Role-Based Access Control (user / moderator / admin) |
| 🌐 **Social Login** | Google OAuth2 with account linking |
| 📧 **Email Verification** | Cryptographic token flow with 24hr expiry |
| 🔄 **Session Management** | Automatic silent refresh + all-device logout |
| 🛡️ **Attack Prevention** | Rate limiting, token reuse detection, input sanitization |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER (React)                         │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐   ┌───────────────┐  │
│  │  Auth Context │    │ Axios Private │   │ Protected     │  │
│  │  (memory)     │◄──►│ (interceptor) │   │ Routes + RBAC │  │
│  └──────────────┘    └──────────────┘   └───────────────┘  │
│         ▲                    │                               │
│  Access Token            API Calls                          │
│  (in memory)          + httpOnly Cookie                     │
└──────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   Express Backend   │
                    │                    │
                    │  ┌──────────────┐  │
                    │  │  Rate Limiter │  │
                    │  │  + Helmet    │  │
                    │  └──────┬───────┘  │
                    │         │          │
                    │  ┌──────▼───────┐  │
                    │  │ JWT Middleware│  │
                    │  │ + RBAC Guard │  │
                    │  └──────┬───────┘  │
                    │         │          │
                    │  ┌──────▼───────┐  │
                    │  │  Controllers  │  │
                    │  └──────┬───────┘  │
                    └─────────┼──────────┘
                              │
              ┌───────────────┼──────────────┐
              │               │              │
       ┌──────▼──────┐ ┌─────▼────┐ ┌──────▼──────┐
       │   MongoDB    │ │  Google  │ │   Nodemailer │
       │  (Users +    │ │  OAuth2  │ │   (SMTP)     │
       │  Tokens)     │ │          │ │              │
       └─────────────┘ └──────────┘ └─────────────┘
```

---

## 📁 Project Structure

```
secureauth-pro/
│
├── 📂 backend/
│   ├── 📂 src/
│   │   ├── 📂 config/
│   │   │   ├── passport.js         # Google OAuth2 strategy
│   │   │   └── email.js            # SMTP transporter config
│   │   │
│   │   ├── 📂 middleware/
│   │   │   ├── auth.js             # JWT verify + RBAC enforce
│   │   │   ├── validate.js         # express-validator handler
│   │   │   └── rateLimiter.js      # Brute-force protection
│   │   │
│   │   ├── 📂 models/
│   │   │   ├── User.js             # User schema (bcrypt pre-save)
│   │   │   └── RefreshToken.js     # Token family rotation store
│   │   │
│   │   ├── 📂 routes/
│   │   │   ├── auth.routes.js      # /register, /login, /refresh, /logout
│   │   │   ├── user.routes.js      # /me, /users (moderator+)
│   │   │   └── admin.routes.js     # /stats, /role, /status (admin only)
│   │   │
│   │   ├── 📂 controllers/
│   │   │   └── auth.controller.js  # All auth business logic
│   │   │
│   │   └── 📂 services/
│   │       ├── token.service.js    # JWT generation + rotation
│   │       └── email.service.js    # Verification + reset emails
│   │
│   ├── server.js                   # Express app entry point
│   └── .env                        # Environment variables
│
└── 📂 frontend/
    ├── 📂 src/
    │   ├── 📂 api/
    │   │   └── axios.js            # Public + Private axios instances
    │   │
    │   ├── 📂 context/
    │   │   └── AuthContext.jsx     # Global auth state (memory storage)
    │   │
    │   ├── 📂 hooks/
    │   │   ├── useAuth.js          # Auth context consumer
    │   │   └── useAxiosPrivate.js  # Auto-refresh interceptor
    │   │
    │   ├── 📂 components/
    │   │   ├── ProtectedRoute.jsx  # Unauthenticated redirect
    │   │   └── RoleGuard.jsx       # Role-based route guard
    │   │
    │   └── 📂 pages/
    │       ├── Login.jsx
    │       ├── Register.jsx
    │       ├── Dashboard.jsx
    │       ├── AdminPanel.jsx
    │       ├── VerifyEmail.jsx
    │       └── OAuthCallback.jsx
    │
    └── vite.config.js
```

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites

Make sure you have these installed:

```bash
node --version    # v18.0.0 or higher
npm --version     # v9.0.0 or higher
mongod --version  # v6.0 or higher (or use MongoDB Atlas)
```

### Step 1 — Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/secureauth-pro.git
cd secureauth-pro

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Step 2 — Configure Environment

```bash
# Copy the example environment file
cd ../backend
cp .env.example .env
```

Open `.env` and fill in your values:

```env
# ── Server ──────────────────────────────────
PORT=5000
NODE_ENV=development

# ── Database ────────────────────────────────
MONGO_URI=mongodb://localhost:27017/secureauth

# ── JWT Secrets (generate with: openssl rand -hex 32) ──
JWT_ACCESS_SECRET=your_64_char_random_secret_here
JWT_REFRESH_SECRET=your_different_64_char_secret_here
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# ── Google OAuth (console.cloud.google.com) ──
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# ── Email (use Gmail App Password, not your real password) ──
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=xxxx_xxxx_xxxx_xxxx

# ── Frontend URL ─────────────────────────────
CLIENT_URL=http://localhost:5173
```

> 💡 **Generate secure secrets:** `openssl rand -hex 32`  
> 💡 **Gmail App Password:** Google Account → Security → 2FA → App Passwords

### Step 3 — Start the Application

```bash
# Terminal 1 — Start MongoDB (skip if using Atlas)
mongod

# Terminal 2 — Start Backend
cd backend
npm run dev
# ✅ MongoDB connected
# ✅ Server running on port 5000

# Terminal 3 — Start Frontend
cd frontend
npm run dev
# ✅ Local: http://localhost:5173
```

### Step 4 — Seed Test Users (Optional)

```bash
cd backend
node scripts/seed.js

# Creates:
# user@test.com     / User@1234    (role: user)
# mod@test.com      / Mod@1234     (role: moderator)
# admin@test.com    / Admin@1234   (role: admin)
```

**Open `http://localhost:5173` — you're running! 🎉**

---

## 📖 Use Cases & Workflows

### 🔵 Use Case 1 — New User Registration

**Who:** A new visitor who wants to create an account.

```
User Journey:
─────────────────────────────────────────────────────
1. User fills out registration form
   └─ Name, Email, Password (with strength indicator)

2. Frontend sends POST /api/auth/register
   └─ express-validator checks all fields
   └─ Password must have: uppercase + lowercase + number + special char

3. Backend creates user account (unverified)
   └─ Password hashed with bcrypt (12 rounds)
   └─ Unique verification token generated (crypto.randomBytes)
   └─ Token hashed before storing in DB

4. Verification email sent via Nodemailer
   └─ Contains one-time link: /verify-email/:token
   └─ Expires in 24 hours

5. User sees success screen: "Check your email"
─────────────────────────────────────────────────────
```

**What to expect:**
```
✅ 201 Created    → Registration successful
❌ 409 Conflict   → Email already in use
❌ 422 Unprocessable → Validation failed (weak password, invalid email)
```

---

### 🔵 Use Case 2 — Email Verification

**Who:** A registered user who received a verification email.

```
User Journey:
─────────────────────────────────────────────────────
1. User clicks "Verify Email" button in their inbox

2. Browser navigates to: /verify-email/:token

3. Frontend calls GET /api/auth/verify-email/:token

4. Backend hashes the token (SHA-256) and looks it up
   └─ Checks it hasn't expired (24hr window)
   └─ Sets isEmailVerified: true
   └─ Deletes the token from DB (one-time use)

5. User redirected to /login with success message
   └─ Account is now fully active
─────────────────────────────────────────────────────
```

**What to expect:**
```
✅ 200 OK       → Email verified, ready to login
❌ 400 Bad Request → Token expired or already used
```

---

### 🔵 Use Case 3 — Secure Login

**Who:** A verified user logging into their account.

```
User Journey:
─────────────────────────────────────────────────────
1. User enters email + password on /login

2. Rate limiter checks: max 10 attempts per 15 minutes

3. Backend validates credentials
   └─ User found? Password matches bcrypt hash?
   └─ Email verified? Account active?

4. Two tokens issued on success:
   ┌──────────────────────────────────────────────┐
   │  ACCESS TOKEN (15 min)                        │
   │  └─ Sent in response body                     │
   │  └─ Stored in React memory (NOT localStorage) │
   │  └─ Attached to API calls as Bearer header    │
   ├──────────────────────────────────────────────┤
   │  REFRESH TOKEN (7 days)                       │
   │  └─ Set as httpOnly cookie                    │
   │  └─ Path: /api/auth/refresh only              │
   │  └─ JavaScript cannot read or steal it        │
   └──────────────────────────────────────────────┘

5. User lands on /dashboard
─────────────────────────────────────────────────────
```

**What to expect:**
```
✅ 200 OK         → { accessToken, user: { id, name, email, role } }
❌ 401 Unauthorized → Invalid credentials (same message for security)
❌ 403 Forbidden   → Email not verified / Account disabled
❌ 429 Too Many    → Rate limited after 10 failed attempts
```

---

### 🔵 Use Case 4 — Silent Token Refresh

**Who:** Any logged-in user whose 15-minute access token has expired.

```
Background Flow (invisible to user):
─────────────────────────────────────────────────────
1. User makes API request with expired access token

2. Server returns 401 { code: "TOKEN_EXPIRED" }

3. Axios interceptor catches this BEFORE showing error to user

4. Interceptor calls POST /api/auth/refresh automatically
   └─ httpOnly cookie sent automatically by browser

5. Server validates refresh token:
   └─ Exists in DB? Not revoked? Not expired?
   └─ Token family intact? (reuse detection)

6. Server issues NEW access token + NEW refresh token
   └─ Old refresh token permanently revoked (rotation)

7. Original API request retried with new access token

8. User sees their content — no interruption noticed
─────────────────────────────────────────────────────
```

**Refresh Token Rotation Security:**
```
LOGIN:           Token-A issued (family: "abc-123")
REFRESH #1:      Token-A → revoked | Token-B issued
REFRESH #2:      Token-B → revoked | Token-C issued
STOLEN Token-A used:
                 Token-A is revoked → ATTACK DETECTED
                 Entire "abc-123" family revoked
                 Token-C (legitimate) also invalidated
                 User must log in again (session protected)
```

---

### 🔵 Use Case 5 — Role-Based Access Control

**Who:** Users with different privilege levels accessing different resources.

```
Three Roles + What They Can Access:
─────────────────────────────────────────────────────────────────
                    │  user  │  moderator  │  admin
────────────────────┼────────┼─────────────┼────────
GET /api/users/me   │  ✅    │     ✅      │   ✅
GET /api/users/     │  ❌    │     ✅      │   ✅
GET /api/admin/stats│  ❌    │     ❌      │   ✅
PATCH /admin/role   │  ❌    │     ❌      │   ✅
PATCH /admin/status │  ❌    │     ❌      │   ✅
─────────────────────────────────────────────────────────────────

Frontend Route Guards:
  /dashboard   → ProtectedRoute (any authenticated user)
  /admin       → ProtectedRoute + RoleGuard(['admin'])

How it works:
  1. JWT payload contains { userId, role }
  2. authenticate middleware verifies the token
  3. authorize('admin') middleware checks req.user.role
  4. Mismatch → 403 with role name in error message
─────────────────────────────────────────────────────────────────
```

---

### 🔵 Use Case 6 — Google OAuth2 Login

**Who:** A user who wants to sign in with their Google account.

```
OAuth2 Flow:
─────────────────────────────────────────────────────
1. User clicks "Continue with Google"

2. Browser redirects to:
   GET /api/auth/google
   └─ Passport.js initiates OAuth2 flow

3. Google shows consent screen
   └─ Requests: profile + email scopes

4. User approves → Google redirects to:
   GET /api/auth/google/callback?code=...

5. Passport exchanges code for user profile

6. Backend checks: Does this Google account exist?
   ┌─ NEW USER ──────────────────────────────────┐
   │  Create account automatically               │
   │  isEmailVerified: true (Google verified it) │
   │  No password set (OAuth-only account)       │
   └─────────────────────────────────────────────┘
   ┌─ RETURNING USER ────────────────────────────┐
   │  Find by googleId or email                  │
   │  Link googleId if signing into email account│
   └─────────────────────────────────────────────┘

7. Tokens issued → Redirect to:
   /oauth-callback?token=ACCESS_TOKEN

8. Frontend stores token in memory
   └─ Refresh token cookie set by backend

9. User lands on /dashboard
─────────────────────────────────────────────────────
```

---

### 🔵 Use Case 7 — Session Persistence (Page Refresh)

**Who:** Any logged-in user who refreshes the browser.

```
What Happens on Page Refresh:
─────────────────────────────────────────────────────
1. React state is cleared (access token in memory = gone)

2. AuthContext useEffect runs on mount

3. Silently calls POST /api/auth/refresh
   └─ httpOnly cookie sent automatically

4. On success: new access token stored in memory
   └─ User profile fetched and stored in context

5. User continues normally — no re-login required

On Failure (expired/missing cookie):
   └─ accessToken stays null
   └─ User redirected to /login
─────────────────────────────────────────────────────
Duration: User stays logged in for up to 7 days
          as long as they return within the refresh
          token window
```

---

### 🔵 Use Case 8 — Logout (Single Device & All Devices)

**Who:** A user who wants to end their session securely.

```
Single Device Logout:
─────────────────────────────────────────────────────
1. User clicks "Logout"
2. POST /api/auth/logout
3. Current refresh token revoked in DB
4. httpOnly cookie cleared from browser
5. Access token cleared from React memory
6. Redirect to /login
─────────────────────────────────────────────────────

All Devices Logout ("Log out everywhere"):
─────────────────────────────────────────────────────
1. User clicks "Logout All Devices"
2. POST /api/auth/logout-all  (requires valid access token)
3. ALL refresh tokens for this user revoked in DB
4. Every other session (phone, tablet, etc.) is
   invalidated — they'll need to log in again
5. Current session also cleared
─────────────────────────────────────────────────────
```

---

## 🛡️ Security Architecture

### Why httpOnly Cookies (Not localStorage)?

```
localStorage / sessionStorage:
  ❌ Readable by ANY JavaScript on the page
  ❌ XSS attack steals token instantly
  ❌ Malicious browser extension can read it
  ❌ Third-party scripts can access it

httpOnly Cookie:
  ✅ Invisible to JavaScript (document.cookie shows nothing)
  ✅ XSS attack cannot steal the token
  ✅ Only sent to the specific path (/api/auth/refresh)
  ✅ Secure flag ensures HTTPS-only in production
  ✅ SameSite: Strict blocks CSRF attacks
```

### Security Layers

| Layer | Tool | Protection Against |
|---|---|---|
| Password hashing | bcrypt (12 rounds) | Database breach |
| Input validation | express-validator | Injection, malformed data |
| Rate limiting | express-rate-limit | Brute force attacks |
| HTTP headers | helmet.js | Clickjacking, XSS, MIME sniffing |
| Token rotation | Custom family system | Stolen refresh token reuse |
| httpOnly cookies | Browser API | XSS token theft |
| SameSite: Strict | Cookie flag | CSRF attacks |
| Short-lived access tokens | 15 min expiry | Token interception window |
| CORS with credentials | Configured origins | Cross-origin attacks |

---

## 📡 API Reference

### Authentication Endpoints

```
POST   /api/auth/register              Public
GET    /api/auth/verify-email/:token   Public
POST   /api/auth/login                 Public (rate limited)
POST   /api/auth/refresh               Public (cookie required)
POST   /api/auth/logout                Public
POST   /api/auth/logout-all            🔒 Authenticated
GET    /api/auth/google                Public (OAuth redirect)
GET    /api/auth/google/callback       Public (OAuth callback)
```

### User Endpoints

```
GET    /api/users/me                   🔒 Any authenticated user
GET    /api/users/                     🔒 Moderator + Admin only
```

### Admin Endpoints

```
GET    /api/admin/stats                🔒 Admin only
PATCH  /api/admin/users/:id/role       🔒 Admin only
PATCH  /api/admin/users/:id/status     🔒 Admin only
```

### Request / Response Examples

**Register**
```json
POST /api/auth/register
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "password": "Alice@1234"
}

→ 201 { "message": "Registration successful. Please verify your email." }
```

**Login**
```json
POST /api/auth/login
{ "email": "alice@example.com", "password": "Alice@1234" }

→ 200 {
  "accessToken": "eyJhbGci...",
  "user": { "id": "64abc...", "name": "Alice Johnson", "email": "alice@example.com", "role": "user" }
}
Set-Cookie: refreshToken=...; HttpOnly; SameSite=Strict; Path=/api/auth/refresh
```

**Protected Request**
```
GET /api/users/me
Authorization: Bearer eyJhbGci...

→ 200 { "_id": "64abc...", "name": "Alice Johnson", "role": "user", ... }
```

---

## 🧪 Testing Guide

### Run All Tests

```bash
cd backend
npm test
```

### Manual Smoke Test

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test@1234"}'

# 2. Quick-verify for testing (MongoDB)
# db.users.updateOne({email:"test@test.com"},{$set:{isEmailVerified:true}})

# 3. Login + save cookie
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@test.com","password":"Test@1234"}'

# 4. Access protected route (paste accessToken from step 3)
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 5. Refresh tokens
curl -X POST http://localhost:5000/api/auth/refresh -b cookies.txt -c cookies.txt

# 6. Logout
curl -X POST http://localhost:5000/api/auth/logout -b cookies.txt
```

### Security Checks

```bash
# XSS test: try stealing token from browser console
document.cookie  # refreshToken should NOT appear ✅

# Brute force: run 11 bad logins in a row → 429 on 11th ✅

# Tamper test: modify 1 char of access token → 403 ✅

# Rotation test: reuse old refresh token → 401 + family revoked ✅
```

---

## 🔧 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Backend server port (default: 5000) |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Yes | Secret for signing access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | Secret for signing refresh tokens (different from access!) |
| `JWT_ACCESS_EXPIRES` | Yes | Access token lifetime e.g. `15m` |
| `JWT_REFRESH_EXPIRES` | Yes | Refresh token lifetime e.g. `7d` |
| `GOOGLE_CLIENT_ID` | OAuth only | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth only | From Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | OAuth only | Must match exactly in Google Console |
| `EMAIL_HOST` | Yes | SMTP host e.g. `smtp.gmail.com` |
| `EMAIL_PORT` | Yes | SMTP port e.g. `587` |
| `EMAIL_USER` | Yes | Sender email address |
| `EMAIL_PASS` | Yes | SMTP password or App Password |
| `CLIENT_URL` | Yes | Frontend URL for CORS + email links |

---

## 🚀 Deployment

### Production Checklist

```bash
# 1. Set environment
NODE_ENV=production

# 2. Use strong secrets (minimum 64 characters)
JWT_ACCESS_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

# 3. Enable HTTPS (Secure cookie flag activates automatically)

# 4. Update CORS origin to your real domain
CLIENT_URL=https://yourdomain.com

# 5. Update Google OAuth callback URL in Google Console
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback

# 6. Use MongoDB Atlas for managed database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/secureauth
```

### Deploy with Docker

```bash
# Build and start all services
docker-compose up --build

# Services:
# Backend  → http://localhost:5000
# Frontend → http://localhost:5173
# MongoDB  → mongodb://localhost:27017
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ using **React** · **Node.js** · **MongoDB** · **JWT** · **Passport.js**

⭐ **Star this repo if it helped you!** ⭐

</div>
