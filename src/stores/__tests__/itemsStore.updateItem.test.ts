import { describe, it, expect, beforeEach } from 'vitest';
import { addItem, updateItem, exportItems, replaceItems } from '../../lib/stores/itemsStore';

describe('itemsStore updateItem', () => {
  beforeEach(async () => {
    // clear and set a known item
    await replaceItems({});
    await addItem({ id: 't1', type: 'concert', createdAt: new Date().toISOString(), data: { artist: 'A', date: '2026-01-01', venue: 'V' } });
  });

  it('updates item data in memory and persistence', async () => {
    await updateItem('t1', { artist: 'A2', venue: 'V2' });
    const exported = await exportItems();
    expect(exported['t1']).toBeTruthy();
    expect(exported['t1'].data.artist).toBe('A2');
    expect(exported['t1'].data.venue).toBe('V2');
  });
});
