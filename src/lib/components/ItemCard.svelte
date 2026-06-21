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
    <button class="edit-button" aria-label={`Edit ${item?.data?.artist || item?.id}`} on:click={onEdit}>Edit</button>
  </div>
  <div class="meta">{item?.data?.date} — {item?.data?.venue}</div>
</div>

<style>
:global(.item-card) { border: none }
.header { display:flex; align-items:center; justify-content:space-between; gap:0.5rem }
.title { font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap }
.edit-button { flex:0 0 auto }
/* local overrides kept minimal; base styles live in theme.css */
</style>
