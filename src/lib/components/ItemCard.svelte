<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import AddItemModal from './AddItemModal.svelte';
  export let item: any;
  export let editing: boolean = false;
  const dispatch = createEventDispatcher();

  function onEdit() {
    // if already editing, clicking should signal cancel intent; parent toggles
    dispatch('edit', { id: item.id, data: item.data });
  }

  function onSave(e) {
    // e.detail should contain { data }
    dispatch('update', { id: item.id, data: e.detail.data });
  }

  function onCancelEdit() {
    dispatch('cancel-edit');
  }

  function handleCardClick(e: MouseEvent) {
    // don't open edit if click was on controls (like the edit button) — those use stopPropagation
    // also ignore clicks when already editing to allow inner inputs to receive focus
    if (editing) return;
    dispatch('edit', { id: item.id, data: item.data });
  }
</script>

<div class="item-card" on:click={editing ? undefined : (e) => handleCardClick(e)} tabindex="0" on:keydown={editing ? undefined : (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(e as any); } }}>
  <div class="header">
    {#if !editing}
      <div class="title">{item?.data?.artist ?? item?.id}</div>
      <button class="edit-button" aria-label={`Edit ${item?.data?.artist || item?.id}`} on:click|stopPropagation={onEdit} title="Edit">
      <!-- simple pencil icon -->
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor" />
        <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor" />
      </svg>
      </button>
    {/if}
  </div>
  {#if !editing}
    <div class="meta">{item?.data?.date} — {item?.data?.venue}</div>
  {:else}
    <!-- Inline edit: render AddItemModal in edit mode replacing the card -->
    <AddItemModal initial={item.data} mode="edit" inline={true} on:update={onSave} on:cancel={onCancelEdit} />
  {/if}
</div>

<style>
:global(.item-card) { border: none }
.header { display:flex; align-items:center; justify-content:space-between; gap:0.5rem }
.title { font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap }
.edit-button { flex:0 0 auto }

/* Hide edit button until hover or focus for a cleaner UI */
.edit-button {
  opacity: 0;
  background: transparent;
  border: none;
  color: var(--muted, #666);
  padding: 0.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: opacity 120ms ease, background-color 120ms ease, color 120ms ease;
}
.item-card:hover .edit-button,
.edit-button:focus,
.edit-button:active {
  opacity: 1;
  background: var(--surface-hover, rgba(0,0,0,0.04));
  color: var(--accent, #1a73e8);
  outline: none;
}
.item-card:hover { background: color-mix(in srgb, var(--surface) 85%, black 3%); cursor: pointer }
.edit-button:focus-visible { box-shadow: 0 0 0 3px rgba(26,115,232,0.12); }

/* Mobile: stack header so button remains visible and accessible */
@media (max-width: 480px) {
  .header { flex-direction: column; align-items: flex-start; gap: 0.25rem }
  .edit-button { opacity: 1; align-self: flex-end }
}
/* local overrides kept minimal; base styles live in theme.css */
</style>
