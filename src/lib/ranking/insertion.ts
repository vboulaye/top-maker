export type CompareResult = 'a' | 'b' | 'tie' | 'unsure';

export async function findInsertIndex(ranking: string[], newId: string, compareFn: (aId: string, bId: string) => Promise<CompareResult>) {
  let low = 0;
  let high = ranking.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const res = await compareFn(newId, ranking[mid]);
    if (res === 'a') {
      high = mid;
    } else if (res === 'b') {
      low = mid + 1;
    } else if (res === 'tie') {
      // place in the same group as mid
      return { index: mid, group: mid };
    } else { // unsure
      // conservative approach: move to lower half (treat as worse)
      low = mid + 1;
    }
  }
  return { index: low };
}
