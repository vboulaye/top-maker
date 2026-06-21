<script lang="ts">
  import AddItemModal from '$lib/components/AddItemModal.svelte';
  import ComparisonModal from '$lib/components/ComparisonModal.svelte';
  import RankedList from '$lib/components/RankedList.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { storageStatus, exportJsonFile, importJsonText, openFromFileHandle, saveToFileHandle } from '$lib/stores/storageStore';
  // undo feature removed
  import { items } from '$lib/stores/itemsStore';
  import { addItem } from '$lib/stores/itemsStore';
  import { rankings, getRanking, insertAt } from '$lib/stores/rankingStore';
  import { findInsertIndex } from '$lib/ranking/insertion.js';

  let showAdd = false;
  let theme: 'light' | 'dark' = 'light';
  let showCompare = false;
  let showActionsMenu = false;
  let actionsEl: HTMLElement | null = null;
  let actionsToggleEl: HTMLElement | null = null;
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
    // click-outside and escape handler for actions menu
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!showActionsMenu) return;
      if (actionsEl && actionsToggleEl) {
        // if the click is outside the menu and toggle, close
        if (actionsEl.contains(target) || actionsToggleEl.contains(target)) return;
        showActionsMenu = false;
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (!showActionsMenu) return;
      if (e.key === 'Escape' || e.key === 'Esc') {
        showActionsMenu = false;
      }
    };
    window.addEventListener('click', onDoc);
    window.addEventListener('keydown', onKeyDown);
    // ensure toggle works even if Svelte event modifiers don't behave in some environments
    const toggleHandler = (ev: Event) => {
      ev.stopPropagation();
      showActionsMenu = !showActionsMenu;
    };
    if (actionsToggleEl) actionsToggleEl.addEventListener('click', toggleHandler);
    onDestroy(() => window.removeEventListener('click', onDoc));
    onDestroy(() => window.removeEventListener('keydown', onKeyDown));
    onDestroy(() => { if (actionsToggleEl) actionsToggleEl.removeEventListener('click', toggleHandler); });
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
      <button
        bind:this={actionsToggleEl}
        class="actions-toggle"
        aria-expanded={showActionsMenu}
        aria-pressed={showActionsMenu}
        on:click|stopPropagation={() => { console.log('actions toggle click', showActionsMenu); showActionsMenu = !showActionsMenu }}
        on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showActionsMenu = !showActionsMenu } }}
      >
        ☰ Actions
      </button>
    </div>

    {#if showActionsMenu}
      <div bind:this={actionsEl} class="actions-menu" role="menu" on:click|stopPropagation>
        <button role="menuitem" on:click={() => { exportJsonFile(); showActionsMenu = false }} class="secondary">Export</button>
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
              showActionsMenu = false;
            }}
          />
        </label>
        {#if $storageStatus.canUseFileSystemApi}
          <button role="menuitem" on:click={() => { openFromFileHandle(); showActionsMenu = false }} class="secondary">Open File</button>
          <button role="menuitem" on:click={() => { saveToFileHandle(); showActionsMenu = false }} class="secondary">Save File</button>
        {/if}
        <div class="menu-sep" />
        <button role="menuitem" on:click={() => { toggleTheme(); showActionsMenu = false }} class="secondary">{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</button>
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
