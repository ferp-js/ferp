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

export const subscribeStage = (setSubscriptions, subscribe) => (props) => {
  if (!subscribe) return props;

  let subscriptions = [];
  const { active, stopped } = subscribeDiff(
    props.subscriptions,
    subscription.collect(subscribe(props.state)),
  );

  subscriptions = active.map((sub) => (sub.cancel ? sub : subscription.start(props.dispatch)(sub)));

  setSubscriptions(subscriptions);
  stopped.forEach(subscription.stop);

  return {
    ...props,
    subscriptions,
  };
};
