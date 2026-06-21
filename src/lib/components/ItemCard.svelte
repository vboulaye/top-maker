<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let item: any;
  const dispatch = createEventDispatcher();

  function onEdit() {
    dispatch('edit', { id: item.id, data: item.data });
  }
</script>

<div class="item-card">
  <div class="title">{item?.data?.artist ?? item?.id}</div>
  <div class="meta">{item?.data?.date} — {item?.data?.venue}</div>
  <button class="edit-button" aria-label={`Edit ${item?.data?.artist || item?.id}`} on:click={onEdit}>Edit</button>
</div>

<style>
:global(.item-card) { border: none }
/* local overrides kept minimal; base styles live in theme.css */
</style>
