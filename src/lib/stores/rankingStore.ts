
import { openDB } from 'idb';
import type { RankingKey } from '$lib/types';

const DB_NAME = 'topmaker';
const DB_VERSION = 1;

const dbPromise = openDB(DB_NAME, DB_VERSION);

function keyFor(k: RankingKey) {
  return `${k.type}:${k.year ?? 'all'}`;
}

export async function getRanking(key: RankingKey) {
  const db = await dbPromise;
  return (await db.get('rankings', keyFor(key))) || [];
}

export async function setRanking(key: RankingKey, ranking: any) {
  const db = await dbPromise;
  await db.put('rankings', ranking, keyFor(key));
}

export async function insertAt(key: RankingKey, index: number, itemId: string) {
  const ranking = await getRanking(key);
  ranking.splice(index, 0, itemId);
  await setRanking(key, ranking);
}
