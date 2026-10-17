import { describe, expect, it } from 'vitest';
import { deduplicateEntries } from '../deduplicateEntries';

describe('deduplicateEntries', () => {
  it('keeps the first trimmed, case-insensitive match within new entries and against existing items', () => {
    const entries = [
      { artist: '  Radiohead ', date: '2026-06-01', venue: ' Forum ' },
      { artist: 'RADIOHEAD', date: '2026-06-01', venue: 'forum' },
      { artist: 'New Artist', date: '2026-06-02', venue: 'Arena' },
      { artist: ' new artist ', date: '2026-06-02', venue: 'ARENA ' }
    ];
    const existingItems = [
      { data: { artist: 'Already Added', date: '2026-06-03', venue: 'Hall' } }
    ];

    expect(deduplicateEntries(entries, existingItems)).toEqual([
      { artist: '  Radiohead ', date: '2026-06-01', venue: ' Forum ' },
      { artist: 'New Artist', date: '2026-06-02', venue: 'Arena' }
    ]);
  });

  it('excludes a new entry matching an existing item regardless of case or surrounding whitespace', () => {
    const entries = [
      { artist: ' already added ', date: '2026-06-03', venue: ' hall ' }
    ];

    expect(deduplicateEntries(entries, [
      { data: { artist: 'Already Added', date: '2026-06-03', venue: 'Hall' } }
    ])).toEqual([]);
  });
});
