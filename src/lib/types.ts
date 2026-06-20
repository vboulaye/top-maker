export type Item = {
  id: string;
  type: string;
  createdAt: string; // ISO
  data: Record<string, any>;
};

export type RankingKey = { type: string; year?: number };

export type ComparisonEntry = {
  id: string;
  aId: string;
  bId: string;
  winnerId: string | null;
  result: 'a' | 'b' | 'tie' | 'unsure';
  timestamp: string;
  note?: string;
};
