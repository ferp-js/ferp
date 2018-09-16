import { Effect } from './types/effect.js';
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

  const runEffect = (effect) => {
    if (killSwitch || typeof effect === 'undefined') return Promise.resolve();

    if (effect instanceof Effect) {
      return effect.then(dispatch); // eslint-disable-line no-use-before-define
    }
    if (effect instanceof Promise) {
      return effect.then(runEffect);
    }
    if (Array.isArray(effect)) {
      const [currentEffect, ...trailing] = effect;
      return runEffect(currentEffect)
        .then(() => {
          if (trailing.length > 0) {
            return runEffect(trailing);
          }
          return Promise.resolve();
        });
    }
    console.error('runEffect recieved something that was not an effect', effect); // eslint-disable-line no-console
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
