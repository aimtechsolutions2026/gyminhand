# 🛠️ GYM SAAS - TECHNOLOGY STACK

**Version:** 1.0  
**Last Updated:** September 2024  
**Target Environment:** Production (Vercel + Railway/Render)

---

## 1. OVERALL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  (Next.js SPA + Member Mobile PWA)                      │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST API
┌──────────────────────▼──────────────────────────────────┐
│                    API LAYER                             │
│  (Next.js API Routes / Express Backend)                │
├──────────────────────────────────────────────────────────┤
│ Auth | Members | Attendance | Payments | Trainers | etc │
└──────────────────────┬──────────────────────────────────┘
                       │ SQL Queries
┌──────────────────────▼──────────────────────────────────┐
│                    DATA LAYER                            │
│  PostgreSQL + Prisma ORM                                │
├──────────────────────────────────────────────────────────┤
│ Tables: Users, Members, Attendance, Payments, etc       │
└──────────────────────────────────────────────────────────┘

External Services:
├── Razorpay (Payments)
├── SendGrid/AWS SES (Email)
├── Twillio (SMS)
├── Cloudinary (Image Storage)
└── Sentry (Error Logging)
```

---

## 2. FRONTEND STACK

### Core Framework
```
Framework:        Next.js 14+
Runtime:          Node.js 18+
Language:         TypeScript
CSS:              Tailwind CSS 3.x
Build Tool:       Webpack (Next.js default)
Package Manager:  npm or pnpm
```

### Frontend Libraries

```
State Management:
├── Zustand         (Lightweight state store)
├── React Query     (Server state management)
└── Context API     (UI-level state)

Form Handling:
├── React Hook Form (Form library)
└── Zod             (Schema validation)

UI Components:
├── shadcn/ui       (Pre-built components)
├── Heroicons       (Icons)
├── Recharts        (Charts & graphs)
└── Lucide React    (Additional icons)

Utilities:
├── clsx / classnames (Conditional CSS)
├── date-fns         (Date manipulation)
├── axios            (HTTP client)
└── next-auth        (Authentication)

QR & Barcode:
├── qrcode.react     (QR generation)
├── jsbarcode        (Barcode generation)
├── qr-scanner       (QR reading)
└── @zxing/library   (Barcode reading)

PDFs & Downloads:
├── jsPDF            (PDF generation)
├── html2pdf         (HTML to PDF)
└── papaparse        (CSV parsing)

Notifications:
├── sonner           (Toast notifications)
├── react-toastify   (Alternative)
└── react-hot-toast  (Another option)

Analytics:
├── next-analytics   (Page views)
├── Plausible        (Privacy-friendly analytics)
└── Mixpanel         (User events)
```

### Development Tools
```
Build:            Next.js (built-in)
Linting:          ESLint + Prettier
Type Checking:    TypeScript
Testing:          Jest + React Testing Library
Code Quality:     SonarQube (optional)
Version Control:  Git
CI/CD:            GitHub Actions
```

### Development Dependencies
```json
{
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "tailwindcss": "^3.0.0",
    "postcss": "^8.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0"
  }
}
```

---

## 3. BACKEND STACK

### API Framework
```
Framework:        Next.js API Routes (initially)
Alternative:      Express.js / NestJS (scale phase)
Runtime:          Node.js 18+
Language:         TypeScript
API Style:        RESTful JSON
Versioning:       /api/v1/...
```

### Backend Libraries

```
Authentication:
├── NextAuth.js      (Auth management)
├── jsonwebtoken     (JWT tokens)
├── bcryptjs         (Password hashing)
└── crypto           (Encryption)

Database & ORM:
├── Prisma           (ORM - PRIMARY)
├── @prisma/client   (Prisma client)
├── pg               (PostgreSQL driver)
└── postgres         (Connection pooling)

Validation:
├── Zod              (Schema validation)
├── Joi              (Alternative)
└── express-validator (Express alternative)

Middleware:
├── express-cors     (CORS handling)
├── express-rate-limit (Rate limiting)
├── helmet           (Security headers)
└── morgan           (HTTP logging)

File Upload:
├── multer           (File handling)
├── cloudinary       (CDN/storage)
└── aws-sdk          (S3 alternative)

Async/Jobs:
├── bull             (Job queue)
├── redis            (Cache/queue store)
└── node-cron        (Scheduled tasks)

External Services:
├── razorpay         (Payments)
├── sendgrid         (Email)
├── twilio           (SMS/WhatsApp)
├── axios            (HTTP requests)
└── stripe           (Alternative payments)

