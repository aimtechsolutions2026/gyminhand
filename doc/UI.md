# 🎨 GYM SAAS - UI/UX DESIGN GUIDE

---

## 1. DESIGN PHILOSOPHY

### Principles
1. **Simplicity** - No complex menus or nested navigation
2. **Mobile-First** - Design for phone, then scale to desktop
3. **India-Friendly** - Clear, accessible, uses local language support
4. **Engagement** - Visual feedback, gamification elements prominent
5. **Data-Driven** - Show numbers/stats prominently
6. **Accessibility** - WCAG AA compliant, readable fonts

### Design System
```
Color Palette:     Primary (Blue) + Accent (Green) + Neutrals
Typography:       2-3 font sizes max
Spacing:          8px grid system
Components:       Reusable, consistent
Animations:       Subtle, purposeful (no bloat)
```

---

## 2. COLOR PALETTE

### Primary Colors
```
Primary Blue:     #0066FF (Main CTA, headers)
Success Green:    #22C55E (Active, success, streak)
Warning Orange:   #F59E0B (Caution, expiring)
Danger Red:       #EF4444 (Error, overdue)
Neutral Gray:     #6B7280 (Secondary text)
Background:       #FFFFFF (Main) / #F9FAFB (Secondary)
```

### Usage
```
🔵 Blue
├── Primary button
├── Links
├── Primary navigation
└── Highlights

🟢 Green
├── Streak counter 🔥
├── Success messages
├── "Active" status
└── Badges

🟠 Orange
├── "At Risk" members
├── Expiring soon
└── Pending actions

🔴 Red
├── Errors
├── Overdue payments
├── "Churned" members
└── Dangerous actions (delete)

⚫ Gray
├── Secondary text
├── Borders
├── Disabled state
└── Subtle info
```

### Dark Mode (Phase 2)
```
Background:   #1F2937
Text:         #F9FAFB
Card:         #374151
Primary:      #3B82F6
```

---

## 3. TYPOGRAPHY

### Font Family
```
Headings:     System default (San Francisco, Roboto, Segoe)
Body:         System default
Monospace:    Monaco, Menlo, Courier New (for codes)
```

### Font Scale
```
H1 (Hero):    32px / 700 weight / Line-height 1.2
H2 (Section): 24px / 600 weight / Line-height 1.3
H3 (Card):    18px / 600 weight / Line-height 1.4
Body Large:   16px / 400 weight / Line-height 1.5
Body Normal:  14px / 400 weight / Line-height 1.5
Small:        12px / 400 weight / Line-height 1.4
Tiny:         10px / 400 weight / Line-height 1.3
```

### Usage Examples
```
H1: "Welcome to FitFlow" (landing page)
H2: "Member Dashboard" (page title)
H3: "Today's Workout" (card title)
Body: "Your membership expires in 3 days"
Small: "Last visit: 8 days ago"
Tiny: "Updated 2 hours ago"
```

---

## 4. COMPONENT LIBRARY

### 4.1 Buttons

#### Primary Button
```
Background:   #0066FF
Text Color:   White
Padding:      12px 24px
Border Radius: 8px
Font Weight:  600
Hover:        #0052CC (darker blue)
Active:       #003A99 (even darker)
Disabled:     #D1D5DB (gray), cursor not-allowed

Usage:
└── Main call-to-action (Login, Submit, Renew)
```

#### Secondary Button
```
Background:   #F3F4F6 (light gray)
Text Color:   #111827 (dark gray)
Border:       1px #E5E7EB
Similar padding as primary
Hover:        #E5E7EB (darker background)

Usage:
└── Secondary actions (Cancel, Back, Skip)
```

#### Icon Button
```
Background:   Transparent
Icon:         24x24px
Hover:        #F3F4F6 (light background circle)
Border Radius: 50% (for hover effect)

Usage:
└── Navigation, close, menu triggers
```

