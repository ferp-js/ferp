import * as subscription from '../subscriptions/core.js';

const subscribeDiff = (previous, current) => current.reduce(
  (memo, currentSubscription) => {
    const previousIndex = memo.toStop.findIndex(
      (prev) => subscription.isSame(prev, currentSubscription),
    );

    if (previousIndex >= 0) {
      const previousSubscription = memo.toStop[previousIndex];
      memo.toStop.splice(previousIndex, 1);
      memo.toContinue.push(previousSubscription);
    } else {
      memo.toStart.push(currentSubscription);
    }

    return memo;
  },
  {
    toContinue: [],
    toStart: [],
    toStop: [...previous],
  },
);

export const subscribeStage = (subscriptions, state, dispatch, subscribe) => (action) => {
  if (!subscribe) return action;

  const { toContinue, toStart, toStop } = subscribeDiff(
    subscriptions.get(),
    subscription.collect(subscribe(state.get())),
  );

  const newSubs = toStart.map(subscription.start(dispatch));
  toStop.forEach(subscription.stop);

  subscriptions.set(toContinue.concat(newSubs));

  return action;
};
