import { compareArrays } from './compareArrays.js';

export const memoizeStore = (initialMap = []) => new Map(
  initialMap.filter(entry => typeof entry[1] !== 'undefined'),
);

export const memoizeSize = store => store.size;

export const memoizeGet = (arr, store) => {
  for (const [storedArr, result] of store.entries()) { // eslint-disable-line no-restricted-syntax
    const areArraysTheSame = compareArrays(arr, storedArr);

    if (areArraysTheSame) {
      return [storedArr, result];
    }
  }

  return undefined;
};

export const memoize = (arr, result, store) => {
  const entries = Array.from(store.entries())
    .filter(entry => !compareArrays(arr, entry[0]));

  return memoizeStore([
    ...entries,
    [arr, result],
  ]);
};
