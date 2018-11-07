import { memoizeStore, memoize, memoizeGet } from './memoize.js';

export const storeKey = Symbol('store');

const pureWithMemoizedStore = (method, initialStore) => {
  let store = initialStore;

  const wrapped = (...args) => {
    const memoized = memoizeGet(args, store);
    if (memoized.found) {
      return memoized.result;
    }
    const result = method(...args);
    store = memoize(args, result, store);
    return result;
  };

  wrapped[storeKey] = () => store;

  return wrapped;
};

export const pure = method => pureWithMemoizedStore(method, memoizeStore());
