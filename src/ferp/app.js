import { subscriptionManager } from './subscriptionManager.js';
import { stateManager } from './stateManager.js';
import { effectManager } from './effectManager.js';
import { messageManager } from './messageManager.js';
import { freeze } from './freeze.js';

export const app = ({
  init,
  update,
  subscribe,
}) => {
  const state = stateManager();
  const messages = messageManager();
  let subscriptions = [];

  messages.onDispatch(message => (
    runUpdate(update(message, state.get())) // eslint-disable-line no-use-before-define
  ));

  const updateSubscriptions = (nextState) => {
    subscriptions = subscriptionManager(
      subscriptions,
      subscribe(freeze(nextState)),
      messages.dispatch,
    );
  };

  if (typeof subscribe === 'function') {
    state.onChange(updateSubscriptions);
  }

  const manageEffects = effectManager(messages.dispatch);

  const runUpdate = ([nextState, nextEffect]) => {
    state.set(nextState);
    return manageEffects(nextEffect);
  };

  runUpdate(init);

  return () => {
    messages.onDispatch(null);
    subscriptions.forEach(sub => sub.detach());
  };
};
