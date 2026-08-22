# Metrics

## Core Metrics

| Metric        | Value | Notes                                                                                                                               |
| ------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Code Coverage | 97%   | lib/farm/ coverage: 96.71% statements, 90.07% branches, 100% functions, 96.55% lines. Excludes UI components and app/. Target: 80%. |
| Build Time    | ~4.1s | Test execution with coverage (272 tests)                                                                                            |
| Bundle Size   | TBD   | Not measured yet                                                                                                                    |
| Test Files    | 13    | utils, gameLogic, farmReducer, spawner, isometric, terrain, structures, notifications, spawnHelpers, towerHelpers, mapSelectors, tickFunctions, ContactModal |
| Test Cases    | 272   | All tests passing - game logic, terrain, state management, notification, spawn/tower math, map selectors, tick functions, contact modal coverage |

## Health

| Metric        | Value      | Notes                |
| ------------- | ---------- | -------------------- |
| Open Issues   | TBD        | GitHub issues        |
| PR Turnaround | TBD        | Typical merge time   |
| Skipped Tests | 0          | All tests passing    |
| Health Score  | TBD        | Overall health score |
| Last Updated  | 2026-08-22 | Last audit date      |

<!--
AGENT INSTRUCTIONS:
1. Update these metrics regularly (e.g., before a merge/last commit weekly or after major releases).
2. Use automated tools to fetch values where possible.
3. Keep this file focused on actual project metrics, not feature documentation.
-->
