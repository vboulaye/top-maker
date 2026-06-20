import { writable } from 'svelte/store';

const STORAGE_KEY = 'topmaker:undo';

export type UndoSnapshot = {
  items?: Record<string, any>;
  rankings?: Record<string, string[]>;
  comparisons?: any[];
  label: string;
  savedAt: string;
};

function load(): UndoSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UndoSnapshot;
  } catch (_) {
    return null;
  }
}

function persist(s: UndoSnapshot | null) {
  if (!s) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }
}

const initial = typeof window !== 'undefined' ? load() : null;

export const lastSnapshot = writable<UndoSnapshot | null>(initial);
export const lastActionLabel = writable<string | null>(initial ? initial.label : null);

export async function recordUndoSnapshot(label: string, snapshot: { items?: Record<string, any>; rankings?: Record<string, string[]>; comparisons?: any[] }) {
  const s: UndoSnapshot = { ...snapshot, label, savedAt: new Date().toISOString() } as UndoSnapshot;
  persist(s);
  lastSnapshot.set(s);
  lastActionLabel.set(label);
}

export async function clearUndo() {
  persist(null);
  lastSnapshot.set(null);
  lastActionLabel.set(null);
}

export async function undo() {
  const snap = load();
  if (!snap) return false;

  // dynamic imports to avoid module cycles
  const { replaceItems } = await import('$lib/stores/itemsStore');
  const { replaceRankings } = await import('$lib/stores/rankingStore');
  const { replaceComparisons } = await import('$lib/stores/comparisonsStore');

  if (snap.items) await replaceItems(snap.items);
  if (snap.rankings) await replaceRankings(snap.rankings);
  if (snap.comparisons) await replaceComparisons(snap.comparisons || []);

  await clearUndo();
  return true;
}

export default { lastSnapshot, lastActionLabel, recordUndoSnapshot, clearUndo, undo };
