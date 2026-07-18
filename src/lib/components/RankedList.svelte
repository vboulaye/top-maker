<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let items: any[] = []; // array of item objects
  export let editingId: string | null = null;
  const dispatch = createEventDispatcher();

  // buffers for inline edit inputs keyed by item id
  let editBuffers: Record<string, { artist: string; date: string; venue: string }> = {};

  // initialize buffer when editingId changes
  $: if (editingId) {
    const found = items && items.find && items.find((it) => it.id === editingId);
    if (found && !editBuffers[editingId]) {
      editBuffers[editingId] = {
        artist: found.data?.artist ?? '',
        date: found.data?.date ?? '',
        venue: found.data?.venue ?? ''
      };
    }
  }

  // sorting state (client-side only)
  let sortColumn: 'rank' | 'name' | 'date' | 'venue' = 'rank';
  let sortDir: 1 | -1 = 1; // 1 = asc, -1 = desc

  function toggleSort(col: typeof sortColumn) {
    if (sortColumn === col) {
      sortDir = (sortDir === 1 ? -1 : 1) as 1 | -1;
    } else {
      sortColumn = col;
      sortDir = 1;
    }
  }

  function cmpString(a: string | undefined, b: string | undefined) {
    const aa = (a || '').toLowerCase();
    const bb = (b || '').toLowerCase();
    if (aa < bb) return -1;
    if (aa > bb) return 1;
    return 0;
  }

  $: sortedItems = (() => {
    if (!items) return [];
    // preserve original order for rank sort; respect direction by reversing when needed
    if (sortColumn === 'rank') return sortDir === 1 ? items : [...items].reverse();
    const copy = [...items];
    copy.sort((x, y) => {
      let res = 0;
      if (sortColumn === 'name') {
        res = cmpString(x?.data?.artist || x?.id, y?.data?.artist || y?.id);
      } else if (sortColumn === 'date') {
        // date strings are ISO-like in data.date; fall back to empty string
        res = cmpString(x?.data?.date, y?.data?.date);
      } else if (sortColumn === 'venue') {
        res = cmpString(x?.data?.venue, y?.data?.venue);
      }
      return res * sortDir;
    });
    return copy;
  })();

  function onEdit(ev: CustomEvent) {
    // forward edit events from ItemCard
    dispatch('edit', ev.detail);
  }

  function onUpdate(ev: CustomEvent) {
    dispatch('update', ev.detail);
  }

  function onCancel(ev: CustomEvent) {
    dispatch('cancel-edit');
  }

  function saveEdit(id: string) {
    const buf = editBuffers[id];
    if (!buf) return;
    dispatch('update', { id, data: { artist: buf.artist, date: buf.date, venue: buf.venue } });
    delete editBuffers[id];
  }

  function cancelEditLocal(id: string) {
    delete editBuffers[id];
    dispatch('cancel-edit');
  }

  // Emit move events for parent to handle actual ranking mutations
  function moveUp(id: string) {
    dispatch('move-up', { id });
  }

  function moveDown(id: string) {
    dispatch('move-down', { id });
  }

  function isFirst(id: string) {
    return items && items.length > 0 && items[0] && items[0].id === id;
  }

  function isLast(id: string) {
    return items && items.length > 0 && items[items.length - 1].id === id;
  }
</script>

