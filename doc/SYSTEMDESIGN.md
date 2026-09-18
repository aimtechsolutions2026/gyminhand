# 🏗️ GYM SAAS - SYSTEM DESIGN DOCUMENT

**Version:** 1.0  
**Date:** September 2024  
**Status:** Production Ready

---

## 1. SYSTEM OVERVIEW

### What is Gym SaaS?
A cloud-based platform for gym owners to manage members, track attendance, process payments, and reduce churn through engagement features.

### Core Principles
1. **Multi-Tenant Architecture** - Each gym is isolated, but share infrastructure
2. **Scalability** - From 1 member to 100,000 members
3. **Reliability** - 99.9% uptime SLA
4. **Security** - Zero data leakage between tenants
5. **Performance** - <200ms API response time

---

## 2. MULTI-TENANT ARCHITECTURE

### What is Multi-Tenancy?
Multiple gyms (customers) use the same application and infrastructure, but their data is completely isolated.

### Architecture Pattern: Shared Database with Row-Level Security (RLS)

```
┌─────────────────────────────────────────────┐
│         Single PostgreSQL Database          │
├─────────────────────────────────────────────┤
│                                             │
│  Organization A (FitZone)                   │
│  ├── Branches                               │
│  ├── Members (with org_id filter)           │
│  ├── Payments (with org_id filter)          │
│  └── Attendance (with org_id filter)        │
│                                             │
│  Organization B (PowerGym)                  │
│  ├── Branches                               │
│  ├── Members (with org_id filter)           │
│  ├── Payments (with org_id filter)          │
│  └── Attendance (with org_id filter)        │
│                                             │
│  Organization C (FitnessHub)                │
│  └── ... (similar structure)                │
│                                             │
└─────────────────────────────────────────────┘
```

### How Isolation Works

```
1. Data Model
   ├── Every record has organization_id
   ├── Every query filtered by organization_id
   └── Foreign key constraints enforce org_id

2. Query Example (Get Members)
   ✅ CORRECT:
      SELECT * FROM members 
      WHERE organization_id = $1

   ❌ WRONG (would break isolation):
      SELECT * FROM members

3. API Authentication
   ├── User logs in → JWT token created
   ├── JWT contains: user_id + organization_id
   ├── Every API call: verify token, extract org_id
   ├── Database queries: filter by org_id from token
   └── Response: only org's data sent

4. RLS (Row Level Security) - Database Level
   CREATE POLICY org_isolation ON members
   USING (organization_id = current_user_org_id());
```

### Tenant Isolation Layers

```
Layer 1: API Level
└── Extract organization_id from JWT token
    Validate token not expired
    ├── If invalid → 401 Unauthorized
    └── If valid → Pass org_id to database layer

Layer 2: Database Query Level
├── Add WHERE organization_id = $1 to all queries
├── Use Prisma's relation filtering
└── Never query without org_id filter

Layer 3: Database RLS Level (PostgreSQL)
├── Optional extra security
├── Backup if app layer fails
└── Policies enforced at database

Layer 4: Application Logic
├── Verify user's org_id matches resource's org_id
├── Before update: confirm org ownership
└── Before delete: verify authorization
```

---

## 3. DATA MODEL & RELATIONSHIPS

### Entity Relationship Diagram (Simplified)

```
┌─────────────────┐
│ Organization    │
│ (Gym)           │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│ Branch          │
└────────┬────────┘
         │ 1:N
         ├──────────────────┐
         │                  │
         ▼                  ▼
    ┌────────────┐    ┌────────────┐
    │ Member     │    │ Trainer    │
    └────┬───────┘    └────┬───────┘
         │                 │
         ├─────────────────┤
         │                 │
    ┌────▼───────┐    ┌────▼────────┐
    │Attendance  │    │WorkoutPlan  │
    └────────────┘    └─────────────┘

┌──────────────┐
│ Membership   │
│ Plan         │
└────────┬─────┘
         │ 1:N
         ▼
┌──────────────┐
│ Membership   │ (Active subscription)
└──────────────┘
         │ 1:1 (foreign key to Member)
         └─────────────

┌──────────────┐
│ Payment      │ (One payment per transaction)
└──────────────┘
```

