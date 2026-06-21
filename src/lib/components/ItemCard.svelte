<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let item: any;
  const dispatch = createEventDispatcher();

  function onEdit() {
    dispatch('edit', { id: item.id, data: item.data });
  }
</script>

<div class="item-card">
  <div class="header">
    <div class="title">{item?.data?.artist ?? item?.id}</div>
    <button class="edit-button" aria-label={`Edit ${item?.data?.artist || item?.id}`} on:click={onEdit} title="Edit">
      <!-- simple pencil icon -->
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor" />
        <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor" />
      </svg>
    </button>
  </div>
  <div class="meta">{item?.data?.date} — {item?.data?.venue}</div>
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
.edit-button:focus-visible { box-shadow: 0 0 0 3px rgba(26,115,232,0.12); }

/* Mobile: stack header so button remains visible and accessible */
@media (max-width: 480px) {
  .header { flex-direction: column; align-items: flex-start; gap: 0.25rem }
  .edit-button { opacity: 1; align-self: flex-end }
}
/* local overrides kept minimal; base styles live in theme.css */
</style>
