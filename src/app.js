import { effectTypes } from './effects/core.js';
import { subscribeHandler } from './subscribeHandler.js';
import { freeze } from './freeze.js';

export const app = ({
  init,
  update,
  subscribe,
  listen,
}) => {
  let state = null;
  let subscriptions = [];

  let dispatch = (message) => {
    if (!message) return Promise.resolve(state);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (Array.isArray(listen)) {
          const frozenMessage = freeze(message);
          const frozenState = freeze(state);
          listen.forEach(listener => listener(frozenMessage, frozenState));
        }
        resolve(runUpdate(update(message, state))); // eslint-disable-line no-use-before-define
      }, 0);
    });
  };

  const updateState = (newState) => {
    state = newState;
    if (typeof subscribe === 'function') {
      const frozenState = freeze(newState);
      subscriptions = subscribeHandler(subscriptions, subscribe(frozenState), dispatch);
    }
  };

  const runEffects = (effect) => {
    switch (effect && effect.type) {
      case effectTypes.none:
        return state;

      case effectTypes.batch:
        return effect.effects.reduce((chain, fx) => (
          chain.then(() => runEffects(fx))
        ), Promise.resolve());

      case effectTypes.defer:
        return effect.promise.then(fx => runEffects(fx));

      default:
        return dispatch(effect);
    }
  };

  const runUpdate = ([nextState, nextEffect]) => {
    updateState(nextState);
    runEffects(nextEffect);
  };

  runUpdate(init());

  return () => {
    dispatch = () => Promise.resolve();
    subscriptions.forEach(sub => sub.detach());
  };
};
