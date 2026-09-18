# 📚 GYM SAAS - COMPLETE FEATURE LIST

---

## 1. AUTHENTICATION & AUTHORIZATION

### 1.1 Owner/Manager Login
```
Feature: Email + Password Login
├── Email verification
├── Password reset via email
├── Remember me (optional)
├── 2FA for admins (Phase 2)
└── Account lockout (5 attempts)
```

**Acceptance Criteria:**
- ✅ Login with correct email/password succeeds
- ✅ Wrong password shows error 3x, then locks for 5 mins
- ✅ Password reset email sent successfully
- ✅ Session expires after 24 hours inactivity
- ✅ Token refresh works seamlessly

### 1.2 Member Login
```
Feature: Mobile QR + Code Login
├── Option 1: QR scan (phone camera)
├── Option 2: Member ID + Phone number
├── Fingerprint/Face ID (Phase 2)
└── No password needed
```

**Acceptance Criteria:**
- ✅ Member can login with QR code
- ✅ Member can login with ID + phone
- ✅ Session persists on phone
- ✅ Auto-logout after 30 days inactivity

### 1.3 Role-Based Access Control (RBAC)
```
Roles:
├── Super Admin
│   ├── Manage all gyms
│   ├── Billing/SaaS
│   └── System settings
├── Gym Owner
│   ├── Full gym access
│   ├── Billing
│   └── Staff management
├── Manager
│   ├── Member operations
│   ├── Attendance
│   └── Payment processing
├── Trainer
│   ├── My assigned members
│   ├── Workout/Diet plans
│   └── Progress tracking
├── Reception
│   ├── Member check-in
│   ├── New member registration
│   └── Payment recording
└── Member
    ├── Personal dashboard
    ├── Workout/Diet view
    └── QR for check-in
```

---

## 2. GYM ONBOARDING & SETUP

### 2.1 Owner Signup
```
Step 1: Account Creation
├── Email (with verification)
├── Name
├── Phone
├── Password (8+ chars, 1 uppercase, 1 number)
└── Terms acceptance

Step 2: Gym Information
├── Gym name
├── Logo upload
├── Address
├── Phone
├── GST number (optional)
├── Opening hours
└── Gym type (commercial, private, etc)

Step 3: Branch Setup (First)
├── Branch name
├── Address
├── Capacity
└── Opening hours

Step 4: Payment Setup (later for trial)
└── Plan selection
```

**UI Flow:**
```
Welcome → Email Verify → Gym Details → Branch → Dashboard
```

### 2.2 Gym Profile Management
```
Features:
├── Edit gym details
├── Upload logo
├── Update opening hours
├── Add multiple branches
├── Manage staff
├── Email templates
└── SMS/WhatsApp settings
```

### 2.3 Branch Management
```
Create Branch:
├── Branch name
├── Address
├── City
├── Capacity
├── Opening hours
├── Assigned manager
└── QR gates setup

Edit Branch:
├── All above fields
└── Member transfer between branches

Delete Branch:
├── Archive (keep data)
└── Permanent delete (with warning)
```

---

## 3. MEMBER MANAGEMENT

### 3.1 Member Registration
```
Receptionist/Manager View:

Form Fields:
├── Personal Info
│   ├── Full name (Required)
│   ├── Email (Optional)
│   ├── Phone (Required, Unique)
│   ├── Date of Birth
│   ├── Gender
│   ├── Address
│   ├── Profile photo
│   └── ID proof upload
├── Fitness Info
│   ├── Height (cm)
│   ├── Weight (kg)
│   ├── BMI (auto-calculate)
│   ├── Fitness goal
│   ├── Fitness level
│   └── Medical notes
├── Membership
│   ├── Plan selection
│   ├── Start date
│   ├── Duration
│   ├── Price
│   ├── Discount
│   └── Payment method
└── Emergency Contact
    ├── Name
    ├── Phone
    └── Relation
```

**Acceptance Criteria:**
- ✅ Can create member in <2 minutes
- ✅ Phone number unique per branch
- ✅ Auto-generate unique member ID (GYM-BRANCH-000001)
- ✅ Confirmation email sent
- ✅ Photo auto-optimized for mobile
- ✅ Form validations work offline-first