### Core Tables

#### 1. Organizations (Gyms)
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    logo_url VARCHAR(500),
    address TEXT,
    gst VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Purpose:** Represents one gym customer  
**Multi-tenant:** Root entity with organization_id  
**Isolation:** All queries joined through this

#### 2. Branches
```sql
CREATE TABLE branches (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    capacity INT,
    created_at TIMESTAMP,
    
    CONSTRAINT fk_org FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE(organization_id, name)
);
```

**Purpose:** Physical gym location  
**Multi-tenant:** Filtered by organization_id  
**Note:** Owner can have multiple branches, each branch is isolated

#### 3. Users (Staff)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password_hash VARCHAR(255),
    role VARCHAR(50), -- owner, manager, trainer, reception
    is_active BOOLEAN DEFAULT true,
    
    CONSTRAINT fk_org FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) ON DELETE CASCADE
);
```

**Purpose:** Staff members (owner, manager, trainer, etc)  
**Multi-tenant:** Belongs to organization  
**Authentication:** Email + password stored here

#### 4. Members
```sql
CREATE TABLE members (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(50),
    height FLOAT, -- cm
    weight FLOAT, -- kg
    fitness_goal VARCHAR(255),
    profile_photo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    
    CONSTRAINT fk_org FOREIGN KEY (organization_id) 
        REFERENCES organizations(id),
    CONSTRAINT fk_branch FOREIGN KEY (branch_id) 
        REFERENCES branches(id),
    UNIQUE(organization_id, branch_id, phone)
);
```

**Purpose:** Individual gym member  
**Multi-tenant:** Must include organization_id + branch_id  
**Unique Key:** (org_id, branch_id, phone) - one member per branch

#### 5. QR Codes
```sql
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    member_id UUID NOT NULL UNIQUE,
    token VARCHAR(500) NOT NULL UNIQUE, -- encrypted
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    
    CONSTRAINT fk_org FOREIGN KEY (organization_id),
    CONSTRAINT fk_member FOREIGN KEY (member_id)
);
```

**Purpose:** Unique QR for member attendance  
**Multi-tenant:** Filtered by organization_id  
**Security:** Token is encrypted, not actual member_id

#### 6. Attendance
```sql
CREATE TABLE attendance (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    member_id UUID NOT NULL,
    entry_time TIMESTAMP NOT NULL,
    exit_time TIMESTAMP,
    duration_minutes INT,
    method VARCHAR(50), -- QR, BIOMETRIC, MANUAL
    
    CONSTRAINT fk_org FOREIGN KEY (organization_id),
    CONSTRAINT fk_member FOREIGN KEY (member_id),
    INDEX idx_member_date (member_id, entry_time)
);
```

**Purpose:** Track member gym visits  
**Multi-tenant:** organization_id + member_id  
**Performance:** Indexed on member_id + date for fast queries

#### 7. Memberships (Active Subscriptions)
```sql
CREATE TABLE memberships (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    member_id UUID NOT NULL UNIQUE,
    plan_id UUID NOT NULL,
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(50), -- ACTIVE, EXPIRED, FROZEN
    
    CONSTRAINT fk_org FOREIGN KEY (organization_id),
    CONSTRAINT fk_member FOREIGN KEY (member_id),
    CONSTRAINT fk_plan FOREIGN KEY (plan_id)
);
```

**Purpose:** Current membership subscription  
**Multi-tenant:** organization_id + member_id  
**Relationship:** 1:1 with members (one active subscription per member)

#### 8. Payments
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    member_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(50), -- CASH, UPI, CARD
    status VARCHAR(50), -- PAID, PENDING, OVERDUE
    invoice_number VARCHAR(100) UNIQUE,
    paid_at TIMESTAMP,
    
    CONSTRAINT fk_org FOREIGN KEY (organization_id),
    CONSTRAINT fk_member FOREIGN KEY (member_id),
    INDEX idx_date (organization_id, paid_at)
);
```

**Purpose:** Payment transactions  
**Multi-tenant:** organization_id  
**Analytics:** Indexed by date for revenue reports

---

## 4. API ARCHITECTURE

### API Layer Organization

