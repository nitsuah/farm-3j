# Metrics

## Core Metrics

| Metric        | Value | Notes                                                                                                                                                        |
| ------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Code Coverage | TBD (re-verify) | Coverage collection failed to attribute output in the Docker/bind-mount run on 2026-09-02 (v8 provider produced an empty `coverage-final.json`); repo-wide thresholds are enforced at 28% lines/statements, 20% functions, 17% branches per `config/vitest.config.ts`. Needs a clean re-run to get a trustworthy percentage. |
| Test Time     | ~35s  | 440 tests across 21 suites confirmed passing (Docker run 2026-09-02)                                                                                         |
| Bundle Size   | TBD   | Not measured yet                                                                                                                                             |
| Test Files    | 21    | lib/farm (utils, gameLogic, farmReducer, spawner, isometric, terrain, structures, notifications, techTree), lib/api-types, components/ContactModal, components/rts/hooks (spawnHelpers, towerHelpers, mapSelectors, tickFunctions, tickEnemyAI, domainHooks) and more |
| Test Cases    | 440   | All tests passing - game logic, terrain, state management, notification, spawn/tower math, map selectors, tick functions, domain hooks, contact modal coverage |

## Health

| Metric        | Value      | Notes                                                      |
| ------------- | ---------- | ---------------------------------------------------------- |
| Open Issues   | TBD        | GitHub issues                                              |
| PR Turnaround | TBD        | Typical merge time                                         |
| Skipped Tests | 0          | All tests passing                                          |
| Health Score  | TBD        | Overall health score                                       |
| Last Updated  | 2026-09-02 | Tests confirmed passing (440/440); coverage figure needs re-verification (see Code Coverage note above) |

<!--
AGENT INSTRUCTIONS:
1. Update these metrics regularly (e.g., before a merge/last commit weekly or after major releases).
2. Use automated tools to fetch values where possible.
3. Keep this file focused on actual project metrics, not feature documentation.
-->
