import { describe, expect, it } from 'vitest';
import { addItem, exportItems, replaceItems } from '../../lib/stores/itemsStore';

describe('itemsStore replaceItems', () => {
  it('replaces the in-memory and persisted item set', async () => {
    await addItem({ id: 'old', type: 'concert', createdAt: '2026-06-20T00:00:00.000Z', data: { artist: 'Old', date: '2026-06-20', venue: 'X' } });

    await replaceItems({
      fresh: { id: 'fresh', type: 'concert', createdAt: '2026-06-20T00:00:00.000Z', data: { artist: 'Fresh', date: '2026-06-21', venue: 'Y' } }
    });

    const exported = await exportItems();
    expect(Object.keys(exported)).toEqual(['fresh']);
  });
});
