import { describe, it, expect } from 'vitest';
import { recordUndoSnapshot, lastSnapshot, undo } from '../undoStore';
import { replaceItems, exportItems } from '../itemsStore';
import { replaceRankings, exportRankings } from '../rankingStore';
import { replaceComparisons, exportComparisons } from '../comparisonsStore';

describe('undoStore', () => {
  it('records a snapshot and undoes to previous state', async () => {
    // initial state
    const initialItems = {
      a: { id: 'a', type: 'concert', createdAt: new Date().toISOString(), data: { artist: 'Alpha', date: '2026-01-01', venue: 'V1' } }
    };
    const initialRankings = { 'concert:2026': ['a'] };
    const initialComparisons: any[] = [];

    await replaceItems(initialItems);
    await replaceRankings(initialRankings);
    await replaceComparisons(initialComparisons);

    const exportedBeforeItems = await exportItems();
    const exportedBeforeRankings = await exportRankings();
    const exportedBeforeComparisons = await exportComparisons();

    // record undo snapshot
    await recordUndoSnapshot('test-undo', {
      items: exportedBeforeItems,
      rankings: exportedBeforeRankings,
      comparisons: exportedBeforeComparisons
    });

    // lastSnapshot store should be set
    let snap: any = null;
    lastSnapshot.subscribe((s) => (snap = s))();
    expect(snap).not.toBeNull();
    expect(snap.label).toBe('test-undo');

    // mutate state
    await replaceItems({ b: { id: 'b', type: 'concert', createdAt: new Date().toISOString(), data: { artist: 'Beta', date: '2026-02-02', venue: 'V2' } } });
    await replaceRankings({});

    // ensure mutated
    const mutated = await exportItems();
    expect(mutated.b).toBeTruthy();

    // perform undo
    const ok = await undo();
    expect(ok).toBe(true);

    const afterItems = await exportItems();
    const afterRankings = await exportRankings();
    const afterComparisons = await exportComparisons();

    expect(afterItems).toEqual(exportedBeforeItems);
    expect(afterRankings).toEqual(exportedBeforeRankings);
    expect(afterComparisons).toEqual(exportedBeforeComparisons);
  });
});