### 3.2 Member Profile
```
Member View:
├── Personal info display
├── Photo
├── Membership status
├── Renewal date
└── Download ID card

Owner/Manager View (Add):
├── Edit member details
├── Change membership
├── Freeze/unfreeze
├── Transfer to branch
├── View attendance
├── View trainer notes
└── Delete member (soft)
```

### 3.3 Bulk Member Import
```
Feature: CSV Upload
├── Supported format: .csv
├── Columns: Name, Phone, Email, Goal
├── Validation on upload
├── Dry-run preview
├── Batch import
└── Error report
```

**File Format:**
```csv
name,phone,email,fitness_goal,fitness_level
Rahul,9876543210,rahul@email.com,weight_loss,beginner
Aman,9876543211,aman@email.com,muscle_gain,intermediate
```

### 3.4 Member Directory
```
Features:
├── List view with filters
├── Search by name/phone
├── Filter by:
│   ├── Membership status
│   ├── Enrollment date
│   ├── Trainer assignment
│   └── Risk level
├── Sort options
├── Pagination (50/100 per page)
└── Export to CSV
```

---

## 4. ATTENDANCE & QR SYSTEM

### 4.1 QR Code Generation
```
For Each Member:
├── Unique QR code generated
├── Token-based (encrypted)
├── Portable (print or mobile)
├── No sensitive data in QR
└── Regenerate if compromised

Display Options:
├── On member profile
├── Print as ID card
├── In member app
└── In email
```

### 4.2 QR Scanner (Mobile-First)
```
Reception/Manager Mobile:

Features:
├── Camera access (ask permission)
├── QR scanning
├── Barcode fallback
├── Offline mode (local cache)
├── Attendance recorded locally
├── Auto-sync when online
├── Haptic feedback on success
└── Sound notification
```

**Offline Flow:**
```
No Internet:
├── Scan QR → Store locally
├── Continue scanning 
├── When online → Sync all
└── Show sync status
```

### 4.3 Manual Attendance
```
Features:
├── Search member by name/phone
├── Mark present/absent
├── Add notes
├── Bulk mark (all members present)
└── Retroactive marking (past 2 days)
```

### 4.4 Attendance Record
```
Fields:
├── Member ID
├── Date
├── Entry time (auto)
├── Exit time (manual or biometric)
├── Duration (auto-calculate)
├── Method (QR, Biometric, Manual)
├── Branch
├── Gate/Location
└── Notes
```

### 4.5 Attendance History
```
Member App View:
├── Current month calendar
├── Green checkmarks for attended days
├── Stats:
│   ├── Attendance count this month
│   ├── Current streak
│   ├── Longest streak
│   └── Average visits/week
└── Previous months view

Owner/Manager View (Add):
├── Daily attendance summary
├── Peak hours graph
├── Member-wise attendance
├── Export report (PDF)
└── Trends/analytics
```

---

## 5. MEMBERSHIP & BILLING

### 5.1 Membership Plans
```
Owner Setup:

Plan Fields:
├── Plan name
├── Type (Monthly/Quarterly/Yearly/PT)
├── Duration (days)
├── Price (₹)
├── Access (all branches or specific)
├── Freeze allowed (Yes/No)
├── Transfer allowed (Yes/No)
├── PT sessions included (if any)
├── Description
└── Is Active (toggle)

Predefined Templates:
├── Monthly (₹1500)
├── Quarterly (₹4000)
├── Half-Yearly (₹7000)
├── Yearly (₹12000)
├── 3-Month PT (₹15000)
└── Couple (₹22000)
```

### 5.2 Member Subscription
```
When Member Joins:
├── Auto-create subscription
├── Link to plan
├── Set start date
├── Calculate expiry
├── Auto-calculate expiry date
└── Create payment record

Renewal:
├── Auto-detect expiry (7 days before)
├── Send WhatsApp/Email reminder
├── Member can renew from app
├── Payment processing
└── Auto-extend membership

Freezing:
├── Pause membership for 30 days
├── Extends expiry accordingly
├── Member can self-serve freeze
└── Manager approval optional
```

### 5.3 Payment Recording
```
Phase 1 (Manual Entry):
├── Select member
├── Select plan
├── Enter amount paid
├── Select payment method
├── Add notes
├── Generate invoice
└── Send receipt

Phase 1.5+ (Razorpay Integration):
├── Online payment link
├── UPI QR code
├── Card payment
├── Webhook handling
└── Auto-reconciliation
```

