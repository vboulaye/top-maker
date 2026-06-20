
import { openDB } from 'idb';
import { writable } from 'svelte/store';
import type { Item } from '$lib/types';

const browser = typeof indexedDB !== 'undefined';

const DB_NAME = 'topmaker';
const DB_VERSION = 1;

const dbPromise = browser
  ? openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('items')) db.createObjectStore('items', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('rankings')) db.createObjectStore('rankings');
        if (!db.objectStoreNames.contains('comparisons')) db.createObjectStore('comparisons', { keyPath: 'id' });
      }
    })
  : null;

// itemsMap: record id -> Item
export const items = writable<Record<string, Item>>({});

// load items from IndexedDB on module init
if (browser && dbPromise) {
  (async () => {
    const db = await dbPromise;
    const all = await db.getAll('items');
    const map: Record<string, Item> = {};
    all.forEach((it: Item) => (map[it.id] = it));
    items.set(map);
  })();
}

export async function addItem(item: Item) {
  if (browser && dbPromise) {
    const db = await dbPromise;
    await db.put('items', item);
  }
  items.update(m => ({ ...m, [item.id]: item }));
}

export async function getItem(id: string) {
  // prefer store value
  let found: Item | undefined;
  items.subscribe(m => { if (m[id]) found = m[id]; })();
  if (found) return found;
  if (!browser || !dbPromise) return undefined;
  const db = await dbPromise;
  return db.get('items', id);
}

export async function listItems() {
  if (!browser || !dbPromise) return [];
  const db = await dbPromise;
  return db.getAll('items');
}