```
api/
├── /members
│   ├── GET    /               (List members)
│   ├── POST   /               (Create member)
│   ├── GET    /[id]           (Get member)
│   ├── PUT    /[id]           (Update member)
│   ├── DELETE /[id]           (Delete member)
│   └── POST   /bulk-import    (CSV import)
│
├── /attendance
│   ├── POST   /               (Mark attendance)
│   ├── GET    /               (List attendance)
│   ├── GET    /member/[id]    (Member history)
│   └── GET    /analytics      (Daily stats)
│
├── /payments
│   ├── POST   /               (Record payment)
│   ├── GET    /               (List payments)
│   ├── POST   /razorpay-webhook
│   └── GET    /dashboard      (Revenue stats)
│
├── /trainers
│   ├── GET    /               (List trainers)
│   ├── POST   /[id]/members   (Assign member)
│   └── POST   /workouts       (Create plan)
│
└── /auth
    ├── POST   /login
    ├── POST   /logout
    ├── POST   /refresh
    └── POST   /password-reset
```

### Request/Response Format

#### Standard Request
```json
POST /api/v1/members
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "Rahul",
  "phone": "9876543210",
  "email": "rahul@example.com",
  "fitnessGoal": "weight_loss",
  "height": 180,
  "weight": 85
}
```

#### Standard Response (Success)
```json
{
  "success": true,
  "data": {
    "id": "member-123",
    "organizationId": "org-456",
    "name": "Rahul",
    "phone": "9876543210",
    "createdAt": "2024-09-05T10:30:00Z"
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Phone number already exists in this branch",
    "details": {
      "field": "phone",
      "value": "9876543210"
    }
  }
}
```

### Request Validation

```typescript
// Using Zod schema
const CreateMemberSchema = z.object({
  name: z.string().min(3).max(255),
  phone: z.string().regex(/^\d{10}$/), // India format
  email: z.string().email().optional(),
  fitnessGoal: z.enum(['weight_loss', 'muscle_gain', 'maintenance']),
  height: z.number().min(100).max(250), // cm
  weight: z.number().min(30).max(200), // kg
});

// Auto-validation on API route
export async function POST(req: Request) {
  const data = await req.json();
  const validated = CreateMemberSchema.parse(data); // Throws if invalid
  // Process validated data
}
```

### Authentication Flow

```
1. Login Request
   POST /api/auth/login
   {email, password}
   
2. Server Verifies
   ├── Find user by email
   ├── Compare password hash
   ├── Lookup organization_id
   └── If invalid → 401 Unauthorized

3. JWT Token Created
   Header: {alg: 'HS256', typ: 'JWT'}
   Payload: {
     user_id: 'user-123',
     email: 'owner@gym.com',
     organization_id: 'org-456',
     role: 'owner',
     exp: 1725566400 (15 mins from now)
   }
   Signature: HMAC-SHA256(header.payload, secret)

4. Refresh Token Created
   └── Stored in database with expiry 7 days

5. Response
   {
     access_token: 'eyJ0eXAiOiJKV1Q...',
     refresh_token: 'refresh-token-uuid',
     expires_in: 900 (seconds)
   }

6. Frontend Storage
   ├── Access token: Memory (lost on refresh)
   ├── Refresh token: HTTPOnly cookie (secure)
   └── On token expire → use refresh token to get new access token

7. Subsequent Requests
   All requests include:
   Authorization: Bearer {access_token}
   
   Server extracts organization_id from token for all queries.
```

---

## 5. DATA FLOW DIAGRAMS

### Member Registration Flow

```
┌─────────────────────────────────────────────────────┐
│ Reception Staff → Member Registration Form         │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ POST /api/members                                   │
│ ├─ Extract organization_id from JWT token         │
│ ├─ Validate input (Zod schema)                    │
│ └─ Check phone uniqueness (org_id + branch_id)   │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ Database Layer (Prisma)                             │
│ ├─ Create member record                            │
│ ├─ Insert with organization_id                     │
│ ├─ Generate unique member ID                       │
│ └─ Create QR code token                            │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ Queue Job: Send Welcome Email                      │
│ ├─ Enqueue in Redis + Bull                         │
│ ├─ Include: email, member_id, org_id              │
│ └─ Process async (no blocking)                     │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ Response to Client                                  │
│ {                                                   │
│   "success": true,                                  │
│   "data": {                                         │
│     "id": "member-789",                            │
│     "memberId": "GYM-BRANCH-000001",              │
│     "qrCode": "https://cdn.../qr-789.png"        │
│   }                                                 │
│ }                                                   │
└─────────────────────────────────────────────────────┘
```

