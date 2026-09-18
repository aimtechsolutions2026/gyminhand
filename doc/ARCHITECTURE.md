# 🏛️ GYM SAAS - SOFTWARE ARCHITECTURE

**Version:** 1.0  
**Date:** September 2024  
**Arch Pattern:** Multi-layered (Presentation → Business Logic → Data Access)

---

## 1. ARCHITECTURAL OVERVIEW

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  (React Components, Pages, UI State)                        │
├──────────────────────┬──────────────────────────────────────┤
│  Owner Dashboard     │  Member App (PWA)                    │
│  Manager Dashboard   │  QR Scanner                          │
│  Settings Pages      │  Trainer Dashboard                   │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ HTTP/API calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER                                │
│  (Next.js API Routes / Controllers)                         │
│  ├─ Request validation (Zod schemas)                        │
│  ├─ Authentication middleware                               │
│  ├─ Authorization checks                                    │
│  ├─ Business logic orchestration                            │
│  └─ Response formatting                                     │
├──────────────────────────────────────────────────────────────┤
│  /api/members   /api/attendance   /api/payments   /api/auth │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ SQL queries
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  SERVICE LAYER                              │
│  (Business Logic, Calculations, Transformations)            │
│  ├─ Member service (create, update, get)                    │
│  ├─ Attendance service (mark, calculate streak)             │
│  ├─ Payment service (process, reconcile)                    │
│  ├─ Notification service (email, WhatsApp)                  │
│  ├─ Gamification service (badges, leaderboard)              │
│  └─ Risk scoring service (churn prediction)                 │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ Prisma ORM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATA ACCESS LAYER                          │
│  (Prisma ORM, Database Queries)                             │
│  ├─ Member queries                                          │
│  ├─ Attendance queries                                      │
│  ├─ Payment queries                                         │
│  └─ Relationship loading                                    │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ SQL
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  PERSISTENCE LAYER                          │
│  PostgreSQL Database                                        │
│  ├─ Tables (members, attendance, payments, etc)            │
│  ├─ Indexes (performance optimization)                      │
│  ├─ Constraints (data integrity)                            │
│  └─ Transactions (consistency)                              │
└─────────────────────────────────────────────────────────────┘

