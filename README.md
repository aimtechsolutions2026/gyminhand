# 🏋️ FitFlow - Gym Operating System

FitFlow is an all-in-one cloud platform engineered for Indian gyms to manage members, eliminate reception bottlenecks with instant encrypted QR check-ins, automate UPI/card billing, and prevent member churn via predictive risk scoring and proactive CRM follow-ups.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14+ (App Router, Server Actions, API Routes)
- **Language:** TypeScript 5.x (Strict mode)
- **Styling:** Tailwind CSS + Custom FitFlow Design System tokens (`#0066FF` Primary Blue, `#22C55E` Success Green, `#F59E0B` Warning Orange, `#EF4444` Danger Red)
- **UI Components:** Custom accessible primitives (`Button`, `Input`, `Card`, `Badge`) with mobile-first 44px touch targets
- **Database & ORM:** PostgreSQL + Prisma ORM (Multi-tenant shared database with strict `organization_id` isolation)
- **Authentication:** NextAuth.js with JWT session strategy & RBAC (`OWNER`, `MANAGER`, `TRAINER`, `RECEPTION`, `MEMBER`)
- **Payments:** Razorpay (UPI, QR Codes, Cards, Subscriptions)
- **Integrations:** Cloudinary (media/photos), SendGrid (transactional emails)

---

## 📁 Directory Structure

```
.
├── doc/                      # Specification & Architecture Documentation
│   ├── ARCHITECTURE.md
│   ├── FEATURES.md
│   ├── PHASES.md
│   ├── PRD.md
│   ├── SYSTEMDESIGN.md
│   ├── TECHSTACK.md
│   └── UI.md
├── prisma/
│   └── schema.prisma         # Multi-tenant schema with 9 core relational models
├── src/
│   ├── app/
│   │   ├── api/auth/         # NextAuth API routes
│   │   ├── globals.css       # Design tokens & typography
│   │   ├── layout.tsx        # Root layout with responsive viewport
│   │   └── page.tsx          # High-converting landing page
│   ├── components/
│   │   └── ui/               # Reusable UI primitives (Button, Card, Input, Badge)
│   ├── lib/
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── prisma.ts         # Singleton Prisma client instance
│   │   └── utils.ts          # Class merging, currency formatting, member ID generator
│   └── types/                # Global TypeScript definitions
├── FEATURES_TRACKER.md       # Living tracker of all functional modules
├── PHASES_TRACKER.md         # 16-week phase roadmap & status
├── TASK_LIST.md              # Active weekly task checklist
└── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.x or 20.x+
- PostgreSQL database

### 2. Setup Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `DATABASE_URL` with your PostgreSQL credentials.

### 3. Generate Database Client & Run Migrations
```bash
npx prisma generate
npx prisma db push
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔑 Demo Accounts & Test Credentials

The database has been seeded with demo users for each system role:

| Role | Name | Email / Identifier | Password | Access Portal |
|---|---|---|---|---|
| **Gym Owner** | Amit Sharma | `owner@fitflow.app` | `Password123` | [`/login`](http://localhost:3000/login) ➔ `/owner/dashboard` |
| **Gym Manager** | Priya Patel | `manager@fitflow.app` | `Password123` | [`/login`](http://localhost:3000/login) ➔ `/owner/dashboard` |
| **Gym Trainer** | Rahul Verma | `trainer@fitflow.app` | `Password123` | [`/login`](http://localhost:3000/login) |
| **Receptionist** | Sneha Reddy | `reception@fitflow.app` | `Password123` | [`/login`](http://localhost:3000/login) ➔ `/owner/scan` |
| **Super Admin** | Platform Admin | `admin@fitflow.app` | `Password123` | [`/login`](http://localhost:3000/login) |
| **Gym Member** | Vikram Malhotra | Phone: `9876543210`<br>ID: `FF-IND-000001` | *No password needed* | [`/member-login`](http://localhost:3000/member-login) ➔ `/member/dashboard` |

### Pre-Seeded Test Members & Churn Scenarios:
1. **Vikram Malhotra** (`9876543210` / `FF-IND-000001`): Active Champion, 18 visits, active 1-year plan, streak active.
2. **Rohan Gupta** (`9876543211` / `FF-IND-000002`): **At-Risk Member** (Absent for 9 days, Risk Score 65/100, pending follow-up task on `/owner/follow-ups`).
3. **Ananya Singh** (`9876543212` / `FF-IND-000003`): **Critical Churn Risk** (Absent for 22 days, Risk Score 95/100, urgent call task).
4. **Karan Mehta** (`9876543213` / `FF-IND-000004`): **Expired Membership** (Plan expired, triggers red warning on QR scanner `/owner/scan`).

---

## 📋 Project Status & Roadmaps

Track real-time progress and deployment guides:
- [🚀 Render Deployment Guide](./DEPLOYMENT.md)
- [`PHASES_TRACKER.md`](./PHASES_TRACKER.md)
- [`FEATURES_TRACKER.md`](./FEATURES_TRACKER.md)
- [`TASK_LIST.md`](./TASK_LIST.md)


