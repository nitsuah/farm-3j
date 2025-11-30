# Project Metrics: farm-3j

This document outlines key metrics for the `farm-3j` project, providing a snapshot of its current state and targets for improvement.

## Metrics Table

| Metric                         | Current | Target    | Status      |
| ------------------------------ | ------- | --------- | ----------- |
| **Testing**                    |         |           |             |
| Test Coverage                  | 0%      | 80%       | Failing     |
| Number of Unit Tests           | 0       | 100       | Failing     |
| E2E Test Pass Rate             | TBD     | 100%      | TBD         |
| **Code Quality**               |         |           |             |
| Lines of Code (LOC)            | TBD     | Maintain  | TBD         |
| Cyclomatic Complexity (avg)  | TBD     | < 5       | TBD         |
| Number of ESLint Violations    | TBD     | 0         | TBD         |
| Number of Security Vulnerabilities (npm audit) | TBD     | 0         | TBD         |
| **Performance**                |         |           |             |
| Initial Load Time (Homepage)   | TBD     | < 3s      | TBD         |
| **Build & Deployment**        |         |           |             |
| CI/CD Build Success Rate       | TBD     | 99%       | TBD         |
| Deployment Frequency           | TBD     | Weekly    | TBD         |
| Time to Deploy (avg)           | TBD     | < 15 mins | TBD         |

## How to Update

This section provides instructions on how to update the metrics listed above.

*   **Test Coverage & Number of Unit Tests:**

    1.  Run tests with coverage: `npm run test:coverage` (or similar command defined in `package.json`).
    2.  Analyze the output from the command line or the generated coverage report (e.g., `coverage/lcov-report/index.html`).
    3.  Update the "Test Coverage" and "Number of Unit Tests" values in the table.

*   **E2E Test Pass Rate:**

    1.  Run E2E tests: `npm run test:e2e` (or similar command).
    2.  Analyze the test results to determine the pass rate.
    3.  Update the "E2E Test Pass Rate" in the table.

*   **Lines of Code (LOC):**

    1.  Use a tool like `tokei` or `loc` to count lines of code: `npx tokei .`
    2.  Update the "Lines of Code (LOC)" value in the table.

*   **Cyclomatic Complexity:**

    1.  Use a tool like `plato` or `escomplex` to analyze code complexity: `npm install -g plato && plato -r src`
    2.  Analyze the generated report (usually in the `report` directory) to find the average cyclomatic complexity.
    3.  Update the "Cyclomatic Complexity (avg)" value in the table.

*   **Number of ESLint Violations:**

    1.  Run ESLint: `npm run lint` (or similar command).
    2.  Count the number of violations reported.
    3.  Update the "Number of ESLint Violations" value in the table.

*   **Number of Security Vulnerabilities:**

    1.  Run `npm audit`.
    2.  Count the number of vulnerabilities reported (especially high and critical).
    3.  Update the "Number of Security Vulnerabilities" value in the table.

*   **Initial Load Time (Homepage):**

    1.  Use browser developer tools (Network tab) or a website speed testing tool (e.g., PageSpeed Insights) to measure the initial load time of the homepage (`https://v0-farm-contact-website.vercel.app`).
    2.  Update the "Initial Load Time (Homepage)" value in the table.

*   **CI/CD Build Success Rate:**

    1.  Check the history of builds in your CI/CD system (e.g., GitHub Actions, CircleCI).
    2.  Calculate the success rate over a reasonable period (e.g., the last month).
    3.  Update the "CI/CD Build Success Rate" value in the table.

*   **Deployment Frequency:**

    1.  Track deployments over a period (e.g., one month).
    2.  Calculate how often deployments occur (e.g., weekly, daily).
    3.  Update the "Deployment Frequency" value in the table.

*   **Time to Deploy (avg):**

    1.  Record the duration of several deployments in your CI/CD system.
    2.  Calculate the average deployment time.
    3.  Update the "Time to Deploy (avg)" value in the table.