### QR Attendance Flow

```
┌──────────────────────────────┐
│ Member → Scan QR Code        │
│ (Member App / Mobile)        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│ QR Scanner Page                                  │
│ ├─ Open camera                                   │
│ ├─ Detect QR code                                │
│ ├─ Extract token from QR                         │
│ └─ (No internet? Store locally)                  │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│ POST /api/attendance (with QR token)             │
│ ├─ Validate QR token (decrypt)                   │
│ ├─ Get member_id from token                      │
│ ├─ Check membership active (not expired)        │
│ ├─ Extract organization_id from JWT              │
│ └─ If offline: store in localStorage, retry      │
└──────────────┬───────────────────────────────────┘
               │
        ┌──────┴────────┐
        │               │
    Valid QR?       Invalid/Expired
        │               │
        ▼               ▼
    ┌─────────┐   ┌──────────────┐
    │ Allow   │   │ Deny Access  │
    │ Entry   │   │ Show Error   │
    └────┬────┘   └──────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ Create Attendance Record                         │
│ {                                                │
│   member_id: 'member-789',                       │
│   organization_id: 'org-456',                    │
│   entry_time: NOW(),                             │
│   method: 'QR'                                   │
│ }                                                │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│ Response: ✓ Attendance Marked                    │
│ (Haptic feedback, beep sound)                    │
└──────────────────────────────────────────────────┘

Offline Sync:
├─ When online → Send all offline records
├─ Server deduplicates (same member, same day)
└─ Confirms sync complete
```

### Payment Processing Flow

```
┌─────────────────────────────────┐
│ Member needs to renew           │
│ Membership expires in 3 days    │
└──────────┬──────────────────────┘
           │ System detects
           ▼
┌─────────────────────────────────────────────┐
│ Auto-send Renewal Reminder (WhatsApp)       │
│ "Your membership expires in 3 days"         │
└──────────┬──────────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────────────┐
│ Member clicks "Renew" in app                  │
└────────────┬─────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐
│ Membership Renewal Page                      │
│ ├─ Plan selected                             │
│ ├─ Amount calculated                         │
│ ├─ Payment method choices (Cash/UPI/Card)    │
│ └─ [Proceed to Payment]                      │
└────────────┬─────────────────────────────────┘
             │
      ┌──────┴──────────┐
      │                 │
   Cash           Online
      │                 │
      ▼                 ▼
  Manual        Razorpay
  Record        Payment
                 Gateway
                    │
                    ▼
            Create Payment Link
            (UPI QR Code)
                    │
                    ▼
            Member Pays
                    │
                    ▼
      Razorpay → Webhook
      payment.authorized
                    │
                    ▼
    POST /webhooks/razorpay
    ├─ Verify signature
    ├─ Extract payment_id
    ├─ Update payment status
    ├─ Update membership expiry
    ├─ Send receipt (email/WhatsApp)
    └─ Emit analytics event
```

---

## 6. SCALABILITY CONSIDERATIONS

### Data Growth Plan

```
Month 1:       50 gyms, 5,000 members, 50K records
Month 6:       200 gyms, 50K members, 500K records
Month 12:      500 gyms, 500K members, 5M records
Year 2:        1000+ gyms, 5M+ members, 50M+ records
```

### Database Scaling Strategy

```
Phase 1 (0-500K records):
├── Single PostgreSQL instance
├── Basic indexes on org_id, member_id
└── Nightly backups

Phase 2 (500K-5M records):
├── Add read replicas (reports/analytics)
├── Optimize slow queries (explain analyze)
├── Archive old attendance data (>1 year)
└── Add more indexes strategically

Phase 3 (5M+ records):
├── Shard by organization_id
├── Separate database per shard
├── Load balancer routes based on org
└── Eventual consistency for cross-org queries

Connection Pool:
├── pgBouncer or PgPool
├── Max connections: based on server capacity
├── Connection timeout: 30 seconds idle
└── Queue: Queue waiting connections
```