#### Danger Button (Red)
```
Background:   #EF4444
Text:         White
Used for:     Delete, refund, cancel membership

Usage:
└── Destructive actions with confirmation
```

### 4.2 Input Fields

#### Text Input
```
Border:           1px #D1D5DB
Border Radius:    6px
Padding:          10px 12px
Font Size:        14px
Focus Border:     2px #0066FF
Placeholder:      #9CA3AF (light gray)
Background:       #FFFFFF

States:
├── Default: light gray border
├── Focus: blue border
├── Filled: dark gray text
├── Disabled: #F3F4F6 bg, grayed out
├── Error: red border, error message below
└── Success: green border
```

#### Validation Messages
```
Error:    Red (#EF4444) text below input
Success:  Green (#22C55E) text below input
Hint:     Gray (#6B7280) text below input
Position: 4px below input field
```

#### Text Area
```
Similar to text input
Height: min 100px
Resize handle in bottom-right
Max-height: 400px
```

### 4.3 Select/Dropdown

```
Appearance: Similar to text input
Dropdown icon (chevron) on right
Options list with hover highlight
Selected option: blue background
Current value shown in field
```

### 4.4 Checkbox & Radio

#### Checkbox
```
Size:         18x18px
Unchecked:    border #D1D5DB, empty white bg
Checked:      blue bg, white checkmark
Disabled:     grayed out
Label:        to the right, clickable
```

#### Radio
```
Size:         18x18px (outer), 10x10px (inner dot)
Similar states as checkbox
Label:        to the right, clickable
```

### 4.5 Cards

#### Standard Card
```
Background:       White
Border:           1px #E5E7EB
Border Radius:    12px
Padding:          16px
Box Shadow:       0 1px 3px rgba(0,0,0,0.1)
Hover:            0 4px 6px rgba(0,0,0,0.1) (slight lift)

Usage:
├── Dashboard metrics
├── Member cards
├── Plan cards
└── Team member cards
```

#### Metric Card
```
Layout:
├── Icon (48x48px, colored background)
├── Label (small gray text)
├── Number (large blue text)
└── Trend arrow (if applicable)

Example:
  📊 Total Members
  1,234
  ↑ +12% this month
```

#### Alert Card
```
Colored left border (4px)
Padding: 12px 16px
Border Radius: 8px

Types:
├── 🟢 Success: green border, #D1FAC4 bg
├── 🔵 Info: blue border, #DBEAFE bg
├── 🟠 Warning: orange border, #FEF3C7 bg
└── 🔴 Error: red border, #FEE2E2 bg

Text: Bold title + optional description
Close button: on right
```

### 4.6 Tables

#### Table Header
```
Background:   #F9FAFB (light gray)
Text:         #374151 (dark gray)
Font Weight:  600
Border-bottom: 1px #E5E7EB
Padding:      12px
```

#### Table Row
```
Padding:      12px
Border-bottom: 1px #F3F4F6 (lighter)
Hover:        #F9FAFB (highlight row)
```

#### Actions
```
Icons in last column
Hover to show (Edit, Delete, View)
Confirmation modal on delete
```

### 4.7 Badge

#### Status Badge
```
Font Size:    12px
Padding:      4px 8px
Border Radius: 4px
Font Weight:  500

Colors:
├── Green: Active/Success
├── Gray: Inactive/Default
├── Orange: Warning/Pending
├── Red: Error/Expired
└── Blue: Info/Pending

Examples:
├── Active
├── Expired
├── At Risk
└── On Track
```

### 4.8 Avatar

```
Size Options: 32px, 48px, 64px
Border Radius: 50% (circle)
Background: Light blue if no image
Text: User initials (white, bold)
Border: Optional 2px white border

Hover: Show tooltip with full name
Click: Open user profile
```

### 4.9 Loading States

#### Spinner
```
Size:        24px or 48px
Color:       Primary blue
Animation:   Spin 1 second, linear, infinite
Background:  Optional light gray circle
```

