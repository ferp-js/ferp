export const isSubscription = (maybeSubscription) => (
  Array.isArray(maybeSubscription)
  && (typeof maybeSubscription[0] === 'function')
);

export const make = ([subscriptionFunction, ...parameters]) => ({
  function: subscriptionFunction,
  parameters,
  cancel: null,
});

export const start = (dispatch) => (subscription) => ({
  ...subscription,
  cancel: subscription.function(dispatch, ...subscription.parameters),
});

export const stop = (subscription) => {
  subscription.cancel();

  return make([subscription.function, ...subscription.parameters]);
};

const isSameFunction = (subA, subB) => subA.function === subB.function;

const isSameParameters = (subA, subB) => {
  const sameLength = subA.parameters.length === subB.parameters.length;
  return sameLength
    && subA.parameters.every((value, index) => value === subB.parameters[index]);
};

export const isSame = (subA, subB) => (
  isSameFunction(subA, subB)
  && isSameParameters(subA, subB)
);

export const collect = (list) => list.reduce(
  (memo, sub) => {
    if (!sub) return memo;

    const toAppend = isSubscription(sub)
      ? [make(sub)]
      : collect(sub);

    return [...memo, ...toAppend];
  },
  [],
);

export const sub = (subscriptionFunction, ...params) => [subscriptionFunction, ...params];
