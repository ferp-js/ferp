import { stateManager } from './stateManager.js';
import { effectManager } from './effectManager.js';
import { messageManager } from './messageManager.js';
import { ofStateManager } from './ofStateManager.js';

export const app = ({
  init,
  ofState,
  observe,
}) => {
  const state = stateManager();
  const messages = messageManager();

  const observeFn = observe || (() => {});
  const dispatch = (params) => {
    setTimeout(() => {
      messages.dispatch(params);
    }, 0);
  };

  const manageEffects = effectManager(dispatch);
  const manageOfState = ofStateManager(dispatch, init[0], ofState);

  const runUpdate = (message) => {
    observeFn(message);
    if (typeof message === 'function') {
      dispatch(message(state.get()));
      return;
    }
    const [nextState, nextEffect] = message;
    if (!nextEffect) {
      throw new ReferenceError(`App.init or each action must be an [state, effect] tuple, but you gave [${nextState}, ${nextEffect}]`);
    }
    state.set(nextState);
    manageOfState.next(nextState);
    manageEffects.next(nextEffect);
  };

  messages.onDispatch(runUpdate);

  runUpdate(init);

  return {
    dispatch,
    detach: () => {
      manageEffects.return();
      manageOfState.return();
    },
  };
};
