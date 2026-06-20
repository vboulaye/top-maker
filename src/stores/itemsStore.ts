import { openDB } from 'idb';
import type { Item } from '$lib/types';

const DB_NAME = 'topmaker';
const DB_VERSION = 1;

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('items')) db.createObjectStore('items', { keyPath: 'id' });
    if (!db.objectStoreNames.contains('rankings')) db.createObjectStore('rankings');
    if (!db.objectStoreNames.contains('comparisons')) db.createObjectStore('comparisons', { keyPath: 'id' });
  }
});

export async function addItem(item: Item) {
  const db = await dbPromise;
  await db.put('items', item);
}

export async function getItem(id: string) {
  const db = await dbPromise;
  return db.get('items', id);
}

export async function listItems() {
  const db = await dbPromise;
  return db.getAll('items');
}
