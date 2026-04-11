# Handoff: Contact Submission Path (2026-04-03)

## Summary

Implemented a validated contact submission path from the existing About-page modal through a backend API route, including success and error feedback states.

## Changes

- Wired `components/ContactModal.tsx` to submit form data to `POST /api/contact`.
- Added client-side validation and user feedback for:
  - invalid input,
  - in-flight submission,
  - API failure,
  - successful submission.
- Added `app/api/contact/route.ts` with server-side zod validation.
- Added optional webhook forwarding via `FARM_CONTACT_WEBHOOK_URL`.
- Added focused tests in `components/ContactModal.test.tsx` for success, validation error, and API error paths.

## Validation

- Docker-focused Vitest run:
  - `docker run --rm -v ${PWD}:/app -v farm-node-modules:/app/node_modules -v farm-pnpm-store:/pnpm/store -w /app node:22-alpine sh -lc "corepack enable; corepack prepare pnpm@9.0.0 --activate; pnpm config set store-dir /pnpm/store; pnpm install --frozen-lockfile --reporter=silent; pnpm vitest run components/ContactModal.test.tsx"`

## Notes

- When webhook delivery is not configured, the API returns success with `delivery: local-log` so the contact UX remains fully testable in local/dev environments.
