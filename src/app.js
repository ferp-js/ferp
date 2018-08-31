const { Effect } = require('./types/effect.js');

const app = ({
  init,
  update,
  subscribe,
  middleware,
}) => {
  let state = null;
  let subscriptions = [];
  let killSwitch = false;

  const updateWithMiddleware = (middleware || []).reduce((all, method) => {
    return method(all);
  }, update);

  function isSubscription(subscription, id) {
    return subscription.id === id;
  }

  function getSubscriptionDetach(previousSubscriptions, { id, method, params }) {
    const sub = previousSubscriptions.find((sub) => isSubscription(sub, id));
    if (sub && sub.detach) return sub.detach;
    return method(...params)(dispatch);
  }

  function handleSubscriptions(previousSubscriptions, state) {
    if (!subscribe) return [];

    const nextSubscriptions = subscribe(state)
      .filter(Array.isArray)
      .map(([id, method, ...params]) => ({
        id,
        method,
        params,
        detach: getSubscriptionDetach(previousSubscriptions, { id, method, params }),
      }));

    previousSubscriptions
      .filter((prevSub) => (
        !nextSubscriptions.find((nextSub) => isSubscription(nextSub, prevSub.id))
      ))
      .forEach((removedSub) => {
        removedSub.detach();
      });

    return nextSubscriptions;
  }

  function updateState(newState) {
    if (newState === undefined) return;
    subscriptions = handleSubscriptions(subscriptions, newState);

    state = newState;
  }

  function runEffect(effect) {
    if (killSwitch) return;

    if (effect instanceof Effect) {
      return effect
        .then(dispatch)
        .catch((err) => {
          console.log('error', err);
        });
    } else if (typeof effect === 'function') {
      return effect(dispatch);
    }
    return Promise.resolve();
  };

  function handleUpdate([newState, effect]) {
    updateState(newState);
    return runEffect(effect);
  }

  function dispatch(message) {
    if (!message) return Promise.resolve();
    return handleUpdate(updateWithMiddleware(message, state));
  };

  handleUpdate(init());

  return () => {
    killSwitch = true;
    subscriptions.forEach((sub) => sub.detach());
  };
};

module.exports = {
  app,
};
