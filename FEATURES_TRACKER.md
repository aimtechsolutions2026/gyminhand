# 📋 FitFlow - Features Tracker

Last Updated: September 2024
Tracking all functional capabilities across modules.

---

## 1. Authentication & Security
| Feature Code | Feature Description | Target Phase | Status | Notes |
|---|---|---|---|---|
| `AUTH-01` | Owner/Staff Email & Password Login | Phase 1 (W2) | 🟢 Complete | NextAuth credentials with bcrypt & JWT session |
| `AUTH-02` | Password Reset & Recovery View | Phase 1 (W2) | 🟢 Complete | `/password-reset` flow |
| `AUTH-03` | Role-Based Access Control (RBAC) | Phase 1 (W2) | 🟢 Complete | `src/middleware.ts` protecting `/owner/*`, `/trainer/*` |
| `AUTH-04` | Member Phone/QR Direct Login | Phase 1 (W2) | 🟢 Complete | `/member-login` and `/api/members/lookup` |
| `AUTH-05` | Multi-Tenant Session Helper | Phase 1 (W3) | 🟢 Complete | `getTenantContext()` in `src/lib/tenant.ts` |

---

## 2. Gym Setup & Multi-Tenancy
| Feature Code | Feature Description | Target Phase | Status | Notes |
|---|---|---|---|---|
| `GYM-01` | Multi-tenant Data Isolation (`organization_id`) | Phase 1 (W1) | 🟢 Complete | Relational schema with cascade deletes & compound indexes |
| `GYM-02` | Owner Shell Layout & Sidebar | Phase 1 (W3) | 🟢 Complete | Desktop sidebar + responsive mobile drawer |
| `GYM-03` | Multi-branch Management | Phase 1 (W3) | 🟢 Complete | `/owner/settings/branches` & `/api/gym/branches` |
| `GYM-04` | Gym Profile & Branding Settings | Phase 1 (W3) | 🟢 Complete | `/owner/settings` & `/api/gym/settings` |
| `GYM-05` | Owner Dashboard KPI Overview | Phase 1 (W3) | 🟢 Complete | Active members, today's visits, MRR, moat spotlight |

---

## 3. Member Management
| Feature Code | Feature Description | Target Phase | Status | Notes |
|---|---|---|---|---|
| `MEM-01` | Member Registration (<2 min wizard) | Phase 1 (W4) | 🟢 Complete | `/owner/members/new` with real-time BMI calculator |
| `MEM-02` | Auto-generated Member ID (`GYM-BRANCH-XXXXXX`) | Phase 1 (W4) | 🟢 Complete | `generateMemberId()` in `src/lib/utils.ts` |
| `MEM-03` | Member Directory (Search, Filters, Status) | Phase 1 (W4) | 🟢 Complete | `/owner/members` with debounced search & status pills |
| `MEM-04` | Member Profile View & Digital QR Pass | Phase 1 (W4) | 🟢 Complete | `/owner/members/[id]` with printable QR card & billing |
| `MEM-05` | Bulk Member CSV Import | Phase 1 (W4) | 🟢 Complete | `/api/members/bulk-import` with validation |
| `MEM-06` | Member Soft Delete / Archive | Phase 1 (W4) | 🟢 Complete | `DELETE /api/members/[id]` setting `isActive: false` |

---

## 4. Attendance & QR Code Engine
| Feature Code | Feature Description | Target Phase | Status | Notes |
|---|---|---|---|---|
| `ATT-01` | Unique Encrypted QR Code Generation | Phase 1 (W5) | 🟢 Complete | Generated on registration and stored in `QRCode` table |
| `ATT-02` | Mobile Camera Scanner Kiosk | Phase 1 (W5) | 🟢 Complete | `/owner/scan` with visual/audio status alerts |
| `ATT-03` | 30-Min Duplicate Scan Guard | Phase 1 (W5) | 🟢 Complete | Checked in `/api/attendance/scan` with force override |
| `ATT-04` | Expired Membership Warning Alert | Phase 1 (W5) | 🟢 Complete | Blocks check-in with overdue days & renewal action |
| `ATT-05` | Attendance Logs & Timeline Feed | Phase 1 (W5) | 🟢 Complete | `/owner/attendance` with peak hours & date stats |

---

## 5. Billing, Plans & Payments
| Feature Code | Feature Description | Target Phase | Status | Notes |
|---|---|---|---|---|
| `BILL-01` | Membership Plans Configuration | Phase 1 (W6) | 🟢 Complete | `/api/plans` with duration days and pricing |
| `BILL-02` | Fee Collection & Auto-Renewal | Phase 1 (W6) | 🟢 Complete | `/api/payments` & `/owner/payments/new` extending expiry |
| `BILL-03` | Official GST-Ready Printable Invoices | Phase 1 (W6) | 🟢 Complete | `/owner/payments/invoice/[id]` with print styles |
| `BILL-04` | Payments Ledger & Month Revenue | Phase 1 (W6) | 🟢 Complete | `/owner/payments` tracking UPI, Cash, and Card |

---

