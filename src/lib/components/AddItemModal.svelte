<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let onAddAndRank: (data: any) => void;
  // initial values when used for editing
  export let initial: { artist?: string; date?: string; venue?: string } | null = null;
  export let mode: 'add' | 'edit' = 'add';

  let artist = '';
  let date = '';
  let venue = '';
  let fastEntry = '';
  let fastError: string | null = null;

  const dispatch = createEventDispatcher();

  function addAndRank() {
    // prefer fastEntry if present
    const parsed = fastEntry && fastEntry.trim().length > 0 ? parseFastEntry(fastEntry) : null;
    const data = parsed ? { artist: parsed.artist || '', date: parsed.date || '', venue: parsed.venue || '' } : { artist, date, venue };
    // clear fastEntry after using it
    if (parsed) fastEntry = '';
    if (onAddAndRank) onAddAndRank(data);
    if (mode === 'edit') {
      // emit update event including id must be provided by parent via initial in edit mode
      dispatch('update', { data });
    } else {
      dispatch('add', { data, rank: true });
    }
  }

  // Parse fast-entry format: "Artist [YYYY-MM-DD Location...]"
  function parseFastEntry(text: string): { artist: string; date?: string; venue?: string } | null {
    let trimmed = (text || '').trim();
    if (!trimmed) return null;

    // If there is a slash, prefer the substring after the last slash (ignore file paths/prefixes)
    const lastSlash = trimmed.lastIndexOf('/');
    if (lastSlash >= 0) trimmed = trimmed.slice(lastSlash + 1).trim();

    // If there's a closing bracket, ignore anything after the first closing bracket
    const firstClose = trimmed.indexOf(']');
    if (firstClose >= 0) trimmed = trimmed.slice(0, firstClose + 1).trim();

    // Find artist and bracket content using explicit indices for robustness
    const openIdx = trimmed.indexOf('[');
    const closeIdx = trimmed.indexOf(']');
    if (openIdx === -1 || closeIdx === -1 || closeIdx <= openIdx) {
      // no bracketed metadata — treat whole string (without extension) as artist
      const noExt = trimmed.replace(/\.[^.\s]{1,5}$/, '').trim();
      return { artist: noExt };
    }

    const artistPart = trimmed.slice(0, openIdx).trim();
    const inside = trimmed.slice(openIdx + 1, closeIdx).trim();
    if (!inside) return { artist: artistPart };

    // inside may be: "YYYY-MM-DD Location..." or just "Location" or just "YYYY-MM-DD"
    const isoMatch = inside.match(/^(\d{4}-\d{2}-\d{2})(?:\s+(.*))?$/);
    if (isoMatch) {
      const isoDate = isoMatch[1];
      const venuePart = (isoMatch[2] || '').trim();
      return { artist: artistPart, date: isoDate, venue: venuePart };
    }

    // fallback: no iso date, treat whole inside as venue
    return { artist: artistPart, date: '', venue: inside };
  }

  function submitFastEntry() {
    fastError = null;
    const parsed = parseFastEntry(fastEntry || '');
    if (!parsed) return;

    // If bracket existed but date is non-empty and invalid, show error
    if (fastEntry.includes('[') && fastEntry.includes(']')) {
      const inside = fastEntry.replace(/^[^[]*\[|\].*$/g, '').trim();
      // if inside starts with something that looks date-like but not iso, treat as error
      const first = inside.split(/\s+/)[0] || '';
      if (first && /^\d{1,4}[-\/]\d{1,2}[-\/]?\d{0,2}$/.test(first) && !/^\d{4}-\d{2}-\d{2}$/.test(first)) {
        fastError = 'Date must be in ISO format YYYY-MM-DD inside brackets.';
        return;
      }
    }

    // Populate fields and submit as Add Without Ranking (legacy comment)
    artist = parsed.artist || '';
    date = parsed.date || '';
    venue = parsed.venue || '';
    // clear fast entry
    fastEntry = '';
    // use addAndRank (without comparisons) to add and close modal — we no longer have addWithout
    if (onAddAndRank) onAddAndRank({ artist, date, venue });
    if (mode === 'edit') dispatch('update', { data: { artist, date, venue } });
    else dispatch('add', { data: { artist, date, venue }, rank: false });
  }

  // Live-parse fastEntry so clicking "Add and Rank" uses parsed values
  $: if (fastEntry && fastEntry.trim().length > 0) {
    const p = parseFastEntry(fastEntry);
    if (p) {
      // populate fields but do not clear fastEntry
      artist = p.artist || '';
      date = p.date || '';
      venue = p.venue || '';
      fastError = null;
    }
  }

  // if initial values provided (edit mode), initialize fields
  $: if (initial) {
    artist = initial.artist || '';
    date = initial.date || '';
    venue = initial.venue || '';
  }
</script>

<div class="modal">
  <label>Fast entry
    <input
      placeholder="Coldplay [2026-06-20 Royal Albert Hall]"
      bind:value={fastEntry}
      on:keydown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitFastEntry();
        }
        if (e.key === 'Escape') {
          fastEntry = '';
          fastError = null;
        }
      }}
    />
  </label>
  {#if fastError}
    <div role="alert" class="fast-error">{fastError}</div>
  {/if}
  <label>Artist<input name="artist" bind:value={artist} /></label>
  <label>Date<input name="date" type="date" bind:value={date} /></label>
  <label>Venue<input name="venue" bind:value={venue} /></label>
  <div class="actions">
    <button on:click={addAndRank}>{mode === 'edit' ? 'Save' : 'Add and Rank'}</button>
    <button class="secondary" on:click={() => { fastEntry = ''; fastError = null; artist = ''; date = ''; venue = ''; dispatch('cancel'); }}>
      Cancel
    </button>
  </div>
</div>

<style>
label { display:block; margin:0.5rem 0 }
.actions { margin-top:1rem }
.fast-error { color: #b00020; font-size: 0.9rem; margin-top: 0.25rem }
</style>
