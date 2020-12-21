export function array2d<T>(size: number) {
  let arr = [] as T[][];
  for (let i = 0; i < size; i++) {
    arr.push([] as T[]);
  }
  return arr;
}