### 5.4 Payment Methods
```
Supported:
├── Cash (physical collection)
├── UPI (QR/Link)
├── Card (Debit/Credit)
├── Bank Transfer
├── Wallet (PhonePe, Google Pay)
├── BNPL (Phase 2)
└── Postpaid credit (Phase 2)

For Each Payment:
├── Payment ID/Reference
├── Amount
├── Status (Pending/Paid/Partial)
├── Payment date
├── Remarks
└── Receipt PDF
```

### 5.5 Invoices
```
Auto-generated:
├── Invoice number (auto-increment)
├── Invoice date
├── Member details
├── Plan details
├── Amount breakdown
├── Paid/Pending status
└── Payment history

Features:
├── Send via email
├── Send via WhatsApp
├── Print to PDF
├── Generate bulk reports
└── Track payment status
```

### 5.6 Payment Dashboard
```
Owner View:
├── Today's collection (₹)
├── Weekly collection
├── Monthly collection
├── Pending payments (amount + count)
├── Payment method breakdown
├── Overdue tracking
└── Cash vs Online split

Filters:
├── Date range
├── Payment status
├── Payment method
└── Member name
```

### 5.7 Membership Expiry Management
```
Auto-Detection:
├── Expiring in 7 days → Yellow alert
├── Expiring in 3 days → Orange alert
├── Expiring tomorrow → Red alert
├── Expired → Show as expired

Actions:
├── Auto-send WhatsApp reminder
├── Send email reminder
├── Manual follow-up task
├── Renewal offer
└── Track conversion
```

---

## 6. GAMIFICATION & ENGAGEMENT

### 6.1 Streak System
```
Member App Display:
├── 🔥 12 Day Streak
├── Fire emoji (if streak active)
├── Current streak count
├── Longest streak achievement
├── Reset on missed day

Calculation:
├── Based on daily attendance
├── Consecutive days visited
└── Resets if 1+ day missed

Rewards:
├── Email on milestone (7, 30, 50, 100 days)
├── Badge unlock
└── Optional: Discount on renewal
```

### 6.2 Badge System
```
Badge Types:
├── 🎉 First Workout
├── 🔥 7-Day Streak
├── 💪 30-Day Streak
├── 🏆 100 Visits
├── 🌅 Early Bird (5+ visits at 6 AM)
├── ⚡ Consistency (visited every week)
├── 📈 Personal Best (weight loss milestone)
└── 🎯 Goal Achieved

Features:
├── Auto-unlock when criteria met
├── Display on profile
├── Share on social (Phase 2)
└── Notification when earned
```

### 6.3 Leaderboard
```
By Branch:

Display:
├── Rank 1-10 (top visitors)
├── Member name
├── Photo (small)
├── Visits this month
├── Current streak

Filters:
├── This week
├── This month
├── All time
├── By gender
└── By fitness level

Refresh: Daily at midnight

Privacy:
├── Show only if opted in
└── Hide phone numbers
```

### 6.4 Challenges
```
Gym Owner Can Create:

Challenge Types:
├── 30-Day Challenge (20 visits)
├── Weight Loss Challenge (track weight)
├── Strength Challenge (track lifts)
├── Consistency Challenge (no missed days)
└── Custom challenge (any metric)

Fields:
├── Challenge name
├── Description
├── Duration (start/end date)
├── Goal
├── Leaderboard visible (Yes/No)
├── Reward (badge, discount, etc)
└── Is Active

Member View:
├── Challenge list
├── Join button
├── Track progress
├── See leaderboard
└── Get notified on rank change
```

### 6.5 Rewards System
```
Future (Phase 2):

Points:
├── 10 points per visit
├── 5 bonus points per friend referral
├── 100 points = 1 day free

Redemption:
├── Free day membership
├── PT session
├── Merchandise
└── Discount on next plan

Display:
├── Points balance in app
├── Redemption history
└── Available rewards list
```

---

## 7. TRAINER MANAGEMENT

### 7.1 Trainer Profile
```
Owner/Manager Creates:

Fields:
├── Name
├── Email
├── Phone
├── Photo
├── Specialization (Cardio, Strength, etc)
├── Certification (optional)
├── Years of experience
├── Bio
├── Rate per PT session (optional)
├── Status (Active/Inactive)
└── Assigned branch

View:
├── List of trainers
├── Member assignments
├── Workout plans created
├── Performance metrics
└── Member reviews (Phase 2)
```

