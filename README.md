# OpsFlow Core

OpsFlow Core is an open source platform for credentialing, administrative operations, and access control workflows.

It can be used as a base for:
- events and visitor management
- internal access operations
- administrative workflow control
- operational audit and observability

## Key Features

- Public participant registration
- Credential issuance with QR code and PDF
- Admin dashboard with CRUD and status controls
- Operator console for QR check-in validation
- Audit logs and access logs
- Analytics and fraud/anomaly insights
- Internal user management with role-based permissions
- Backup export and status monitoring

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL + Prisma
- Documents: PDFKit + QRCode
- Container runtime: Docker Compose

## Repository Structure

```text
opsflow-core/
|-- frontend/
|   `-- src/
|       |-- api/
|       |-- components/
|       |-- constants/
|       |-- locales/
|       |-- pages/
|       |-- utils/
|       `-- App.jsx
|-- backend/
|   |-- prisma/
|   `-- src/
|       |-- adapters/
|       |-- application/
|       |-- config/
|       |-- controllers/
|       |-- domain/
|       |-- http/
|       |-- middlewares/
|       |-- providers/
|       |-- repositories/
|       |-- routes/
|       `-- services/
|-- docs/
|   `-- MANUTENCAO.md
|-- docker-compose.yml
|-- CONTRIBUTING.md
`-- LICENSE
```

## Quick Start (Local)

### 1. Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+

### 2. Configure Environment Variables

Copy templates:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate:dev -- --name init
npm run seed
npm run dev
```

Backend will run at `http://localhost:3001`.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at `http://localhost:5173`.

## Quick Start (Docker)

```bash
docker compose up --build
```

Services:
- frontend: `http://localhost:5173`
- backend: `http://localhost:3001`
- postgres: `localhost:5432`

## Environment Variables

### Backend (`backend/.env`)

- `DATABASE_URL`
- `PORT`
- `JWT_SECRET` (required in production, minimum 32 chars)
- `JWT_EXPIRES_IN`
- `CORS_ORIGINS`
- `AUTH_COOKIE_SECURE`
- `AUTH_COOKIE_SAMESITE`
- `TRUST_PROXY`
- `JSON_BODY_LIMIT`
- `AUTH_RATE_LIMIT_*`
- `PUBLIC_WRITE_RATE_LIMIT_*`
- `CHECKIN_RATE_LIMIT_*`
- seed users (`ADMIN_EMAIL`, `MASTER_EMAIL`, etc.)

### Frontend (`frontend/.env`)

- `VITE_API_URL`

## Architecture Notes

- `routes`: endpoint declarations and middleware chaining
- `controllers`: HTTP adaptation and response handling
- `http`: shared helpers for query parsing and actor context
- `services`: business rules and orchestration
- `repositories`: Prisma data access
- `providers/adapters`: external integration boundaries (PDF, QR, gate)
- `application`: use-cases and input/output ports

## How to Customize

- Product texts and labels:
  - `frontend/src/locales/en-us.json`
  - `frontend/src/locales/pt-br.json`
- Active UI language:
  - `frontend/src/locales/index.js`
  - change `ACTIVE_LANGUAGE_CODE` to `"en-us"` or `"pt-br"`
- Form fields and category model:
  - `frontend/src/constants/formConfig.js`
- PDF layout and branding:
  - `backend/src/providers/pdf/credentialPdfProvider.js`
- Seed data:
  - `backend/prisma/seed.js`
- Security and session behavior:
  - `backend/src/config/auth.js`
  - `backend/src/middlewares/*`

## API Overview

### Public

- `POST /credenciados`
- `GET /credenciais/:id/pdf`
- `GET /credenciais/:id/qrcode`
- `GET /health`

### Auth

- `POST /auth/login`
- `POST /auth/operator/login`
- `POST /auth/logout`
- `GET /auth/me`

### Admin / Operator

Includes participant management, credential lifecycle, events, audit, access logs, reports, check-in, analytics, backup, and internal users.

## Known Limitations

- Gate integration is currently mocked.
- There is no automated test suite yet.
- Some domain enums and payload keys are still Portuguese for compatibility with current Prisma schema and existing endpoint contracts.

## Localization (Simple i18n)

- Dictionaries:
  - `frontend/src/locales/en-us.json`
  - `frontend/src/locales/pt-br.json`
- Active language is controlled by one centralized variable:
  - `frontend/src/locales/index.js`
  - `ACTIVE_LANGUAGE_CODE = "en-us"` (default)
- To switch language:
  1. Open `frontend/src/locales/index.js`
  2. Change `ACTIVE_LANGUAGE_CODE` to `pt-br` or `en-us`
- To add a new language:
  1. Create a new locale file in `frontend/src/locales/`
  2. Register it in `dictionaryByLanguage` inside `frontend/src/locales/index.js`
  3. Keep key parity with `en-us.json`

## Roadmap (Suggested)

- Add automated unit/integration tests
- Add API docs (OpenAPI/Swagger)
- Add CI workflow for lint/build/test/security checks
- Add pluggable gate provider implementations

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).
