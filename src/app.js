import { subscribeHandler } from './subscribeHandler.js';
import { freeze } from './freeze.js';

export const app = ({
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

  const updateState = (newState) => {
    if (newState === undefined) return;
    if (typeof subscribe === 'function') {
      subscriptions = subscribeHandler(
        subscriptions,
        subscribe(freeze(newState)),
        dispatch, // eslint-disable-line no-use-before-define
      );
    }

    state = newState;
  };

  const afterTick = value => new Promise(resolve => setTimeout(resolve, 0, value));

  const runEffect = (effect) => {
    if (killSwitch || !effect) return Promise.resolve();

    if (effect instanceof Promise) {
      return effect.then(runEffect);
    }

    if (Array.isArray(effect)) {
      return Promise.all(effect.filter(Boolean).map(runEffect));
    }

    return dispatch(effect); // eslint-disable-line no-use-before-define
  };

  const handleUpdate = ([newState, effect]) => {
    updateState(newState);
    return afterTick(effect).then(runEffect);
  };

  const dispatch = (message) => {
    const isMessageEmpty = (
      message === null
      || typeof message === 'undefined'
    );

    if (isMessageEmpty) return afterTick();
    return handleUpdate(updateWithMiddleware(message, state));
  };

  handleUpdate(init());

  return () => {
    killSwitch = true;
    subscriptions.forEach(sub => sub.detach());
  };
};