External Services (Integrated at API Layer):
├── Razorpay (Payments)
├── SendGrid (Email)
├── Twilio (SMS/WhatsApp)
├── Cloudinary (File storage)
├── Sentry (Error tracking)
└── Redis (Cache, Sessions, Job Queue)
```

---

## 2. PROJECT STRUCTURE

### Directory Layout

```
gym-saas/
│
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Authentication group
│   │   ├── login/
│   │   │   └── page.tsx              # Login page component
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── password-reset/
│   │   │   └── page.tsx
│   │   └── layout.tsx                # Auth layout (centered)
│   │
│   ├── (dashboard)/                  # Protected pages group
│   │   ├── owner/                    # Owner routes
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Main dashboard
│   │   │   ├── members/
│   │   │   │   ├── page.tsx          # Member list
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx      # Member details
│   │   │   │   └── new/
│   │   │   │       └── page.tsx      # New member form
│   │   │   ├── payments/
│   │   │   │   ├── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── trainers/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx          # Gym settings
│   │   │   │   └── branches/
│   │   │   │       ├── page.tsx
│   │   │   │       └── new/
│   │   │   │           └── page.tsx
│   │   │   ├── follow-ups/
│   │   │   │   ├── page.tsx          # CRM dashboard
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx            # Owner layout (sidebar)
│   │   │
│   │   ├── member/                   # Member app routes
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Member home
│   │   │   ├── qr/
│   │   │   │   └── page.tsx          # Show QR code
│   │   │   ├── scan/
│   │   │   │   └── page.tsx          # QR scanner
│   │   │   ├── attendance/
│   │   │   │   └── page.tsx          # Attendance history
│   │   │   ├── workout/
│   │   │   │   └── page.tsx          # Today's workout
│   │   │   ├── diet/
│   │   │   │   └── page.tsx          # Today's diet
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx            # Member layout (bottom tabs)
│   │   │
│   │   ├── trainer/                  # Trainer routes
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── members/
│   │   │   │   └── page.tsx
│   │   │   ├── workouts/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   └── layout.tsx                # Protected layout wrapper
│   │
│   ├── api/                          # API routes
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts          # POST /api/auth/login
│   │   │   ├── logout/
│   │   │   │   └── route.ts
│   │   │   ├── refresh/
│   │   │   │   └── route.ts
│   │   │   └── password-reset/
│   │   │       └── route.ts
│   │   │
│   │   ├── members/
│   │   │   ├── route.ts              # GET/POST /api/members
│   │   │   ├── [id]/
│   │   │   │   └── route.ts          # GET/PUT/DELETE /api/members/[id]
│   │   │   ├── bulk-import/
│   │   │   │   └── route.ts          # POST CSV import
│   │   │   └── [id]/
│   │   │       └── risk-score/
│   │   │           └── route.ts
│   │   │
│   │   ├── attendance/
│   │   │   ├── route.ts              # GET/POST attendance
│   │   │   └── scan/
│   │   │       └── route.ts          # POST /api/attendance/scan (QR)
│   │   │
│   │   ├── payments/
│   │   │   ├── route.ts
│   │   │   └── razorpay-webhook/
│   │   │       └── route.ts          # POST webhook from Razorpay
│   │   │
│   │   ├── trainers/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── workouts/
│   │   │           └── route.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── email/
│   │   │   │   └── route.ts
│   │   │   └── whatsapp/
│   │   │       └── route.ts
│   │   │
│   │   └── health/
│   │       └── route.ts              # Health check endpoint
│   │
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Landing page
│
├── components/                       # Reusable React components
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── dashboard/
│   │   ├── StatCard.tsx              # Metric card
│   │   ├── Chart.tsx                 # Recharts wrapper
│   │   ├── MemberRiskCard.tsx
│   │   └── FollowUpTaskCard.tsx
│   │
│   ├── member/
│   │   ├── MemberForm.tsx
│   │   ├── MemberCard.tsx
│   │   ├── MemberList.tsx
│   │   └── AttendanceCalendar.tsx
│   │
│   ├── attendance/
│   │   ├── QRScanner.tsx             # QR scanning component
│   │   ├── QRDisplay.tsx             # Show member QR
│   │   └── AttendanceHistory.tsx
│   │
│   ├── forms/
│   │   ├── FormField.tsx             # Wrapper for form fields
│   │   ├── FormError.tsx
│   │   └── FormSubmit.tsx
│   │
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Tabs.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   ├── Spinner.tsx
│   │   ├── Toast.tsx
│   │   ├── Alert.tsx
│   │   └── Table.tsx
│   │
│   ├── layout/
│   │   ├── OwnerSidebar.tsx
│   │   ├── MemberBottomNav.tsx
│   │   ├── Header.tsx
│   │   └── Navbar.tsx
│   │
│   └── shared/
│       ├── Loading.tsx
│       ├── EmptyState.tsx
│       └── ErrorBoundary.tsx
│
├── lib/                              # Utility functions & helpers
│   ├── db.ts                         # Prisma client instance
│   ├── auth.ts                       # Auth utilities (JWT, verify)
│   ├── qr.ts                         # QR generation/validation
│   ├── api-client.ts                 # Axios instance + interceptors
│   ├── api-helpers.ts                # Response formatting
│   ├── stripe.ts                     # Razorpay helper (payments)
│   ├── email.ts                      # SendGrid client
│   ├── whatsapp.ts                   # Twilio client
│   ├── storage.ts                    # Cloudinary client
│   ├── sentry.ts                     # Error tracking setup
│   ├── redis.ts                      # Redis client
│   ├── validators.ts                 # Zod schemas for validation
│   ├── utils.ts                      # General utilities
│   └── constants.ts                  # App-wide constants
│
├── services/                         # Business logic layer
│   ├── member.service.ts
│   │   ├── createMember()
│   │   ├── getMember()
│   │   ├── updateMember()
│   │   ├── deleteMember()
│   │   ├── listMembers()
│   │   └── importMembers()
│   │
│   ├── attendance.service.ts
│   │   ├── markAttendance()
│   │   ├── getAttendanceHistory()
│   │   ├── calculateStreak()
│   │   ├── getDailyStats()
│   │   └── getAnalytics()
│   │
│   ├── payment.service.ts
│   │   ├── createPayment()
│   │   ├── verifyRazorpayPayment()
│   │   ├── getRevenueStats()
│   │   └── handleWebhook()
│   │
│   ├── membership.service.ts
│   │   ├── createMembership()
│   │   ├── renewMembership()
│   │   ├── expireMembership()
│   │   ├── freezeMembership()
│   │   └── getExpiringMembers()
│   │
│   ├── notification.service.ts
│   │   ├── sendEmail()
│   │   ├── sendWhatsApp()
│   │   ├── sendSMS()
│   │   └── queueNotification()
│   │
│   ├── gamification.service.ts
│   │   ├── calculateStreak()
│   │   ├── awardBadge()
│   │   ├── updateLeaderboard()
│   │   └── getLeaderboard()
│   │
│   ├── risk-score.service.ts
│   │   ├── calculateRiskScore()
│   │   ├── detectChurn()
│   │   ├── detectInactive()
│   │   └── getRiskReport()
│   │
│   ├── trainer.service.ts
│   │   ├── createTrainer()
│   │   ├── assignTrainerToMember()
│   │   ├── createWorkoutPlan()
│   │   └── createDietPlan()
│   │
│   └── organization.service.ts
│       ├── createOrganization()
│       ├── getOrganization()
│       ├── updateSettings()
│       └── createBranch()
│
├── hooks/                            # Custom React hooks
│   ├── useAuth.ts                    # Auth state & methods
│   ├── useOrganization.ts            # Org context
│   ├── useFetch.ts                   # Data fetching
│   ├── useLocalStorage.ts            # Browser storage
│   ├── useForm.ts                    # Form state management
│   ├── useNotification.ts            # Toast notifications
│   ├── useDebounce.ts                # Debouncing
│   └── useOffline.ts                 # Offline detection
│
├── store/                            # State management (Zustand)
│   ├── auth.store.ts                 # Auth state
│   ├── organization.store.ts         # Org/branch state
│   ├── ui.store.ts                   # UI state (sidebar, etc)
│   └── offline.store.ts              # Offline queue
│
├── middleware/                       # Next.js middleware
│   └── auth.ts                       # Protect routes, verify JWT
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── migrations/                   # Migration history
│
├── public/
│   ├── images/
│   └── icons/
│
├── styles/
│   └── globals.css                   # Tailwind + global styles
│
├── types/                            # TypeScript types
│   ├── index.ts                      # Main types
│   ├── api.ts                        # API request/response types
│   ├── models.ts                     # Database model types
│   └── components.ts                 # Component prop types
│
├── .env.example                      # Environment template
├── .env.local                        # Local secrets (git ignored)
├── .gitignore
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
├── package.json
└── README.md
```

---

## 3. LAYER ARCHITECTURE

### Layer 1: Presentation Layer (React Components)

**Responsibility:** UI rendering, user interaction, local state management

```typescript
// components/member/MemberForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateMemberSchema } from '@/lib/validators';
import { useMemberService } from '@/hooks/useMemberService';

