# KeshevPlus - ADHD Clinic Website

## Overview
KeshevPlus is a multilingual website for an ADHD clinic specializing in diagnosis and treatment of attention disorders in children. Migrated from Lovable (frontend-only with Supabase) to Replit fullstack environment.

## Current State
- Fully functional fullstack application running on Replit
- Express backend with Drizzle ORM connected to Neon Postgres
- React frontend with Vite, serving from the same port
- Session-based authentication replacing Supabase Auth
- Contact form with database persistence
- Firecrawl proxy endpoint
- Admin-controlled multilingual support (9 languages)

## Architecture
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui (RTL/LTR layout)
- **Backend**: Express.js with session-based auth
- **Database**: Neon Postgres via Drizzle ORM
- **Schema**: Users, Contacts, SiteSettings, Translations, QuestionnaireSubmissions, Appointments, Clients, ClientActivities, Conversations, Messages tables
- **i18n**: Database-backed translation system with 9 languages, static locale file fallback, admin-editable via Translation Manager
- **Email Delivery**: Nodemailer with configurable notifications (contact forms, appointments, questionnaires) via admin toggles
- **AI Chat**: OpenAI-powered virtual assistant (gpt-4o-mini) via Replit AI Integrations, streaming SSE responses
- **CRM**: Client management with activity logging (notes, calls, meetings, sales, emails)
- **Appointments**: Booking system with status management (pending/confirmed/cancelled/completed)

## Project Structure
```
client/src/          - React frontend source
  components/        - UI components (auth, layout, sections, ui)
  pages/             - Page components
  lib/               - Utilities, API helpers
  hooks/             - Custom React hooks (useLanguage for i18n)
  i18n/              - Translation system
    config.ts        - Language types, constants, settings
    locales/         - Translation files (he, en, fr, es, de, ru, am, ar, yi)
server/              - Express backend
  index.ts           - Server entry point
  routes.ts          - API routes
  storage.ts         - Database storage layer (Drizzle)
  vite.ts            - Vite dev server setup
shared/              - Shared types and schema
  schema.ts          - Drizzle schema definitions
```

## Key API Routes
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Current user check
- `POST /api/contact` - Contact form submission
- `GET /api/contacts` - List contacts (admin)
- `PATCH /api/contacts/:id/read` - Mark contact as read
- `GET /api/settings/email-notifications` - Get email notification settings (admin)
- `PUT /api/settings/email-notifications` - Update email notification settings (admin)
- `POST /api/firecrawl-scrape` - Firecrawl proxy
- `GET /api/settings/language` - Get language settings (public)
- `PUT /api/settings/language` - Update language settings (admin only)
- `GET /api/translations` - Get all translations (grouped by key) or by language (?lang=xx)
- `GET /api/translations/keys` - List all translation keys
- `PUT /api/translations` - Upsert single translation (admin)
- `PUT /api/translations/bulk` - Bulk upsert translations (admin)
- `DELETE /api/translations/:key` - Delete translation key (admin)
- `POST /api/translations/seed` - Seed DB from locale files (admin)
- `POST /api/questionnaires/submit` - Submit questionnaire (public)
- `GET /api/questionnaires` - List submissions (admin, ?type= filter)
- `GET /api/questionnaires/stats` - Submission stats (admin)
- `GET /api/questionnaires/:id` - Get single submission (admin)
- `PATCH /api/questionnaires/:id/reviewed` - Mark as reviewed (admin)
- `POST /api/appointments` - Create appointment (public)
- `GET /api/appointments` - List appointments (admin)
- `PATCH /api/appointments/:id/status` - Update appointment status (admin)
- `POST /api/clients` - Create client (admin)
- `GET /api/clients` - List clients (admin)
- `PATCH /api/clients/:id` - Update client (admin)
- `POST /api/clients/:id/activities` - Add client activity (admin)
- `GET /api/clients/:id/activities` - Get client activities (admin)
- `POST /api/chat` - AI chat assistant (public, streaming SSE)

