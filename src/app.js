import { subscribeHandler } from './subscribeHandler.js';
import { effectRunner } from './effectRunner.js';
import { freeze } from './freeze.js';

export const app = ({
  init,
  update,
  subscribe,
}) => {
  let state = null;
  let subscriptions = [];

  let dispatch = message => new Promise((resolve) => {
    setTimeout(() => {
      resolve(runUpdate(update(message, state))); // eslint-disable-line no-use-before-define
    }, 0);
  });

  const updateState = (newState) => {
    state = newState;
    if (typeof subscribe === 'function') {
      subscriptions = subscribeHandler(
        subscriptions,
        subscribe(freeze(newState)),
        dispatch,
      );
    }
  };

  const runEffects = effectRunner(dispatch);

  const runUpdate = ([nextState, nextEffect]) => {
    updateState(nextState);
    return runEffects(nextEffect);
  };

  runUpdate(init);

  return () => {
    dispatch = () => Promise.resolve();
    subscriptions.forEach(sub => sub.detach());
  };
};