### 7.2 Trainer-Member Assignment
```
Features:
├── Assign members to trainer
├── Bulk assignment
├── Assignment date range
├── Assignment status
└── Remove assignment

Trainer View:
├── My assigned members (count)
├── Member list with:
│   ├── Photo
│   ├── Fitness goal
│   ├── Current weight
│   └── Last visit
└── Quick access to plans
```

### 7.3 Trainer Dashboard
```
Quick Stats:
├── My Members (count)
├── Today's Sessions (count)
├── Pending Workouts (count)
├── Pending Diets (count)
└── Member check-ins today

Features:
├── See today's workout plans
├── See today's diet plans
├── Member progress tracking
├── Measurement history
├── Notes on members
├── Follow-up tasks
└── Quick messaging (Phase 2)
```

---

## 8. WORKOUT MANAGEMENT

### 8.1 Exercise Library
```
Pre-built Database:
├── 500+ exercises
├── Each with:
│   ├── Name
│   ├── Category (Chest, Back, etc)
│   ├── Muscle groups
│   ├── Equipment needed
│   ├── Difficulty level
│   ├── Video link (optional)
│   ├── Image
│   └── Instructions
└── Searchable by name/category

Trainer Can:
├── Browse library
├── Add custom exercises
├── Edit exercise details
└── Delete custom exercises
```

### 8.2 Workout Plan Creation
```
Trainer Creates Plan:

Fields:
├── Plan name
├── Member selection
├── Start date
├── Duration (days/weeks)
├── Frequency (3x/week, etc)
├── Description

Exercise Selection:
├── Add exercises to plan
├── Set sets/reps/weight
├── Set rest time
├── Add notes per exercise
├── Reorder exercises
└── Save as template

Edit/Delete:
├── Can edit until member starts
├── Archive (don't delete)
└── Duplicate for other members
```

### 8.3 Member Workout View
```
Member App Display:

Today's Workout:
├── Workout name (e.g., "Chest Day")
├── Exercise 1
│   ├── Name + image
│   ├── Sets: 3
│   ├── Reps: 12
│   ├── Weight: 20kg
│   ├── Rest: 60s
│   └── Video link
├── Exercise 2
│   └── ... similar
└── Mark as complete

Completion:
├── Swipe to mark done
├── Track all completed exercises
├── Show in stats
└── Notify trainer
```

### 8.4 Workout Progress Tracking
```
Trainer Can See:
├── Completion status (Completed/Pending/Skipped)
├── When member completed
├── Which exercises done
├── Notes from member
└── Modification history

Member Can Track:
├── Workouts completed this week
├── Workouts missed
├── Stats over time
└── Personal records (PRs)
```

---

## 9. DIET PLAN MANAGEMENT

### 9.1 Diet Plan Creation
```
Trainer Creates:

Fields:
├── Plan name
├── Member
├── Start/End date
├── Target calories (optional)
├── Target protein (grams)
├── Target carbs (grams)
├── Target fats (grams)

Add Meals:
├── Meal time (06:30, 08:30, etc)
├── Meal name (Pre-Workout, Breakfast, etc)
├── Food items (can add multiple)
├── Auto-calculate macros
└── Save as template
```

### 9.2 Member Diet View
```
Member App:

Today's Diet:
├── Pre-Workout (06:30)
│   ├── Banana
│   ├── Coffee
│   └── Macros: P 2g, C 27g, F 0g
├── Breakfast (08:30)
│   ├── Eggs (3)
│   ├── Oats (50g)
│   └── Macros: P 25g, C 35g, F 18g
└── ... other meals

Daily Totals:
├── Total Protein: 120g (Target: 150g)
├── Total Carbs: 200g
├── Total Fats: 65g
└── Total Calories: 1850

Actions:
├── Mark meal as done
├── Skip meal
├── Log custom food
└── Add notes
```

### 9.3 Nutrition Database
```
Food Items Database:

Each Item:
├── Name
├── Quantity (100g, 1 egg, etc)
├── Protein (g)
├── Carbs (g)
├── Fats (g)
├── Calories
├── Category (Protein, Carbs, etc)
└── Indian foods focus

Search:
├── By name
├── By category
├── Favorites
└── Recent items
```

