# KeshevPlus - ADHD Clinic Website

## Overview
KeshevPlus is a multilingual website for an ADHD clinic specializing in the diagnosis and treatment of attention disorders in children. The project aims to provide a comprehensive online presence, offering information, appointment scheduling, questionnaires, and client management functionalities. It targets a broad audience with multi-language support, including RTL languages, to effectively serve diverse communities.

## User Preferences
- Hebrew RTL website
- Clean, professional medical clinic design
- Dark mode support with brand-consistent colors
- Visitors are LEADS, not clients. Only manually converted to clients by admin.
- Persistent user recognition via cookies/localStorage
- Israeli law compliance for cookies disclaimer

## Recent Changes
- **Feb 2026:** Implemented smooth scroll-based navbar logo animation with continuous interpolation
- **Feb 2026:** Aligned hero welcome text with navbar logo using container-based grid system
- **Feb 2026:** Added delete functionality for contact forms and chat conversations in admin dashboard
- **Feb 2026:** Configured deployment settings for Replit hosting
- **Feb 2026:** Added admin badge notifications (unread contacts, pending appointments, unreviewed items) on dashboard tabs and overview cards with auto-refresh
- **Feb 2026:** Integrated WhatsApp quick-action buttons in admin contacts, clients, and appointments managers
- **Feb 2026:** Added WhatsApp floating button next to chat widget for direct clinic communication
- **Feb 2026:** Added owner role with admin-equivalent permissions, first-login password change, seed script, and E2E testing pipeline
- **Feb 2026:** Added cookies disclaimer banner compliant with Israeli Privacy Protection Act
- **Feb 2026:** Implemented persistent visitor recognition - returning visitors auto-recognized via localStorage/cookies
- **Feb 2026:** Enhanced CRM with full timestamps (date+time+seconds) on admin activity entries
- **Feb 2026:** Added metadata/notes field for admin activity documentation ("Added by" field)
- **Feb 2026:** Chat widget always visible (no dismiss to hidden), hidden on admin pages
- **Feb 2026:** Lead/client distinction: visitors auto-registered as leads, manual conversion toggle
- **Feb 2026:** Chatbot graceful error handling for AI service unavailability
- **Feb 2026:** Added Italian (it) language support - now 10 languages total
- **Feb 2026:** Added Visual Editor - iframe-based WYSIWYG content editor in admin dashboard for editing site text visually
- **Feb 2026:** Questionnaires now open as modals (like booking page) instead of navigating to separate page
- **Feb 2026:** Mobile hero layout: full-width stacked text + image on portrait, side-by-side on larger screens
- **Feb 2026:** Fixed AI chat Gemini fallback to use correct @google/genai SDK API (generateContentStream with systemInstruction)
- **Feb 2026:** Added WhatsApp Business API integration - webhook endpoints (verify + inbound), outbound message sending via Meta Graph API, admin WhatsApp conversations manager with chat-style thread view

## System Architecture
The application is a full-stack project built with a React frontend (Vite, TailwindCSS, shadcn/ui) and an Express.js backend. It uses Neon Postgres via Drizzle ORM for data persistence.

**Key Features:**
- **Multilingual Support (i18n):** Database-backed translation system for 10 languages (he, en, fr, es, de, ru, am, ar, yi, it), with RTL/LTR layout handling. Translations are admin-editable, with static locale file fallback.
- **User Authentication:** Session-based authentication for secure access.
- **Contact Management:** Contact forms with database persistence and admin review capabilities.
- **AI Chat Widget:** OpenAI-powered virtual assistant (gpt-4o-mini via Replit AI Integrations) with streaming SSE responses, conversation storage, admin review, and graceful fallback when AI service is unavailable.
- **Questionnaire System:** Web-based Vanderbilt ADHD assessments (Parent, Teacher, Self-Report) with automatic scoring, JSONB storage of answers, and an admin interface for submissions.
- **Appointment System:** Public booking page with status management (pending/confirmed/cancelled/completed) by administrators. Limits one active appointment per child.
- **Lead/Client System:** Visitors leaving details via any form are auto-registered as LEADS (not clients). Admin manually converts leads to clients. Includes activity logging (notes, calls, meetings, sales, emails) with full timestamps and admin ClientsManager with lead/client status badges and conversion toggle.
- **CRM Activity Tracking:** Timestamped admin documentation with date+time+seconds, activity types (note, call, meeting, sale, email), and metadata ("Added by") field.
- **Persistent Visitor Recognition:** Returning visitors are auto-recognized via localStorage and cookies (90-day expiry). Chat widget auto-populates visitor info for returning users.
- **Cookies Disclaimer:** Israeli law-compliant cookies banner with accept/decline, expandable info section.
- **Email Notifications:** Configurable email notifications for contact forms, appointments, and questionnaires via Nodemailer.
- **UI/UX:** TailwindCSS and shadcn/ui are used for a modern, responsive design with full RTL/LTR support. Dark mode is implemented with brand-consistent color palettes.
- **Performance:** Optimized with code-splitting, lazy loading of components (including CookiesBanner), and dependency cleanup.

**Database Schema Highlights:**
- `Users`: For authentication.
- `Contacts`: Stores contact form submissions.
- `SiteSettings`: Manages global site configurations, including language settings and email notification toggles.
- `Translations`: Stores all localized text for the multilingual system.
- `QuestionnaireSubmissions`: Stores questionnaire responses and scores.
- `Appointments`: Manages appointment details and statuses.
- `Clients`: Lead/client records (status: lead/client), automatically created as leads from form submissions, manually converted to clients by admin.
- `ClientActivities`: Logs interactions with clients within the CRM. Includes type, description, metadata, and auto-timestamped createdAt.
- `Conversations`: Stores AI chat dialogues with visitor info.
- `Messages`: Stores individual messages within conversations.
- `WhatsAppMessages`: Stores WhatsApp Business API messages (inbound/outbound) with phone, direction, status, raw payload, and optional client linkage.

## External Dependencies
- **Neon Postgres:** Primary database solution.
- **Drizzle ORM:** Object-Relational Mapper for database interactions.
- **Express.js:** Web application framework for the backend.
- **React:** Frontend JavaScript library.
- **Vite:** Build tool for the frontend.
- **TailwindCSS:** Utility-first CSS framework.
- **shadcn/ui:** UI component library.
- **Nodemailer:** For sending emails.
- **OpenAI (via Replit AI Integrations):** Powers the AI chat assistant (gpt-4o-mini). Uses AI_INTEGRATIONS_OPENAI_API_KEY and AI_INTEGRATIONS_OPENAI_BASE_URL env vars.
- **Firecrawl:** Used via a proxy endpoint for web scraping.
- **Google Maps:** Embedded for clinic directions.

## Key Components
- `client/src/components/CookiesBanner.tsx` - Israeli law-compliant cookies disclaimer
- `client/src/components/ChatWidget.tsx` - AI chat with persistent visitor recognition
- `client/src/components/admin/ClientsManager.tsx` - CRM with timestamped activity logging
- `client/src/components/admin/VisualEditor.tsx` - WYSIWYG visual content editor with iframe preview
- `client/src/components/admin/AdminDashboard.tsx` - Admin overview dashboard
- `client/src/components/admin/WhatsAppManager.tsx` - WhatsApp Business conversations manager with chat thread view
