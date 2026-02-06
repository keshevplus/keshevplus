# KeshevPlus - ADHD Clinic Website

## Overview
KeshevPlus is a Hebrew-language website for an ADHD clinic specializing in diagnosis and treatment of attention disorders in children. Migrated from Lovable (frontend-only with Supabase) to Replit fullstack environment.

## Current State
- Fully functional fullstack application running on Replit
- Express backend with Drizzle ORM connected to Neon Postgres
- React frontend with Vite, serving from the same port
- Session-based authentication replacing Supabase Auth
- Contact form with database persistence
- Firecrawl proxy endpoint

## Architecture
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui (RTL Hebrew layout)
- **Backend**: Express.js with session-based auth
- **Database**: Neon Postgres via Drizzle ORM
- **Schema**: Users table (auth) + Contacts table (contact form submissions)

## Project Structure
```
client/src/          - React frontend source
  components/        - UI components (auth, layout, sections, ui)
  pages/             - Page components
  lib/               - Utilities, API helpers
  hooks/             - Custom React hooks
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

## Recent Changes
- 2026-02-06: Performance optimization - code splitting, dependency cleanup, 31% bundle reduction
- 2026-02-06: Fixed SIGBUS crash by cleaning corrupted node_modules (bun/npm conflict)
- 2026-02-06: Removed lovable-tagger dependency
- 2026-02-06: Simplified Vite dev server setup in server/vite.ts

## User Preferences
- Hebrew RTL website
- Clean, professional medical clinic design
