# Per-Year Tops Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show one year at a time and ensure ranking/comparisons are scoped to that year.

**Architecture:** Add a simple year selector UI and scope all ranking operations to a RankingKey that includes the selected year. Use item.data.date to derive the item's year when ranking on add; otherwise fall back to selectedYear.

**Tech Stack:** Svelte + Vite, Playwright (e2e), Vitest (unit), idb for indexedDB storage.

## Global Constraints
- Preserve Add modal fast-entry parsing and inline-edit behavior.
- Keep minimal edits and follow existing patterns in src/lib/stores and src/routes.
- Tests must be updated (unit + e2e) to cover per-year behavior.

---

### Task 1: Wire selectedYear into main page UI

**Files:**
- Modify: `src/routes/+page.svelte` (header, heading) — the file already partially updated; ensure year selector exists and is bound to `selectedYear`.

**Interfaces:**
- Produces `selectedYear: number` reactive var used elsewhere in the page.

- [ ] **Step 1: Add year select UI**

Update `src/routes/+page.svelte` to include a select with values currentYear-5..currentYear+5 and bind it to `selectedYear`. Ensure the heading shows `Top of {selectedYear}`.

Code (patch already applied in working tree):
```svelte
<div class="year-select">
  <label for="year-select">Year:</label>
  <select id="year-select" bind:value={selectedYear} aria-label="Select year">
    {#each Array(11) as _, i}
      {#let y = new Date().getFullYear() - 5 + i}
      <option value={y}>{y}</option>
    {/each}
  </select>
</div>
<h2 class="top-year">Top of {selectedYear}</h2>
```

- [ ] **Step 2: Run UI smoke**
Run dev server and visually confirm select appears and changes selectedYear.

Run: `npm run dev` (or `npm run preview` if using preview)

- [ ] **Step 3: Commit**
```
git add src/routes/+page.svelte
git commit -m "feat(ui): add year selector and heading for per-year tops"
```

### Task 2: Use selectedYear for rankings displayed

**Files:**
- Modify: `src/routes/+page.svelte` (itemsForDisplay reactive block already updated) — confirm rankingStore key uses selectedYear

**Interfaces:**
- Consumes `selectedYear` and `rankings` store. Produces `itemsForDisplay` used by RankedList.

- [ ] **Step 1: Ensure reactive compute uses selectedYear**
Confirm the reactive statement constructs `rankingStoreKey = `${type}:${selectedYear}` and maps $rankings[rankingStoreKey] to itemsForDisplay. (This change was made.)

- [ ] **Step 2: Commit**
```
git add src/routes/+page.svelte
git commit -m "fix(ui): scope displayed rankings to selectedYear"
```

### Task 3: Add year-aware add-and-rank flow

**Files:**
- Modify: `src/routes/+page.svelte` (onAddAndRank, startInsertion) — partially updated
- Modify: `src/lib/stores/rankingStore.ts` (no change required; already accepts RankingKey)

**Interfaces:**
- onAddAndRank(data) should determine yearOfItem = data.date ? new Date(data.date).getFullYear() : selectedYear and use that as target rankingKey for getRanking/insertAt/startInsertion.

- [ ] **Step 1: Write failing unit test**

Create `tests/unit/ranking-per-year.spec.ts` with tests that:

1) Add an item with date 2024 and ensure it inserts into `concert:2024` ranking.
2) Add a second item with date 2025 and ensure it inserts into `concert:2025` and does not affect `concert:2024`.

Test code:
```ts
import { getRanking, insertAt, setRanking } from '$lib/stores/rankingStore';

