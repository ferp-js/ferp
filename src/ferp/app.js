import { stateManager } from './stateManager.js';
import { effectManager } from './effectManager.js';
import { messageManager } from './messageManager.js';
import { ofStateManager } from './ofStateManager.js';

export const app = ({
  init,
  ofState,
}) => {
  const state = stateManager();
  const messages = messageManager();
  const manageEffects = effectManager(messages.dispatch);
  const manageOfState = ofStateManager(messages.dispatch, ofState);

  const runUpdate = ([nextState, nextEffect]) => {
    state.set(nextState);
    manageOfState.next(nextState);
    return manageEffects(nextEffect);
  };

  runUpdate(init);

  return messages.dispatch;
};
