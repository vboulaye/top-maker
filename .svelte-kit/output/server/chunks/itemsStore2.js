import { n as writable } from "./shared2.js";
import "./index-server2.js";
import { openDB } from "idb";
//#region src/lib/stores/itemsStore.ts
var browser = typeof indexedDB !== "undefined";
var dbPromise = browser ? openDB("topmaker", 1, { upgrade(db) {
	if (!db.objectStoreNames.contains("items")) db.createObjectStore("items", { keyPath: "id" });
	if (!db.objectStoreNames.contains("rankings")) db.createObjectStore("rankings");
	if (!db.objectStoreNames.contains("comparisons")) db.createObjectStore("comparisons", { keyPath: "id" });
} }) : null;
var items = writable({});
if (browser && dbPromise) (async () => {
	const all = await (await dbPromise).getAll("items");
	const map = {};
	all.forEach((it) => map[it.id] = it);
	items.set(map);
})();
async function replaceItems(next) {
	items.set(next);
	if (!browser || !dbPromise) return;
	const tx = (await dbPromise).transaction("items", "readwrite");
	await tx.store.clear();
	for (const value of Object.values(next)) await tx.store.put(value);
	await tx.done;
}
//#endregion
export { replaceItems as n, items as t };
