# TASKS

## P0 - Blockers

- [ ] Fix Docker dependency stage to include `patches/` before `pnpm install`.
  - Priority: P0
  - Confidence: High
  - Impact: Current Docker build fails and blocks containerized deployment.
  - Acceptance Criteria: `docker build` succeeds from clean checkout without manual file copies.

- [ ] Add CI Docker smoke test (`docker build` + startup probe).
  - Priority: P0
  - Confidence: High
  - Impact: Prevents future regressions in container readiness.
  - Acceptance Criteria: CI fails on Docker build/runtime breakage and passes on healthy image.

## P1 - Near-Term

- [ ] Complete Farm Tycoon phase 2 core systems (animal needs, feeding, fence tooling).
  - Priority: P1
  - Confidence: Medium
  - Impact: Moves playable simulation from foundation to feature-complete loop.
  - Acceptance Criteria: Systems are available in UI and covered by deterministic tests.

- [ ] Ship contact-to-market conversion path.
  - Priority: P1
  - Confidence: Medium
  - Impact: Converts site traffic into actionable sales leads.
  - Acceptance Criteria: Validated form submission path with confirmation UX and error handling.

## P2 - Growth Backlog

- [ ] Build content and discovery surfaces (gallery, blog/news, SEO/accessibility hardening).
  - Priority: P2
  - Confidence: Medium
  - Impact: Increases acquisition and long-term discoverability.
  - Acceptance Criteria: Lighthouse/accessibility baseline tracked and improved release-over-release.

- [ ] Plan and implement ecommerce phase 1.
  - Priority: P2
  - Confidence: Medium
  - Impact: Enables direct revenue capture.
  - Acceptance Criteria: Product catalog + checkout path complete with payment provider integration.

## Done

- [x] Project foundation, linting, and CI baseline.
- [x] Farm Tycoon phase 1 MVP.
- [x] Farm Tycoon phase 2a-2f isometric foundation.
