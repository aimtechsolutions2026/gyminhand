# 🚀 FitFlow - Production Deployment Guide for Render

This guide provides step-by-step instructions for deploying the **FitFlow Gym Operating System** (Next.js 14 App Router + Prisma ORM) to **Render** as a high-availability Web Service connected to your live Render PostgreSQL database.

---

## 📑 Table of Contents
1. [Architecture Overview](#-architecture-overview)
2. [Prerequisites Checklist](#-prerequisites-checklist)
3. [Step 1: Git Repository Setup & Push to GitHub](#step-1-git-repository-setup--push-to-github)
4. [Step 2: Deploying to Render](#step-2-deploying-to-render)
   - [Option A: Via Render Web Dashboard (Recommended)](#option-a-deploy-via-render-web-dashboard-recommended)
   - [Option B: Via Render Blueprint (1-Click IaC)](#option-b-deploy-via-render-blueprint-1-click-iac)
5. [Step 3: Environment Variables Configuration](#step-3-environment-variables-configuration)
6. [Step 4: Database Migrations & Initial Seeding](#step-4-database-migrations--initial-seeding)
7. [Step 5: Post-Deployment Verification](#step-5-post-deployment-verification)
8. [Custom Domains & SSL Configuration](#-custom-domains--ssl-configuration)
9. [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🏛 Architecture Overview

- **Web Service:** Next.js 14 (App Router) on Node.js 18+ runtime.
- **Database:** PostgreSQL 16 (Hosted on Render in the **Oregon (US West)** region).
- **Authentication:** NextAuth.js JWT session engine with bcrypt password hashing.
- **ORM:** Prisma 5.x with automatic Client generation and connection pooling.
- **Health Checks:** Automated `/api/health` probe for zero-downtime rolling deploys.

```
┌─────────────────────────────────────────────────────────────┐
│                 Render Cloud (Oregon Region)                │
│                                                             │
│   ┌────────────────────────┐      Internal DB Network       │
│   │   FitFlow Web Service  │ ◄───────────────────────────┐  │
│   │   (Next.js 14 Node)    │      Low latency, $0 egress │  │
│   └───────────┬────────────┘                             │  │
│               │                                          │  │
│               ▼                                          │  │
│   ┌────────────────────────┐                             │  │
│   │  Health Check Probe    │                             │  │
│   │  /api/health (200 OK)  │                             │  │
│   └────────────────────────┘                             │  │
│                                                          │  │
│   ┌──────────────────────────────────────────────────┐   │  │
│   │   PostgreSQL Database (Render Managed)           │───┘  │
│   │   Instance: dpg-dajcl315efls738dkch0-a           │      │
│   └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Prerequisites Checklist

Before you begin, ensure you have:
1. A **[Render Account](https://dashboard.render.com)**.
2. A **[GitHub](https://github.com)** or **[GitLab](https://gitlab.com)** account.
3. Access to your existing Render PostgreSQL database (`gyminhand`).
4. Git installed on your local computer (`git --version`).

---

## Step 1: Git Repository Setup & Push to GitHub

Render builds your application by connecting to a Git repository. Follow these commands to initialize and push your code:

### 1.1 Check `.gitignore` (Safety First)
Confirm that sensitive files and build artifacts are ignored:
```bash
# Verify .gitignore contains .env and node_modules
cat .gitignore | grep -E "(\.env|node_modules|\.next)"
```
> [!CAUTION]
> Never commit `.env` containing your live database credentials to public GitHub repositories. `.gitignore` is already configured to block `.env`.

### 1.2 Initialize Git and Create Initial Commit
Run the following commands in the project root directory:

```bash
# 1. Initialize local git repository
git init

# 2. Stage all files (respecting .gitignore)
git add .

# 3. Create the initial commit
git commit -m "feat: complete FitFlow SaaS platform ready for Render deployment"

# 4. Rename default branch to main
git branch -M main
```

### 1.3 Create GitHub Repository and Push
1. Go to [GitHub](https://github.com/new) and create a **New Repository**.
   - Name: `fitflow-saas` (or your preferred name)
   - Visibility: **Private** (recommended)
   - Do **NOT** initialize with README, .gitignore, or license (we already have them).
2. Copy the remote URL and push your code:

```bash
# Replace <YOUR_GITHUB_USERNAME> with your actual GitHub username
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/fitflow-saas.git

# Push code to GitHub
git push -u origin main
```

---

## Step 2: Deploying to Render

You can choose either **Option A** (Standard Web Dashboard) or **Option B** (1-Click Blueprint).

### Option A: Deploy via Render Web Dashboard (Recommended)

1. Go to the [Render Dashboard](https://dashboard.render.com).
2. Click **New +** in the top navigation and select **Web Service**.
3. Under **Connect a Git repository**, find your `fitflow-saas` repository and click **Connect**.
4. Configure the service settings:

| Field | Recommended Value | Explanation |
|---|---|---|
| **Name** | `fitflow-gym` | Identifies your service; URL becomes `https://fitflow-gym.onrender.com` |
| **Region** | **`Oregon (US West)`** | ⚠️ **Must match your PostgreSQL database region** for minimum latency |
| **Branch** | `main` | Production branch |
| **Root Directory** | *(leave empty)* | Application is in the root directory |
| **Runtime** | **`Node`** | Native Node.js environment |
| **Build Command** | `npm install --include=dev && npx prisma generate && npm run build` | Installs packages including build tools (Tailwind, PostCSS, Prisma), generates Prisma Client, and builds Next.js |
| **Start Command** | `npm run start` | Launches the Next.js production server |
| **Instance Type** | **Starter ($7/mo)** or **Free** | *Starter* is recommended for 24/7 uptime without sleep delays |

5. Scroll down to **Advanced** settings:
   - **Health Check Path:** `/api/health`
   - **Auto-Deploy:** `Yes` (automatically redeploys whenever you push to `main`)

---

### Option B: Deploy via Render Blueprint (1-Click IaC)

The repository includes a ready-to-use [`render.yaml`](render.yaml) file.

1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Blueprint**.
3. Connect your `fitflow-saas` repository.
4. Render will automatically parse `render.yaml` and configure:
   - Web service name, Node runtime, Oregon region.
   - Build & Start commands.
   - Health check path `/api/health`.
5. Click **Apply**.

---

## Step 3: Environment Variables Configuration

In the Render Web Service dashboard, navigate to the **Environment** tab and add the following variables:

| Key | Value / Example | Where to find |
|---|---|---|
| `DATABASE_URL` | `postgresql://gyminhand_user:...@dpg-...-a/gyminhand` | **Render DB Dashboard → "Internal Database URL"** (preferred) or "External Database URL" |
| `NEXTAUTH_URL` | `https://fitflow-gym.onrender.com` | Your Render Web Service public URL (or custom domain) |
| `NEXTAUTH_SECRET` | *(Random 32+ character string)* | Generate using `openssl rand -base64 32` (or use any strong secret) |
| `NODE_ENV` | `production` | Tells Next.js to run in optimized production mode |
| `PORT` | `3000` | Optional (Render automatically maps internal port) |

> [!TIP]
> **Why use the Internal Database URL?**
> When your Web Service and PostgreSQL database are both in the **Oregon** region on Render, using the **Internal Database URL** routes all database traffic through Render's private high-speed network. This eliminates egress bandwidth costs and significantly reduces query latency.

### Generating a Secure `NEXTAUTH_SECRET`
Run this in your local terminal:
```bash
openssl rand -base64 32
```
Copy the output and paste it into the `NEXTAUTH_SECRET` field on Render.

---

## Step 4: Database Migrations & Initial Seeding

Your database schema has already been pushed to your live Render database. If you ever need to run migrations or re-seed demo data on Render:

### Method 1: Using the Render Web Shell (Easiest)
1. Open your Web Service in the Render Dashboard.
2. In the left sidebar, click **Shell**.
3. Run the following commands directly inside the container:

```bash
# Push schema updates if any
npx prisma db push

# Seed initial demo accounts and plans
node prisma/seed.mjs
```

### Method 2: From your Local Machine
Since your local `.env` points to the Render database, you can run from your local terminal:
```bash
# Push schema
npx prisma db push

# Re-seed demo users
node prisma/seed.mjs
```

---

## Step 5: Post-Deployment Verification

Once Render displays **`Live`** with a green checkmark, complete these tests:

### 1. Verify Health Check Endpoint
Open in your browser:
```
https://<your-service-name>.onrender.com/api/health
```
Expected response:
```json
{
  "status": "ok",
  "service": "fitflow-gym-saas",
  "database": "connected"
}
```

### 2. Verify Authentication & Portals
Test logging in with the pre-seeded demo accounts:

| Role | Email / Identifier | Password | Target URL | Expected View |
|---|---|---|---|---|
| **Super Admin** | `admin@fitflow.app` | `Password123` | `/admin/dashboard` | Platform SaaS KPIs, Gym Active/Deactivate, Subscriptions |
| **Gym Owner** | `owner@fitflow.app` | `Password123` | `/owner/dashboard` | Full Owner Dashboard, Member Directory, Revenue MRR |
| **Gym Manager** | `manager@fitflow.app` | `Password123` | `/owner/dashboard` | Branch Operations, Member Management, Attendance |
| **Trainer** | `trainer@fitflow.app` | `Password123` | `/owner/members` | Member List, Fitness Progress, Leaderboard |
| **Receptionist** | `reception@fitflow.app` | `Password123` | `/owner/scan` | Live Camera Kiosk Scanner & Multi-Branch Check-in |
| **Member Portal** | Phone: `9876543210`<br>ID: `FF-IND-000001` | *(direct)* | `/member/dashboard` | Digital QR Membership Card & Cross-Branch Pass |

### 3. Verify Key Features
- [ ] **Lockout Perimeter:** As Superadmin, toggle the demo gym to *Inactive* → open `/owner/dashboard` in an incognito window → verify redirect to `/gym-suspended`. Toggle back to *Active* → verify instant access restored.
- [ ] **Membership Plans:** Navigate to `/owner/plans` → create a custom plan (e.g. "CrossFit 90 Days") → verify it appears in the plan catalog.
- [ ] **Digital Membership Card:** Visit `/member/card` → verify glassmorphism card, countdown timer, and **Multi-Branch Roaming Pass** badge.
- [ ] **Cross-Branch Check-in:** Open `/owner/scan` → change scanner location branch → scan Indiranagar member QR → verify roaming celebration alert.

---

## 🌐 Custom Domains & SSL Configuration

Render provides automatic, free, zero-configuration Let's Encrypt SSL certificates for custom domains:

1. In Render Dashboard, go to your Web Service → **Settings** → **Custom Domains**.
2. Click **Add Custom Domain** and enter your domain (e.g., `app.yourdomain.com` or `yourgym.com`).
3. Add the DNS records to your DNS registrar (GoDaddy, Namecheap, Cloudflare, etc.):
   - **For Subdomain (`app.yourdomain.com`):** Add a `CNAME` record pointing to your Render onrender.com address (e.g., `fitflow-gym.onrender.com`).
   - **For Apex Domain (`yourdomain.com`):** Add an `A` record pointing to Render's IP address provided in the dashboard.
4. Update `NEXTAUTH_URL` in the Render Environment tab to your custom domain:
   ```
   NEXTAUTH_URL=https://app.yourdomain.com
   ```
5. Click **Save Changes** (Render will automatically re-deploy with the new URL).

---

## ⏰ Keep-Alive Cron Service (Prevent Render Free Tier Sleep)

Render's Free Tier automatically puts web services to sleep after **15 minutes of inactivity**, causing a 50-second delay on the next visit. FitFlow has a built-in automated 10-minute keep-alive system to keep the service warm 24/7:

### 1. Built-In Backend Auto-Ping (Enabled Automatically)
- **Files:** [`src/instrumentation.ts`](src/instrumentation.ts) and [`src/lib/keep-alive.ts`](src/lib/keep-alive.ts)
- **How it works:** When the Next.js server starts in production on Render, it automatically schedules an HTTP GET request to `https://<RENDER_EXTERNAL_URL>/api/health` every **10 minutes** (before the 15-minute idle cutoff).
- **Zero Config:** Automatically detects your public URL via Render's built-in `RENDER_EXTERNAL_URL` or `NEXTAUTH_URL`.

### 2. External GitHub Actions Cron Workflow
- **File:** [`.github/workflows/keep-alive.yml`](.github/workflows/keep-alive.yml)
- **How it works:** GitHub runs a completely free background runner on schedule `*/10 * * * *` that curls your Render URL `/api/health` every 10 minutes from outside.
- **Setup:**
  1. In your GitHub repository, go to **Settings → Secrets and variables → Actions**.
  2. Add repository secret `RENDER_SERVICE_URL` with value `https://<your-service-name>.onrender.com`.

### 3. Optional: Free External Monitor (UptimeRobot)
1. Register at [UptimeRobot.com](https://uptimerobot.com) (Free).
2. Add New Monitor → Type: **HTTP(s)** → URL: `https://<your-service-name>.onrender.com/api/health` → Interval: **10 minutes**.
3. This guarantees 100% uptime with instant alerts if your service ever experiences downtime.

---

## 🛠 Troubleshooting & FAQs

### Q1: The build fails with `PrismaClientInitializationError` during `next build`
**Cause:** Next.js static page generation attempted to connect to the database, but `DATABASE_URL` was missing during the build phase.  
**Solution:** Ensure `DATABASE_URL` is set in the **Environment** tab on Render. The `postinstall` script in `package.json` automatically runs `prisma generate` before `next build`.

### Q2: Authentication fails or redirects back to `/login` with an error
**Cause:** `NEXTAUTH_URL` does not match the exact URL in the browser (e.g. using `http://` instead of `https://`), or `NEXTAUTH_SECRET` is missing.  
**Solution:** 
1. Check that `NEXTAUTH_URL` starts with `https://`.
2. Ensure `NEXTAUTH_SECRET` is set to a 32+ character string.

### Q3: First request is slow or takes 50 seconds to respond
**Cause:** You are using Render's **Free Tier**, which automatically spins down Web Services after 15 minutes of inactivity.  
**Solution:** Upgrade the Web Service instance type from **Free** to **Starter ($7/month)** in **Settings → Instance Type**. This keeps the application running 24/7 with zero spin-down latency.

### Q4: How do I roll back a bad deployment?
In the Render Web Service dashboard, click the **Deploys** tab. Find any previous successful build and click **Rollback to this deploy**. Render will restore the previous build instantly.