### 9.4 Diet Progress Tracking
```
Trainer View:
├── Completion rate (meals completed %)
├── Adherence score
├── Member notes
├── Modifications
└── Effectiveness metrics

Member View:
├── Weekly adherence
├── Meals completed
├── Consistency
└── Trend over time
```

---

## 10. MEMBER VISIBILITY & CRM (YOUR USP)

### 10.1 Member Risk Score
```
Automatic Calculation:

Algorithm Factors:
├── Attendance trend (weight: 40%)
│   ├── Average visits/week
│   ├── Days since last visit
│   └── Trend (increasing/decreasing)
├── Payment status (weight: 30%)
│   ├── On-time payments
│   ├── Overdue count
│   └── Payment consistency
├── Engagement (weight: 20%)
│   ├── Workout plan completion
│   ├── Diet plan adherence
│   └── App usage
└── Trainer interaction (weight: 10%)
    ├── Has trainer assigned
    └── Trainer engagement

Risk Levels:
├── 🟢 GREEN (80-100) - Active, healthy
├── 🟡 YELLOW (50-79) - At risk, follow-up needed
└── 🔴 RED (0-49) - Churned or about to churn

Reason Examples:
├── "No visits for 8 days (avg 4/week)"
├── "Payment overdue by 5 days"
├── "Missing 4 workout sessions"
└── "Combined factors causing decline"
```

### 10.2 Member Visibility Dashboard
```
Owner/Manager View:

Quick Filters:
├── By risk level (Green/Yellow/Red)
├── By branch
├── By membership status
├── Expiring soon
└── No trainer assigned

Member Cards:
├── Photo + Name
├── Last visit (days ago)
├── Risk level + score
├── Reason for risk (if yellow/red)
├── Membership expiry
├── Trainer assigned (if any)
├── Action button (Follow-up/Assign/Message)

Stats:
├── Total members
├── At-risk count
├── Churned this month
├── New members
└── Expiring this week
```

### 10.3 Follow-up Task Management
```
Create Follow-up:

Task Types:
├── Manual follow-up (custom)
├── Membership renewal reminder
├── Inactive member check-in
├── Trainer assignment needed
├── Payment overdue reminder
├── Diet plan review
└── Measurement update

Fields:
├── Task name
├── Description
├── Assign to (Manager/Trainer)
├── Due date
├── Priority (Low/Medium/High)
├── Member linked
└── Status (Pending/Done)

Task Tracking:
├── List of pending tasks
├── Overdue tasks (red flag)
├── Completed tasks
├── Filter by assignee
└── Filter by status

Completion:
├── Mark as done
├── Add notes
├── Log outcome
└── Reassign if needed
```

### 10.4 Inactive Member Detection
```
Automatic Detection:

Triggers:
├── No visit for 7 days (avg user)
├── No visit for 14 days (all users)
├── Payment overdue
├── Workout not done in 7 days
└── Multiple factors combined

Actions:
├── Auto-create follow-up task
├── Assign to manager/trainer
├── Send alert to owner
├── Suggest action (WhatsApp, Call, PT session)
└── Track if member comes back

Metrics:
├── How many inactive members this month
├── Reactivation rate (came back %)
├── Time to reactivation
└── Churn rate (didn't come back)
```

### 10.5 CRM Actions
```
Available Actions:

From Member Card:
├── Send WhatsApp message (template)
├── Send email
├── Create follow-up task
├── Assign trainer
├── Call member (log call)
├── Update membership
├── Add note
└── Schedule follow-up date

Automation:
├── Auto-send WhatsApp at specific time
├── Auto-create tasks (if condition met)
├── Auto-assign trainer (based on rules)
└── Auto-extend membership (if payment received)
```

---

## 11. OWNER DASHBOARD & ANALYTICS

### 11.1 Owner Dashboard Overview
```
Quick Stats Cards:
├── 📊 Total Members: 1,234
├── 💰 This Month Revenue: ₹2,34,000
├── 🚪 Today's Check-ins: 187
├── ⏰ Peak Hour: 7 PM (312 members)

Key Metrics:
├── Active Members: 1,050 (85%)
├── At-Risk Members: 120 (10%)
├── Expiring This Week: 45
├── Pending Payments: ₹84,500

Graphs:
├── Attendance Trend (last 30 days)
├── Revenue Trend (last 30 days)
├── Membership Expiry Timeline
└── Peak Hours Heatmap
```

