export async function findInsertIndex(ranking, newId, compareFn) {
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
      return { index: mid, group: mid };
    } else {
      low = mid + 1;
    }
  }
  return { index: low };
}