Monitoring & Logging:
├── winston          (Logging)
├── pino             (Fast logging)
├── sentry           (Error tracking)
└── datadog          (Monitoring - optional)

Utilities:
├── lodash           (Utility functions)
├── moment/date-fns  (Date utilities)
├── uuid             (ID generation)
└── crypto-js        (Encryption)
```

### Backend Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "next-auth": "^4.0.0",
    "zod": "^3.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.0",
    "axios": "^1.4.0",
    "razorpay": "^2.0.0",
    "sendgrid": "^7.7.0",
    "twilio": "^3.0.0",
    "bull": "^4.0.0",
    "redis": "^4.0.0",
    "winston": "^3.0.0",
    "@sentry/nextjs": "^7.0.0",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.0.0"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "@prisma/cli": "^5.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "ts-node": "^10.0.0"
  }
}
```

---

## 4. DATABASE STACK

### Database Engine
```
Type:             Relational (SQL)
Database:         PostgreSQL 14+
Connection Pool:  pgBouncer or PgPool
Backup:           Automated daily
Replication:      Read replicas (Phase 2)
```

### PostgreSQL Features Used
```
✅ Multi-tenant with Row Level Security (RLS)
✅ UUID primary keys
✅ JSONB for flexible fields
✅ Indexes on frequently queried columns
✅ Enum types for status fields
✅ Constraints for data integrity
✅ Transactions for critical operations
✅ Full-text search (Phase 2)
✅ PostGIS for location features (Phase 3)
```

### ORM: Prisma

```
Why Prisma:
├── Type-safe database access
├── Auto-migrations
├── Clear schema definition
├── Excellent TypeScript support
├── Built-in performance insights
└── Easy relationship handling

Prisma Version:   5.x or latest
Prisma Studio:    For database GUI browsing
```

### Database Migrations
```
Method:           Prisma Migrate
Versioning:       Auto-generated with timestamps
History:          Stored in prisma/migrations/
Rollback:         Supported for recent migrations
```

### Backup Strategy
```
Automated:        Daily snapshots (Cloud provider)
Retention:        30-day rolling backup
Disaster Recovery: 4-hour RTO, 1-hour RPO
Testing:          Monthly restore drills
Encryption:       At rest + in transit
```

---

## 5. INFRASTRUCTURE & DEPLOYMENT

### Hosting

#### Frontend Deployment
```
Platform:         Vercel
Auto-deploy:      On push to main branch
Preview:          Auto-generated for PRs
CDN:              Vercel Edge Network
SSL:              Automatic (Let's Encrypt)
Monitoring:       Built-in Web Analytics
Speed:            <2s First Contentful Paint
Region:           Auto-global
```

#### Backend/Database Options

**Option A: Vercel Serverless (Initial)**
```
API Routes:       Vercel Serverless Functions
Database:         Railway PostgreSQL
Cache:            Upstash Redis
Cold start:       <1 second
Cost:             Pay-per-execution
Scaling:          Automatic
```

**Option B: Railway (Recommended for Phase 1)**
```
Backend:          Railway Node.js
Database:         Railway PostgreSQL
Redis:            Railway Redis
Pricing:          $5-50/month (includes everything)
Scaling:          Horizontal on demand
Backup:           Automatic daily
Database URL:     Automatic environment variable
```

**Option C: Render (Alternative)**
```
Backend:          Render Web Service
Database:         Render PostgreSQL
Pricing:          $12-100/month
Scaling:          Easy scaling
Free tier:        Available but limited
```

### Environment Configuration

```bash
# .env.local (Local Development)
DATABASE_URL="postgresql://user:pass@localhost:5432/gym_saas_dev"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key"
RAZORPAY_KEY_ID="test-key"
RAZORPAY_KEY_SECRET="test-secret"
CLOUDINARY_URL="cloudinary://..."
SENDGRID_API_KEY="test-key"
SENTRY_DSN=""

# Production (Vercel/Railway Secrets)
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="production-secret"
RAZORPAY_KEY_ID="live-key"
RAZORPAY_KEY_SECRET="live-secret"
CLOUDINARY_URL="..."
SENDGRID_API_KEY="live-key"
SENTRY_DSN="https://..."
NODE_ENV="production"
```

---

## 6. THIRD-PARTY INTEGRATIONS

### Payments: Razorpay

```
Why Razorpay:
├── UPI, Cards, Wallets support
├── Subscriptions built-in
├── No US bank needed (India-first)
├── Excellent documentation
├── Best for Indian market
└── Affordable fees

Integration:
├── API Key: Razorpay Dashboard
├── Webhook: Verify payments
├── Payment Links: Generate for members
├── Subscriptions: Auto-renewal

SDK: razorpay npm package
Version: 2.x or latest

Webhook Events:
├── payment.authorized
├── payment.failed
├── subscription.activated
├── subscription.charged
└── subscription.paused
```