#### Skeleton
```
Background:   #E5E7EB
Border Radius: 4px
Height:       Match content height
Animation:    Pulse (opacity 0.5 → 1, 1.5s)

Used for:     Cards loading, tables loading
```

#### Progress Bar
```
Height:     6px
Background: #E5E7EB
Progress:   #0066FF
Border Radius: 3px
Smooth animation: ease-out
```

### 4.10 Modal/Dialog

```
Background:       White
Border Radius:    12px
Padding:          24px
Box Shadow:       0 25px 50px rgba(0,0,0,0.15)
Overlay:          rgba(0,0,0,0.5) semi-transparent
Max Width:        500px (mobile) / 600px (desktop)

Header:           Title + close icon (X)
Body:             Content area
Footer:           Action buttons (Cancel | Confirm)

Animation:        Fade in + slight scale up
Close on:         Escape key, overlay click
```

### 4.11 Tabs

```
Tab Bar:          Flex row, full width
Tab Text:         14px, 500 weight
Padding:          12px 16px
Default Tab:      Gray text
Active Tab:       Blue text + blue underline (3px)
Hover:            Light gray background

Content:          Tab content below
Switch:           Instant (no animation needed)
```

---

## 5. LAYOUT & SPACING

### Grid System
```
Base Unit: 8px
Spacing:   8px, 16px, 24px, 32px, 48px

Examples:
├── Margin:     16px or 24px
├── Padding:    12px or 16px
├── Gap:        8px or 16px
└── Border Radius: 6px or 12px
```

### Safe Areas (Mobile)
```
Top:    44px (status bar) + 16px padding
Bottom: 20px (safe area) + navigation
Left:   16px padding
Right:  16px padding
```

### Desktop Layout
```
Max Width: 1200px centered
Sidebar:   240px fixed
Content:   Fluid (remaining)
Margins:   24px on sides
```

---

## 6. SCREEN LAYOUTS

### 6.1 Owner Login Page

```
┌─────────────────────────────────────┐
│                                     │
│    🏋️ FitFlow                      │
│                                     │
│    Gym Management Platform          │
│                                     │
│    ┌───────────────────────────┐   │
│    │ Email                     │   │
│    │ [____________________]    │   │
│    │                           │   │
│    │ Password                  │   │
│    │ [____________________]    │   │
│    │                           │   │
│    │ [ ] Remember me           │   │
│    │                           │   │
│    │ [  Login  ]               │   │
│    │                           │   │
│    │ Don't have account?       │   │
│    │ Sign Up                   │   │
│    └───────────────────────────┘   │
│                                     │
│ Forgot password?                    │
└─────────────────────────────────────┘
```

**Key Elements:**
- Logo/Brand at top
- Email input (required)
- Password input (required)
- Remember me (optional)
- Login button (primary blue)
- Links: Sign up, forgot password
- Centered on screen
- Works on mobile (no scroll if possible)

---

### 6.2 Owner Dashboard (Desktop)

