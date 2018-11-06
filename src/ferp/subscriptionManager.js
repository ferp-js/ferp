import { freeze } from './freeze.js';
import { compareArrays } from './util/compareArrays.js';
import {
  memoizeStore,
  memoize,
  getMemoized,
} from './util/memoize.js';


export const subscriptionUpdate = (previousStore, subscriptions, dispatch) => {
  const nextSubs = subscriptions.filter(Array.isArray);

  const prevSubs = Array.from(previousStore.keys());

  const discontinuedSubs = prevSubs.filter(prevSub => (
    !nextSubs.some(sub => compareArrays(prevSub, sub))
  ));

  const continuedSubs = prevSubs.filter(prevSub => (
    nextSubs.some(newSub => compareArrays(prevSub, newSub))
  ));

  const newSubs = nextSubs.filter(newSub => (
    continuedSubs.every(sub => (
      !compareArrays(sub, newSub)
    ))
  ));

  discontinuedSubs.forEach((sub) => {
    const oldSub = getMemoized(sub, previousStore);
    oldSub.result();
  });

  let nextStore = memoizeStore();
  continuedSubs.forEach((sub) => {
    const oldSub = getMemoized(sub, previousStore);
    nextStore = memoize(sub, oldSub.result, nextStore);
  });

  newSubs.forEach((newSub) => {
    const [method, ...args] = newSub;
    const detach = method(...args)(dispatch);
    nextStore = memoize(newSub, detach, nextStore);
  });

  return nextStore;
};

export const subscriptionManager = (dispatch, subscribe) => {
  if (typeof subscribe !== 'function') return { next: () => {}, detach: () => {} };

  let store = memoizeStore();

  const next = (state) => {
    store = subscriptionUpdate(
      store,
      subscribe(freeze(state)),
      dispatch,
    );
  };

  const detach = () => {
    const callbacks = Array.from(store.values());
    callbacks.forEach(callback => callback());
  };

  return {
    next,
    detach,
  };
};