### Email: SendGrid

```
Why SendGrid:
├── High deliverability
├── Templates support
├── SMTP + API both available
├── Analytics included
├── Reasonable pricing

Integration:
├── API Key from SendGrid dashboard
├── From email: noreply@yourdomain.com
├── Templates: Create in SendGrid UI
├── Track: Opens, clicks

SDK: @sendgrid/mail npm package
```

### SMS & WhatsApp: Twilio

```
Why Twilio:
├── WhatsApp API available
├── SMS fallback
├── Templates support
├── India numbers available
├── Webhooks for delivery status

Integration:
├── Account SID + Auth Token
├── From number/WhatsApp sender
├── Template IDs
├── Webhook for delivery confirmation

SDK: twilio npm package
Cost: ~₹0.50-1 per SMS/WhatsApp message
```

### Cloud Storage: Cloudinary

```
Why Cloudinary:
├── Image optimization
├── Auto-transformation
├── CDN included
├── Free tier (10GB/month)
├── No extra server needed

Integration:
├── Cloud name, API key, secret
├── Upload widget or direct upload
├── URL transformation (resize, etc)
├── Programmatic upload

SDK: cloudinary npm package
```

### Error Tracking: Sentry

```
Why Sentry:
├── Real-time error alerts
├── Source maps support
├── Performance monitoring
├── Session replay (Phase 2)
├── Free tier available

Integration:
├── DSN from Sentry project
├── Automatic error capture
├── Custom error contexts
├── Release tracking

SDK: @sentry/nextjs npm package
```

### Analytics: Plausible (Privacy-Friendly)

```
Why Plausible:
├── Privacy-focused (no cookies)
├── GDPR compliant
├── Simple & lightweight
├── No data selling
├── India-friendly

Integration:
├── Simple script tag
├── Automatic page tracking
├── Goal tracking (signups, etc)
├── Dashboard on plausible.io

Cost: ~$20/month for 500K pageviews
Alternative: Posthog, Mixpanel
```

---

## 7. CACHING & OPTIMIZATION

### Redis Caching

```
Service:          Upstash Redis or Railway Redis
Use Cases:
├── Session storage
├── Rate limiting (per IP)
├── Member list cache
├── Attendance cache (before DB write)
├── Job queue (Bull)
└── Real-time stats cache

TTL Strategy:
├── Sessions: 24 hours
├── Attendance: 1 hour
├── Member list: 30 mins
├── Stats: 15 mins
└── Rate limit: 5 mins

Pricing: ~$7-20/month for production
```

### Database Query Optimization

```
Techniques:
├── Indexes on foreign keys
├── Indexes on frequently filtered columns
├── N+1 query prevention (Prisma relations)
├── Query result caching
├── Pagination for large lists
├── Select specific columns (not *)
└── Denormalization for read-heavy data

Monitoring:
├── Database slow query log
├── Prisma query insights
├── API response time tracking
└── Database connection pool monitoring
```

### Frontend Performance

```
Optimization:
├── Code splitting (Next.js automatic)
├── Image optimization (next/image)
├── Dynamic imports for large components
├── CSS minification (Tailwind)
├── JS minification (Next.js)
├── Lazy loading components
├── Service Worker for offline (Phase 2)
└── Gzip compression (automatic)

Metrics:
├── Lighthouse score > 90
├── First Contentful Paint < 2s
├── Cumulative Layout Shift < 0.1
├── Time to Interactive < 3.5s
```

---

## 8. MONITORING & LOGGING

### Application Logging

```
Logger:           Winston or Pino
Log Levels:
├── ERROR         (Application errors)
├── WARN          (Warnings, deprecations)
├── INFO          (Important events)
├── DEBUG         (Development info)
└── TRACE         (Detailed debugging)

What to Log:
├── API requests/responses (non-sensitive)
├── Database errors
├── Authentication events
├── Payment events
├── Failed tasks
└── Important state changes

Rotation:        Daily, keep 30 days
Storage:         CloudWatch or file system
```

### Performance Monitoring

```
Metrics:
├── API response time (target: <200ms)
├── Database query time (target: <100ms)
├── Frontend load time (target: <3s)
├── Error rate (target: <0.1%)
├── Uptime (target: 99.9%)
└── User session duration

Tools:
├── Sentry (errors)
├── Vercel Analytics (frontend)
├── Railway/Render Monitoring (backend)
└── Datadog (optional, comprehensive)

Alerts:
├── Error spike (>5% increase)
├── API down (>5 consecutive 5xx)
├── Database slow (>1s queries)
└── High memory usage (>80%)
```

