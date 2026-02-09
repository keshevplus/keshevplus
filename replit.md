# KeshevPlus - ADHD Clinic Website

## Overview
KeshevPlus is a multilingual website for an ADHD clinic specializing in the diagnosis and treatment of attention disorders in children. The project aims to provide a comprehensive online presence, offering information, appointment scheduling, questionnaires, and client management functionalities. It targets a broad audience with multi-language support, including RTL languages, to effectively serve diverse communities.

## User Preferences
- Hebrew RTL website
- Clean, professional medical clinic design
- Dark mode support with brand-consistent colors

## System Architecture
The application is a full-stack project built with a React frontend (Vite, TailwindCSS, shadcn/ui) and an Express.js backend. It uses Neon Postgres via Drizzle ORM for data persistence.

**Key Features:**
- **Multilingual Support (i18n):** Database-backed translation system for 9 languages (he, en, fr, es, de, ru, am, ar, yi), with RTL/LTR layout handling. Translations are admin-editable, with static locale file fallback.
- **User Authentication:** Session-based authentication for secure access.
- **Contact Management:** Contact forms with database persistence and admin review capabilities.
- **AI Chat Widget:** OpenAI-powered virtual assistant (gpt-4o-mini) with streaming SSE responses, conversation storage, and admin review.
- **Questionnaire System:** Web-based Vanderbilt ADHD assessments (Parent, Teacher, Self-Report) with automatic scoring, JSONB storage of answers, and an admin interface for submissions.
- **Appointment System:** Public booking page with status management (pending/confirmed/cancelled/completed) by administrators. Limits one active appointment per child.
- **CRM System:** Unified visitor/client system that auto-registers clients from any form submission. Includes client activity logging (notes, calls, meetings, sales, emails) and a comprehensive admin ClientsManager.
- **Email Notifications:** Configurable email notifications for contact forms, appointments, and questionnaires via Nodemailer.
- **UI/UX:** TailwindCSS and shadcn/ui are used for a modern, responsive design with full RTL/LTR support. Dark mode is implemented with brand-consistent color palettes.
- **Performance:** Optimized with code-splitting, lazy loading of components, and dependency cleanup.

**Database Schema Highlights:**
- `Users`: For authentication.
- `Contacts`: Stores contact form submissions.
- `SiteSettings`: Manages global site configurations, including language settings and email notification toggles.
- `Translations`: Stores all localized text for the multilingual system.
- `QuestionnaireSubmissions`: Stores questionnaire responses and scores.
- `Appointments`: Manages appointment details and statuses.
- `Clients`: Unified client records, automatically created from various interactions.
- `ClientActivities`: Logs interactions with clients within the CRM.
- `Conversations`: Stores AI chat dialogues.
- `Messages`: Stores individual messages within conversations.

## External Dependencies
- **Neon Postgres:** Primary database solution.
- **Drizzle ORM:** Object-Relational Mapper for database interactions.
- **Express.js:** Web application framework for the backend.
- **React:** Frontend JavaScript library.
- **Vite:** Build tool for the frontend.
- **TailwindCSS:** Utility-first CSS framework.
- **shadcn/ui:** UI component library.
- **Nodemailer:** For sending emails.
- **OpenAI (via Replit AI Integrations):** Powers the AI chat assistant (gpt-4o-mini).
- **Firecrawl:** Used via a proxy endpoint for web scraping.
- **Google Maps:** Embedded for clinic directions.