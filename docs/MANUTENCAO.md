# Maintenance Guide

This guide explains where to change OpsFlow Core safely without breaking frontend/backend contracts.

## Fast Architecture Map

- `frontend/src/App.jsx`: top-level routes and session orchestration
- `frontend/src/api/platformApi.js`: frontend API contract layer
- `frontend/src/locales/index.js`: active language switch (`ACTIVE_LANGUAGE_CODE`)
- `frontend/src/locales/en-us.json` and `frontend/src/locales/pt-br.json`: UI dictionaries
- `frontend/src/components/*`: reusable UI blocks
- `backend/src/routes/*`: endpoint declaration and middleware chain
- `backend/src/controllers/*`: HTTP parsing and response mapping
- `backend/src/http/*`: shared query parsing and actor/scope helpers
- `backend/src/services/*`: business logic and orchestration
- `backend/src/application/*`: use-cases and ports
- `backend/src/repositories/*`: Prisma data access
- `backend/src/repositories/queryFragments.js`: shared Prisma include/select fragments
- `backend/src/providers/*`: PDF, QR, gate provider internals

## Critical Flows

### Public Registration

1. Frontend form (`PublicAreaPage` + `CredenciadoForm`)
2. Frontend validation (`frontend/src/utils/validation.js`)
3. API call (`createPublicParticipant`)
4. Backend validation + service orchestration
5. Credential generation + QR + PDF

### Administrative Operations

- Participant CRUD
- Credential status/reissue
- Audit and access monitoring
- Internal users and scoped access

### Operator Check-In

- `POST /operator/check-in/validate`
- `GET /operator/history-basic`
- actor context is normalized in `backend/src/http/actorContext.js`

## Sensitive Coupling Points

### API Contract

Always update `frontend/src/api/platformApi.js` first when changing endpoints.
Avoid direct `fetch` inside random components.
Note: payload keys to backend remain legacy Portuguese in several endpoints (`nomeCompleto`, `aceitouLgpd`, etc.) for schema compatibility.

### Localization

- Add/change UI text only in locale files:
  - `frontend/src/locales/en-us.json`
  - `frontend/src/locales/pt-br.json`
- Change active language in a single place:
  - `frontend/src/locales/index.js` (`ACTIVE_LANGUAGE_CODE`)
- Keep key parity between locale files to avoid fallback key rendering.

### PDF Generation

Main file:
- `backend/src/providers/pdf/credentialPdfProvider.js`

If changing visual identity, sponsors, disclaimers or layout, do it here.

### Data Access Payloads

Shared query fragments:
- `backend/src/repositories/queryFragments.js`

If you change includes/selects, verify affected mappers and UI tables.

## Safe Change Recipes

### Add Registration Field

1. Add field in `frontend/src/constants/formConfig.js`
2. Render field in `CredenciadoForm`
3. Validate in `frontend/src/utils/validation.js`
4. Validate/sanitize in backend validator
5. Persist in Prisma schema (if needed)
6. Update mappers/responses

### Add Admin Filter

1. Add filter state in frontend page
2. Send parameter in API contract layer
3. Parse query in controller using `queryParsers.js`
4. Apply filter in repository

### Add/Change Role Behavior

1. Update enums and seed
2. Update auth middleware / role guards
3. Update UI visibility rules
4. Validate scoped access for commission/governance users

## Validation Checklist

- Frontend build succeeds
- Backend syntax check succeeds
- Public registration still creates credential
- Admin login and list pages still load
- Operator check-in still validates and logs attempts
- PDF generation still works
- Language switch works by changing only `ACTIVE_LANGUAGE_CODE`

## Documentation Hygiene

After architecture/setup changes, update:
- `README.md`
- `docs/MANUTENCAO.md`
- `.env.example` files
- `CONTRIBUTING.md` (if contributor flow changed)
