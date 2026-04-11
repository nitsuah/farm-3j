# TASKS

Last Updated: 2026-04-03 (pmo/q2-2026-planning)

## Todo

### P0 - Blockers

- [x] Fix the Docker dependency stage so `patches/` is available before `pnpm install`.
  - Priority: P0
  - Acceptance Criteria: `docker build` succeeds from a clean checkout without manual file copies.
  - Completed: 2026-03-27
  - Evidence: local `docker build -t farm-devops-check .` succeeds from repo root.

- [x] Add a CI Docker smoke test.
  - Priority: P0
  - Acceptance Criteria: CI catches Docker build and startup regressions.
  - Completed: 2026-03-27
  - Evidence: `.github/workflows/docker-smoke.yml` builds the image, starts the container, and verifies HTTP readiness.

### P1 - Near-Term

- [ ] Complete Farm Tycoon phase 2 core systems.
  - Priority: P1
  - Context: animal needs, feeding, and fence tooling still need to finish the playable loop. This is the Q2 gate before shifting to commercial product work.
  - Acceptance Criteria: animal lifecycle (needs, hunger, happiness), feeding mechanics, fence placement, and save/load are all functional and covered by deterministic tests; full loop validated in Docker.

- [ ] Refresh README and deployment notes with actual release path.
  - Priority: P1
  - Context: Docker build is fixed but docs still lag behind the actual state.
  - Acceptance Criteria: README reflects Docker-first usage, correct env setup, and live vs. in-progress feature status.

### P2 - Growth Backlog

- [ ] Build content and discovery surfaces.
  - Priority: P2
  - Context: gallery, blog or news, SEO, and accessibility work still trail the playable product work.
  - Acceptance Criteria: Lighthouse and accessibility baselines are tracked and improved release-over-release.

- [ ] Plan and implement ecommerce phase 1.
  - Priority: P2
  - Acceptance Criteria: product catalog and checkout flow are complete with a payment provider.

## In Progress

## Done

- [x] Project foundation, linting, and CI baseline.
- [x] Farm Tycoon phase 1 MVP.
- [x] Farm Tycoon phase 2a-2f isometric foundation.
- [x] Ship the contact-to-market conversion path.
  - Completed: 2026-04-03
  - Evidence: `components/ContactModal.tsx`, `app/api/contact/route.ts`, `components/ContactModal.test.tsx`
