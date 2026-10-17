type Entry = { artist: string; date: string; venue: string };
type ExistingItem = { data: { artist?: string; date?: string; venue?: string } };

export function deduplicateEntries(entries: Entry[], existingItems: ExistingItem[]): Entry[] {
  const keyFor = (entry: { artist?: string; date?: string; venue?: string }) =>
    [entry.artist, entry.date, entry.venue]
      .map((value) => (value || '').trim().toLowerCase())
      .join('||');

  const seen = new Set(existingItems.map((item) => keyFor(item.data)));
  const unique: Entry[] = [];

  for (const entry of entries) {
    const key = keyFor(entry);
    if (seen.has(key)) continue;

    seen.add(key);
    unique.push(entry);
  }

  return unique;
}
