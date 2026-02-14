# UI & Layout Rules

## Purpose

This document contains all user-requested UI, layout, design, and behavioral rules.
These rules are mandatory and must be followed during any refactoring or feature work.

**READ THIS ENTIRE FILE BEFORE ANY UI OR LAYOUT REFACTORING.**

---

## 1. Mobile-First Design (MANDATORY)

### 1.1 Navbar Rules
- Navbar must stick to top on ALL routes (/, /demo, etc.)
- Navbar must NOT get cut off when scrolling on mobile
- Navbar must use `position: sticky` with very high `z-index`
- No `overflow-visible` on navbar containers — this causes clipping issues
- Navbar containers use standard overflow (no explicit overflow-visible)

### 1.2 Overflow Prevention
- `html`, `body`, and `#root` must all have `overflow-x: hidden`
- The `<Section>` layout component uses `overflow-x-hidden` (NOT `overflow-visible`)
- No element should use `100vw` or `w-screen` (these cause horizontal scrollbar with scrollbar width)
- Hero images must NOT use `scale-105` or `scale-110` transforms (these extend beyond viewport)
- All page wrappers (Index, DemoIndex) must have `overflow-x-hidden w-full`

### 1.3 Global CSS Requirements (in index.css)
```css
html {
  overflow-x: hidden;
  width: 100%;
}
body {
  overflow-x: hidden;
  width: 100%;
  max-width: 100%;
}
```

### 1.4 Root Element (in index.html)
```html
<body class="overflow-x-hidden">
  <div id="root" class="w-full overflow-x-hidden">
```

---

## 2. Visitor / Lead / Client Distinction

- Visitors who leave details via ANY form are auto-registered as **LEADS** (not clients)
- Only admin can manually convert a lead to a **CLIENT**
- The word "client" should not be used for visitors in the public-facing UI
- Admin dashboard shows lead/client status badges and conversion toggle

---

## 3. Cookies Disclaimer

- Must comply with Israeli Privacy Protection Act
- Must have accept/decline options
- Must have expandable info section
- Uses lazy loading (`React.lazy`) for performance

---

## 4. Persistent Visitor Recognition

- Returning visitors are auto-recognized via `localStorage` and cookies (90-day expiry)
- Chat widget auto-populates visitor info for returning users
- Cookie name: `kp_visitor`
- LocalStorage key: `kp_visitor_info`

---

## 5. Chat Widget UI Rules

### 5.1 Position & Layout
- Fixed position: `bottom-5 left-5` on all public pages
- Buttons stack vertically: WhatsApp on top, chat button below
- Text bubble ("How can I help?") floats to the RIGHT using absolute positioning
- Text bubble must NEVER displace the buttons (no flexbox row layout that pushes buttons)
- Bubble dismisses to icon-only mode (stored in localStorage as `kp_chat_bubble`)

### 5.2 Modal Behavior
- Chat opens as a centered modal overlay (not a sidebar or bottom sheet)
- Modal size: `max-w-md h-[70vh] max-h-[560px]`
- On mobile with keyboard: modal fills visible viewport using `visualViewport` API
- All inputs have `onFocus` → `scrollIntoView` for keyboard visibility

### 5.3 Visibility Rules
- Always visible on public pages (/, /demo)
- Hidden on admin pages (/admin)
- Hidden inside Visual Editor iframes (detected via `visualEditor=true` URL param)
- NOT hidden in other iframe contexts

---

## 6. Hero Section Rules

### 6.1 Layout
- Mobile (portrait): full-width stacked text + image
- Larger screens: side-by-side layout
- Doctor image: NO scale transforms (no `scale-105` or `scale-110`)
- Hero section: `overflow-x-hidden`

### 6.2 Scroll Behavior
- Smooth scroll-based navbar logo animation with continuous interpolation
- Hero welcome text aligned with navbar logo using container-based grid system

---

## 7. Admin Dashboard Rules

### 7.1 Badge Notifications
- Unread contacts, pending appointments, unreviewed items show badge counts
- Badges appear on dashboard tabs and overview cards
- Auto-refresh enabled

