import { memoizeStore, memoize, memoizeGet } from './memoize.js';

const getStoreKey = Symbol('getStore');

const pureWithMemoizedStore = (method, initialStore) => {
  let store = initialStore;

  const wrapped = (...args) => {
    const memoized = memoizeGet(args, store);
    if (memoized) {
      return memoized[1];
    }
    const result = method(...args);
    store = memoize(args, result, store);
    return result;
  };

  wrapped[getStoreKey] = () => store;

  return wrapped;
};

export const pure = method => pureWithMemoizedStore(method, memoizeStore());
export const pureGetStore = pureMethod => pureMethod[getStoreKey]();
