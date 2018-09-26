export const compareValue = (a, b) => {
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return a === b;
  if (a === null && b === null) return true;
  return Object.keys(a).every(key => compareValue(a[key], b[key]));
};

export const subscriptionComparator = args => (subArgs) => {
  if (args.length !== subArgs.length) {
    return false;
  }
  return args.every((value, position) => compareValue(value, subArgs[position]));
};

const initSub = (args, dispatch) => {
  const [method, ...trailing] = args;
  return method(...trailing)(dispatch);
};

const toSubscription = (args, dispatch) => ({
  isSub: subscriptionComparator(args),
  detach: initSub(args, dispatch),
  raw: args,
});

export const subscribeHandler = (prevSubs, subscriptions, dispatch) => {
  const nextSubs = subscriptions.filter(Array.isArray);

  const discontinuedSubs = prevSubs.filter(prevSub => (
    nextSubs.every(sub => !prevSub.isSub(sub))
  ));

  const continuedSubs = prevSubs.filter(prevSub => (
    nextSubs.some(newSub => prevSub.isSub(newSub))
  ));

  const newSubs = nextSubs.filter(newSub => (
    continuedSubs.every(sub => !sub.isSub(newSub))
  ));

  discontinuedSubs.forEach(oldSub => oldSub.detach());

  const addedSubs = newSubs.map(sub => toSubscription(sub, dispatch));
  return continuedSubs.concat(addedSubs);
};