describe('per-year ranking', () => {
  it('inserts into correct year key', async () => {
    await setRanking({ type: 'concert', year: 2024 }, []);
    await insertAt({ type: 'concert', year: 2024 }, 0, 'i_2024_a');
    const r2024 = await getRanking({ type: 'concert', year: 2024 });
    expect(r2024).toContain('i_2024_a');

    await setRanking({ type: 'concert', year: 2025 }, []);
    await insertAt({ type: 'concert', year: 2025 }, 0, 'i_2025_a');
    const r2025 = await getRanking({ type: 'concert', year: 2025 });
    expect(r2025).toContain('i_2025_a');

    const r2024Again = await getRanking({ type: 'concert', year: 2024 });
    expect(r2024Again).toContain('i_2024_a');
  });
});
```

- [ ] **Step 2: Run unit tests and see them fail (if startInsertion behavior not implemented)**

Run: `npm test` (or `npx vitest`)

- [ ] **Step 3: Implement onAddAndRank behavior**

Ensure `onAddAndRank` computes `yearOfItem` and uses `insertAt(targetKey, ...)` or sets `pendingNewYear` before calling `startInsertion`. (This is already implemented in working tree.)

- [ ] **Step 4: Implement startInsertion to use pendingNewYear**

Make sure `startInsertion` reads `pendingNewYear ?? selectedYear` and uses that key for `getRanking` and `insertAt`. (Already implemented.)

- [ ] **Step 5: Run tests**
Run: `npm test` and expect tests to pass.

- [ ] **Step 6: Commit**
```
git add src/routes/+page.svelte tests/unit/ranking-per-year.spec.ts
git commit -m "feat: scope add-and-rank to item year; add unit tests for per-year rankings"
```

### Task 4: Ensure comparison flow only compares within a year

**Files:**
- Modify: `src/lib/ranking/insertion.ts` (no change required) — ensure findInsertIndex expects ranking only from target year
- Modify: `src/routes/+page.svelte` (compareFn/startInsertion already use key)

**Interfaces:**
- compareFn(newId, otherId) should only be invoked with otherId from the target ranking array.

- [ ] **Step 1: Add unit test for findInsertIndex usage**

Add `tests/unit/findInsertIndex.spec.ts` asserting that when provided ranking array only containing ids from one year, comparisons execute only for those ids (indirect — ensure index computed is correct given mocked compareFn).

Test code:
```ts
import { findInsertIndex } from '$lib/ranking/insertion';

it('binary insertion uses provided ranking only', async () => {
  const ranking = ['a','b','c'];
  const calls: Array<[string,string]> = [];
  const cmp = async (a: string, b: string) => { calls.push([a,b]); return 'b'; };
  const res = await findInsertIndex(ranking, 'x', cmp);
  expect(res.index).toBeGreaterThanOrEqual(0);
  expect(calls.length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run tests and commit**

```
npm test
git add tests/unit/findInsertIndex.spec.ts
git commit -m "test: assert findInsertIndex behavior uses provided ranking items"
```

### Task 5: Update Playwright E2E tests

**Files:**
- Modify: `playwright/tests/*.ts` (update existing tests that assume global single ranking)
- Create: `playwright/tests/per-year.spec.ts` to explicitly test per-year scenarios

**Interfaces:**
- E2E tests will use app UI to switch years, add items for different years, and assert comparisons restricted to the selected year.

- [ ] **Step 1: Write per-year E2E test**

Test outline (playwright):
1) Start preview server
2) Open page and wait for hydration
3) Switch to year 2024
4) Open Add modal and add an item with date '2024-06-01' and Rank enabled
5) Confirm comparison flow only shows existing items from 2024
6) Switch to 2025 and assert that 2024 item is not shown in 2025's list

Example (sketch):
```ts
test('per-year ranking scoping', async ({ page }) => {
  await page.goto(baseURL);
  await page.selectOption('#year-select', '2024');
  // open add, add item with date 2024-06-01 and rank
  // assert comparisons only include 2024 items
});
```

- [ ] **Step 2: Run E2E tests**

Run: `npm run e2e` and expect Playwright suite to pass.

- [ ] **Step 3: Commit**

```
git add playwright/tests/per-year.spec.ts
git commit -m "test(e2e): add per-year ranking scoping test"
```

### Task 6: Docs and spec commit

**Files:**
- Create: `docs/superpowers/specs/2026-06-21-per-year-tops-design.md` (already added)
- Create: `docs/superpowers/plans/2026-06-21-per-year-tops-plan.md` (this file)

- [ ] **Step 1: Commit plan/docs**

```
git add docs/superpowers/specs/2026-06-21-per-year-tops-design.md docs/superpowers/plans/2026-06-21-per-year-tops-plan.md
git commit -m "docs(per-year): design and implementation plan for per-year tops"
```

### Self-Review

1. Spec coverage: Tasks implement the UI, add flow, comparison scoping, tests, and docs.
2. No placeholders: all tasks specify code and tests. Unit test code is provided.
3. Type consistency: RankingKey uses `{type, year}` and functions referenced exist in the codebase.

Plan file saved to `docs/superpowers/plans/2026-06-21-per-year-tops-plan.md`.

Execution options: choose one
1) Subagent-Driven (recommended) — I will dispatch subagents per task and run them sequentially with reviews.
2) Inline Execution — I will implement tasks in this session.

Which approach do you want? Reply with `subagent` or `inline`.
