# KeshevPlus - ADHD Clinic Website

KeshevPlus is a multilingual platform for an ADHD clinic specializing in the diagnosis and treatment of attention disorders in children. It provides a public-facing site (information, appointment booking, questionnaires, AI chat) alongside an admin dashboard for clinic staff to manage leads, clients, appointments, and site content.

## 🚀 Features

- **Multilingual Support**: Database-backed translations for 10 languages (Hebrew, English, French, Spanish, German, Russian, Amharic, Arabic, Yiddish, Italian) with automatic RTL/LTR layout handling and admin-editable translation keys.
- **AI Chat Assistant**: OpenAI-powered widget (Gemini as fallback) with streaming responses, conversation storage, and admin review.
- **Interactive Questionnaires**: Vanderbilt ADHD assessment forms (Parent, Teacher, Self-Report) with automatic scoring, opened as modals, with an admin review interface.
- **Appointment Scheduling**: Public booking with real-time availability, configurable appointment-type hours, and admin status management (pending/confirmed/cancelled/completed).
- **Unified CRM & Lead System**: Every form submission auto-registers as a lead; admins manually convert leads to clients. Includes activity logging (notes, calls, meetings, sales, emails), client files, and payments.
- **WhatsApp Integration**: Meta WhatsApp Business API webhook, outbound sending, and an admin conversations manager.
- **Visual Content Editor**: Iframe-based WYSIWYG editor for admins to edit site text and home page sections directly.
- **Admin Dashboard**: Badge notifications (unread contacts, pending appointments, unreviewed items), user/role management (owner + admin roles), a soft-delete bin with restore, and image slot management.
- **Privacy & Compliance**: Israeli law-compliant cookies disclaimer, accessibility statement, privacy policy, and terms-of-use pages; session-based authentication.

## 🛠️ Technology Stack

- **Frontend**: React 18 + Vite, TailwindCSS, shadcn/ui (Radix primitives), TanStack Query, React Hook Form + Zod, Framer Motion, wouter (routing).
- **Backend**: Express.js (Node.js) served via `tsx` in development and bundled with `esbuild` for production.
- **Database**: PostgreSQL (Neon) with Drizzle ORM (`drizzle-kit push` for schema sync, no migration files checked in).
- **AI**: OpenAI SDK (primary) with `@google/genai` (Gemini) as fallback.
- **Communication**: Nodemailer (email notifications), WhatsApp Business API, optional Firecrawl integration for scraping.
- **Testing**: Vitest for unit tests, Playwright for end-to-end tests.

## 📁 Project Structure

```
keshevplus/
├── client/            # Vite + React frontend (separate package, own package.json)
│   └── src/
│       ├── components/    # UI components, incl. admin/ dashboard managers and auth/
│       └── pages/         # Route-level pages (Index, BookingPage, QuestionnairePage, etc.)
├── server/            # Express backend (routes, storage/data access, session, dev/prod entrypoints)
├── shared/            # Drizzle schema + Zod validators shared by client and server
├── api/               # Vercel serverless function entrypoint (built from server/vercel-handler.ts)
├── scripts/           # One-off ops scripts (Neon schema check, owner role seeding, typecheck)
├── e2e/               # Playwright end-to-end specs
├── docs/              # Mandatory reference docs for UI and chat-widget behavior (see below)
└── dist/              # Production build output (server bundle + client assets)
```

## 💻 Getting Started

### Prerequisites

- Node.js 24.x
- A PostgreSQL database (the project targets Neon, but any Postgres instance works)

### Environment Variables

Copy `.env.example` to `.env` and fill in the values you need:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `SESSION_SECRET` | Required in production; signs the session cookie |
| `EMAIL_USER` / `EMAIL_PASS` / `CONTACT_RECIPIENT_EMAIL` | Email notifications (Nodemailer) |
| `OPENAI_API_KEY` (or `AI_INTEGRATIONS_OPENAI_*`) | Primary AI chat provider |
| `GEMINI_API_KEY` / `GOOGLE_API_KEY` (or `AI_INTEGRATIONS_GEMINI_*`) | Fallback AI chat provider |
| `WHATSAPP_PHONE_NUMBER_ID` / `WHATSAPP_ACCESS_TOKEN` / `WHATSAPP_VERIFY_TOKEN` / `META_APP_SECRET` | WhatsApp Business API |
| `FIRECRAWL_API_KEY` | Optional web-scraping integration |
| `OWNER_EMAIL` / `OWNER_PASSWORD` | Used only by the owner-role seed script |

### Install & Run

```sh
# Install root (server) and client dependencies
npm install
npm install --prefix client

# Sync the database schema (Drizzle push)
npm run db:push

# Start the dev server (Express + Vite middleware, http://localhost:5000)
npm run dev
```

### Other Scripts

| Command | Description |
|---|---|
| `npm run build` | Builds the client, then bundles the server and Vercel API handler with esbuild |
| `npm run start` | Runs the production build (`dist/index.js`) |
| `npm run typecheck` | Type-checks the client |
| `npm run lint` | Lints the client |
| `npm test` | Runs client unit tests (Vitest) |
| `npx playwright test` | Runs end-to-end tests in `e2e/` against a running server on port 5000 |
| `npm run db:push:force` | Force-pushes schema changes (drops data if needed) |

## 🚢 Deployment

- **Vercel**: `vercel.json` builds the client into `client/dist` and routes `/api/*` to the bundled `api/index.js` serverless handler; all other paths serve the SPA.
- **Replit**: `.replit` configures an autoscale deployment running `npm run build` / `npm run start`, bound to port 5000.

## 📚 Further Documentation

These files contain mandatory, project-specific rules — read them before touching the related code:

- [`docs/UI_LAYOUT_RULES.md`](docs/UI_LAYOUT_RULES.md) — mobile-first layout, overflow prevention, lead/client distinction, chat widget positioning, admin dashboard and section-component rules.
- [`docs/CHAT_WIDGET_ENFORCEMENT.md`](docs/CHAT_WIDGET_ENFORCEMENT.md) — chat AI behavioral rules, language-matching behavior, and mobile keyboard handling.

## 📄 License

Proprietary - KeshevPlus ADHD Clinic.