<div class="ranked-table-wrapper">
  <table class="ranked-table">
    <thead>
      <tr>
        <th class="col-rank" aria-sort={sortColumn === 'rank' ? (sortDir === 1 ? 'ascending' : 'descending') : 'none'}>
          <button class="col-btn" on:click={() => toggleSort('rank')}># {sortColumn === 'rank' ? (sortDir === 1 ? '▲' : '▼') : ''}</button>
        </th>
        <th class="col-name" aria-sort={sortColumn === 'name' ? (sortDir === 1 ? 'ascending' : 'descending') : 'none'}>
          <button class="col-btn" on:click={() => toggleSort('name')}>Artist {sortColumn === 'name' ? (sortDir === 1 ? '▲' : '▼') : ''}</button>
        </th>
        <th class="col-date" aria-sort={sortColumn === 'date' ? (sortDir === 1 ? 'ascending' : 'descending') : 'none'}>
          <button class="col-btn" on:click={() => toggleSort('date')}>Date {sortColumn === 'date' ? (sortDir === 1 ? '▲' : '▼') : ''}</button>
        </th>
        <th class="col-venue" aria-sort={sortColumn === 'venue' ? (sortDir === 1 ? 'ascending' : 'descending') : 'none'}>
          <button class="col-btn" on:click={() => toggleSort('venue')}>Venue {sortColumn === 'venue' ? (sortDir === 1 ? '▲' : '▼') : ''}</button>
        </th>
        <th class="col-actions">&nbsp;</th>
      </tr>
    </thead>
    <tbody>
      {#each sortedItems as item, i}
        <tr data-item-id={item.id} class:selected={item.id === editingId}>
          <td class="col-rank" data-label="Rank">{#if sortColumn === 'rank'}{i+1}{:else}{items.indexOf(item) + 1}{/if}</td>
          <td class="col-name" data-label="Artist">
            {#if editingId === item.id}
              <input class="edit-input name" bind:value={editBuffers[item.id].artist} placeholder="Artist" />
            {:else}
              <div class="cell-name-text">{item?.data?.artist ?? item?.id}</div>
            {/if}
          </td>
          <td class="col-date" data-label="Date">
            {#if editingId === item.id}
              <input class="edit-input date" bind:value={editBuffers[item.id].date} placeholder="YYYY-MM-DD" />
            {:else}
              {item?.data?.date ?? ''}
            {/if}
          </td>
          <td class="col-venue" data-label="Venue">
            {#if editingId === item.id}
              <input class="edit-input venue" bind:value={editBuffers[item.id].venue} placeholder="Venue" />
            {:else}
              {item?.data?.venue ?? ''}
            {/if}
          </td>
          <td class="col-actions">
            {#if editingId === item.id}
              <div class="edit-actions">
                <!-- Manual rank controls: Move Up / Move Down -->
                <button
                  class="edit-button"
                  aria-label="Move item up"
                  on:click|stopPropagation={() => moveUp(item.id)}
                  disabled={isFirst(item.id)}
                >
                  ▲
                </button>
                <button
                  class="edit-button"
                  aria-label="Move item down"
                  on:click|stopPropagation={() => moveDown(item.id)}
                  disabled={isLast(item.id)}
                >
                  ▼
                </button>

                <button class="save" on:click={() => saveEdit(item.id)}>Save</button>
                <button class="cancel" on:click={() => cancelEditLocal(item.id)}>Cancel</button>
              </div>
            {:else}
              <button class="edit-button" aria-label={`Edit ${item?.data?.artist || item?.id}`} on:click|stopPropagation={() => dispatch('edit', { id: item.id, data: item.data })}>Edit</button>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
.ranked-table-wrapper { width:100% }
.ranked-table { width:100%; border-collapse:collapse; }
.ranked-table thead th { text-align:left; padding:0.5rem 0.75rem; color:var(--muted); font-weight:600; border-bottom:1px solid rgba(0,0,0,0.06) }
.ranked-table tbody td { padding:0.5rem 0.75rem; border-bottom:1px solid rgba(0,0,0,0.04); vertical-align:middle }
.col-rank { width:4rem; text-align:center }
.col-actions { width:6rem; text-align:right }
.col-btn { background:transparent; border:none; padding:0; font:inherit; cursor:pointer; color:inherit }
.cell-name-text { font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
.cell-meta { color:var(--muted); font-size:0.9rem }
.edit-button { background:transparent; border:1px solid rgba(0,0,0,0.06); padding:0.25rem 0.5rem; border-radius:6px; cursor:pointer }
.edit-input { padding:0.25rem 0.5rem; border-radius:6px; border:1px solid rgba(0,0,0,0.08); }
.edit-input.name { min-width:10rem }
.edit-input.date { width:8rem }
.edit-input.venue { min-width:8rem }
.edit-actions { display:flex; gap:0.25rem }
.save { background:var(--accent); color:white; border:none; padding:0.25rem 0.5rem; border-radius:6px }
.cancel { background:transparent; border:1px solid rgba(0,0,0,0.06); padding:0.25rem 0.5rem; border-radius:6px }
tr.selected { background: color-mix(in srgb, var(--surface) 85%, black 2%) }

/* Responsive: collapse into stacked rows on small screens */
@media (max-width:600px) {
  .ranked-table, .ranked-table thead, .ranked-table tbody, .ranked-table th, .ranked-table td, .ranked-table tr { display:block }
  .ranked-table thead { display:none }
  .ranked-table tbody tr { margin-bottom:0.75rem; border:1px solid rgba(0,0,0,0.04); border-radius:8px; padding:0.5rem }
  .ranked-table tbody td { display:flex; justify-content:space-between; padding:0.5rem }
  .cell-meta { display:none }
}
</style>
