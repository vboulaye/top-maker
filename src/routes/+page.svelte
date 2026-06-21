<script lang="ts">
  import AddItemModal from '$lib/components/AddItemModal.svelte';
  import ComparisonModal from '$lib/components/ComparisonModal.svelte';
  import RankedList from '$lib/components/RankedList.svelte';
  import { onMount } from 'svelte';
  import { storageStatus, exportJsonFile, importJsonText, openFromFileHandle, saveToFileHandle } from '$lib/stores/storageStore';
  // undo feature removed
  import { items } from '$lib/stores/itemsStore';
  import { addItem } from '$lib/stores/itemsStore';
  import { rankings, getRanking, insertAt } from '$lib/stores/rankingStore';
  import { findInsertIndex } from '$lib/ranking/insertion.js';

  let showAdd = false;
  let theme: 'light' | 'dark' = 'light';
  let showCompare = false;
  let showMobileActions = false;
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

  function applyTheme(t: 'light' | 'dark') {
    if (typeof document === 'undefined') return;
    if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    theme = t;
    try { localStorage.setItem('theme', t); } catch (e) {}
  }

  function toggleTheme() {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
  }

  onMount(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') {
        applyTheme(stored as 'light' | 'dark');
        return;
      }
    } catch (e) {}
    // default to system preference
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      applyTheme('dark');
    } else {
      applyTheme('light');
    }
  });

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
  <div class="header-row">
    <div class="title-block">
      <h1>Top Maker</h1>
      <p>Track and compare your best concerts of the year.</p>
    </div>
    <div class="top-actions">
      <button on:click={() => exportJsonFile()} class="secondary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 3v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 7l4-4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 21H3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Export</span>
      </button>
      <label class="file-button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 21V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 15l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Import</span>
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
        <button on:click={() => openFromFileHandle()} class="secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7 10l5-5 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Open</span>
        </button>
        <button on:click={() => saveToFileHandle()} class="secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M21 15V5a2 2 0 0 0-2-2H7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7 21h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 21v-8H7v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Save</span>
        </button>
      {/if}
      <button class="mobile-toggle" aria-expanded={showMobileActions} on:click={() => (showMobileActions = !showMobileActions)}>
        ☰
      </button>
    </div>

    {#if showMobileActions}
      <div class="mobile-actions" role="menu">
        <button role="menuitem" on:click={() => { exportJsonFile(); showMobileActions = false }} class="secondary">Export</button>
        <label class="file-button" role="menuitem">
          Import
          <input
            type="file"
            accept="application/json"
            on:change={async (e) => {
              const f = e.target.files && e.target.files[0];
              if (!f) return;
              const text = await f.text();
              await importJsonText(text);
              showMobileActions = false;
            }}
          />
        </label>
        {#if $storageStatus.canUseFileSystemApi}
          <button role="menuitem" on:click={() => { openFromFileHandle(); showMobileActions = false }} class="secondary">Open File</button>
          <button role="menuitem" on:click={() => { saveToFileHandle(); showMobileActions = false }} class="secondary">Save File</button>
        {/if}
      </div>
    {/if}
  </div>

  <div class="controls">
    <button on:click={() => (showAdd = true)} class="primary">Add</button>
    <div class="spacer"></div>
    <button on:click={toggleTheme} class="secondary">{theme === 'dark' ? 'Light' : 'Dark'}</button>
  </div>

  {#if showAdd}
    <AddItemModal
      on:add={(ev) => (ev.detail.rank ? onAddAndRank(ev.detail.data) : onAddWithoutRanking(ev.detail.data))}
      on:cancel={() => (showAdd = false)}
    />
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