### 11.2 Attendance Analytics
```
Daily Stats:
├── Expected members (active subscriptions)
├── Checked in count
├── Check-in rate (%)
├── Currently inside (estimate)
├── Peak hours timeline

Insights:
├── Busiest day of week
├── Busiest hour of day
├── Member attendance patterns
├── Growth/decline trend
└── Comparison with previous month

Export:
├── Daily report (PDF)
├── Member attendance list (CSV)
└── Peak hours chart
```

### 11.3 Revenue Dashboard
```
Collection Tracking:
├── Today's collection: ₹X
├── This month: ₹X
├── This year: ₹X
├── Pending: ₹X
├── Overdue: ₹X

Breakdown:
├── By payment method (Cash/UPI/Card)
├── By membership plan
├── By branch (if multi-branch)
└── By member (top spenders)

Payment Status:
├── Paid: X members
├── Partial: X members
├── Pending: X members
└── Overdue: X members

Forecasts:
├── Expected revenue (renewals)
├── Churn impact (lost revenue)
└── Net MRR projection
```

### 11.4 Member Analytics
```
Growth:
├── New members this month
├── New members trend (last 6 months)
├── Churn rate (this month %)
├── Retention rate (%)
├── Net growth

Segmentation:
├── By fitness goal
├── By membership plan
├── By enrollment age (new/6mo/1yr+)
├── By trainer (if assigned)
└── By engagement level

Insights:
├── Which plan has best retention
├── Time to churn (avg)
├── Member lifetime value
└── Most valuable members
```

### 11.5 Trainer Analytics
```
Per Trainer:
├── Assigned members (count)
├── Member retention rate
├── Workout plans created
├── Diet plans created
├── Member engagement (average)
└── Rating (Phase 2)

Performance:
├── Most effective trainer (by retention)
├── Busiest trainer (sessions/week)
├── Highest rated trainer
└── Revenue per trainer (PT sessions)
```

### 11.6 Custom Reports
```
Available Reports:
├── Member attendance (date range, branch)
├── Revenue report (date range, method)
├── Membership expiry (next 7/30/90 days)
├── Trainer performance report
├── Churn analysis
└── Growth metrics

Export:
├── PDF download
├── CSV export
├── Email delivery
└── Schedule weekly/monthly
```

---

## 12. NOTIFICATIONS & COMMUNICATION

### 12.1 Email System
```
Automated Emails:

New Member:
├── Welcome email
├── Account setup instructions
├── Payment receipt

Membership:
├── Renewal reminder (7 days before)
├── Renewal reminder (3 days before)
├── Renewed confirmation
├── Expiry notification

Payment:
├── Payment receipt
├── Overdue payment reminder
└── Invoice download link

Trainer:
├── New member assigned
├── Workout plan created
├── Diet plan created
└── Member progress report

Admin:
├── Daily summary
├── Weekly performance report
├── Critical alerts
└── System notifications
```

### 12.2 WhatsApp Integration
```
Template Messages:

New Member:
> "Welcome to FitZone Gym! 🎉 Your account is ready. Download app & login with your phone number. Let's start your fitness journey!"

Membership Expiring:
> "Hey Rahul! Your membership expires in 3 days. Renew now to continue your fitness journey 💪"

Payment:
> "Payment received! ₹2,999 for Monthly Plan. Valid till 31-Oct-2024. Thank you!"

Inactive:
> "Rahul, we haven't seen you for 8 days 😢 Join us back! Reply YES to schedule a session with Trainer"

Birthday:
> "Happy Birthday Rahul 🎂 Get 10% discount on renewal! Use code BDAY10"

Churn Prevention:
> "Rahul, let's get back on track! Your trainer has assigned a new workout plan 💪"
```

### 12.3 SMS (Phase 2)
```
For members without WhatsApp:
├── OTP delivery
├── Membership renewal reminders
├── Payment confirmations
└── Quick alerts
```

### 12.4 In-App Notifications
```
Member Notifications:
├── Workout assigned
├── Diet plan shared
├── Streak achievement
├── Badge unlocked
├── Leaderboard rank change
└── Trainer message (Phase 2)

Owner/Manager Notifications:
├── Member joined
├── Payment received
├── Member overdue
├── Inactive detection
├── Expiry reminder
└── System alerts
```

---