### Query Performance Targets

```
User-Facing Queries:
├── List members: <500ms (1000 records)
├── Member detail: <100ms
├── Attendance history: <500ms (1000 records)
└── Dashboard stats: <2000ms (complex query)

Reporting Queries:
├── Monthly revenue: <5s (full scan ok)
├── Member churn: <10s (complex analytics)
└── Trainer performance: <5s
```

### Caching Strategy

```
Redis Cache:
├── Member list (branch + org): 30 mins
├── Attendance daily stats: 1 hour
├── Member risk score: 4 hours
├── Leaderboard: 1 day
└── Gym settings: 1 day

Invalidation:
├── On new member → invalidate member list
├── On attendance → invalidate daily stats + leaderboard
├── On risk score change → invalidate risk score cache
└── Time-based expiry as fallback
```

---

## 7. ERROR HANDLING & RESILIENCE

### Error Codes

```
200 OK           - Success
201 Created      - Resource created
400 Bad Request  - Invalid input
401 Unauthorized - Not authenticated
403 Forbidden    - Authenticated but no permission
404 Not Found    - Resource not found
409 Conflict     - Phone already exists, etc
422 Invalid      - Validation failed
429 Too Many     - Rate limited
500 Server Error - Unexpected error
503 Unavailable  - Service temporarily down
```

### Resilience Patterns

#### 1. Database Connection Retries
```typescript
async function queryWithRetry(query, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await prisma.$queryRaw(query);
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

#### 2. External Service Timeouts
```typescript
// Razorpay, SendGrid, Twilio with timeout
const paymentResponse = await Promise.race([
  razorpay.orders.create({...}),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), 5000)
  )
]);

// Fallback if service down
if (error) {
  // Email instead of WhatsApp
  // Log for manual follow-up
  // Continue without blocking member
}
```

#### 3. Circuit Breaker Pattern (Phase 2)
```typescript
// If Razorpay down 5+ times → Circuit Open
// Stop calling Razorpay for 5 minutes
// Return cached response or fallback
```

---

## 8. Security CONSIDERATIONS

### SQL Injection Prevention
```typescript
// ❌ NEVER do this
const query = `SELECT * FROM members WHERE phone = '${phone}'`;

// ✅ ALWAYS use Prisma (automatic parameterization)
const member = await prisma.member.findUnique({
  where: { phone: phone } // Safe!
});
```

### Cross-Tenant Data Leakage Prevention
```typescript
// ❌ NEVER do this
const members = await prisma.member.findMany();
// Returns ALL members from ALL gyms!

// ✅ ALWAYS filter by organization_id
const members = await prisma.member.findMany({
  where: {
    organizationId: userOrgId, // From JWT token
  }
});
```

### Authentication & Authorization
```
Every API Route:
1. Extract JWT token from header
2. Verify token signature & expiry
3. Extract user_id + organization_id
4. Query user record → confirm user exists & org matches
5. Verify user role has permission
6. For resource access → verify resource belongs to org
7. If all checks pass → process request
8. If any check fails → 401/403 response
```

---

## 9. MONITORING & OBSERVABILITY

### Key Metrics to Track

```
Availability:
├── API uptime (target: 99.9%)
├── Database uptime
├── External service health (Razorpay, etc)
└── Member app load time

Performance:
├── API response times (p50, p95, p99)
├── Database query times
├── QR scan success rate
└── File upload speed

Errors:
├── Error rate (% of requests)
├── Error types (500 vs 4xx vs 3rd party)
├── Failed payments
└── Failed email sends

Business:
├── Members created today
├── Payments processed today
├── Attendance check-ins today
├── Churn detected today
└── API requests (by endpoint)
```

### Logging Levels

```
ERROR    - Payment failed, member creation failed, auth error
WARN     - Slow query (>2s), service degradation, retry attempt
INFO     - Member created, payment successful, user login
DEBUG    - API request/response, data values (dev only)
TRACE    - SQL queries, detailed flow (dev only)
```

---

**Document Status:** APPROVED ✅  
**Last Updated:** September 2024  
**System Design Version:** 1.0
