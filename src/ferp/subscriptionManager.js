import { compareArrays } from './util/compareArrays.js';

const getDetachFromSignatureAndDispatch = (signature, dispatch) => {
  const [method, ...args] = signature;
  return method(...args)(dispatch);
};

const uniqueEntries = (previousEntries, allEntries) => (
  allEntries.reduce((entries, entry) => {
    const exists = entries.some(([signature]) => compareArrays(signature, entry[0]));

    if (exists) {
      return entries;
    }

    return [...entries, entry];
  }, previousEntries)
);

export const subscriptionUpdate = (previousStore, subscriptions, dispatch) => {
  const nextSubs = subscriptions.filter(Array.isArray);

  const allMemoizedEntries = uniqueEntries(
    previousStore,
    nextSubs.map((signature) => [signature, null]),
  );

  const nextEntries = allMemoizedEntries.reduce((entries, [signature, detach]) => {
    if (!detach) {
      return [...entries, [signature, getDetachFromSignatureAndDispatch(signature, dispatch)]];
    }

    const isContinued = nextSubs.some((sub) => compareArrays(sub, signature));
    if (!isContinued) {
      detach();
      return entries;
    }

    return [...entries, [signature, detach]];
  }, []);

  return nextEntries;
};

export const subscriptionManager = (dispatch, subscribe) => {
  if (typeof subscribe !== 'function') return { next: () => {}, detach: () => {} };

  let store = [];

  const next = (state) => {
    store = subscriptionUpdate(
      store,
      subscribe(state),
      dispatch,
    );
  };

  const detach = () => {
    store.forEach((arr) => arr[1]());
  };

  return {
    next,
    detach,
  };
};