## 13. MEMBER APP (MOBILE-FIRST)

### 13.1 Member Homepage
```
Display:
├── Greeting (Good Morning/Afternoon/Evening)
├── Member name
├── 🔥 Streak counter (prominent)
├── Today's attendance status
├── Membership countdown (days left)
├── Quick action buttons:
│   ├── Show QR (to scan at entry)
│   ├── View Workout
│   ├── View Diet
│   └── Call Trainer

Navigation:
├── Home
├── Attendance
├── Workout
├── Diet
├── Profile
└── More (Leaderboard, Badges, etc)
```

### 13.2 Member Attendance View
```
Display:
├── Current month calendar
├── Checked-in days: ✓ (green)
├── Missed days: - (gray)
├── Stats:
│   ├── Current streak
│   ├── Longest streak
│   ├── Total visits
│   └── Average visits/week
└── Previous months: swipe to see

Actions:
├── See past attendance
└── Contact trainer (if issue)
```

### 13.3 Member Workout View
```
Today's Workout:
├── Workout name
├── Trainer name
├── Start time
├── Exercise list:
│   ├── Exercise name + image
│   ├── Sets x Reps
│   ├── Weight
│   ├── Video link
│   └── Rest timer
├── Mark exercise done (swipe)
└── Completed count (3/8 exercises)

Features:
├── Video play from app
├── Audio timer for rest
├── Voice coaching (Phase 2)
└── Share workout with friend (Phase 2)
```

### 13.4 Member Diet View
```
Today's Diet:
├── Meal time + name
├── Food items listed
├── Macros per meal
├── Total macros (daily target)
├── Progress bars:
│   ├── Protein (120/150g)
│   ├── Carbs (200/250g)
│   └── Fats (65/70g)
├── Calories remaining

Actions:
├── Mark meal done
├── Log custom food
├── See meal details
└── Contact trainer with questions
```

### 13.5 Member Profile
```
Display:
├── Photo
├── Name + Phone
├── Fitness goal
├── Membership status
├── Renewal date
├── Trainer name (if assigned)
├── Achievements (badges)

Actions:
├── Edit photo
├── Edit fitness goal
├── View membership details
├── Renew membership
├── Contact support
└── Logout
```

---

## 14. FREE PLAN vs PAID PLANS

### 14.1 Feature Comparison

| Feature | Free | Starter | Pro | Enterprise |
|---------|------|---------|-----|-----------|
| Members | 30 | 500 | 5,000 | Unlimited |
| Branches | 1 | 1 | 5 | Unlimited |
| QR Attendance | ✅ | ✅ | ✅ | ✅ |
| Gamification | ❌ | ✅ | ✅ | ✅ |
| Trainer Management | ❌ | ❌ | ✅ | ✅ |
| CRM/Follow-ups | ❌ | ❌ | ✅ | ✅ |
| Analytics | Basic | Basic | Advanced | Advanced |
| WhatsApp Automation | ❌ | Limited | Yes | Yes |
| Biometric | ❌ | ❌ | ❌ | ✅ |
| White Label | ❌ | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ❌ | ✅ |
| Priority Support | ❌ | Email | Email+Chat | Dedicated |

---

## 15. FUTURE PHASE FEATURES

### Phase 2
- [ ] Biometric integration (fingerprint, face)
- [ ] Advanced AI insights
- [ ] Trainer marketplace
- [ ] Member social feed
- [ ] Video workout library
- [ ] Virtual classes integration
- [ ] 2FA authentication
- [ ] Member referral rewards
- [ ] Mobile app (iOS + Android)

### Phase 3
- [ ] White-label solution
- [ ] Enterprise SSO
- [ ] Advanced multi-location analytics
- [ ] Franchise management
- [ ] Member reviews & ratings
- [ ] Equipment booking system
- [ ] Staff performance metrics
- [ ] Advanced CRM with email automation
- [ ] Integration marketplace

### Phase 4
- [ ] AI fitness coach
- [ ] Predictive analytics
- [ ] Insurance integration
- [ ] Corporate wellness programs
- [ ] International expansion
- [ ] Wearable device integration
- [ ] Smart contract for commitments
- [ ] NFT achievements (gamification 2.0)

---

## END OF FEATURES DOCUMENT

**Version:** 1.0  
**Last Updated:** September 2024  
**Next Review:** October 2024