---

## 9. SECURITY STACK

### Authentication & Authorization

```
Method:           JWT (JSON Web Tokens)
Storage:          HTTPOnly cookies (secure)
Refresh Token:    In database, rotated
Expiry:           Access token 15 mins, Refresh 7 days
2FA:              TOTP (Phase 2)
SSO:              Google OAuth (Phase 2)

Password:
├── Min 8 characters
├── Hashed with bcryptjs (10 rounds)
├── Never stored in plain text
└── Salted before hashing
```

### HTTPS & Certificates

```
Protocol:         HTTPS only (force redirect)
Certificate:      Let's Encrypt (auto-renewed)
HSTS:             Enabled (1 year)
TLS Version:      1.2+ required
Cipher Suites:    Modern (no weak ciphers)
```

### Data Protection

```
At Rest:
├── Database passwords encrypted (HashiCorp Vault)
├── API keys encrypted
├── Personal data encrypted (PII)
└── Backups encrypted (AES-256)

In Transit:
├── HTTPS everywhere
├── TLS 1.2+
├── Certificate pinning (Phase 2)
└── Signed requests for webhooks

Data Retention:
├── Logs: 30 days
├── Backups: 90 days
├── Deleted data: 30-day recovery window
└── Compliance: GDPR, CCPA ready
```

### API Security

```
Rate Limiting:
├── 100 requests/minute per IP (general)
├── 10 requests/minute per IP (auth endpoints)
├── 1000 requests/hour per user (logged in)
└── Burst allowance: +20 requests

CORS:
├── Only from allowed domains
├── No credentials on cross-origin by default
├── Pre-flight requests required
└── Content-Type restrictions

CSRF Protection:
├── Token-based (for forms)
├── SameSite cookie attribute
└── Double-submit pattern

Input Validation:
├── All inputs validated (Zod schemas)
├── No SQL injection possible (Prisma)
├── XSS protection (React auto-escapes)
├── File upload restrictions (type, size)
└── File scanning for malware (Phase 2)
```

### Secrets Management

```
Approach:
├── Never commit secrets to Git
├── Use environment variables
├── Encrypt secrets in CI/CD
├── Rotate secrets regularly

Services:
├── Vercel Secrets (frontend/serverless)
├── Railway/Render Secrets (backend)
├── HashiCorp Vault (enterprise)
└── AWS Secrets Manager (optional)

Secret Types:
├── Database credentials
├── API keys (Razorpay, Twilio, etc)
├── NEXTAUTH_SECRET
├── Encryption keys
└── JWT signing keys
```

---

## 10. TESTING STACK

### Unit Testing

```
Framework:        Jest
Assertion Lib:    Jest built-in
Coverage Target:  >80% for critical paths

Test Utilities:
├── Jest setup files
├── Mock database
├── Mock external services
└── Test data factories

Commands:
├── npm test (run all tests)
├── npm test -- --watch (watch mode)
├── npm test -- --coverage (coverage report)
```

### Component Testing

```
Framework:        React Testing Library
Philosophy:       Test user behavior, not implementation

Focus:
├── Button clicks
├── Form submission
├── Conditional rendering
├── Props validation
└── State changes

Coverage:         >70% for components
```

### Integration Testing

```
Approach:         Test full flows
Database:         Test database (with seed data)
API Routes:       Test actual API endpoints

Examples:
├── Member signup → Login → View dashboard
├── Payment flow → Membership renewal
├── Attendance scan → History update
└── Follow-up task → Completion

Tools:           Jest + Supertest (for API)
```

### E2E Testing (Phase 2)

```
Framework:        Cypress or Playwright
Environments:     Staging server
Scenarios:
├── Owner signup flow
├── Member registration
├── QR scanning
├── Payment processing
└── Dashboard interactions

Frequency:        Daily on staging
```

---

## 11. CI/CD PIPELINE

### GitHub Actions Workflow

```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: vercel/action@v4
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
      - name: Deploy to Railway
        run: |
          railway up --deployment-token ${{ secrets.RAILWAY_TOKEN }}
```

### Deployment Checklist

```
Before Deploy:
├── All tests passing
├── Lint checks pass
├── Type checking passes
├── No security vulnerabilities
├── Database migrations tested
├── Environment variables configured
└── Backup created

After Deploy:
├── Smoke tests on production
├── Monitor error rates (Sentry)
├── Check database health
├── Verify payments working
├── Check member app load time
└── Monitor user sessions
```

---

## 12. DEVELOPMENT WORKFLOW

