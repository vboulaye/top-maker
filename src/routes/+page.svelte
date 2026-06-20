<script lang="ts">
  import AddItemModal from '$lib/components/AddItemModal.svelte';
  import ComparisonModal from '$lib/components/ComparisonModal.svelte';
  import RankedList from '$lib/components/RankedList.svelte';
  import { storageStatus, exportJsonFile, importJsonText, openFromFileHandle, saveToFileHandle } from '$lib/stores/storageStore';
  // undo feature removed
  import { items } from '$lib/stores/itemsStore';
  import { addItem } from '$lib/stores/itemsStore';
  import { rankings, getRanking, insertAt } from '$lib/stores/rankingStore';
  import { findInsertIndex } from '$lib/ranking/insertion.js';

  let showAdd = false;
  let showCompare = false;
  let pendingNew: string | null = null;
  let comparePair: { newId: string; otherId: string; resolve: (value: 'a' | 'b' | 'tie' | 'unsure') => void } | null = null;
  let currentRanking: string[] = [];
  let itemsForDisplay: Array<any> = [];

  const rankingKey = { type: 'concert', year: new Date().getFullYear() };
  const rankingStoreKey = `${rankingKey.type}:${rankingKey.year}`;

  $: {
    const ids = $rankings?.[rankingStoreKey] || [];
    itemsForDisplay = ids.map((id) => $items[id]).filter(Boolean);
  }

  async function onAddAndRank(data: { artist: string; date: string; venue: string }) {
    const id = `i_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const item = { id, type: 'concert', createdAt: new Date().toISOString(), data };
    await addItem(item);

    currentRanking = await getRanking(rankingKey);
    if (!currentRanking || currentRanking.length === 0) {
      await insertAt(rankingKey, 0, id);
    } else {
      pendingNew = id;
      await startInsertion();
    }

    showAdd = false;
  }

  async function onAddWithoutRanking(data: { artist: string; date: string; venue: string }) {
    const id = `i_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const item = { id, type: 'concert', createdAt: new Date().toISOString(), data };
    await addItem(item);
    const ranking = await getRanking(rankingKey);
    await insertAt(rankingKey, ranking.length, id);
    showAdd = false;
  }

  function compareFn(newId: string, otherId: string) {
    return new Promise<'a' | 'b' | 'tie' | 'unsure'>((resolve) => {
      comparePair = { newId, otherId, resolve };
      showCompare = true;
    });
  }

  async function startInsertion() {
    if (!pendingNew) return;
    const ranking = await getRanking(rankingKey);
    const res = await findInsertIndex(ranking, pendingNew, compareFn);
    await insertAt(rankingKey, res.index, pendingNew);
    pendingNew = null;
    showCompare = false;
  }

  function onCompareResult(e: CustomEvent<{ result: 'a' | 'b' | 'tie' | 'unsure' }>) {
    const result = e.detail?.result;
    if (!comparePair) return;
    comparePair.resolve(result);
    comparePair = null;
  }
</script>

<main>
  <h1>Top Maker</h1>
  <p>Track and compare your best concerts of the year.</p>

  <button on:click={() => (showAdd = true)}>Add</button>
  <button on:click={() => exportJsonFile()}>Export JSON</button>
  <!-- Undo button removed -->
  <label style="display:inline-block; margin-left:8px;">
    Import JSON
    <input
      type="file"
      accept="application/json"
      on:change={async (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const text = await f.text();
        await importJsonText(text);
      }}
    />
  </label>

  {#if $storageStatus.canUseFileSystemApi}
    <button on:click={() => openFromFileHandle()}>Open File</button>
    <button on:click={() => saveToFileHandle()}>Save File</button>
  {/if}

  {#if showAdd}
    <AddItemModal on:add={(ev) => (ev.detail.rank ? onAddAndRank(ev.detail.data) : onAddWithoutRanking(ev.detail.data))} />
  {/if}

  {#if showCompare && comparePair}
    <ComparisonModal
      itemA={$items[comparePair.newId]}
      itemB={$items[comparePair.otherId]}
      on:result={onCompareResult}
    />
  {/if}

  <RankedList items={itemsForDisplay} />
  {#if $storageStatus.lastAction}
    <div class="storage-status">{$storageStatus.lastAction}</div>
  {/if}
  {#if $storageStatus.lastError}
    <div role="alert" class="storage-error">{$storageStatus.lastError}</div>
  {/if}
</main>
