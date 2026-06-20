// Minimal File System Access API helpers

export function canUseFileSystemApi() {
  return typeof window !== 'undefined' && 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;
}

export async function pickOpenFile() {
  if (!canUseFileSystemApi()) return null;
  const [handle] = await (window as any).showOpenFilePicker({
    types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }]
  });
  return handle ?? null;
}

export async function pickSaveFile() {
  if (!canUseFileSystemApi()) return null;
  return (window as any).showSaveFilePicker({
    suggestedName: `top-maker-${new Date().getFullYear()}.json`,
    types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }]
  });
}

export async function readHandleText(handle: any) {
  const file = await handle.getFile();
  return file.text();
}

export async function writeHandleText(handle: any, text: string) {
  const writable = await handle.createWritable();
  await writable.write(text);
  await writable.close();
}

export default { canUseFileSystemApi, pickOpenFile, pickSaveFile, readHandleText, writeHandleText };
