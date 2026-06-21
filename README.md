Top Maker

Quick dev/test notes

- Run the app in development: `npm run dev`
- Run unit tests (Vitest): `npm test` — this runs project unit tests only. The test runner is configured to ignore the `playwright/` folder and `node_modules/`.
- Run end-to-end Playwright tests locally (recommended helper):

  1. Start Playwright helper which starts a dev server and runs the tests: `npm run e2e`.
     - The helper tries to start the dev server on port 4173 by default and will pick another free port if 4173 is taken.
     - The helper sets `VITE_E2E=1` so the app exposes small test helpers used by the Playwright suite.

  2. Or run tests against an already-running server:
     - Start the app manually: `npm run dev` (pick a port, e.g. 5173).
     - Run Playwright and point it to your server: `PW_BASE_URL=http://localhost:5173 npx playwright test --config=playwright.config.ts`

Notes on environment variables
- `VITE_E2E=1` — when set, the app exposes test-only helpers (used by the Playwright tests). The e2e helper already sets this for you.
- `PREVIEW_PORT` — the run-playwright helper exports the chosen port to `PREVIEW_PORT` so tests know which port the helper started on.
- `PW_BASE_URL` — you can set this to override the base URL used by Playwright tests.

CI
- The repository's GitHub Actions workflow already sets `VITE_E2E=1` in the preview and test steps so Playwright tests run in CI.

If you want Vitest to only look at specific folders, update `vitest.config.ts` to use an explicit `include` pattern instead of the current `exclude` list.

Contributing
- Open a PR for any change and ensure unit tests pass. Run Playwright E2E tests locally when changing flows that affect the UI.
