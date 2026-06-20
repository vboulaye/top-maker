import { writable } from 'svelte/store';
import { openDB } from 'idb';

const DB_NAME = 'topmaker_undo';
const DB_VERSION = 1;
const STORE_NAME = 'undo';
const STORE_KEY = 'last';

const browser = typeof indexedDB !== 'undefined';

export type UndoSnapshot = {
  items?: Record<string, any>;
  rankings?: Record<string, string[]>;
  comparisons?: any[];
  label: string;
  savedAt: string;
};

const dbPromise = browser
  ? openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
      }
    })
  : null;

export const lastSnapshot = writable<UndoSnapshot | null>(null);
export const lastActionLabel = writable<string | null>(null);

async function persist(s: UndoSnapshot | null) {
  if (!browser || !dbPromise) return;
  const db = await dbPromise;
  if (!s) {
    await db.delete(STORE_NAME, STORE_KEY);
  } else {
    await db.put(STORE_NAME, s, STORE_KEY);
  }
}

async function load(): Promise<UndoSnapshot | null> {
  if (!browser || !dbPromise) return null;
  const db = await dbPromise;
  const rec = await db.get(STORE_NAME, STORE_KEY);
  return (rec as UndoSnapshot) || null;
}

// initialize from indexeddb if present
(async () => {
  try {
    const s = await load();
    if (s) {
      lastSnapshot.set(s);
      lastActionLabel.set(s.label);
    }
  } catch (e) {
    // ignore
  }
})();

export async function recordUndoSnapshot(label: string, snapshot: { items?: Record<string, any>; rankings?: Record<string, string[]>; comparisons?: any[] }) {
  const s: UndoSnapshot = { ...snapshot, label, savedAt: new Date().toISOString() } as UndoSnapshot;
  await persist(s);
  lastSnapshot.set(s);
  lastActionLabel.set(label);
}

export async function clearUndo() {
  await persist(null);
  lastSnapshot.set(null);
  lastActionLabel.set(null);
}

export async function undo() {
  if (!browser) return false;
  const s = await load();
  if (!s) return false;

  // dynamic imports to avoid module cycles
  const { replaceItems } = await import('$lib/stores/itemsStore');
  const { replaceRankings } = await import('$lib/stores/rankingStore');
  const { replaceComparisons } = await import('$lib/stores/comparisonsStore');

  if (s.items) await replaceItems(s.items);
  if (s.rankings) await replaceRankings(s.rankings);
  if (s.comparisons) await replaceComparisons(s.comparisons || []);

  await clearUndo();
  return true;
}

export default { lastSnapshot, lastActionLabel, recordUndoSnapshot, clearUndo, undo };
