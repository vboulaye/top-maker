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
    await OneDrive.uploadFileToOneDrive(path, json);
    storageStatus.update((s) => ({ ...s, lastAction: 'saved-onedrive', lastError: null }));
  } catch (err) {
    storageStatus.update((s) => ({ ...s, lastError: 'failed-save-onedrive' }));
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

export default {
  storageStatus,
  exportJsonFile,
  importJsonText,
  openFromFileHandle,
  saveToFileHandle
};
