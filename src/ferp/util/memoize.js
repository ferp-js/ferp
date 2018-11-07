import { compareArrays } from './compareArrays.js';

export const memoizeStore = initialMap => new Map(initialMap);

export const memoizeSize = store => store.size;

export const memoizeGet = (arr, store) => {
  for (const [storedArr, result] of store.entries()) { // eslint-disable-line no-restricted-syntax
    const isShallowMatch = compareArrays(arr, storedArr);

    if (isShallowMatch) {
      return { found: true, key: storedArr, result };
    }
  }

  return { found: false, key: undefined, result: undefined };
};

export const memoize = (arr, result, store) => {
  const memoized = memoizeGet(arr, store);

  const key = memoized.found
    ? memoized.key
    : arr;

  const initialEntries = Array.from(store.entries());

  const entries = [...initialEntries, [key, result]];

  return new Map(entries);
};
