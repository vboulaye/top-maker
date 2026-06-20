import "../../chunks/index-server.js";
import { W as fallback, n as writable } from "../../chunks/shared2.js";
import "../../chunks/index-server2.js";
import { a as store_get, o as unsubscribe_stores, r as ensure_array_like, t as bind_props, y as escape_html } from "../../chunks/server.js";
import { t as items } from "../../chunks/itemsStore2.js";
import { t as rankings } from "../../chunks/rankingStore2.js";
import "../../chunks/comparisonsStore2.js";
import { n as lastSnapshot, t as lastActionLabel } from "../../chunks/undoStore2.js";
//#region src/lib/components/ItemCard.svelte
function ItemCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let item = $$props["item"];
		$$renderer.push(`<div class="item-card svelte-t2ykpv"><div class="title svelte-t2ykpv">${escape_html(item?.data?.artist ?? item?.id)}</div> <div class="meta svelte-t2ykpv">${escape_html(item?.data?.date)} — ${escape_html(item?.data?.venue)}</div></div>`);
		bind_props($$props, { item });
	});
}
//#endregion
//#region src/lib/components/RankedList.svelte
function RankedList($$renderer, $$props) {
	let items = fallback($$props["items"], () => [], true);
	$$renderer.push(`<div class="ranked-list"><!--[-->`);
	const each_array = ensure_array_like(items);
	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let item = each_array[i];
		$$renderer.push(`<div class="rank-row svelte-1sbqmqp"><div class="pos svelte-1sbqmqp">#${escape_html(i + 1)}</div> `);
		ItemCard($$renderer, { item });
		$$renderer.push(`<!----></div>`);
	}
	$$renderer.push(`<!--]--></div>`);
	bind_props($$props, { items });
}
//#endregion
//#region src/lib/storage/fileAccess.ts
function canUseFileSystemApi() {
	return typeof window !== "undefined" && "showOpenFilePicker" in window && "showSaveFilePicker" in window;
}
//#endregion
//#region src/lib/stores/storageStore.ts
var storageStatus = writable({
	canUseFileSystemApi: typeof window !== "undefined" && canUseFileSystemApi(),
	lastAction: null,
	lastError: null,
	currentFileHandle: null
});
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let itemsForDisplay = [];
		const rankingKey = {
			type: "concert",
			year: (/* @__PURE__ */ new Date()).getFullYear()
		};
		const rankingStoreKey = `${rankingKey.type}:${rankingKey.year}`;
		$: itemsForDisplay = (store_get($$store_subs ??= {}, "$rankings", rankings)?.[rankingStoreKey] || []).map((id) => store_get($$store_subs ??= {}, "$items", items)[id]).filter(Boolean);
		$$renderer.push(`<main><h1>Top Maker</h1> <p>Track and compare your best concerts of the year.</p> <button>Add</button> <button>Export JSON</button> `);
		if (store_get($$store_subs ??= {}, "$lastSnapshot", lastSnapshot)) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button>Undo: ${escape_html(store_get($$store_subs ??= {}, "$lastActionLabel", lastActionLabel))}</button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <label style="display:inline-block; margin-left:8px;">Import JSON <input type="file" accept="application/json"/></label> `);
		if (store_get($$store_subs ??= {}, "$storageStatus", storageStatus).canUseFileSystemApi) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button>Open File</button> <button>Save File</button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		RankedList($$renderer, { items: itemsForDisplay });
		$$renderer.push(`<!----> `);
		if (store_get($$store_subs ??= {}, "$storageStatus", storageStatus).lastAction) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="storage-status">${escape_html(store_get($$store_subs ??= {}, "$storageStatus", storageStatus).lastAction)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (store_get($$store_subs ??= {}, "$storageStatus", storageStatus).lastError) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div role="alert" class="storage-error">${escape_html(store_get($$store_subs ??= {}, "$storageStatus", storageStatus).lastError)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></main>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
