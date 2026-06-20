<script lang="ts">
  import ItemCard from './ItemCard.svelte';
  export let items: any[] = []; // array of item objects
</script>

<div class="ranked-list">
  {#each items as item, i}
    <div class="rank-row">
      <div class="pos">#{i+1}</div>
      <ItemCard {item} />
    </div>
  {/each}
</div>

<style>
.rank-row { display:flex; gap:1rem; align-items:center; margin:0.5rem 0 }
.pos { width:2rem; text-align:center }
</style>
