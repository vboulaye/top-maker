import { describe, expect, it } from 'vitest';
import { buildSnapshot, parseSnapshot } from '../snapshot';

describe('snapshot', () => {
  it('serializes and parses app state', () => {
    const snapshot = buildSnapshot({
      items: {
        a: { id: 'a', type: 'concert', createdAt: '2026-06-20T00:00:00.000Z', data: { artist: 'A', date: '2026-06-20', venue: 'Bercy' } }
      },
      rankings: { 'concert:2026': ['a'] },
      comparisons: []
    });

    const parsed = parseSnapshot(JSON.stringify(snapshot));
    expect(parsed.version).toBe(1);
    expect(parsed.items.a.data.artist).toBe('A');
    expect(parsed.rankings['concert:2026']).toEqual(['a']);
  });
});
