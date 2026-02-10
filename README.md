# Kiwi Challenge — Rewards/Cashback App

Full‑stack application built with **GitHub Spec‑Kit** that mirrors the Figma flow for a rewards/cashback experience: balance, transaction history, and withdrawal to a bank account.

## Technical approach (summary)
- **Spec‑Kit** used to define scope, contracts, data, and tasks (`/specs/001-rewards-cashback-app`).
- **Frontend** in React + Vite + Tailwind, with reusable components and centralized state via context.
- **Backend** in Node.js + Express with **SQLite** for local persistence, validations via `express-validator`, and a layered architecture.
- **Testing** with Vitest (frontend and backend).

## Architectural decisions
- **FE/BE separation**: two independent packages (`/frontend`, `/backend`).
- **Layered backend**: `api/` (routes + validation), `services/` (business logic), `models/` (data access), `db/` (migrations/seed). This improves testability and scalability.
- **Local persistence**: SQLite reduces setup friction and supports fast end‑to‑end evaluation.
- **Env‑based config**: URLs and ports are configurable.

## Requirements
- Node.js **18+**
- pnpm

## Setup
> Run these steps from the repo root.

### 1) Backend
```bash
cd backend
pnpm install
cp .env.example .env
pnpm run db:init
pnpm run dev
```
The backend runs on **http://localhost:3000** by default.

### 2) Frontend
```bash
cd ../frontend
pnpm install
cp .env.example .env
pnpm run dev
```
The frontend runs on **http://localhost:5173** and consumes the API at `http://localhost:3000/api` (configurable in `.env`).

## Tests
### Backend
```bash
cd backend
pnpm run test
```
### Frontend
```bash
cd frontend
pnpm run test
```

## Project structure
```
kiwi-challenge-1/
  backend/
  frontend/
  specs/001-rewards-cashback-app/
```

## Spec‑Kit artifacts
Main artifacts are located at:
- `specs/001-rewards-cashback-app/spec.md`
- `specs/001-rewards-cashback-app/plan.md`
- `specs/001-rewards-cashback-app/tasks.md`
- `specs/001-rewards-cashback-app/data-model.md`

## Assumptions
- The flow is **single‑user** (no authentication) to focus on the core experience.
- Local persistence with SQLite and seeded data for quick testing.
- API base URL is configured via the frontend `.env`.

## Useful scripts
### Backend
- `pnpm run dev` — start API
- `pnpm run db:init` — migrate + seed
- `pnpm run test` — run tests

### Frontend
- `pnpm run dev` — start app
- `pnpm run build` — production build
- `pnpm run test` — run tests