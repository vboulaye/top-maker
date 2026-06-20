
import { openDB } from 'idb';
import { writable } from 'svelte/store';
import type { ComparisonEntry } from '$lib/types';

const browser = typeof indexedDB !== 'undefined';

const DB_NAME = 'topmaker';
const DB_VERSION = 1;

const dbPromise = browser ? openDB(DB_NAME, DB_VERSION) : null;

export const comparisons = writable<ComparisonEntry[]>([]);

if (browser && dbPromise) {
  (async () => {
    const db = await dbPromise;
    const all = await db.getAll('comparisons');
    comparisons.set(all || []);
  })();
}

export async function recordComparison(entry: ComparisonEntry) {
  // record undo snapshot (previous comparisons) before mutating
  try {
    if (typeof window !== 'undefined') {
      const { recordUndoSnapshot } = await import('$lib/stores/undoStore');
      let current: ComparisonEntry[] = [];
      comparisons.subscribe((v) => (current = v))();
      await recordUndoSnapshot(`Comparison recorded`, { comparisons: current });
    }
  } catch (e) {
    // ignore
  }

  if (browser && dbPromise) {
    const db = await dbPromise;
    await db.put('comparisons', entry);
  }
  comparisons.update(a => [...a, entry]);
}

export async function exportComparisons() {
  let current: ComparisonEntry[] = [];
  comparisons.subscribe((v) => (current = v))();
  return current;
}

export async function replaceComparisons(next: ComparisonEntry[]) {
  comparisons.set(next || []);
  if (!browser || !dbPromise) return;
  const db = await dbPromise;
  const tx = db.transaction('comparisons', 'readwrite');
  await tx.store.clear();
  for (const item of next) {
    await tx.store.put(item);
  }
  await tx.done;
}

export async function latestBetween(aId: string, bId: string) {
  if (!browser || !dbPromise) return null;
  const db = await dbPromise;
  const all = await db.getAll('comparisons');
  const filtered = all.filter((c: ComparisonEntry) => {
    return (c.aId === aId && c.bId === bId) || (c.aId === bId && c.bId === aId);
  });
  filtered.sort((x: ComparisonEntry, y: ComparisonEntry) => (x.timestamp < y.timestamp ? 1 : -1));
  return filtered[0] || null;
}

export async function listForItem(id: string) {
  if (!browser || !dbPromise) return [];
  const db = await dbPromise;
  const all = await db.getAll('comparisons');
  return all.filter((c: ComparisonEntry) => c.aId === id || c.bId === id);
}
