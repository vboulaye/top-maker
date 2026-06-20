import { describe, it, expect } from 'vitest';
import { addItem, getItem, listItems } from '../itemsStore';

describe('itemsStore', () => {
  it('adds and retrieves an item', async () => {
    const item = { id: 'i1', type: 'concert', createdAt: new Date().toISOString(), data: { artist: 'A', date: '2026-01-01', venue: 'V' } };
    await addItem(item);
    const got = await getItem('i1');
    expect(got.id).toBe(item.id);
  });

  it('lists items', async () => {
    const items = await listItems();
    expect(Array.isArray(items)).toBe(true);
  });
});
