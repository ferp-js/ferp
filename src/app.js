import { effectTypes } from './effects/core.js';
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

  let dispatch = (message) => {
    if (!message) return Promise.resolve(state); // throw new Error('All updates must return an effect');
    return new Promise((resolve) => {
      setTimeout(() => {
        if (Array.isArray(middleware)) {
          middleware.forEach(mw => mw(() => {})(message, state));
        }
        resolve(resolveEffects(update(message, state)));
      }, 0);
    });
  };

  const updateState = (newState) => {
    state = newState;
    const frozenState = freeze(newState);
    if (typeof subscribe === 'function') {
      subscriptions = subscribeHandler(subscriptions, subscribe(frozenState), dispatch);
    }
    return Promise.resolve(state);
  };

  const resolveEffects = ([newState, effect]) => (
    updateState(newState)
      .then((currentState) => {
        switch (effect && effect.type) {
          case effectTypes.none:
            return currentState;

          case effectTypes.batch:
            return effect.effects.reduce((chain, fx) => (
              chain.then(s => resolveEffects([s, fx]))
            ), Promise.resolve(currentState));

          case effectTypes.defer:
            return effect.promise.then(fx => resolveEffects([state, fx]));

          default:
            return dispatch(effect);
        }
      })
  );

  resolveEffects(init());

  return () => {
    subscriptions.forEach(sub => sub.detach());
  };
};
