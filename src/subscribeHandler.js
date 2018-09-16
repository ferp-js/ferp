const compareValue = (a, b) => {
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return a === b;
  if (a === null && b === null) return true;
  return Object.keys(a).every(key => compareValue(a[key], b[key]));
};

const subscriptionComparator = args => (subArgs) => {
  if (args.length !== subArgs.length) return false;
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
  const initialSubs = prevSubs.filter((prevSub) => {
    const keepSub = subscriptions.some(sub => prevSub.isSub(sub));
    if (!keepSub) prevSub.detach();
    return keepSub;
  });

  const newSubs = subscriptions.filter(Boolean).filter(nextSub => (
    !prevSubs.some(sub => sub.isSub(nextSub))
  ));

  return initialSubs.concat(newSubs.map(sub => toSubscription(sub, dispatch)));
};
