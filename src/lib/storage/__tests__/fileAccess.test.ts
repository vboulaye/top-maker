import { describe, expect, it, vi } from 'vitest';
import { canUseFileSystemApi } from '../fileAccess';

describe('fileAccess', () => {
  it('detects availability from window.showSaveFilePicker', () => {
    // stub window with save picker
    const original = (global as any).window;
    (global as any).window = { showSaveFilePicker: vi.fn(), showOpenFilePicker: vi.fn() } as any;
    try {
      expect(canUseFileSystemApi()).toBe(true);
    } finally {
      (global as any).window = original;
    }
  });
});
