<script lang="ts">
  // placeholder home page
</script>

<main>
  <h1>Top Maker (placeholder)</h1>
  <p>UI tasks will be wired under src/lib/components/</p>
  <script lang="ts">
    import AddItemModal from '$lib/components/AddItemModal.svelte';
    import ComparisonModal from '$lib/components/ComparisonModal.svelte';
    import { addItem } from '$lib/stores/itemsStore';
    import { getRanking, insertAt } from '$lib/stores/rankingStore';
    import { findInsertIndex } from '$lib/ranking/insertion.js';

    let showAdd = false;
    let showCompare = false;
    let pendingNew: any = null;
    let comparePair: any = null;
    let currentRanking: string[] = [];

    async function onAddAndRank(data) {
      // create item
      const id = 'i_' + Date.now();
      const item = { id, type: 'concert', createdAt: new Date().toISOString(), data };
      await addItem(item);
      // fetch ranking and if empty just insert
      currentRanking = await getRanking({ type: 'concert' });
      if (!currentRanking || currentRanking.length === 0) {
        await insertAt({ type: 'concert' }, 0, id);
      } else {
        // start interactive insertion via findInsertIndex which will call compareFn that shows modal
        pendingNew = id;
        showCompare = true;
        // actual insertion logic is handled by compareFn and onResult
      }
      showAdd = false;
    }

    function onAddWithoutRanking(data) {
      const id = 'i_' + Date.now();
      const item = { id, type: 'concert', createdAt: new Date().toISOString(), data };
      addItem(item);
      insertAt({ type: 'concert' }, (currentRanking||[]).length, id);
      showAdd = false;
    }

    function compareFn(newId, otherId) {
      return new Promise((resolve) => {
        // show comparison modal for UI
        comparePair = { newId, otherId, resolve };
      });
    }

    async function startInsertion() {
      const ranking = await getRanking({ type: 'concert' });
      const res = await findInsertIndex(ranking, pendingNew, compareFn);
      const idx = res.index;
      await insertAt({ type: 'concert' }, idx, pendingNew);
      pendingNew = null;
      showCompare = false;
    }

    async function onCompareResult(e) {
      const r = e.detail?.result;
      if (!comparePair) return;
      // resolve the waiting promise
      comparePair.resolve(r === 'a' ? 'a' : r === 'b' ? 'b' : r === 'tie' ? 'tie' : 'unsure');
      comparePair = null;
      // if the insertion is still in progress, continue
      // startInsertion will pick up after all comparisons
    }
  </script>

  <button on:click={() => showAdd = true}>Add</button>
  {#if showAdd}
    <AddItemModal on:add={(ev) => ev.detail.rank ? onAddAndRank(ev.detail.data) : onAddWithoutRanking(ev.detail.data)} />
  {/if}

  {#if showCompare && comparePair}
    <ComparisonModal {itemA}={null} {itemB}={null} on:result={onCompareResult} />
  {/if}

</main>
