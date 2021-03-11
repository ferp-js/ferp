import * as subscription from '../subscriptions/core.js';

const subscribeDiff = (previous, current) => current.reduce(
  (memo, currentSubscription) => {
    const previousIndex = memo.stopped.findIndex(
      (prev) => subscription.isSame(prev, currentSubscription),
    );

    if (previousIndex >= 0) {
      const previousSubscription = memo.stopped[previousIndex];
      memo.stopped.splice(previousIndex, 1);
      memo.active.push(previousSubscription);
    } else {
      memo.active.push(currentSubscription);
    }

    return memo;
  },
  {
    active: [],
    stopped: [...previous],
  },
);

export const subscribeStage = (subscriptions, state, dispatch, subscribe) => (action) => {
  if (subscribe) {
    const { active, stopped } = subscribeDiff(
      subscriptions.get(),
      subscription.collect(subscribe(state.get())),
    );

    subscriptions.set(active.map((sub) => (sub.cancel ? sub : subscription.start(dispatch)(sub))));
    stopped.forEach(subscription.stop);
  }

  return action;
};
