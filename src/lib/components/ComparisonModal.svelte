<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Item } from '$lib/types';
  export let itemA: Item;
  export let itemB: Item;
  export let onResult: (r: 'a' | 'b' | 'tie' | 'unsure') => void;

  const dispatch = createEventDispatcher();

  function result(r: 'a' | 'b' | 'tie' | 'unsure') {
    if (onResult) onResult(r);
    dispatch('result', { result: r });
  }

  function onKey(e: KeyboardEvent) {
    const k = e.key.toLowerCase();
    if (k === 'b') result('a');
    else if (k === 'w') result('b');
    else if (k === 'e') result('tie');
    else if (k === 'u') result('unsure');
    else if (k === 'escape') dispatch('cancel');
  }

  onMount(() => {
    // focus for accessibility
    const btn = document.getElementById('btn-better') as HTMLButtonElement | null;
    if (btn) btn.focus();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
</script>

<div class="modal" role="dialog" aria-modal="true">
  <div class="cards">
    <article role="article" aria-label="Item A" class="card">
      <div class="title">{itemA?.data?.artist ?? itemA?.id}</div>
      <div class="meta">{itemA?.data?.date} — {itemA?.data?.venue}</div>
    </article>
    <article role="article" aria-label="Item B" class="card">
      <div class="title">{itemB?.data?.artist ?? itemB?.id}</div>
      <div class="meta">{itemB?.data?.date} — {itemB?.data?.venue}</div>
    </article>
  </div>

  <div class="actions">
    <button id="btn-better" aria-label="Better (B)" on:click={() => result('a')}>Better</button>
    <button id="btn-worse" aria-label="Worse (W)" on:click={() => result('b')}>Worse</button>
    <button id="btn-equal" aria-label="Equal (E)" on:click={() => result('tie')}>Equal</button>
    <button id="btn-unsure" aria-label="Unsure (U)" on:click={() => result('unsure')}>Not sure</button>
  </div>
</div>

<style>
.modal { padding: 1rem; }
.cards { display: flex; gap: 1rem; }
.card { border: 1px solid #ddd; padding: 0.5rem; width: 200px; }
.actions { margin-top: 1rem; display:flex; gap:0.5rem; }
button { padding: 0.5rem 1rem; }
</style>
