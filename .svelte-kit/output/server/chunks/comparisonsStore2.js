import { n as writable } from "./shared2.js";
import "./index-server2.js";
import { openDB } from "idb";
//#region src/lib/stores/comparisonsStore.ts
var browser = typeof indexedDB !== "undefined";
var dbPromise = browser ? openDB("topmaker", 1) : null;
var comparisons = writable([]);
if (browser && dbPromise) (async () => {
	const all = await (await dbPromise).getAll("comparisons");
	comparisons.set(all || []);
})();
async function replaceComparisons(next) {
	comparisons.set(next || []);
	if (!browser || !dbPromise) return;
	const tx = (await dbPromise).transaction("comparisons", "readwrite");
	await tx.store.clear();
	for (const item of next) await tx.store.put(item);
	await tx.done;
}
//#endregion
export { replaceComparisons as n, comparisons as t };
