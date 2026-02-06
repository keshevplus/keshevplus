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
- **Schema**: Users table (auth) + Contacts table (contact form) + SiteSettings table (language config)
- **i18n**: Custom translation system with 9 languages, admin-controlled via database settings

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

## Multilingual System
- **Languages**: Hebrew (he), English (en), French (fr), Spanish (es), German (de), Russian (ru), Amharic (am), Arabic (ar), Yiddish (yi)
- **RTL Languages**: Hebrew, Arabic, Yiddish
- **Modes**: Bilingual (he/en only) or Multilingual (all 9)
- **Admin Control**: Toggle on/off, select mode, set default language via Admin Dashboard
- **Settings Storage**: `site_settings` table with JSONB value, key="language"
- **Translation Keys**: `section.key` pattern (e.g., `nav.about`, `hero.title`)

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
