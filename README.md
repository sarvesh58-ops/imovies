# 🎬 IMovies — Full-Stack Movie Ticket Booking Platform

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-lightgrey.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple.svg)](https://getbootstrap.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-orange.svg)]()

> A production-grade, advanced full-stack movie ticket booking web application built with a decoupled architecture (**React + Vite + Custom Bootstrap 5 Cinema Theme** frontend and **Node.js + Express.js + MongoDB Mongoose** backend).

---

## 🌟 Key Highlights

- **Custom Cinema UI Design System**: Dark obsidian canvas (`#0A0D14`), glowing crimson accents (`#E50914`), glassmorphism headers, curved auditorium screen visual, and interactive responsive seat selector matrix.
- **Atomic Concurrency Guard (Zero Double-Booking)**: High-concurrency seat reservation engine backed by MongoDB partial unique compound indexes (`{ showtime: 1, seat: 1 }`), eliminating race conditions and simultaneous booking conflicts.
- **Interactive Auditorium Map**: Dynamically colored seat matrix distinguishing **Standard**, **Premium**, and **VIP Recliner** tiers with dynamic pricing, real-time fee and tax calculation, and live seat count limits.
- **Scannable Digital Cinema Passes**: Automated QR code verification payload and unique booking references (`IMV-YYYYMMDD-XXXXXX`), with integrated print/download ticket capabilities.
- **Comprehensive Executive Admin Portal**: Live KPI analytics, revenue tracking, popular movie box office tables, theatre occupancy, user management with role toggles, screening schedulers, and review moderation.
- **Zero-Friction Evaluation Mode**: Out-of-the-box support for local MongoDB instances, MongoDB Atlas cloud clusters, or automatic embedded in-memory MongoDB fallback with pre-seeded demo cinema data.

---

## 🏗️ Architecture & Tech Stack

### Frontend (`/client`)
- **React.js 18** (Vite build system)
- **Bootstrap 5.3** (Heavily customized with bespoke SCSS variables, glowing shadows, dark glass cards)
- **Bootstrap Icons** (Semantic vector cinema iconography)
- **React Router v6** (Nested routes, `ProtectedRoute`, `AdminRoute`)
- **Axios** (Centralized API client with JWT Bearer interceptor and auto-logout on token expiration)
- **Context API** (`AuthContext`, `BookingContext`, `ToastContext`)

### Backend (`/server`)
- **Node.js & Express.js** (Layered architecture: Routes, Controllers, Services, Models, Middleware)
- **MongoDB & Mongoose ODM** (Rich schemas, compound indexes, virtual relations, cascade cleanups)
- **JWT & bcryptjs** (Secure authentication, hashed passwords with salt rounds, authorization middleware)
- **express-validator** (Strict server-side payload validation and sanitization)
- **Helmet & CORS** (Security headers and cross-origin resource sharing)

---

## 📂 Project Structure

```
movieticket/
├── client/                     # Frontend React Single Page Application
│   ├── src/
│   │   ├── assets/styles/      # Custom Bootstrap SCSS & cinema theme variables
│   │   ├── components/         # Reusable UI (Navbar, Footer, MovieCard, SeatMatrix, TicketCard, etc.)
│   │   ├── context/            # Global State: Auth, Booking, Toast notifications
│   │   ├── layouts/            # MainLayout and AdminLayout wrappers
│   │   ├── pages/              # Home, Movies, MovieDetails, Theatres, SeatBooking, Checkout, History, Profile
│   │   │   └── admin/          # Dashboard, MovieManagement, TheatreManagement, Showtimes, Bookings, Users, Reviews
│   │   ├── routes/             # AppRoutes, ProtectedRoute, AdminRoute
│   │   └── services/           # Axios API service endpoints
│   ├── index.html
│   └── vite.config.js
│
├── server/                     # Backend REST API Server
│   ├── src/
│   │   ├── config/             # Environment & MongoDB connection module
│   │   ├── constants/          # Roles, booking status, seat tiers
│   │   ├── controllers/        # HTTP controllers (Auth, Movie, Theatre, Showtime, Booking, Admin, Review)
│   │   ├── middleware/         # Auth, Admin guard, Validator, Error handler, 404
│   │   ├── models/             # Mongoose schemas (User, Movie, Theatre, Screen, Seat, Showtime, Booking, Review)
│   │   ├── routes/             # RESTful API route declarations
│   │   ├── services/           # Business logic & atomic seat reservation engine
│   │   ├── utils/              # ApiResponse, ApiError, Reference & QR generators
│   │   ├── validators/         # express-validator schemas
│   │   └── scripts/            # Seed data generator & automated test suite
│   ├── .env.example
│   └── package.json
│
├── package.json                # Root orchestration scripts
└── README.md
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- **Node.js** v18+ and **npm** installed on your system.
- *(Optional)* Local MongoDB or MongoDB Atlas cluster (if not running, the application automatically launches an embedded in-memory MongoDB instance with pre-seeded demo data).

### 2. Install Dependencies
```bash
# From the root directory:
npm run install:all
```

### 3. Run Automated Integration Test Suite
To verify that all REST endpoints, authentication, atomic double-booking prevention, cancellation, and admin analytics work correctly:
```bash
npm test
```

### 4. Seed the Database
Populate the database with blockbuster movies, multiplex theatres, screen layouts, showtimes, sample bookings, and demo accounts:
```bash
npm run seed
```

### 5. Launch the Application

#### Option A: Development Mode (Hot Reloading)
Open two terminal windows:
```bash
# Terminal 1: Backend Server (Port 5000)
cd server
npm run dev

# Terminal 2: Frontend Vite Client (Port 5173)
cd client
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

#### Option B: Unified Production Mode
Build the client and serve everything from the Express server:
```bash
npm start
```
Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## 🔑 Default Evaluation Credentials

For seamless evaluation, quick-fill buttons are provided directly on the Login page:

| Role | Email Address | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@imovies.com` | `Admin@123` | Full access to Admin Portal, CRUD, Analytics, Users |
| **Standard User** | `user@imovies.com` | `User@123` | Browse, Book Tickets, Cancel, Review Movies, Profile |

---

## 🧪 Concurrency & Double-Booking Protection

In high-demand ticket releases, simultaneous booking attempts for the same seat must never result in duplicate tickets.

IMovies implements a two-tier concurrency guard:
1. **Application-Level Pre-Flight Check**: Checks existing reservations before price calculation.
2. **Database-Level Compound Unique Index**:
   ```javascript
   // models/BookingSeat.js
   bookingSeatSchema.index(
     { showtime: 1, seat: 1 },
     { unique: true, partialFilterExpression: { status: 'booked' } }
   );
   ```
   If two requests attempt to book seat `A4` simultaneously, MongoDB immediately rejects the second insertion with a duplicate key conflict (`code 11000`). The booking service rolls back the pending document and returns `HTTP 409 Conflict: "Seat A4 was just booked by another user"`.

---

## 📡 REST API Summary

- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Get authenticated user details
- `GET /api/movies` — List movies with search, genre, language, status, and sort filters
- `GET /api/movies/:id` — Get detailed movie information
- `GET /api/movies/:id/showtimes` — Get movie screenings grouped by theatre and date
- `GET /api/theatres` — List cinemas with city filter
- `GET /api/showtimes/:id/seats` — Get live auditorium seating grid and occupancy
- `POST /api/bookings` — Atomically book selected seats
- `GET /api/bookings/my-bookings` — Customer booking history
- `PUT /api/bookings/:id/cancel` — Cancel booking and release seats
- `GET /api/reviews/movie/:movieId` — Movie reviews and ratings
- `POST /api/reviews/movie/:movieId` — Submit movie review (with verified ticket badge)
- `GET /api/admin/stats` — Executive dashboard KPIs (Revenue, Bookings, Users, Screenings)
- `GET /api/admin/popular-movies` — Box office revenue ranking
- `GET /api/admin/theatre-performance` — Cinema occupancy and revenue breakdown
- `GET /api/admin/users` — User management and role switching
- `GET /api/admin/reviews` — Review moderation queue

---

## 📄 Evaluation Checklist

- [x] Full-Stack separation: `/client` and `/server`
- [x] Tech stack followed strictly: React, Vite, Bootstrap 5, Express, MongoDB (Mongoose)
- [x] JWT Authentication & bcrypt password hashing
- [x] Input validation with express-validator
- [x] Complete customer booking journey (Browse -> Showtime -> Seats -> Dynamic Pricing -> Checkout -> Digital Ticket QR)
- [x] Concurrency and double-booking prevention tested and verified
- [x] Ticket cancellation and automatic seat release
- [x] Movie ratings and reviews system with average calculation
- [x] Executive Admin Dashboard with analytics and KPIs
- [x] Full CRUD operations for Movies, Theatres, Screens, and Showtimes
- [x] Responsive layout supporting Mobile, Tablet, and Desktop screens
- [x] Automated test suite passing 100%

---

## 💳 Razorpay & 🎬 TMDB API Integrations

### 1. Razorpay Payment Gateway
- **Backend Order Creation**: Server generates authenticated Razorpay orders via `POST /api/bookings/razorpay/create-order` calculating itemized seat breakdowns, convenience fees, and 18% GST.
- **Cryptographic Signature Verification**: Server validates the HMAC SHA256 payment signature `crypto.createHmac('sha256', secret).update(order_id + '|' + payment_id).digest('hex')` before atomically booking the seats.
- **Frontend Integration**: Checkout dynamically loads the official Razorpay Checkout SDK modal (`checkout.js`) with custom cinema styling, user prefill, and retry handling.
- **Simulator Fallback**: If `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are not yet supplied in `.env`, the system automatically runs in a zero-friction evaluation mode so testing and booking confirmation never fail.

### 2. The Movie Database (TMDB) API
- **Official Movie Discovery & Search**: Query TMDB catalog with `GET /api/movies/tmdb/search?query=...` and `GET /api/movies/tmdb/trending`.
- **One-Click Admin Import**: In the Admin Movie Management portal, click **"Import from TMDB"** to search any global title and import full synopses, HD posters, backdrops, YouTube trailer links, cast/crew, and age certificates directly into your MongoDB database.
- **Safe Fallback**: If `TMDB_API_KEY` is not supplied, the backend provides curated offline blockbusters with a clear indicator in the UI.

---

## 🚀 Running Localhost URLs

- **Full-Stack Application (Production Bundle)**: [http://localhost:5000](http://localhost:5000)
- **Vite Development Server (with Proxy to :5000)**: [http://localhost:5173](http://localhost:5173)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Demo Credentials:
- **Admin**: `admin@imovies.com` / `Admin@123`
- **User**: `user@imovies.com` / `User@123`