```
┌──────────────────────────────────────────────────────┐
│ ☰  Dashboard  Members  Payments  Trainers  Settings │
│                                            User ▼    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Good Morning, Amit 👋                              │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                │
│  │ 📊 1,234     │  │ 💰 ₹2,34,000 │                │
│  │ Members      │  │ Revenue      │                │
│  └──────────────┘  └──────────────┘                │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                │
│  │ 🚪 187       │  │ 🔴 120       │                │
│  │ Today Entry  │  │ At Risk      │                │
│  └──────────────┘  └──────────────┘                │
│                                                      │
│  Attendance Trend                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │ Graph here (last 30 days)                   │  │
│  └─────────────────────────────────────────────┘  │
│                                                      │
│  At-Risk Members                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ [Member cards with risk indicators]         │  │
│  └─────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

### 6.3 Member App (Mobile)

```
┌─────────────────────────────────┐
│ Status Bar (9:41) 🔋 📶         │
├─────────────────────────────────┤
│                                 │
│  Good Morning, Rahul 👋         │
│                                 │
│  🔥 12 Day Streak               │
│  ⏰ 23 Days Left (Membership)   │
│                                 │
│  ┌───────────────────────────┐ │
│  │ 📅 Today's Attendance     │ │
│  │ 06:42 AM                  │ │
│  │ ✓ Checked In              │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ 💪 Today's Workout        │ │
│  │ Chest + Triceps           │ │
│  │ [View]                    │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ [Show My QR Code]         │ │
│  └───────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│ 🏠 Attendance 💪 Workout 🍽 Diet│
└─────────────────────────────────┘
```

---

### 6.4 Member QR Scanner (Mobile)

```
┌─────────────────────────────────┐
│ Status Bar                      │
├─────────────────────────────────┤
│                                 │
│  Scan Entry QR                  │
│  ┌─────────────────────────┐  │
│  │                         │  │
│  │   [Camera Feed]         │  │
│  │                         │  │
│  │   [QR Code Here]        │  │
│  │                         │  │
│  │                         │  │
│  └─────────────────────────┘  │
│                                 │
│  ✓ Align QR code in frame      │
│                                 │
│  [Manual Entry ▼]               │
│                                 │
├─────────────────────────────────┤
│ 🏠 QR Scanner 👤 Profile        │
└─────────────────────────────────┘
```

---

### 6.5 Member List (Owner View)

```
┌──────────────────────────────────────────┐
│ ← Members                          🔍 ⊕  │
├──────────────────────────────────────────┤
│                                          │
│ Filter: [All ▼] Risk: [All ▼]           │
│ Search: [______________] 🔍              │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ 👤 Rahul (GYM-001)                 │  │
│ │ Phone: 9876543210                  │  │
│ │ Last Visit: 2 days ago             │  │
│ │ Status: 🟢 Active                  │  │
│ │ Membership: 23 days left           │  │
│ │ [More ▼]                           │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ 👤 Aman (GYM-002)                  │  │
│ │ Phone: 9876543211                  │  │
│ │ Last Visit: 8 days ago             │  │
│ │ Status: 🟡 At Risk                 │  │
│ │ [Follow Up] [Assign Trainer]       │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ← 1 2 3 ... 10 →                        │
│                                          │
└──────────────────────────────────────────┘
```

---

## 7. INTERACTION PATTERNS

### 7.1 Loading State
```
Show:
├── Full-page spinner (initial load)
├── Skeleton screens (data loading)
└── Progress indication (multi-step forms)

Duration: <3 seconds
Message: "Loading..." or specific action
```

### 7.2 Empty State
```
When: No data to show (no members, no payments, etc)

Display:
├── Icon (relevant to section)
├── Heading: "No [items] yet"
├── Description: "Create your first [item]"
└── CTA button: "Create [item]"

Example:
  📋 No Members Yet
  Start adding members to track their fitness journey
  [Add First Member]
```

### 7.3 Error State
```
Display:
├── Red alert card
├── Error icon
├── Error message (clear, actionable)
└── Retry or go back button

Example:
  ❌ Oops, something went wrong
  We couldn't load your members. Please check your internet connection and try again.
  [Retry]
```

### 7.4 Success Message
```
Duration: 3 seconds (auto-dismiss)
Position: Top of page or bottom-right
Type: Toast notification

Example:
  ✓ Member added successfully!
  Rahul is now registered. You can assign a trainer.
```

### 7.5 Confirmation Modal
```
Used for: Delete, refund, significant changes

Title: "Are you sure?"
Message: Clear description of action
Buttons: [Cancel] [Confirm (Red)]

Example:
  ⚠️ Delete Member?
  This will permanently remove Rahul from your gym.
  This action cannot be undone.
  [Cancel] [Delete]
