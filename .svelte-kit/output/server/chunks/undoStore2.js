import { n as writable } from "./shared2.js";
import "./index-server2.js";
import { openDB } from "idb";
//#region src/lib/stores/undoStore.ts
var DB_NAME = "topmaker_undo";
var DB_VERSION = 1;
var STORE_NAME = "undo";
var STORE_KEY = "last";
var browser = typeof indexedDB !== "undefined";
var dbPromise = browser ? openDB(DB_NAME, DB_VERSION, { upgrade(db) {
	if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
} }) : null;
var lastSnapshot = writable(null);
var lastActionLabel = writable(null);
async function persist(s) {
	if (!browser || !dbPromise) return;
	const db = await dbPromise;
	if (!s) await db.delete(STORE_NAME, STORE_KEY);
	else await db.put(STORE_NAME, s, STORE_KEY);
}
async function load() {
	if (!browser || !dbPromise) return null;
	return await (await dbPromise).get(STORE_NAME, STORE_KEY) || null;
}
(async () => {
	try {
		const s = await load();
		if (s) {
			lastSnapshot.set(s);
			lastActionLabel.set(s.label);
		}
	} catch (e) {}
})();
async function recordUndoSnapshot(label, snapshot) {
	const s = {
		...snapshot,
		label,
		savedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	await persist(s);
	lastSnapshot.set(s);
	lastActionLabel.set(label);
}
//#endregion
export { lastSnapshot as n, recordUndoSnapshot as r, lastActionLabel as t };
