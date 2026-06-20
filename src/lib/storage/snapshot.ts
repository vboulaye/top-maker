// Snapshot serialization and parsing for app export/import
import type { ComparisonEntry, Item } from '$lib/types';

export type AppSnapshot = {
  version: 1;
  exportedAt: string;
  items: Record<string, Item>;
  rankings: Record<string, string[]>;
  comparisons: ComparisonEntry[];
};

export function buildSnapshot(input: {
  items: Record<string, Item>;
  rankings: Record<string, string[]>;
  comparisons: ComparisonEntry[];
}): AppSnapshot {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    items: input.items,
    rankings: input.rankings,
    comparisons: input.comparisons
  };
}

export function parseSnapshot(json: string): AppSnapshot {
  const parsed = JSON.parse(json);

  if (parsed.version !== 1) {
    throw new Error('Unsupported snapshot version');
  }

  if (!parsed.items || !parsed.rankings || !Array.isArray(parsed.comparisons)) {
    throw new Error('Invalid snapshot format');
  }

  return parsed as AppSnapshot;
}

export function snapshotToJson(snapshot: AppSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

export default {
  buildSnapshot,
  parseSnapshot,
  snapshotToJson
};
