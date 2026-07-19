# KeshevPlus - ADHD Clinic Website

KeshevPlus is a comprehensive, multilingual platform for a specialized ADHD clinic. It provides a professional online presence with advanced features for patient engagement, administrative management, and clinical assessment.

## 🚀 Features

- **Multilingual Support**: Fully localized in 10 languages (Hebrew, English, French, Spanish, German, Russian, Amharic, Arabic, Yiddish, Italian) with automatic RTL/LTR handling.
- **AI Chat Assistant**: OpenAI-powered virtual assistant (GPT-4o-mini) providing 24/7 support with graceful fallback and lead generation.
- **Interactive Questionnaires**: Web-based Vanderbilt ADHD assessment forms (Parent, Teacher, Self-Report) with automatic scoring and admin review.
- **Appointment Scheduling**: Streamlined booking system with real-time availability and administrative status management.
- **Unified CRM & Lead System**: Automatic lead creation from all interactions, manual client conversion, and detailed activity logging with full timestamps.
- **Visual Content Editor**: Integrated WYSIWYG editor allowing administrators to update site text visually via an iframe preview.
- **Admin Dashboard**: Real-time notifications, badge counts, and integrated WhatsApp communication for efficient clinic management.
- **Privacy & Compliance**: Israeli law-compliant cookies disclaimer and secure, session-based authentication.

## 🛠️ Technology Stack

- **Frontend**: React (Vite), TailwindCSS, shadcn/ui, TanStack Query, Framer Motion.
- **Backend**: Express.js (Node.js).
- **Database**: Neon Postgres with Drizzle ORM.
- **AI**: OpenAI via Replit AI Integrations.
- **Communication**: Nodemailer (Email), WhatsApp integration.

## 💻 Development Setup

```sh
# Install dependencies
npm install

# Start development server (Frontend on port 5000)
npm run dev

# Database schema sync
npm run db:push
```

## 📄 License

Proprietary - KeshevPlus ADHD Clinic.
