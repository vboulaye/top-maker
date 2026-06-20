# File Backup And Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add reliable local backup and restore for the ranking app via JSON export/import everywhere, plus File System Access API open/save when the browser supports it.

**Architecture:** Keep IndexedDB-backed stores as the working state. Add a storage snapshot layer that can serialize the current app state into a versioned JSON document and restore it back into the stores. Add a file integration layer on top of snapshots: export/import uses browser download/upload, while file open/save uses a retained File System Access API handle when available.

**Tech Stack:** SvelteKit, TypeScript, Svelte stores, IndexedDB via `idb`, browser File System Access API, Vitest.

## Global Constraints

- Use component-scoped CSS only (no Tailwind).
- Persist working state to IndexedDB.
- Export/Import JSON must work even when File System Access API is unavailable.
- File System Access API support must be optional and feature-detected.
- Keep the current item/ranking/comparison stores as the source of truth during app runtime.
- Follow the storage design in `docs/superpowers/specs/2026-06-20-weapp-top-concerts-design.md`.

---

## File Structure

- Create: `src/lib/storage/snapshot.ts`
  - Owns snapshot schema, serialization, parsing, and validation.
- Create: `src/lib/storage/fileAccess.ts`
  - Owns browser file-handle detection, open/save picker integration, and file writes.
- Create: `src/lib/stores/storageStore.ts`
  - Owns UI-facing storage state: current file handle availability, last save state, import/export helpers.
- Modify: `src/lib/stores/itemsStore.ts`
  - Add bulk replace/export helpers for full snapshot restore.
- Modify: `src/lib/stores/rankingStore.ts`
  - Add bulk replace/export helpers for full snapshot restore.
- Modify: `src/lib/stores/comparisonsStore.ts`
  - Add bulk replace/export helpers for full snapshot restore.
- Modify: `src/routes/+page.svelte`
  - Add backup/open/save/import controls and wire them to storage actions.
- Create: `src/lib/storage/__tests__/snapshot.test.ts`
  - Validates snapshot serialization and parsing.
- Create: `src/lib/storage/__tests__/fileAccess.test.ts`
  - Validates feature detection and basic file helpers with mocked browser APIs.

### Task 1: Add Snapshot Schema And Serialization

**Files:**
- Create: `src/lib/storage/snapshot.ts`
- Test: `src/lib/storage/__tests__/snapshot.test.ts`

**Interfaces:**
- Produces: `type AppSnapshot`, `buildSnapshot(input): AppSnapshot`, `parseSnapshot(json: string): AppSnapshot`
- Consumes later: `snapshotToJson(snapshot): string`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { buildSnapshot, parseSnapshot } from '../snapshot';

