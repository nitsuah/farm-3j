# TASKS

Last Updated: 2026-03-27

## Todo

### P0 - Blockers

- [ ] Fix the Docker dependency stage so `patches/` is available before `pnpm install`.
  - Priority: P0
  - Acceptance Criteria: `docker build` succeeds from a clean checkout without manual file copies.

- [ ] Add a CI Docker smoke test.
  - Priority: P0
  - Acceptance Criteria: CI catches Docker build and startup regressions.

### P1 - Near-Term

- [ ] Complete Farm Tycoon phase 2 core systems.
  - Priority: P1
  - Context: animal needs, feeding, and fence tooling still need to finish the playable loop.
  - Acceptance Criteria: the systems are available in the UI and covered by deterministic tests.

- [ ] Ship the contact-to-market conversion path.
  - Priority: P1
  - Acceptance Criteria: the site has a validated form submission path with confirmation and error handling.

### P2 - Growth Backlog

- [ ] Build content and discovery surfaces.
  - Priority: P2
  - Context: gallery, blog or news, SEO, and accessibility work still trail the playable product work.
  - Acceptance Criteria: Lighthouse and accessibility baselines are tracked and improved release over release.

- [ ] Plan and implement ecommerce phase 1.
  - Priority: P2
  - Acceptance Criteria: product catalog and checkout flow are complete with a payment provider.

## In Progress

## Done

- [x] Project foundation, linting, and CI baseline.
- [x] Farm Tycoon phase 1 MVP.
- [x] Farm Tycoon phase 2a-2f isometric foundation.