### 7.2 WhatsApp Integration
- Quick-action WhatsApp buttons in contacts, clients, and appointments managers
- WhatsApp conversations manager with chat-style thread view

### 7.3 CRM Activity Tracking
- Full timestamps: date + time + seconds
- Activity types: note, call, meeting, sale, email
- Metadata field: "Added by" for admin documentation

### 7.4 Visual Editor
- Iframe-based WYSIWYG content editor
- Chat widget hidden inside editor iframe (via URL parameter detection)

---

## 8. Questionnaire System

- Questionnaires open as modals (like booking page)
- Do NOT navigate to separate page
- Types: Parent, Teacher, Self-Report (Vanderbilt ADHD)

---

## 9. Translation System

### 9.1 Supported Languages (10 total)
he, en, fr, es, de, ru, am, ar, yi, it

### 9.2 Contact Form Translation Keys
All contact form keys must exist in the database for ALL languages:
- `contact.email_placeholder`
- `contact.phone_placeholder`
- `contact.topic_label`
- `contact.topic_option1`, `contact.topic_option2`, `contact.topic_option3`
- `contact.address_label`
- `contact.email_label`
- `contact.details_title`
- `contact.directions_title`
- `contact.clear_form`

These must NOT only exist in `demoOverrides` — they must be synced to the main database.

---

## 10. Deployment Configuration

- Deployment target: `autoscale`
- Build command: `npm run build`
- Run command: `npm run start`
- Frontend binds to `0.0.0.0:5000`

---

## 11. Section Component Rules

The `<Section>` layout component (`client/src/components/layout/Section.tsx`):
- Uses `overflow-x-hidden relative` (NEVER `overflow-visible`)
- Container: `max-w-4xl` with responsive padding
- SectionHeader uses negative margins (`-mx-4 sm:-mx-6 lg:-mx-8`) — these are safe because the parent section clips overflow

---

## 12. About Section

- Background: `bg-[#FFFDF5] dark:bg-card`
- No explicit `overflow-visible` override

---

## 13. Project Separation Plan (keshevplus-demo)

### Intent
The /demo route should become the main / route in a separate project called "keshevplus-demo".
The current / route stays in this keshevplus-monorepo project.

### Architecture Notes for Separation
- `/demo` uses `DemoIndex.tsx` which wraps `Index` with `TranslationOverrideProvider` using `demoOverrides.ts`
- Components with `isDemo` conditional logic: `AboutSection.tsx`, `ServicesSection.tsx`, `ContactSection.tsx`, `ChatWidget.tsx`
- In the demo project: remove all `isDemo` checks and always show the "demo" variant
- In this project: remove the /demo route and `DemoIndex.tsx` after separation
- All server infrastructure (admin dashboard, API routes, database, auth) must remain intact in BOTH projects
- The demo project shares the same database and backend

### isDemo Conditionals Summary
| Component | isDemo=true behavior |
|-----------|---------------------|
| AboutSection | Hides credentials list and values cards section |
| ServicesSection | Shows diagnosis steps (3 steps) instead of process steps (4 steps) |
| ContactSection | Uses `contact.title` instead of `nav.contact`; orange card bg; shows "clear form" button |
| ChatWidget | Currently unused (was for demo detection via URL) |

### Translation Overrides (demoOverrides.ts)
Contains Hebrew content overrides for: about, services, ADHD info, diagnosis, questionnaires, contact sections.
In the demo project, these overrides should become the primary translations (merged into database or static files).

---

# CHANGE LOG

| Date       | Change Description |
|------------|-------------------|
| Feb 2026   | Initial creation with all accumulated user rules |
| Feb 2026   | Overflow fixes: html/body/root overflow-x-hidden, Section overflow-x-hidden |
| Feb 2026   | Chat bubble positioning: absolute float-right, no button displacement |
| Feb 2026   | Mobile keyboard: visualViewport-based modal repositioning |
| Feb 2026   | Chat AI enforcement rules documented |
| Feb 2026   | Added project separation plan for keshevplus-demo |

---

# END OF UI RULES