## Questionnaire System
- **Types**: Parent, Teacher, Self-Report (Vanderbilt ADHD Assessment)
- **Flow**: Registration (name/email/phone + child info) → Multi-section form → Scoring → Submit
- **Storage**: JSONB answers + calculated scores in questionnaire_submissions table
- **Admin View**: Filterable list with expand/collapse details, scores, individual answers, mark-as-reviewed
- **Public Access**: Fill online at /questionnaire/:type, also PDF/Word downloads
- **Scoring**: Automatic calculation of inattention, hyperactivity, combined scores
- **Data**: questionnaire-data.ts contains all Vanderbilt questions in Hebrew/English

## Multilingual System
- **Languages**: Hebrew (he), English (en), French (fr), Spanish (es), German (de), Russian (ru), Amharic (am), Arabic (ar), Yiddish (yi)
- **RTL Languages**: Hebrew, Arabic, Yiddish
- **Modes**: Bilingual (he/en only) or Multilingual (all 9)
- **Admin Control**: Toggle on/off, select mode, set default language via Admin Dashboard
- **Settings Storage**: `site_settings` table with JSONB value, key="language"
- **Translation Keys**: `section.key` pattern (e.g., `nav.about`, `hero.title`)
- **Fallback Chain**: DB translations → static locale files → English fallback → raw key
- **Admin Translation Manager**: Search, filter, inline edit, delete keys, seed from locale files

## Running
- `npm run dev` starts Express + Vite on port 5000
- `npm run db:push` syncs Drizzle schema to database

## Performance
- Code-split routes: AdminPage and NotFound lazy-loaded via React.lazy
- Below-fold sections lazy-loaded: AboutSection, ServicesSection, ADHDInfoSection, FAQSection, ContactSection, Footer
- Only MedicalHero loads eagerly (above the fold)
- Removed 8 unused shadcn UI components (calendar, carousel, resizable, command, input-otp, drawer, chart, sonner)
- Removed 11 unused npm packages (react-router-dom, sonner, recharts, date-fns, embla-carousel-react, etc.)
- Main JS bundle: ~410 KB (down from ~592 KB), split into 19 lazy chunks
- Images: hero images load eagerly, below-fold images use loading="lazy"

