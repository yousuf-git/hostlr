# <img src="https://cdn.simpleicons.org/homeassistantcommunitystore/C4522A" alt="HOSTLR" width="22" height="22" /> HOSTLR

<p align="left">
	<a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
	<a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=111827" alt="React" /></a>
	<a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite" /></a>
	<a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express" /></a>
	<a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white" alt="MongoDB" /></a>
	<a href="https://socket.io/"><img src="https://img.shields.io/badge/Socket.IO-4-010101?logo=socketdotio&logoColor=white" alt="Socket.IO" /></a>
</p>

HOSTLR is a full-stack hostel discovery and reservation platform built with a role-based architecture for **Finder**, **Owner**, and **Admin** users.

## Platform Overview

- Finder users can browse hostels, reserve seats, and chat with hostel owners.
- Owner users can manage hostels, rooms, seats, reservations, and conversations.
- Admin users can moderate the platform and monitor high-level metrics.
- Real-time communication is powered by Socket.IO.
- Reservation lifecycle includes automatic expiration handling.

## Monorepo Structure

```text
hostlr/
├── api.hostlr.com/         # Production backend API (Express + MongoDB + Socket.IO)
├── web.hostlr.com/         # Frontend application (React + Vite + Tailwind)
├── PLAN.md                 # Build/migration planning notes
├── PROMPT.md               # Product and scope prompt
└── TEST.md                 # Test strategy notes
```

## Technology Stack

### Frontend (`web.hostlr.com`)
- <img src="https://cdn.simpleicons.org/react/61DAFB" alt="React" width="14" /> React 18
- <img src="https://cdn.simpleicons.org/vite/646CFF" alt="Vite" width="14" /> Vite
- <img src="https://cdn.simpleicons.org/tailwindcss/06B6D4" alt="Tailwind CSS" width="14" /> Tailwind CSS
- <img src="https://cdn.simpleicons.org/mui/007FFF" alt="MUI" width="14" /> MUI
- <img src="https://cdn.simpleicons.org/tanstack/FF4154" alt="TanStack Query" width="14" /> TanStack Query
- <img src="https://cdn.simpleicons.org/socketdotio/010101" alt="Socket.IO" width="14" /> Socket.IO Client


### Backend (`api.hostlr.com`)
- <img src="https://cdn.simpleicons.org/nodedotjs/339933" alt="Node.js" width="14" /> Node.js (ES Modules)
- <img src="https://cdn.simpleicons.org/express/000000" alt="Express" width="14" /> Express
- <img src="https://cdn.simpleicons.org/mongodb/47A248" alt="MongoDB" width="14" /> MongoDB + Mongoose
- <img src="https://cdn.simpleicons.org/socketdotio/010101" alt="Socket.IO" width="14" /> Socket.IO
- <img src="https://cdn.simpleicons.org/swagger/85EA2D" alt="Swagger" width="14" /> Swagger (OpenAPI)
- <img src="https://cdn.simpleicons.org/mocha/8D6748" alt="Mocha" width="14" /> Mocha + Supertest

## Core Features

### Authentication and Access
- JWT-based authentication
- Role-based authorization (`admin`, `owner`, `finder`)
- Separate Admin Panel and User Panel route organization

### Hostel and Reservation Domain
- Hostel, room, and seat management for owners
- Public and role-aware browse endpoints
- Reservation creation, completion, cancellation, and expiry flows
- Scheduled expiry job for pending reservations

### Realtime Chat
- Participant-scoped conversations
- Message persistence with real-time delivery
- Typing and read-state events

### Admin Operations
- User moderation and role/status management
- Hostel and reservation oversight
- Dashboard aggregate metrics endpoints

## Local Development Setup

### 1) Prerequisites
- <img src="https://cdn.simpleicons.org/nodedotjs/339933" alt="Node.js" width="14" /> Node.js 18+
- <img src="https://cdn.simpleicons.org/npm/CB3837" alt="npm" width="14" /> npm 9+
- <img src="https://cdn.simpleicons.org/mongodb/47A248" alt="MongoDB" width="14" /> MongoDB (local instance)

### 2) Install dependencies

```bash
cd api.hostlr.com && npm install
cd ../web.hostlr.com && npm install
```

### 3) Configure backend environment

Create `api.hostlr.com/.env.dev` with values similar to:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/hostlr
ACCESS_TOKEN_SECRET=change-me
ACCESS_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
RESERVATION_TTL_HOURS=48
```

### 4) Seed demo data

```bash
cd api.hostlr.com
npm run seed
```

### 5) Run backend and frontend

```bash
# Terminal 1
cd api.hostlr.com
npm run start

# Terminal 2
cd web.hostlr.com
npm run dev
```

## Access Points

- Frontend: http://localhost:5173
- API base: http://localhost:4000/api
- Health (HTML): http://localhost:4000/api/health
- Health (JSON): http://localhost:4000/api/health/json
- API Docs: http://localhost:4000/hostlr-api-docs

## Backend Scripts (`api.hostlr.com`)

- `npm run start` — start API server via nodemon
- `npm run seed` — seed database with demo data
- `npm run test` — run backend test suite

## Frontend Scripts (`web.hostlr.com`)

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build

## Demo Accounts

- Admin: `admin@hostlr.test` / `Admin@123`
- Owner: `owner1@hostlr.test` / `Owner@123`
- Finder: `finder1@hostlr.test` / `Finder@123`

## API Domains at a Glance

- `ap/*` — Admin Panel APIs
- `up/*` — User Panel APIs (owner and finder)

## License

This project is licensed under the **Attribution 4.0 International (CC BY 4.0)** license. You are free to use, modify, and distribute this code for any purpose, provided you give appropriate credit to the original author(s).

For details, see [Creative Commons BY 4.0](https://creativecommons.org/licenses/by/4.0/).

