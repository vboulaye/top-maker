import { writable } from 'svelte/store';
import { buildSnapshot, parseSnapshot, snapshotToJson } from '$lib/storage/snapshot';
import { exportItems, replaceItems } from '$lib/stores/itemsStore';
import { exportRankings, replaceRankings } from '$lib/stores/rankingStore';
import { exportComparisons, replaceComparisons } from '$lib/stores/comparisonsStore';
import { canUseFileSystemApi, pickOpenFile, pickSaveFile, readHandleText, writeHandleText } from '$lib/storage/fileAccess';

export const storageStatus = writable({
  canUseFileSystemApi: typeof window !== 'undefined' && canUseFileSystemApi(),
  lastAction: null as string | null,
  lastError: null as string | null,
  currentFileHandle: null as any | null
});

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

export default {
  storageStatus,
  exportJsonFile,
  importJsonText,
  openFromFileHandle,
  saveToFileHandle
};