export function MemberForm() {
  const { createMember } = useMemberService();
  const { register, formState: { errors } } = useForm({
    resolver: zodResolver(CreateMemberSchema),
  });

  const handleSubmit = async (data) => {
    try {
      await createMember(data);
      // Show success notification
    } catch (error) {
      // Show error notification
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      {/* More fields */}
      <button type="submit">Create Member</button>
    </form>
  );
}
```

**Characteristics:**
- Components use hooks (useState, useEffect)
- Form handling with react-hook-form
- API calls through custom hooks
- Error/loading states managed locally
- Re-renders on state change

---

### Layer 2: API Layer (Next.js Routes)

**Responsibility:** Request routing, validation, auth checks, response formatting

```typescript
// app/api/members/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CreateMemberSchema } from '@/lib/validators';
import { verifyAuth } from '@/lib/auth';
import { memberService } from '@/services/member.service';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify authentication
    const authResult = await verifyAuth(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Validate input
    const body = await req.json();
    const validated = CreateMemberSchema.parse(body);

    // 3. Call business logic
    const member = await memberService.createMember(
      validated,
      authResult.organizationId  // From JWT
    );

    // 4. Format & return response
    return NextResponse.json({
      success: true,
      data: member,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

**Characteristics:**
- Route handler for each endpoint
- Request validation upfront
- Auth verification from JWT token
- Delegation to services
- Consistent response format

---

### Layer 3: Service Layer (Business Logic)

**Responsibility:** Core business logic, data transformations, orchestration

```typescript
// services/member.service.ts
import { prisma } from '@/lib/db';
import { notificationService } from './notification.service';
import { storageService } from './storage.service';

export const memberService = {
  async createMember(
    data: CreateMemberInput,
    organizationId: string
  ) {
    // 1. Pre-processing
    const memberId = generateMemberId();
    const photoUrl = await storageService.uploadPhoto(data.photo);

    // 2. Database operation
    const member = await prisma.member.create({
      data: {
        ...data,
        id: memberId,
        organizationId,  // Tenant isolation
        profilePhotoUrl: photoUrl,
      },
    });

    // 3. Create QR code
    const qr = await qrService.generateQRCode(member.id);

    // 4. Post-processing (async, non-blocking)
    notificationService.queueWelcomeEmail(member);

    // 5. Return member with QR
    return {
      ...member,
      qrCode: qr,
    };
  },

  async getMember(memberId: string, organizationId: string) {
    // Fetch with org_id check (prevents cross-tenant access)
    return prisma.member.findFirst({
      where: {
        id: memberId,
        organizationId,  // Tenant isolation
      },
      include: {
        membership: true,
        attendance: { take: 10 },  // Recent attendance
        streak: true,
      },
    });
  },

  // More methods...
};
```

**Characteristics:**
- Pure business logic
- Database access through Prisma
- Data validation & transformation
- Orchestration of other services
- No HTTP awareness
- Testable (can unit test)

---

### Layer 4: Data Access Layer (Prisma ORM)

**Responsibility:** Database queries, relationships, caching

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
});

// Connection pooling handled by PgPool
// Indexes on frequently queried columns
// Constraints for data integrity
```

**Prisma Schema Example:**
```prisma
model Member {
  id            String   @id @default(cuid())
  organizationId String   // Tenant key
  branchId      String
  name          String
  phone         String   @unique  // Unique per branch
  email         String?
  
  // Relations
  organization  Organization @relation(fields: [organizationId])
  branch        Branch @relation(fields: [branchId])
  membership    Membership?
  attendance    Attendance[]
  
  @@index([organizationId, branchId])  // Tenant + Branch
  @@unique([organizationId, branchId, phone])  // Business unique key
}
```

**Characteristics:**
- ORM abstracts database operations
- Type-safe queries
- Automatic query optimization
- Relationship loading
- Migration management

---

### Layer 5: Persistence Layer (PostgreSQL)

**Responsibility:** Durable data storage, ACID transactions, indexes

```sql
-- Database ensures:
-- 1. Data integrity (constraints)
CREATE TABLE members (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  phone VARCHAR(20) NOT NULL,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  UNIQUE(organization_id, phone)
);

-- 2. Performance (indexes)
CREATE INDEX idx_members_org_branch 
ON members(organization_id, branch_id);

CREATE INDEX idx_attendance_member_date 
ON attendance(member_id, entry_time DESC);

-- 3. Automatic ACID transactions
BEGIN;
INSERT INTO membership (...);
UPDATE member SET ... WHERE id = $1;
COMMIT;
```

**Characteristics:**
- Relational data model
- ACID guarantees
- Indexes for query performance
- Foreign keys for referential integrity
- Transactions for consistency

---

## 4. DATA FLOW IN A REQUEST

### Complete Request Flow: Create Member

```
1. User clicks "Add Member" (Presentation)
   └─ MemberForm.tsx calls handleSubmit()

2. Form validation (Presentation)
   ├─ react-hook-form validates locally
   ├─ Zod schema checks format
   └─ If invalid → show errors, stop

3. API call (Presentation → API)
   └─ POST /api/members with form data

4. Route handler (API Layer)
   ├─ Extract body from request
   ├─ Extract organization_id from JWT token
   ├─ Validate input against schema
   ├─ Check auth permissions
   └─ Call memberService.createMember()

5. Business Logic (Service Layer)
   ├─ Generate unique member ID
   ├─ Upload photo to Cloudinary
   ├─ Transform input to database format
   ├─ Call prisma.member.create()
   ├─ Generate QR code
   └─ Queue welcome email async

6. Database Query (Data Access → Persistence)
   ├─ Prisma builds SQL query
   │   INSERT INTO members (id, org_id, name, phone, ...)
   │   VALUES (?, ?, ?, ?, ...)
   ├─ PostgreSQL checks constraints
   ├─ PostgreSQL inserts record
   ├─ PostgreSQL returns created record
   └─ Prisma deserializes to TypeScript object

7. Response (Service → API → Presentation)
   ├─ Service returns member object
   ├─ Route handler formats response
   ├─ Returns NextResponse.json() with 201 status
   ├─ Frontend receives response
   ├─ Show success toast
   └─ Refresh member list

8. Side Effects (Async, non-blocking)
   ├─ Welcome email queued → SendGrid
   ├─ Sentry logs event
   ├─ Analytics event tracked
   └─ Dashboard stats cache invalidated
```

---

## 5. DESIGN PATTERNS USED

### 1. Singleton Pattern
```typescript
// Ensure only one Prisma client instance
export const prisma = new PrismaClient();
```

### 2. Repository Pattern
```typescript
// Services act as repositories for business logic
export const memberService = {
  async create() { ... },
  async getById() { ... },
  async update() { ... },
  async delete() { ... },
};
```

### 3. Dependency Injection
```typescript
// Services receive dependencies as parameters
async function handleAttendance(
  attendanceService: AttendanceService,
  notificationService: NotificationService
) {
  await attendanceService.mark(...);
  await notificationService.send(...);
}
```

### 4. Observer Pattern
```typescript
// Event emitters for cross-concern notifications
eventBus.on('member.created', async (member) => {
  await notificationService.sendWelcomeEmail(member);
  await gamificationService.awardBadge(member);
});
```

### 5. Strategy Pattern
```typescript
// Different implementations of same interface
interface PaymentStrategy {
  process(amount: number): Promise<PaymentResult>;
}

class RazorpayPaymentStrategy implements PaymentStrategy { ... }
class CashPaymentStrategy implements PaymentStrategy { ... }
```

### 6. Factory Pattern
```typescript
// Create service instances
const createNotificationService = (config) => ({
  sendEmail: () => { ... },
  sendWhatsApp: () => { ... },
});
```

### 7. Middleware Pattern
```typescript
// Auth middleware intercepts requests
app.use(authMiddleware);
app.use(rateLimitMiddleware);
app.use(errorHandlerMiddleware);
```

---

## 6. ERROR HANDLING STRATEGY

### Layered Error Handling

```
Presentation Layer:
├─ Try/catch in component
├─ Format error for UI
└─ Show error toast/modal

API Layer:
├─ Validate input (throw if invalid)
├─ Check auth (throw if unauthorized)
├─ Call service
├─ Catch service errors
└─ Format error response (400/401/500)

Service Layer:
├─ Perform business logic
├─ Validate business rules
├─ Call database
├─ Catch database errors
└─ Throw descriptive errors

Database Layer:
├─ Constraints prevent invalid data
├─ Transactions ensure consistency
└─ Return errors to service layer
```

**Error Class:**
```typescript
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
  }
}

