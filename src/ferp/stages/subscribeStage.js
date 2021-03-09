class Subscription {
  static isSubscription(subscription) {
    return Array.isArray(subscription) && typeof subscription[0] === 'function';
  }

  constructor([subscriptionFn, ...params]) {
    this.subscriptionFn = subscriptionFn;
    this.params = params;
    this.instance = null;
  }

  valueOf() {
    return {
      subscriptionFn: this.subscriptionFn,
      params: [...this.params],
      instance: this.instance,
    };
  }

  start(dispatch) {
    this.instance = this.subscriptionFn(dispatch, ...this.params);
  }

  stop() {
    return this.instance();
  }

  isSameAs(otherSubscription) {
    return this.isSameFn(otherSubscription) && this.isSameParams(otherSubscription);
  }

  isSameFn(otherSubscription) {
    return otherSubscription.subscriptionFn === this.subscriptionFn;
  }

  isSameParams(otherSubscription) {
    const sameParamCount = this.params.length === otherSubscription.params.length;
    return sameParamCount && otherSubscription.params.every((otherParam, index) => (
      this.params[index] == otherParam // eslint-disable-line eqeqeq
    ));
  }
}

const toSubscriptionList = (subscriptions) => subscriptions.reduce(
  (memo, subscription) => {
    if (!subscription) return memo;

    const toAppend = Subscription.isSubscription(subscription)
      ? [new Subscription(subscription)]
      : toSubscriptionList(subscription);

    return [...memo, ...toAppend];
  },
  [],
);

const subscribeDiff = (previous, current) => current.reduce(
  (memo, currentSubscription) => {
    const previousIndex = memo.toStop.findIndex(
      (prev) => prev.isSameAs(currentSubscription),
    );

    if (previousIndex >= 0) {
      const previousSubscription = memo.toStop[previousIndex];
      memo.toStop.splice(previousIndex, 1);
      memo.all.push(previousSubscription);
    } else {
      memo.toStart.push(currentSubscription);
      memo.all.push(currentSubscription);
    }

    return memo;
  },
  {
    all: [],
    toStart: [],
    toStop: [...previous],
  },
);

export const subscribeStage = (subscriptions, state, subscribe) => (action) => {
  if (!subscribe) return action;

  const { all, toStart, toStop } = subscribeDiff(
    subscriptions.get(),
    subscribe(state.get()),
  );

  toStart.forEach((sub) => sub.start());
  toStop.forEach((sub) => sub.stop());

  subscriptions.set(all);

  return action;
};
