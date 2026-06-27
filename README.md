# Must Push in Development Branch From your workable branch. Then If everything okey, then marge into main branch. 

# 🧩 Daily Crossword Puzzle Platform API

A scalable REST API built with **Node.js**, **Express.js**, **TypeScript**, **Prisma**, **PostgreSQL**, and **Zod** for a Daily Crossword Puzzle Platform.

The platform allows administrators to create crossword puzzles and publish one puzzle per day. Users can solve the daily puzzle, while the system tracks attempts, selects a random daily winner, and maintains user statistics.

---

# 🚀 Tech Stack

* Node.js
* Express.js
* TypeScript
* Prisma ORM (v6)
* PostgreSQL
* Zod Validation
* JWT Authentication
* Bcrypt
* Node Cron

---

# ✨ Features

## Authentication

* User Registration
* User Login
* JWT Authentication
* Password Encryption
* Username Support
* Profile Management

---

## Admin Features

* Create Puzzle
* Update Puzzle
* Delete Puzzle
* Publish Daily Puzzle
* Archive Puzzle
* Manage Puzzle Rules
* Manage Announcements
* View User Statistics
* Manage Tester Devices
* Block Devices

---

## Puzzle Management

* Dynamic Grid Size (5×5, 7×7, 9×9, etc.)
* Across Clues
* Down Clues
* Black Cell Support
* Dynamic Rules
* Difficulty Levels
* Publish Scheduling

---

## User Features

* Play Daily Puzzle
* Auto Save Progress
* Resume Puzzle
* View Statistics
* Daily Streak
* Completion Time
* Wrong Attempt Tracking
* Hint Usage Tracking

---

## Daily Winner System

* One Winner Per Puzzle
* Random Winner Selection
* Excludes Tester Devices
* Reward Support
* Winner History

---

## Device Protection

* Device ID Tracking
* Browser Fingerprint Tracking
* IP Tracking
* User Agent Tracking
* Blocked Device Support
* Tester Device Support
* Prevent Multiple Solves From Same Device

---

## Statistics

* Total Played
* Total Completed
* Total Wins
* Fastest Time
* Average Time
* Current Streak
* Longest Streak

---

# 📁 Project Structure

```
src
│
├── app
│   ├── modules
│   │   ├── auth
│   │   ├── users
│   │   ├── puzzles
│   │   ├── puzzleAttempt
│   │   ├── puzzleWinner
│   │   ├── testerDevice
│   │   ├── blockedDevice
│   │   └── announcement
│   │
│   ├── middlewares
│   ├── routes
│   ├── config
│   ├── helpers
│   ├── errors
│   ├── constants
│   ├── interfaces
│   ├── utils
│   └── validations
│
├── prisma
│
├── app.ts
└── server.ts
```

---

# 🗄 Database Models

* User
* Puzzle
* PuzzleCell
* PuzzleClue
* PuzzleAttempt
* PuzzleWinner
* UserStatistic
* TesterDevice
* BlockedDevice
* Announcement

---

# 🔐 Security

* JWT Authentication
* Password Hashing
* Request Validation
* Device Verification
* Duplicate Solve Prevention
* Blocked Device Protection
* Role Based Authorization

---

# 📊 Puzzle Flow

```
Admin Creates Puzzle
        │
        ▼
Draft
        │
        ▼
Tester Verification
        │
        ▼
Published
        │
        ▼
Users Solve Daily Puzzle
        │
        ▼
Puzzle Completed
        │
        ▼
Random Winner Selected
        │
        ▼
Statistics Updated
```

---

# 📦 Installation

```bash
git clone <repository_url>

cd project

npm install
```

---

# ⚙ Environment Variables

```
JWT_SECRET_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgzZGJmMWZhLTg4ZjQtNGZkYS1hYzU5LTViODkzNjVkNzg2MCIsImVtYWlsIjoiYWRtaW5AcHV6emxlLmNvbSIsInJvbGUiOiJTWVNURU1fT1dORVIiLCJpYXQiOjE3ODI1NDk1MDQsImV4cCI6MTc4MzE1NDMwNH0.5-Ty1bJ2ZuGrFmM7dmORm1BgeYU_FzLUYxUWwLH9w0E
JWT_REFRESH_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgzZGJmMWZhLTg4ZjQtNGZkYS1hYzU5LTViODkzNjVkNzg2MCIsImVtYWlsIjoiYWRtaW5AcHV6emxlLmNvbSIsInJvbGUiOiJTWVNURU1fT1dORVIiLCJpYXQiOjE3ODI1NDk1MDQsImV4cCI6MTc4MzE1NDMwNH0.5-Ty1bJ2ZuGrFmgfdsgadsfaYU_FzLUYxUWwLH9w0E
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUND=10
EXPRESS_SESSION=10
NODE_ENV=development
PORT=8000

DATABASE_URL=postgresql://postgres:your_db_pass@localhost:5432/puzzle_db

FRONT_END_URL=http://localhost:3000

# redis > 
REDIS_URL=redis://default:your_redis_password@your_redis_host:your_redis_port
# REDIS_URL=redis://127.....:6379  (for local testing)

# SMTP (Email Service) >
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email
SMTP_PASS=your_pass
SMTP_FROM=your_email
```

---

# Prisma

Generate Prisma Client

```bash
npx prisma generate
```

Run Migration

```bash
npx prisma migrate dev
```

Open Prisma Studio

```bash
npx prisma studio
```

---

# Run Project

Development

```bash
npm run dev
```

Production

```bash
npm run build

npm start
```

---

# Future Improvements

* Leaderboard
* Weekly Challenges
* Monthly Challenges
* Multiple Puzzle Categories
* Reward System
* Coin System
* Push Notifications
* Email Notifications
* Hint System
* Puzzle Import & Export
* Admin Dashboard Analytics
* Multiplayer Puzzle Mode

---

# License

This project is licensed for educational and commercial use.