// Usage
if (phone already exists) {
  throw new AppError(
    'PHONE_DUPLICATE',
    'Phone number already registered',
    409
  );
}
```

---

## 7. TESTING STRATEGY

### Unit Testing (Services)
```typescript
// services/__tests__/member.service.test.ts
describe('MemberService', () => {
  it('should create member with correct org_id', async () => {
    const member = await memberService.create(
      { name: 'Rahul', phone: '9876543210' },
      'org-123'
    );
    expect(member.organizationId).toBe('org-123');
  });
});
```

### Integration Testing (API + Database)
```typescript
// app/api/members/__tests__/route.test.ts
describe('POST /api/members', () => {
  it('should create member and return with QR code', async () => {
    const response = await POST(mockRequest);
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('qrCode');
  });
});
```

### E2E Testing (User flows)
```typescript
// e2e/member-flow.test.ts
describe('Member Registration Flow', () => {
  it('should signup, add member, see in list', async () => {
    await page.goto('/login');
    // Login
    // Click add member
    // Fill form
    // See in member list
  });
});
```

---

## 8. DEPLOYMENT ARCHITECTURE

### Environment Progression

```
Local Development
├─ Next.js dev server (port 3000)
├─ PostgreSQL (local or Docker)
├─ Redis (Docker or local)
└─ .env.local with test keys

Staging Environment
├─ Deployed to Vercel (staging domain)
├─ Connected to test database
├─ Uses test API keys (Razorpay, SendGrid)
└─ Auto-deploy on develop branch push

Production Environment
├─ Deployed to Vercel (yourdomain.com)
├─ Connected to production database (Railway)
├─ Uses live API keys
├─ Error tracking (Sentry)
└─ CDN for static assets (CloudFlare)
```

### CI/CD Pipeline

```
1. Developer pushes to branch
   └─ GitHub webhooks Vercel

2. Vercel runs checks
   ├─ npm install
   ├─ npm run lint
   ├─ npm run type-check
   ├─ npm run test
   └─ npm run build

3. If all pass
   ├─ Preview URL generated (for PRs)
   └─ Or deploy to production (main branch)

4. Post-deploy
   ├─ Run smoke tests
   ├─ Monitor Sentry for errors
   └─ Check database health
```

---

**Document Status:** APPROVED ✅  
**Last Updated:** September 2024  
**Architecture Version:** 1.0
