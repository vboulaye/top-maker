<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let onAddAndRank: (data: any) => void;
  export let onAddWithoutRanking: (data: any) => void;

  let artist = '';
  let date = '';
  let venue = '';

  const dispatch = createEventDispatcher();

  function addAndRank() {
    const data = { artist, date, venue };
    if (onAddAndRank) onAddAndRank(data);
    dispatch('add', { data, rank: true });
  }
  function addWithout() {
    const data = { artist, date, venue };
    if (onAddWithoutRanking) onAddWithoutRanking(data);
    dispatch('add', { data, rank: false });
  }
</script>

<div class="modal">
  <label>Artist<input bind:value={artist} /></label>
  <label>Date<input type="date" bind:value={date} /></label>
  <label>Venue<input bind:value={venue} /></label>
  <div class="actions">
    <button on:click={addAndRank}>Add and Rank</button>
    <button on:click={addWithout}>Add Without Ranking</button>
  </div>
</div>

<style>
label { display:block; margin:0.5rem 0 }
.actions { margin-top:1rem }
</style>
