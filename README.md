# Keshevplus Monorepo

This repository contains the codebase for Keshevplus, organized as a monorepo with separate client and server applications.

## Structure

- `/client` — Frontend (Vite + TypeScript)
- `/server` — Backend API (Node.js + Express)

---

## Server API Documentation

The backend server is located in `/server/server.js` and exposes the following main routes:

### Auth Routes
- `POST /api/auth/login` — Authenticate user
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/logout` — Log out the user

### Admin Routes (protected)
- `GET /api/admin/...` — Admin-only endpoints (requires authentication)

### Leads Routes
- `GET /api/leads` — Get all leads
- `POST /api/leads` — Submit a new lead

### Neon Leads Routes
- `GET /api/neon/leads` — Get Neon leads
- `POST /api/neon/leads` — Submit a Neon lead

### Test Route
- `GET /api/test` — Health check/test endpoint

---

## Development

- Install dependencies: `pnpm install` (monorepo)
- Start client: `pnpm --filter ./client dev`
- Start server: `pnpm --filter ./server dev`

---

## Deployment

- See Vercel configuration for monorepo deployment (client and server as separate projects)

---

## License

ISC
