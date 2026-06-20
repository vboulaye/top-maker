Top Maker

Quick dev/test notes

- Run the app in development: `npm run dev`
- Run unit tests (Vitest): `npm test` — this runs project unit tests only. The test runner is configured to ignore the `playwright/` folder and `node_modules/`.
- Run end-to-end Playwright tests: `npm run playwright` (requires a running preview/dev server). Playwright tests live in the `playwright/` folder and are run separately from unit tests.

If you want Vitest to only look at specific folders, update `vitest.config.ts` to use an explicit `include` pattern instead of the current `exclude` list.

Contributing
- Open a PR for any change and ensure unit tests pass. Run Playwright E2E tests locally when changing flows that affect the UI.
