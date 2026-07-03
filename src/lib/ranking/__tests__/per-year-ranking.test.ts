import { describe, it, expect } from 'vitest';
import { getRanking, setRanking, insertAt } from '../../stores/rankingStore';

describe('per-year ranking store', () => {
  it('keeps rankings isolated by year', async () => {
    await setRanking({ type: 'concert', year: 2024 }, []);
    await insertAt({ type: 'concert', year: 2024 }, 0, 'i2024a');
    const r2024 = await getRanking({ type: 'concert', year: 2024 });
    expect(r2024).toContain('i2024a');

    await setRanking({ type: 'concert', year: 2025 }, []);
    await insertAt({ type: 'concert', year: 2025 }, 0, 'i2025a');
    const r2025 = await getRanking({ type: 'concert', year: 2025 });
    expect(r2025).toContain('i2025a');

    const r2024Again = await getRanking({ type: 'concert', year: 2024 });
    expect(r2024Again).toContain('i2024a');
  });
});
