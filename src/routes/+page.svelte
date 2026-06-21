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
  let editingItem: { id: string; data: { artist?: string; date?: string; venue?: string } } | null = null;
  let theme: 'light' | 'dark' = 'light';
  let showCompare = false;
  let showActionsMenu = false;
  let actionsEl: HTMLElement | null = null;
  let actionsToggleEl: HTMLElement | null = null;
  let pendingNew: string | null = null;
  let comparePair: { newId: string; otherId: string; resolve: (value: 'a' | 'b' | 'tie' | 'unsure') => void } | null = null;
  let currentRanking: string[] = [];
  let itemsForDisplay: Array<any> = [];
  let importInput: HTMLInputElement | null = null;

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
    onDestroy(() => window.removeEventListener('click', onDoc));
    onDestroy(() => window.removeEventListener('keydown', onKeyDown));
    // expose a small test helper and mark that client has mounted so tests can wait for hydration
    try {
      document.documentElement.setAttribute('data-topmaker-hydrated', '1');
      // Only expose test helpers when running e2e tests. We use the VITE_E2E env flag.
      // import.meta.env is provided by Vite and includes VITE_* variables.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const viteE2E = typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_E2E === '1' || import.meta.env.VITE_E2E === 'true');
      const isE2E = !!viteE2E;
  if (isE2E) {
        // allow tests to programmatically open the Add modal if clicks are unreliable in headless environments
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.__topmaker_openAdd = () => { showAdd = true; };
        // expose helper to open actions menu for tests
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.__topmaker_openActions = () => { showActionsMenu = true; };
        // expose an export helper so tests can obtain exported JSON without relying on downloads
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.__topmaker_export = async () => {
          try {
            return await exportJsonFile();
          } catch (e) {
            return null;
          }
        };
      }
    } catch (e) {}
  });

  async function onAddWithoutRanking(data: { artist: string; date: string; venue: string }) {
    const id = `i_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const item = { id, type: 'concert', createdAt: new Date().toISOString(), data };
    await addItem(item);
    const ranking = await getRanking(rankingKey);
    await insertAt(rankingKey, ranking.length, id);
    showAdd = false;
  }

  async function onUpdateItem(id: string, data: { artist?: string; date?: string; venue?: string }) {
    // use itemsStore.updateItem
    // import lazily to avoid circular at top-level
    const mod = await import('$lib/stores/itemsStore');
    if (mod.updateItem) await mod.updateItem(id, data);
    editingItem = null;
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
        class="actions-toggle secondary"
        aria-expanded={showActionsMenu}
        aria-pressed={showActionsMenu}
        on:click|stopPropagation={() => { showActionsMenu = !showActionsMenu }}
        on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showActionsMenu = !showActionsMenu } }}
      >
        ☰
      </button>

      {#if showActionsMenu}
        <div bind:this={actionsEl} class="actions-menu" role="menu" tabindex="0" on:click|stopPropagation on:keydown|stopPropagation={(e) => e.stopPropagation()}>
          <button data-test="actions-export" role="menuitem" on:click={() => { exportJsonFile(); showActionsMenu = false }} class="secondary">Export</button>
          <!-- use a button to open the file picker for accessibility; trigger hidden input click -->
          <button
            role="menuitem"
            class="file-button"
            on:click={async () => {
              // trigger hidden input
              if (importInput) importInput.click();
            }}
          >
            Import
          </button>
          
          {#if $storageStatus.canUseFileSystemApi}
            <button role="menuitem" on:click={() => { openFromFileHandle(); showActionsMenu = false }} class="secondary">Open File</button>
            <button role="menuitem" on:click={() => { saveToFileHandle(); showActionsMenu = false }} class="secondary">Save File</button>
          {/if}
          <div class="menu-sep"></div>
          <button role="menuitem" on:click={() => { toggleTheme(); showActionsMenu = false }} class="secondary">{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</button>
        </div>
      {/if}
    </div>
  </div>

  <div class="controls">
    <button on:click={() => (showAdd = true)} class="primary">Add</button>
    <div class="spacer"></div>
  </div>

  <!-- Hidden import input placed after controls so tests can locate it reliably -->
  <input bind:this={importInput} id="actions-import-input" type="file" accept="application/json" style="display:none" on:change={async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const text = await f.text();
    await importJsonText(text);
    showActionsMenu = false;
  }} />

  {#if showAdd}
    <AddItemModal
      initial={editingItem ? editingItem.data : null}
      mode={editingItem ? 'edit' : 'add'}
      on:add={(ev) => (ev.detail.rank ? onAddAndRank(ev.detail.data) : onAddWithoutRanking(ev.detail.data))}
      on:update={async (ev) => {
        if (!editingItem) return;
        await onUpdateItem(editingItem.id, ev.detail.data);
      }}
      on:cancel={() => { editingItem = null; showAdd = false }}
    />
  {/if}

  {#if showCompare && comparePair}
    <ComparisonModal
      itemA={$items[comparePair.newId]}
      itemB={$items[comparePair.otherId]}
      on:result={onCompareResult}
    />
  {/if}

  <RankedList items={itemsForDisplay} on:edit={(e) => { editingItem = { id: e.detail.id, data: e.detail.data }; showAdd = true }} />
  {#if $storageStatus.lastAction}
    <div class="storage-status">{$storageStatus.lastAction}</div>
  {/if}
  {#if $storageStatus.lastError}
    <div role="alert" class="storage-error">{$storageStatus.lastError}</div>
  {/if}
</main>
