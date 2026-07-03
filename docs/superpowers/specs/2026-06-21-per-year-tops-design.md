Title: Per-Year Tops Design
Date: 2026-06-21

Summary
 - Show one year at a time (user-selected) and ensure all ranking and comparison operations are scoped to that year. Rankings are stored and keyed by `${type}:${year}` so different years do not interfere.

Goals
 - Allow users to view and manage a single year's "Top" list at a time.
 - Ensure comparisons and ranking insertions only compare items that belong to the same year.
 - Minimize UI disruption and migration surface.
 - Keep export/import and OneDrive snapshot formats backward-compatible (use same keys).

Constraints
 - Small, incremental change preferred.
 - Preserve current Add modal fast-entry format and inline-edit flows.
 - Tests updated to assert per-year scoping.

Approaches (options)
1) Minimal UI + Scoped Keys (Recommended)
  - Add a simple year selector in the header (select box pre-populated with a +/-5 year range around current year).
  - Derive an items ranking year from its data.date (YYYY) when available, otherwise fall back to selectedYear on add.
  - Store rankings by key `${type}:${year}` (already present in codebase); all ranking operations use that key.
  - When adding, use the items year as the target ranking key. Do not auto-switch the selectedYear UI when an item for a different year is added.
  - Comparison modal and binary insertion logic remain identical but operate on the ranking for the selected/target year.
  - Tests: update e2e and unit tests to assert that comparisons and insertions don't cross years.

  Trade-offs: minimal surface area, low risk, easy tests. UX: users must switch year manually to see/edit other years (explicit is good).

2) Year Groups View + Archive
  - Display multiple year groups on the main page (accordion/list), showing each years top (or top N) simultaneously.
  - Ranking store unchanged; UI aggregates multiple keys.
  - Comparison and ranking actions limited to within a group via UI guards.

  Trade-offs: more UI complexity, higher layout work, potential performance impact when many years exist. Better for users who want archive at-a-glance.

3) Auto-Switch on Add + Introductory UX
  - Keep UI single-year selector but when an add creates an item for a different year, automatically switch selectedYear to that item's year and open insertion flow for clarity.
  - Expose a toggle in settings to control auto-switch behavior.

  Trade-offs: potential surprise if user intended to add to current year; more preference surface to manage.

Recommendation
 - Use Approach 1 (Minimal UI + Scoped Keys). It is the lowest-risk option, aligns with the user's choice to show one year at a time, and preserves current workflows. We can consider Approach 3 later as an optional UX improvement.

Design Details

1) Data model
 - RankingKey: { type: string, year: number }
 - Rankings stored under keyFor(key) => `${type}:${year}` (existing behavior). No schema change required.
 - Items: keep existing shape. The event year is determined by parsing item.data.date if available; otherwise the selectedYear is used at add time.

2) UI
 - Header: add a small Year selector UI next to the title (select element). Range: currentYear-5 .. currentYear+5. The control binds to a `selectedYear` state.
 - Title area shows "Top of {selectedYear}".
 - Add flow: when user adds with "Rank" selected, the items year is derived from the provided date (YYYY). The insertion/comparison flow operates on the ranking for that year. After add, the UI does not auto-switch selectedYear.
 - If user uses "Add without ranking", item is appended to the ranking for the currently selectedYear (legacy behavior preserved).

3) Stores / Logic
 - rankingStore.getRanking, setRanking, insertAt already accept a RankingKey and persist under keyFor(key). Ensure `keyFor` uses the year strictly (no 'all' fallback for ranked lists). If any existing code expects a default key without year, update those call sites to pass selectedYear explicitly.
 - Comparison/Insertion: when starting an insertion for a newly-added item, use the item's year (derived) as the target key. The binary search (`findInsertIndex`) and `compareFn` remain unchanged but are executed against that year's ranking list.
 - Compare guard: in compareFn UI, ensure that when presenting item pairs both items belong to the same year key. The insertion algorithm already selects which ranking to use; comparisons only compare newId to an item from that ranking.

4) Tests
 - Unit tests for rankingStore: verify getRanking/insertAt work for keys like `concert:2025` and do not affect `concert:2024`.
 - Unit test for findInsertIndex / compareFn behavior remains valid; add a test that findInsertIndex using compareFn doesn't compare across years (i.e., the ranking passed must only contain ids from that year).
 - E2E (Playwright): seed items across two different years; add a new item for year A and assert that comparisons appear only against items from year A. Switch selectedYear and assert the top changes. Test adding without ranking appends to selectedYear.

5) Backwards compatibility and migration
 - The rankings export format already keys by `${type}:${year}`; preserve this format so existing exports/imports remain compatible. If there are any existing keys without an explicit year (e.g., `concert:all`), treat them as legacy and leave them unchanged — but prefer explicit per-year keys going forward.

6) Edge cases
 - Items without a date: when user requests to Rank on add, use selectedYear as the ranking target. If user later edits the item to add a date and the year changes, do NOT automatically move the item between ranking lists; moving should be a deliberate action (future work).
 - When item.date is invalid or unparsable, show a validation error in the Add modal and fall back to selectedYear only if user chooses.
 - If selectedYear has no ranking yet, inserting first item creates the ranking key with that ID.

7) Accessibility
 - The Year select is a native <select> with label; keyboard-accessible. Screen reader announces "Top of {selectedYear}" heading.

8) Tasks (implementation plan outline)
 - Update UI: add Year selector and heading (small Svelte change). Wire selectedYear reactive var.
 - Update add flow: derive year from date when ranking; pass target key to getRanking/insertAt/startInsertion.
 - Ensure startInsertion uses pendingNewYear when provided, otherwise selectedYear.
 - Update tests: unit + e2e. Add seeding for multi-year cases.
 - Update docs: add short note to docs/onedrive-setup.md and README about per-year view.

Next Step
 - Please review this design. If it looks good, reply "approve" and I will write a short implementation plan and proceed with the code changes and tests.
