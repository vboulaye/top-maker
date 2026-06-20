import { n as writable } from "./shared2.js";
import "./index-server2.js";
import { openDB } from "idb";
//#region src/lib/stores/rankingStore.ts
var browser = typeof indexedDB !== "undefined";
var dbPromise = browser ? openDB("topmaker", 1) : null;
var rankings = writable({});
if (browser && dbPromise) (async () => {
	const db = await dbPromise;
	const allKeys = await db.getAllKeys("rankings");
	const map = {};
	for (const k of allKeys) map[k] = await db.get("rankings", k) || [];
	rankings.set(map);
})();
async function replaceRankings(next) {
	rankings.set(next);
	if (!browser || !dbPromise) return;
	const tx = (await dbPromise).transaction("rankings", "readwrite");
	await tx.store.clear();
	for (const [k, v] of Object.entries(next)) await tx.store.put(v, k);
	await tx.done;
}
//#endregion
export { replaceRankings as n, rankings as t };
