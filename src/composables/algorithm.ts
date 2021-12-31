export const sum = (array: number[], start = 0, end = array.length): number =>
  array.slice(start, end).reduce((xs, x) => xs + x, 0);

export const average = (array: number[], start = 0, end = array.length): number =>
  sum(array, start, end) / (end - start);
