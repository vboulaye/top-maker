
import { openDB } from 'idb';
import { writable } from 'svelte/store';
import type { RankingKey } from '$lib/types';

const browser = typeof indexedDB !== 'undefined';

const DB_NAME = 'topmaker';
const DB_VERSION = 1;

const dbPromise = browser ? openDB(DB_NAME, DB_VERSION) : null;

function keyFor(k: RankingKey) {
  return `${k.type}:${k.year ?? 'all'}`;
}

// rankings: map key -> array of ids
export const rankings = writable<Record<string, string[]>>({});

if (browser && dbPromise) {
  (async () => {
    const db = await dbPromise;
    const allKeys = await db.getAllKeys('rankings');
    const map: Record<string, string[]> = {};
    for (const k of allKeys) {
      const val = await db.get('rankings', k as any);
      map[k as string] = val || [];
    }
    rankings.set(map);
  })();
}

export async function getRanking(key: RankingKey) {
  const k = keyFor(key);
  let found: string[] | undefined;
  rankings.subscribe(m => { if (m[k]) found = m[k]; })();
  if (found) return found;
  if (!browser || !dbPromise) return [];
  const db = await dbPromise;
  return (await db.get('rankings', k)) || [];
}

export async function setRanking(key: RankingKey, ranking: string[]) {
  // undo support removed; no-op

  if (browser && dbPromise) {
    const db = await dbPromise;
    await db.put('rankings', ranking, keyFor(key));
  }
  rankings.update(m => ({ ...m, [keyFor(key)]: ranking }));
}

export async function insertAt(key: RankingKey, index: number, itemId: string) {
  const ranking = await getRanking(key);
  // avoid mutating the existing array in-place so undo snapshots capture the previous state
  const next = [...ranking];
  next.splice(index, 0, itemId);
  await setRanking(key, next);
}

export async function exportRankings() {
  let current: Record<string, string[]> = {};
  rankings.subscribe((v) => (current = v))();
  return current;
}

export async function replaceRankings(next: Record<string, string[]>) {
  rankings.set(next);
  if (!browser || !dbPromise) return;
  const db = await dbPromise;
  const tx = db.transaction('rankings', 'readwrite');
  await tx.store.clear();
  for (const [k, v] of Object.entries(next)) {
    await tx.store.put(v, k);
  }
  await tx.done;
}
