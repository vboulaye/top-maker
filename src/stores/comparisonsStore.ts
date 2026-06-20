import { openDB } from 'idb';
import type { ComparisonEntry } from '$lib/types';

const DB_NAME = 'topmaker';
const DB_VERSION = 1;

const dbPromise = openDB(DB_NAME, DB_VERSION);

export async function recordComparison(entry: ComparisonEntry) {
  const db = await dbPromise;
  await db.put('comparisons', entry);
}

export async function latestBetween(aId: string, bId: string) {
  const db = await dbPromise;
  const all = await db.getAll('comparisons');
  // find most recent where aId/bId match regardless of order
  const filtered = all.filter((c: ComparisonEntry) => {
    return (c.aId === aId && c.bId === bId) || (c.aId === bId && c.bId === aId);
  });
  filtered.sort((x: ComparisonEntry, y: ComparisonEntry) => (x.timestamp < y.timestamp ? 1 : -1));
  return filtered[0] || null;
}

export async function listForItem(id: string) {
  const db = await dbPromise;
  const all = await db.getAll('comparisons');
  return all.filter((c: ComparisonEntry) => c.aId === id || c.bId === id);
}