describe('snapshot', () => {
  it('serializes and parses app state', () => {
    const snapshot = buildSnapshot({
      items: {
        a: { id: 'a', type: 'concert', createdAt: '2026-06-20T00:00:00.000Z', data: { artist: 'A', date: '2026-06-20', venue: 'Bercy' } }
      },
      rankings: { 'concert:2026': ['a'] },
      comparisons: []
    });

    const parsed = parseSnapshot(JSON.stringify(snapshot));
    expect(parsed.version).toBe(1);
    expect(parsed.items.a.data.artist).toBe('A');
    expect(parsed.rankings['concert:2026']).toEqual(['a']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- --run src/lib/storage/__tests__/snapshot.test.ts`
Expected: FAIL with module or export not found for `snapshot.ts`

- [ ] **Step 3: Write minimal implementation**

```ts
import type { ComparisonEntry, Item } from '$lib/types';

export type AppSnapshot = {
  version: 1;
  exportedAt: string;
  items: Record<string, Item>;
  rankings: Record<string, string[]>;
  comparisons: ComparisonEntry[];
};

export function buildSnapshot(input: {
  items: Record<string, Item>;
  rankings: Record<string, string[]>;
  comparisons: ComparisonEntry[];
}): AppSnapshot {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    items: input.items,
    rankings: input.rankings,
    comparisons: input.comparisons
  };
}

export function parseSnapshot(json: string): AppSnapshot {
  const parsed = JSON.parse(json);

  if (parsed.version !== 1) {
    throw new Error('Unsupported snapshot version');
  }

  if (!parsed.items || !parsed.rankings || !Array.isArray(parsed.comparisons)) {
    throw new Error('Invalid snapshot format');
  }

  return parsed as AppSnapshot;
}

export function snapshotToJson(snapshot: AppSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- --run src/lib/storage/__tests__/snapshot.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage/snapshot.ts src/lib/storage/__tests__/snapshot.test.ts
git commit -m "feat(storage): add snapshot serialization format"
```

### Task 2: Add Store Export And Full Replace Helpers

**Files:**
- Modify: `src/lib/stores/itemsStore.ts`
- Modify: `src/lib/stores/rankingStore.ts`
- Modify: `src/lib/stores/comparisonsStore.ts`
- Test: `src/stores/__tests__/itemsStore.test.ts`

**Interfaces:**
- Consumes: `AppSnapshot`
- Produces:
  - `exportItems(): Promise<Record<string, Item>>`
  - `replaceItems(next: Record<string, Item>): Promise<void>`
  - `exportRankings(): Promise<Record<string, string[]>>`
  - `replaceRankings(next: Record<string, string[]>): Promise<void>`
  - `exportComparisons(): Promise<ComparisonEntry[]>`
  - `replaceComparisons(next: ComparisonEntry[]): Promise<void>`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { addItem, exportItems, replaceItems } from '../../lib/stores/itemsStore';

describe('itemsStore replaceItems', () => {
  it('replaces the in-memory and persisted item set', async () => {
    await addItem({ id: 'old', type: 'concert', createdAt: '2026-06-20T00:00:00.000Z', data: { artist: 'Old', date: '2026-06-20', venue: 'X' } });

    await replaceItems({
      fresh: { id: 'fresh', type: 'concert', createdAt: '2026-06-20T00:00:00.000Z', data: { artist: 'Fresh', date: '2026-06-21', venue: 'Y' } }
    });

    const exported = await exportItems();
    expect(Object.keys(exported)).toEqual(['fresh']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- --run src/stores/__tests__/itemsStore.test.ts`
Expected: FAIL with missing `replaceItems` or `exportItems`

- [ ] **Step 3: Write minimal implementation**

```ts
// itemsStore.ts additions
export async function exportItems() {
  let current: Record<string, Item> = {};
  items.subscribe((value) => {
    current = value;
  })();
  return current;
}

export async function replaceItems(next: Record<string, Item>) {
  items.set(next);
  if (!browser || !dbPromise) return;
  const db = await dbPromise;
  const tx = db.transaction('items', 'readwrite');
  await tx.store.clear();
  for (const value of Object.values(next)) {
    await tx.store.put(value);
  }
  await tx.done;
}
```

Repeat the same pattern for rankings and comparisons using their own stores/object stores.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- --run src/stores/__tests__/itemsStore.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/stores/itemsStore.ts src/lib/stores/rankingStore.ts src/lib/stores/comparisonsStore.ts src/stores/__tests__/itemsStore.test.ts
git commit -m "feat(storage): add full export and replace helpers for stores"
```

### Task 3: Add JSON Export/Import Workflow

**Files:**
- Create: `src/lib/stores/storageStore.ts`
- Modify: `src/routes/+page.svelte`
- Test: `src/lib/storage/__tests__/snapshot.test.ts`

**Interfaces:**
- Consumes: `buildSnapshot`, `parseSnapshot`, `exportItems`, `replaceItems`, `exportRankings`, `replaceRankings`, `exportComparisons`, `replaceComparisons`
- Produces:
  - `exportJsonFile(): Promise<void>`
  - `importJsonText(json: string): Promise<void>`
  - `storageStatus` writable store with `{ canUseFileSystemApi: boolean; lastAction: string | null; lastError: string | null }`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { importJsonText } from '../stores/storageStore';
import { exportItems } from '../stores/itemsStore';

describe('storageStore importJsonText', () => {
  it('restores snapshot content into the stores', async () => {
    await importJsonText(JSON.stringify({
      version: 1,
      exportedAt: '2026-06-20T00:00:00.000Z',
      items: {
        a: { id: 'a', type: 'concert', createdAt: '2026-06-20T00:00:00.000Z', data: { artist: 'A', date: '2026-06-20', venue: 'Bercy' } }
      },
      rankings: { 'concert:2026': ['a'] },
      comparisons: []
    }));

    const items = await exportItems();
    expect(items.a.data.artist).toBe('A');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- --run src/lib/storage/__tests__/snapshot.test.ts`
Expected: FAIL with missing `storageStore.ts` exports

- [ ] **Step 3: Write minimal implementation**

Implement `storageStore.ts` with:

```ts
import { writable } from 'svelte/store';
import { buildSnapshot, parseSnapshot, snapshotToJson } from '$lib/storage/snapshot';
import { exportItems, replaceItems } from '$lib/stores/itemsStore';
import { exportRankings, replaceRankings } from '$lib/stores/rankingStore';
import { exportComparisons, replaceComparisons } from '$lib/stores/comparisonsStore';

export const storageStatus = writable({
  canUseFileSystemApi: typeof window !== 'undefined' && 'showSaveFilePicker' in window,
  lastAction: null as string | null,
  lastError: null as string | null
});

export async function exportJsonFile() {
  const snapshot = buildSnapshot({
    items: await exportItems(),
    rankings: await exportRankings(),
    comparisons: await exportComparisons()
  });

  const blob = new Blob([snapshotToJson(snapshot)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `top-maker-${new Date().getFullYear()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  storageStatus.update((s) => ({ ...s, lastAction: 'exported-json', lastError: null }));
}

export async function importJsonText(json: string) {
  // "Replace All" import semantics chosen by user: the imported snapshot replaces current state
  const snapshot = parseSnapshot(json);
  await replaceItems(snapshot.items);
  await replaceRankings(snapshot.rankings);
  await replaceComparisons(snapshot.comparisons);
  storageStatus.update((s) => ({ ...s, lastAction: 'imported-json', lastError: null }));
}
```

Then add two UI controls in `+page.svelte`:
- Export button -> `exportJsonFile()`
- Import input (`type="file" accept="application/json"`) -> reads text and calls `importJsonText()`

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/stores/storageStore.ts src/lib/storage/snapshot.ts src/routes/+page.svelte src/lib/storage/__tests__/snapshot.test.ts
git commit -m "feat(storage): add json export and import workflow"
```

### Task 4: Add File System Access API Open/Save

**Files:**
- Create: `src/lib/storage/fileAccess.ts`
- Modify: `src/lib/stores/storageStore.ts`
- Modify: `src/routes/+page.svelte`
- Test: `src/lib/storage/__tests__/fileAccess.test.ts`

**Interfaces:**
- Produces:
  - `canUseFileSystemApi(): boolean`
  - `pickOpenFile(): Promise<FileSystemFileHandle | null>`
  - `pickSaveFile(): Promise<FileSystemFileHandle | null>`
  - `readHandleText(handle): Promise<string>`
  - `writeHandleText(handle, text): Promise<void>`
  - `openFromFileHandle(): Promise<void>`
  - `saveToFileHandle(): Promise<void>`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from 'vitest';
import { canUseFileSystemApi } from '../fileAccess';

describe('fileAccess', () => {
  it('detects availability from window.showSaveFilePicker', () => {
    vi.stubGlobal('window', { showSaveFilePicker: vi.fn() });
    expect(canUseFileSystemApi()).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- --run src/lib/storage/__tests__/fileAccess.test.ts`
Expected: FAIL with missing `fileAccess.ts`

- [ ] **Step 3: Write minimal implementation**

Implement `fileAccess.ts`:

```ts
export function canUseFileSystemApi() {
  return typeof window !== 'undefined' && 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;
}

export async function pickOpenFile() {
  if (!canUseFileSystemApi()) return null;
  const [handle] = await window.showOpenFilePicker({
    types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }]
  });
  return handle ?? null;
}

export async function pickSaveFile() {
  if (!canUseFileSystemApi()) return null;
  return window.showSaveFilePicker({
    suggestedName: `top-maker-${new Date().getFullYear()}.json`,
    types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }]
  });
}

export async function readHandleText(handle: FileSystemFileHandle) {
  const file = await handle.getFile();
  return file.text();
}

export async function writeHandleText(handle: FileSystemFileHandle, text: string) {
  const writable = await handle.createWritable();
  await writable.write(text);
  await writable.close();
}
```

Update `storageStore.ts` to keep:
- `currentFileHandle` writable store
- `openFromFileHandle()` which picks a file, reads JSON, and calls `importJsonText()`
- `saveToFileHandle()` which reuses `currentFileHandle` or prompts for one, builds a snapshot, and writes JSON

Update `+page.svelte` to render:
- `Open File` button when supported
- `Save File` button when supported

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage/fileAccess.ts src/lib/storage/__tests__/fileAccess.test.ts src/lib/stores/storageStore.ts src/routes/+page.svelte
git commit -m "feat(storage): add file open and save integration"
```

### Task 5: Add UI Feedback And Error Handling

**Files:**
- Modify: `src/routes/+page.svelte`
- Modify: `src/lib/stores/storageStore.ts`

**Interfaces:**
- Consumes: `storageStatus`
- Produces: visible feedback for export/import/save/open actions and graceful fallback behavior

- [ ] **Step 1: Write the failing test**

Add a small component-level assertion in an existing test or create a new test that verifies `storageStatus.lastAction` updates after calling `importJsonText()`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL because no visible feedback is wired yet

- [ ] **Step 3: Write minimal implementation**

In `+page.svelte`, add a small status area:

```svelte
{#if $storageStatus.lastAction}
  <p>{$storageStatus.lastAction}</p>
{/if}

{#if $storageStatus.lastError}
  <p role="alert">{$storageStatus.lastError}</p>
{/if}
```

Update `storageStore.ts` so every action catches errors and sets `lastError` with a short string like `failed-import`, `failed-save-file`, `failed-open-file`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/routes/+page.svelte src/lib/stores/storageStore.ts
git commit -m "feat(storage): add backup status and error feedback"
```

### Self-Review

1. Spec coverage: This plan covers export/import JSON everywhere, optional file open/save integration, browser-only FS API detection, and UI feedback. It does not implement merge-on-import; it uses replace semantics first, which is a narrower MVP than the spec. If merge is still required for MVP, add a follow-up plan.
2. Placeholder scan: No TODO/TBD placeholders remain. Every task has exact files, commands, and concrete implementation snippets.
3. Type consistency: Snapshot types, store helper names, and file-access APIs are consistent across tasks.

### Plan saved

Plan complete and saved to `docs/superpowers/plans/2026-06-20-file-backup-and-sync.md`.

Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
