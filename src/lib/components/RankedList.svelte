<script lang="ts">
  import ItemCard from './ItemCard.svelte';
  import { createEventDispatcher } from 'svelte';
  export let items: any[] = []; // array of item objects
  const dispatch = createEventDispatcher();

  function onEdit(ev: CustomEvent) {
    // forward edit events from ItemCard
    dispatch('edit', ev.detail);
  }
</script>

<div class="ranked-list">
  {#each items as item, i}
    <div class="rank-row">
      <div class="pos">#{i+1}</div>
      <div class="row-content"><ItemCard {item} on:edit={onEdit} /></div>
    </div>
  {/each}
</div>

<style>
.ranked-list { display:flex; flex-direction:column; gap:0.5rem }
.rank-row { display:flex; gap:1rem; align-items:stretch; margin:0 }
.pos { width:3rem; text-align:center; color:var(--muted); display:flex; align-items:center; justify-content:center }
.row-content { flex:1 }
/* ensure rows are consistent width and item cards fill available space */
:global(.item-card) { width:100%; box-sizing:border-box }
</style>
