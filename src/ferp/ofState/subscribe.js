/* eslint-disable no-restricted-syntax */

import { make } from './make';

class Subscription {
  static isSubscription(subscription) {
    return Array.isArray(subscription) && typeof subscription[0] === 'function';
  }

  constructor([subscriptionFn, ...params]) {
    this.subscriptionFn = subscriptionFn;
    this.params = params;
    this.generator = null;
  }

  valueOf() {
    return {
      subscriptionFn: this.subscriptionFn,
      params: [...this.params],
      generator: this.generator,
    };
  }

  start(dispatch) {
    this.generator = this.susbcriptionFn(dispatch, ...this.params);
  }

  stop() {
    this.generator.return();
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
      (prev) => prev.isSameSubscription(currentSubscription),
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

function* subscribeGenerator(dispatch, subscribeFn) {
  let subscriptions = [];

  while (true) {
    const state = yield subscriptions;

    const current = toSubscriptionList(subscribeFn(state));
    const { all, toStart, toStop } = subscribeDiff(subscriptions, current);
    toStart.forEach((sub) => sub.start(dispatch));
    toStop.forEach((sub) => sub.stop());
    subscriptions = all;
  }
}

export const subscribe = (dispatch, subscribeFn) => make(dispatch, subscribeGenerator, subscribeFn);