```

---

## 8. RESPONSIVE DESIGN

### Breakpoints
```
Mobile:   < 640px (Portrait phone)
Tablet:   640px - 1024px
Desktop:  > 1024px
```

### Mobile Adaptations
```
Navigation:
├── Sidebar → Bottom tab bar (5 items max)
├── Hamburger menu → Tab bar + settings
└── Desktop grid → Stack vertically

Spacing:
├── Reduce margins (16px → 12px)
├── Reduce padding (24px → 16px)
└── Tighter cards

Touch:
├── Button min height: 44px (thumb friendly)
├── Tap target min: 44x44px
├── Remove hover states (use active state)
└── Gesture: Swipe left/right on lists

Tables:
├── Convert to cards
├── Show essential columns
└── Horizontal scroll if needed
```

### Tablet Layout
```
Split view:
├── Left panel (member list)
├── Right panel (member details)
└── 50-50 split

Or full-width with larger spacing
```

---

## 9. DARK MODE (FUTURE - PHASE 2)

### Color Adjustments
```
Background:     #1F2937 (dark gray)
Text:           #F9FAFB (off-white)
Cards:          #374151 (darker gray)
Borders:        #4B5563 (medium gray)
Primary:        #3B82F6 (brighter blue)
Success:        #34D399 (brighter green)
```

### Implementation
```
CSS Variables:
--bg-primary: #FFFFFF (light) / #1F2937 (dark)
--text-primary: #111827 (light) / #F9FAFB (dark)
etc.

Toggle: User settings → Theme
Persistence: localStorage
System preference: Respect prefers-color-scheme
```

---

## 10. ACCESSIBILITY (WCAG AA)

### Requirements
- [ ] Color contrast ratio ≥ 4.5:1 (text)
- [ ] Focus outline visible (2px, blue border)
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Form labels linked to inputs
- [ ] Error messages associated with fields
- [ ] Alt text on all images
- [ ] ARIA labels where needed
- [ ] No info conveyed by color alone

### Testing
```
Tools:
├── axe DevTools (Chrome extension)
├── WAVE (WebAIM)
├── Lighthouse (built-in)
└── Screen reader testing

Keyboard:
├── Tab through all interactive elements
├── Buttons clickable with Enter/Space
├── Modals closable with Escape
└── No keyboard traps
```

---

## 11. ANIMATION & TRANSITIONS

### Guidelines
```
Duration:   200-300ms (most animations)
Easing:     ease-out (UI) / ease-in (dismissals)
Distance:   Small (8-16px moves)
Avoid:      Flashy, distracting effects
Purpose:    Clarify state changes, guide attention
```

### Examples
```
Button Hover:    Scale 1.02, shadow increase
Tab Switch:      Fade + slide (200ms)
Modal Open:      Fade in + scale from 0.95
Toast:           Slide in from top (300ms)
Streak Update:   Pulse effect (fire emoji)
Loader:          Spin 1s rotation
```

---

## 12. DESIGN TOKENS (CSS)

### Create as CSS Variables

```css
:root {
  /* Colors */
  --color-primary: #0066FF;
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-gray: #6B7280;
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F9FAFB;
  --color-border: #E5E7EB;
  
  /* Typography */
  --font-primary: system-ui, -apple-system, sans-serif;
  --font-size-h1: 32px;
  --font-size-body: 16px;
  --font-weight-bold: 600;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
}
```

---

## 13. COMPONENT CHECKLIST

Before launching component, ensure:

- [ ] Works on mobile (< 640px)
- [ ] Works on desktop (> 1024px)
- [ ] Accessible (keyboard nav, ARIA labels)
- [ ] Clear focus state (blue outline)
- [ ] Error states shown clearly
- [ ] Loading state included
- [ ] Responsive padding/margins
- [ ] Dark mode ready (CSS vars)
- [ ] No console warnings
- [ ] Consistent with design system
- [ ] Documented with examples

---

**Document Status:** APPROVED ✅  
**Last Updated:** September 2024  
**Design System Version:** 1.0
