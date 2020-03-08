import { subscriptionManager } from './subscriptionManager.js';
import { stateManager } from './stateManager.js';
import { effectManager } from './effectManager.js';
import { messageManager } from './messageManager.js';

export const app = ({
  init,
  update,
  subscribe,
}) => {
  const state = stateManager();
  const messages = messageManager();
  const manageEffects = effectManager(messages.dispatch);
  const subscriptions = subscriptionManager(messages.dispatch, subscribe);

  const runUpdate = ([nextState, nextEffect]) => {
    state.set(nextState);
    return manageEffects(nextEffect);
  };

  messages.onDispatch((message) => (
    runUpdate(update(message, state.get()))
  ));

  state.onChange(subscriptions.next);

  runUpdate(init);

  return () => {
    subscriptions.detach();
    messages.onDispatch(null);
  };
};
