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
- **Schema**: Users table (auth) + Contacts table (contact form) + SiteSettings table (language config) + Translations table (i18n) + QuestionnaireSubmissions table (ADHD assessments)
- **i18n**: Database-backed translation system with 9 languages, static locale file fallback, admin-editable via Translation Manager
- **Email Delivery**: Nodemailer integration for contact form submissions to pluskeshev@gmail.com

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

## Recent Changes
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
