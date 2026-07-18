import { writable } from 'svelte/store';
import { buildSnapshot, parseSnapshot, snapshotToJson } from '$lib/storage/snapshot';
import { exportItems, replaceItems } from '$lib/stores/itemsStore';
import { exportRankings, replaceRankings } from '$lib/stores/rankingStore';
import { exportComparisons, replaceComparisons } from '$lib/stores/comparisonsStore';
import { canUseFileSystemApi, pickOpenFile, pickSaveFile, readHandleText, writeHandleText } from '$lib/storage/fileAccess';
import OneDrive from '$lib/storage/onedrive';

export const storageStatus = writable({
  canUseFileSystemApi: typeof window !== 'undefined' && canUseFileSystemApi(),
  lastAction: null as string | null,
  lastError: null as string | null,
  currentFileHandle: null as any | null
});

// expose helper to open OneDrive auth flow in E2E if needed
try {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.__topmaker_saveOneDrive = async (path?: string) => {
      return await saveToOneDrive(path);
    };
    // @ts-ignore
    window.__topmaker_loadOneDrive = async (path?: string) => {
      return await loadFromOneDrive(path);
    };
  }
} catch (e) {}

// Helper to surface detailed debug info in the console
try {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.__topmaker_onedrive_status = () => ({ lastAction: null, lastError: null, tokens: null, clientIdOverride: null });
  }
} catch (e) {}

// Provide a richer runtime inspector that actually returns live state
try {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.__topmaker_onedrive_status = () => {
      let s: any;
      storageStatus.subscribe((v) => (s = v))();
      let toks = null;
      try { toks = (window as any).localStorage.getItem('topmaker_onedrive_tokens'); } catch (e) {}
      let cid = null;
      try { cid = (window as any).localStorage.getItem('topmaker_onedrive_client_id_override') || (import.meta as any).env?.PUBLIC_ONEDRIVE_CLIENT_ID || null; } catch (e) {}
      return { status: s, tokens: toks ? JSON.parse(toks) : null, clientId: cid };
    };
  }
} catch (e) {}

export async function exportJsonFile() {
  try {
    const snapshot = buildSnapshot({
      items: await exportItems(),
      rankings: await exportRankings(),
      comparisons: await exportComparisons()
    });

    const blob = new Blob([snapshotToJson(snapshot)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `top-maker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    storageStatus.update((s) => ({ ...s, lastAction: 'exported-json', lastError: null }));
  } catch (err) {
    storageStatus.update((s) => ({ ...s, lastError: 'failed-export' }));
    throw err;
  }
}

export async function importJsonText(json: string) {
  try {
    // "Replace All" import semantics chosen by user

    const snapshot = parseSnapshot(json);
    await replaceItems(snapshot.items);
    await replaceRankings(snapshot.rankings);
    await replaceComparisons(snapshot.comparisons);
    storageStatus.update((s) => ({ ...s, lastAction: 'imported-json', lastError: null }));
  } catch (err) {
    storageStatus.update((s) => ({ ...s, lastError: 'failed-import' }));
    throw err;
  }
}

export async function openFromFileHandle() {
  if (!canUseFileSystemApi()) {
    storageStatus.update((s) => ({ ...s, lastError: 'fsapi-unavailable' }));
    return;
  }
  const handle = await pickOpenFile();
  if (!handle) return;
  const text = await readHandleText(handle);
  await importJsonText(text);
  storageStatus.update((s) => ({ ...s, currentFileHandle: handle, lastAction: 'opened-file', lastError: null }));
}

export async function saveToFileHandle() {
  try {
    let handle: any;
    let statusObj: any;
    storageStatus.subscribe((s) => (statusObj = s))();
    handle = statusObj.currentFileHandle;
    if (!handle) {
      handle = await pickSaveFile();
      if (!handle) return;
    }
    const snapshot = buildSnapshot({
      items: await exportItems(),
      rankings: await exportRankings(),
      comparisons: await exportComparisons()
    });
    await writeHandleText(handle, snapshotToJson(snapshot));
    storageStatus.update((s) => ({ ...s, currentFileHandle: handle, lastAction: 'saved-file', lastError: null }));
  } catch (err) {
    storageStatus.update((s) => ({ ...s, lastError: 'failed-save-file' }));
    throw err;
  }
}

export async function saveToOneDrive(path = '/top-maker.json') {
  try {
    // ensure tokens exist or prompt user
    await OneDrive.ensureAuthenticatedInteractive();
    const snapshot = buildSnapshot({ items: await exportItems(), rankings: await exportRankings(), comparisons: await exportComparisons() });
    const json = snapshotToJson(snapshot);
    const res = await OneDrive.uploadFileToOneDrive(path, json);
    // include some details in lastAction for debugging (file id or name if present)
    const info = res && (res.id || res.name) ? `saved-onedrive:${res.name || res.id}` : 'saved-onedrive';
    storageStatus.update((s) => ({ ...s, lastAction: info, lastError: null }));
    return res;
  } catch (err) {
    // surface error message for debugging
    const msg = err instanceof Error ? err.message : String(err);
    storageStatus.update((s) => ({ ...s, lastError: `failed-save-onedrive: ${msg}` }));
    throw err;
  }
}

export async function loadFromOneDrive(path = '/top-maker.json') {
  try {
    await OneDrive.ensureAuthenticatedInteractive();
    const txt = await OneDrive.downloadFileFromOneDrive(path);
    await importJsonText(txt);
    storageStatus.update((s) => ({ ...s, lastAction: 'loaded-onedrive', lastError: null }));
  } catch (err) {
    storageStatus.update((s) => ({ ...s, lastError: 'failed-load-onedrive' }));
    throw err;
  }
}

// Wire UI helper buttons into the actions menu if running in browser
try {
  if (typeof document !== 'undefined') {
    // Add menu entries exist in +page.svelte; tests can call window.__topmaker_saveOneDrive directly.
  }
} catch (e) {}

export default {
  storageStatus,
  exportJsonFile,
  importJsonText,
  openFromFileHandle,
  saveToFileHandle
};