## 6. Member Mobile Web App (PWA)
| Feature Code | Feature Description | Target Phase | Status | Notes |
|---|---|---|---|---|
| `MOB-01` | Mobile App Layout & Bottom Navigation | Phase 1 (W7) | 🟢 Complete | `/member/layout.tsx` with floating center pass button |
| `MOB-02` | Member Home Dashboard | Phase 1 (W7) | 🟢 Complete | `/member/dashboard` with streak and plan countdown |
| `MOB-03` | High-Contrast Digital QR Pass | Phase 1 (W7) | 🟢 Complete | `/member/qr` with brightness guidance |
| `MOB-04` | Personal Visit History | Phase 1 (W7) | 🟢 Complete | `/member/attendance` with streak indicator |

---

## 7. Gamification & Workouts (Phase 1.5)
| Feature Code | Feature Description | Target Phase | Status | Notes |
|---|---|---|---|---|
| `GAME-01` | Attendance Streak Engine | Phase 1.5 (W9) | 🟢 Complete | Tracked across visits & displayed on profile |
| `GAME-02` | Gym-wide Member Leaderboard | Phase 1.5 (W9) | 🟢 Complete | `/owner/leaderboard` with top 3 podium & rankings |
| `TRN-01` | Certified Coach Management | Phase 1.5 (W10) | 🟢 Complete | `/owner/trainers` & `/api/trainers` |
| `TRN-02` | Member Daily Workout Checklist | Phase 1.5 (W10) | 🟢 Complete | `/member/workout` with target muscle groups |
| `TRN-03` | Nutrition & Macro Diet Plan | Phase 1.5 (W11) | 🟢 Complete | `/member/diet` with calories, protein, and meals |

---

## 8. Retention CRM & Churn Moat (Phase 1.5+ FitFlow USP)
| Feature Code | Feature Description | Target Phase | Status | Notes |
|---|---|---|---|---|
| `CRM-01` | Member Churn Risk Scoring Algorithm | Phase 1.5+ (W13) | 🟢 Complete | `/api/crm/risk-scoring` evaluating 0-100 risk score |
| `CRM-02` | Automated Inactivity Detection (7+, 14+, 21+ Days) | Phase 1.5+ (W13) | 🟢 Complete | Automatic task queue generation |
| `CRM-03` | Retention CRM Task Board | Phase 1.5+ (W14) | 🟢 Complete | `/owner/follow-ups` with priority tags |
| `CRM-04` | 1-Click WhatsApp Member Outreach | Phase 1.5+ (W14) | 🟢 Complete | Direct `wa.me` re-engagement templates |

---

## 9. Super Admin Platform & Staff RBAC Management
| Feature Code | Feature Description | Target Phase | Status | Notes |
|---|---|---|---|---|
| `SADM-01` | Superadmin Platform Control Center | Core Admin | 🟢 Complete | `/admin/dashboard` with platform MRR, total gyms, active lifters |
| `SADM-02` | Provision Gym Owner & Tenant Isolation | Core Admin | 🟢 Complete | `/api/admin/gyms` with atomic transaction, default branch & plans |
| `SADM-03` | System Tiers & RBAC Permissions Matrix | Core Admin | 🟢 Complete | `/admin/tiers` defining Starter, Pro, Enterprise & 6-role matrix |
| `RBAC-01` | Gym Owner Staff Directory & Invite | Staff RBAC | 🟢 Complete | `/owner/staff` & `/api/gym/staff` for Manager, Trainer, Reception |
| `RBAC-02` | Role-Adaptive Sidebar Navigation | Staff RBAC | 🟢 Complete | Dynamically tailors links for Owner, Manager, Trainer, Reception |
| `RBAC-03` | Route Protection Middleware & Role Login Redirect | Security | 🟢 Complete | `src/middleware.ts` & `/login` automatic role routing |

---

## 10. Platform Subscriptions, Custom Plans & Multi-Branch Roaming
| Feature Code | Feature Description | Target Phase | Status | Notes |
|---|---|---|---|---|
| `SAAS-01` | Superadmin Gym Active/Deactivate Toggle | SaaS Engine | 🟢 Complete | 1-click gym activation toggle in `/admin/dashboard` & `/api/admin/gyms` |
| `SAAS-02` | Platform Subscription Engine (Free, Silver, Gold, Custom) | SaaS Engine | 🟢 Complete | Set active validity days, expiration dates, and tier badges |
| `SAAS-03` | Subscription Lockout Perimeter (`/gym-suspended`) | SaaS Engine | 🟢 Complete | Restricts all gym staff & members if gym is inactive/expired |
| `PLAN-01` | Gym Owner Membership Plan Manager | Owner Portal | 🟢 Complete | Dedicated `/owner/plans` CRUD & toggle without code changes |
| `MEM-07` | Custom Pricing & Custom Duration for Members | Member Billing | 🟢 Complete | Enrolment & renewal with custom amount and days/months |
| `CARD-01` | Digital Gym Membership Card & Roaming Pass | Member App | 🟢 Complete | Glassmorphic pass at `/member/card` with QR & live countdown |
| `ROAM-01` | Cross-Branch Roaming Attendance Engine | Multi-Branch | 🟢 Complete | Members visit any sister branch; scanner records roaming visit |


