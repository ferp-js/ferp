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

  const updateWithMiddleware = (middleware || [])
    .reduce((all, method) => method(all), update);

  const getSubscriptionDetach = (previousSubscriptions, { id, method, params }) => {
    const sub = previousSubscriptions.find(pSub => pSub.id === id);
    if (sub && sub.detach) return sub.detach;
    return method(...params)(dispatch); // eslint-disable-line no-use-before-define
  };

  const handleSubscriptions = (previousSubscriptions, currentState) => {
    if (!subscribe) return [];

    const nextSubscriptions = subscribe(currentState)
      .filter(Array.isArray)
      .map(([id, method, ...params]) => ({
        id,
        method,
        params,
        detach: getSubscriptionDetach(previousSubscriptions, { id, method, params }),
      }));

    previousSubscriptions
      .filter(prevSub => (
        !nextSubscriptions.find(nextSub => nextSub.id === prevSub.id)
      ))
      .forEach((removedSub) => {
        removedSub.detach();
      });

    return nextSubscriptions;
  };

  const updateState = (newState) => {
    if (newState === undefined) return;
    subscriptions = handleSubscriptions(subscriptions, newState);

    state = newState;
  };

  const runEffect = (effect) => {
    if (killSwitch) return Promise.resolve();

    if (effect instanceof Effect) {
      return effect.then(dispatch); // eslint-disable-line no-use-before-define
    }
    if (typeof effect === 'function') {
      return effect(dispatch); // eslint-disable-line no-use-before-define
    }
    return Promise.resolve();
  };

  const handleUpdate = ([newState, effect]) => {
    updateState(newState);
    return runEffect(effect);
  };

  const dispatch = (message) => {
    const isMessageEmpty = (
      message === null
      || typeof message === 'undefined'
    );

    if (isMessageEmpty) return Promise.resolve();
    return handleUpdate(updateWithMiddleware(message, state));
  };

  handleUpdate(init());

  return () => {
    killSwitch = true;
    subscriptions.forEach(sub => sub.detach());
  };
};

module.exports = {
  app,
};