## Dark Mode
- **ThemeProvider**: `client/src/hooks/useTheme.tsx` - Context-based with localStorage persistence and system preference detection
- **ThemeToggle**: `client/src/components/ThemeToggle.tsx` - Sun/Moon icon toggle button
- **CSS Variables**: `.dark` class in `index.css` uses clinic green/orange brand colors (not default blue)
- **Semantic Tokens**: All components use bg-background, text-foreground, bg-card, bg-primary, text-primary-foreground, bg-muted, text-muted-foreground instead of hardcoded colors
- **Exceptions**: Third-party brand colors (WhatsApp #25D366, Waze #33CCFF, Google Maps #4285F4) remain hardcoded
- **Toggle Location**: In navigation bar (both desktop and mobile)

## AI Chat Widget
- **Component**: `client/src/components/ChatWidget.tsx` - Floating chat bubble, opens into card-style chat window
- **Backend**: `/api/chat` endpoint using OpenAI gpt-4o-mini via Replit AI Integrations
- **Streaming**: Server-Sent Events (SSE) for real-time token streaming
- **System Prompt**: Context-aware for clinic info (location, phone, services), language-adaptive (Hebrew/English)
- **Features**: Message history, loading states, error handling, RTL/LTR support

## Appointment System
- **Schema**: `appointments` table (name, email, phone, date, time, type, status, notes)
- **Public**: BookingPage at `/booking` with form validation
- **Admin**: AppointmentsManager in admin dashboard with status badges (pending/confirmed/cancelled/completed)
- **Status Flow**: pending → confirmed/cancelled, confirmed → completed

## CRM System
- **Schema**: `clients` table (master record) + `clientActivities` table (interactions)
- **Activity Types**: note, call, meeting, sale, email
- **Admin**: ClientsManager with expandable client details, inline activity logging, editable notes
- **Data**: Name, email, phone, status (active/inactive/lead), notes, creation tracking

## Recent Changes
- 2026-02-09: Contact submissions manager (פניות באתר) - admin tab to view/manage contact form submissions with read/unread status
- 2026-02-09: Email notification settings - admin toggles to enable/disable email notifications for contacts, appointments, questionnaires
- 2026-02-09: Email notifications for appointments and questionnaires - sends email when new appointment scheduled or questionnaire submitted
- 2026-02-09: Admin dashboard restructured with 7 tabs: Overview, Contacts, Appointments, Clients, Questionnaires, Translations, Settings
- 2026-02-08: AI Chat Widget - OpenAI-powered virtual assistant with streaming responses, bilingual support
- 2026-02-08: CRM system - client management with activity logging (notes, calls, meetings, sales, emails)
- 2026-02-08: Appointment scheduling - public booking page + admin status management
- 2026-02-08: Admin dashboard bilingual translation (Hebrew/English) for all admin components
- 2026-02-07: Web-based questionnaire system - 3 Vanderbilt ADHD assessments (Parent/Teacher/Self-Report) with registration, multi-section forms, automatic scoring, JSONB storage, admin dashboard viewer with filtering and mark-as-reviewed
- 2026-02-07: Content sections (About, Services, ADHD/FAQ) converted to translation key system using t() function for full multilingual support
- 2026-02-07: Translation Manager admin UI - full CRUD for translations, search/filter by key/section/language, inline editing, seed from locale files, pagination
- 2026-02-07: Database-backed i18n system - translations table, API routes, useLanguage hook with DB→static→English fallback chain
- 2026-02-07: Static locale files updated with all component-used keys (hero, nav, contact, footer sections) for graceful fallback
- 2026-02-07: AccessibilityWidget expanded - full 9-language translations, large cursor, stop animations, Israeli law accessibility statement
- 2026-02-07: FAQ section merged into ADHDInfoSection - FAQ accordion as sub-section with #faq anchor preserved
- 2026-02-07: QuestionnairesSection redesigned - 3 Vanderbilt questionnaires (Parent, Teacher, Self-Report) with actual PDF/DOCX files, Word/PDF icon download buttons, matching keshevplus.co.il/forms layout, fully translated to 9 languages
- 2026-02-07: Directions modal updated with embedded Google Maps iframe showing clinic at יגאל אלון 94, תל אביב
- 2026-02-07: Navigation restructured: Home → About → Services → ADHD (includes FAQ) → Questionnaires → Contact
- 2026-02-07: Hero font sizes increased for desktop/laptop (larger clamp values)
- 2026-02-07: AccessibilityWidget - floating blue button (bottom-left RTL) with text size, contrast, grayscale, link highlight, readable font
- 2026-02-07: Dark mode green saturation reduced from 55% to 30% for softer appearance
- 2026-02-06: Hero redesign to match keshevplus.co.il - logo in hero content, cycling audience text, exact Hebrew copy, 50/50 split layout
- 2026-02-06: ContactModal component - popup contact form triggered from CTA buttons and nav "יצירת קשר" link
- 2026-02-06: Dark mode implementation - ThemeProvider, semantic color tokens, brand-consistent dark theme
- 2026-02-06: Performance optimization - code splitting, dependency cleanup, 31% bundle reduction
- 2026-02-06: Fixed SIGBUS crash by cleaning corrupted node_modules (bun/npm conflict)
- 2026-02-06: Removed lovable-tagger dependency
- 2026-02-06: Simplified Vite dev server setup in server/vite.ts

## User Preferences
- Hebrew RTL website
- Clean, professional medical clinic design
- Dark mode support with brand-consistent colors