### Local Development Setup

```bash
# Clone and install
git clone <repo>
cd gym-saas
npm install

# Environment setup
cp .env.example .env.local
# Edit .env.local with local PostgreSQL URL

# Database setup
npx prisma migrate dev --name init
npx prisma generate

# Start development
npm run dev

# URL: http://localhost:3000
```

### Code Quality Tools

```
Linting:          ESLint (catch errors)
Formatting:       Prettier (code style)
Type Checking:    TypeScript (type safety)
Pre-commit:       Husky (run checks before commit)
PR Checks:        GitHub Actions (enforce quality)

Commands:
├── npm run lint       (check)
├── npm run lint:fix   (auto-fix)
├── npm run format     (prettify)
├── npm run type-check (TypeScript check)
└── npm test           (run tests)
```

### Git Workflow

```
Branch Strategy:  Git Flow
├── main           (production-ready)
├── develop        (staging)
└── feature/*      (feature branches)

Commit Message:
├── feat: Add X
├── fix: Fix Y
├── chore: Update Z
├── docs: Update README

PR Requirements:
├── 2 approvals
├── All checks passing
├── No merge conflicts
└── Description of changes
```

---

## 13. TECHNOLOGY SELECTION RATIONALE

| Component | Choice | Alternative | Why |
|-----------|--------|-------------|-----|
| **Frontend** | Next.js | React, Vue, Svelte | Full-stack, SSR, API routes built-in |
| **Backend** | Next.js API Routes | Express, NestJS | Simplicity for MVP, quick scaling |
| **Database** | PostgreSQL | MongoDB, MySQL | Relational, better for taxi transactions |
| **ORM** | Prisma | TypeORM, Sequelize | Type-safe, developer experience |
| **Auth** | NextAuth.js | Auth0, Firebase | Open source, self-hosted control |
| **Payments** | Razorpay | Stripe, CCAvenue | UPI, India-friendly, no US account |
| **Email** | SendGrid | AWS SES, Mailgun | Reliability, templates, deliverability |
| **SMS** | Twilio | AWS SNS, Karix | WhatsApp support, India ready |
| **Hosting** | Vercel (Frontend) | Netlify, GitHub Pages | Next.js native, auto-scaling |
| **Database** | Railway | Heroku, AWS RDS | Affordable, good DX, India support |
| **Cache** | Upstash Redis | Redis Cloud, AWS | Serverless, affordable |
| **Monitoring** | Sentry | DataDog, New Relic | Error tracking, free tier |

---

## 14. COST BREAKDOWN (Monthly)

### Phase 1 (MVP - <50 gyms)
```
Vercel (Frontend):        ~$20/month (pro plan)
Railway (Backend+DB):     ~$20/month
Upstash Redis:            ~$7/month
SendGrid Email:           ~$15/month (free tier + charges)
Twilio SMS/WhatsApp:      ~$20/month (estimated)
Cloudinary:               Free (10GB/month)
Sentry:                   ~$29/month (pro tier)
Domain:                   ~$1/month
SSL Certificate:          Free (Let's Encrypt)
─────────────────────────────────────
TOTAL:                    ~$112/month

Revenue:                  ~₹2L/month (20 gyms × ₹10k/month avg)
Margin:                   ~99%
```

### Phase 2 (Scale - 100+ gyms)
```
Vercel:                   ~$100/month
Railway:                  ~$80/month
Upstash:                  ~$20/month
SendGrid:                 ~$50/month
Twilio:                   ~$100/month
Cloudinary:               ~$50/month
Sentry:                   ~$50/month
CDN (CloudFlare):         ~$20/month
Monitoring (DataDog):     ~$50/month (optional)
─────────────────────────────────────
TOTAL:                    ~$520/month

Revenue:                  ~₹50L/month (100 gyms × ₹50k/month avg)
Margin:                   ~99%
```

---

## 15. SCALABILITY ROADMAP

### Phase 1: MVP (0-50 gyms)
- Single PostgreSQL instance
- Vercel serverless functions
- No caching layer needed
- Simple logging

### Phase 2: Growth (50-500 gyms)
- Read replica for PostgreSQL
- Redis cache layer
- Queue system for async jobs (Bull + Redis)
- Advanced monitoring (DataDog)
- CDN for static assets (CloudFlare)

### Phase 3: Enterprise (500+ gyms)
- Database sharding by organization
- Microservices architecture
- Kubernetes deployment
- Multiple database regions
- Advanced load balancing
- Real-time updates (WebSockets)

---

**Document Status:** APPROVED ✅  
**Last Updated:** September 2024  
**Technology Stack Version:** 1.0
