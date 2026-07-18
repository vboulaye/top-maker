<script lang="ts">
  import { onMount } from 'svelte';
  import { storageStatus } from '$lib/stores/storageStore';
  import { writable } from 'svelte/store';

  const clientId = writable('');
  const path = writable('/Apps/TopMaker/top-maker.json');
  const status = storageStatus;

  onMount(() => {
    try {
      const o = localStorage.getItem('topmaker_onedrive_client_id_override');
      if (o) clientId.set(o);
      const p = localStorage.getItem('topmaker_onedrive_path');
      if (p) path.set(p);
    } catch (e) {}
  });

  function saveSettings() {
    clientId.subscribe((v) => { try { localStorage.setItem('topmaker_onedrive_client_id_override', v || ''); } catch (e) {} })();
    path.subscribe((v) => { try { localStorage.setItem('topmaker_onedrive_path', v || '/Apps/TopMaker/top-maker.json'); } catch (e) {} })();
    alert('Settings saved. You may need to reconnect to OneDrive if you changed the client id.');
  }

  async function connect() {
    try {
      const OneDrive = await import('$lib/storage/onedrive');
      await OneDrive.ensureAuthenticatedInteractive();
      storageStatus.update((s) => ({ ...s, lastAction: 'connected-onedrive', lastError: null }));
    } catch (e) {
      storageStatus.update((s) => ({ ...s, lastError: 'failed-connect-onedrive' }));
      console.error(e);
    }
  }

  async function backup() {
    try {
      let p: string | null = null;
      path.subscribe((v) => (p = v))();
      const store = await import('$lib/stores/storageStore');
      await store.saveToOneDrive(p || '/Apps/TopMaker/top-maker.json');
    } catch (e) {
      console.error(e);
    }
  }
</script>

<div class="onedrive-settings">
  <h3>OneDrive Settings</h3>
  <label>
    Client ID (override for debugging)
    <input bind:value={$clientId} placeholder="VITE_ONEDRIVE_CLIENT_ID or override here" />
  </label>
  <label>
    Backup path
    <input bind:value={$path} />
  </label>
  <div class="actions">
    <button on:click={saveSettings}>Save Settings</button>
    <button on:click={connect}>Connect</button>
    <button on:click={backup}>Backup Now</button>
  </div>
  {#if $status.lastAction}
    <div class="status">Last: {$status.lastAction}</div>
  {/if}
  {#if $status.lastError}
    <div class="error" role="alert">Error: {$status.lastError}</div>
  {/if}
</div>

<style>
  .onedrive-settings { border: 1px solid #ddd; padding: 12px; border-radius: 6px; max-width: 520px; }
  label { display: block; margin-bottom: 8px; }
  input { width: 100%; padding: 6px; margin-top: 4px; }
  .actions { display:flex; gap:8px; margin-top:8px }
  .status { margin-top:8px; color: #060 }
  .error { margin-top:8px; color: #900 }
</style>
