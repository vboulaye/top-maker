import { describe, it, expect } from 'vitest';

describe('findInsertIndex', () => {
  it('inserts into empty list', async () => {
    const mod = await import('../insertion.js');
    const idx = await mod.findInsertIndex([], 'new', async () => 'a');
    expect(idx.index).toBe(0);
  });

  it('finds correct position in simple ranking', async () => {
    const mod = await import('../insertion.js');
    const ranking = ['a','b','c','d'];
    const compareFn = async (x,y) => {
      const order = ['a','b','new','c','d'];
      return order.indexOf(x) < order.indexOf(y) ? 'a' : 'b';
    };
    const res = await mod.findInsertIndex(ranking, 'new', compareFn);
    expect(res.index).toBe(2);
  });
});
