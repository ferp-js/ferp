import { freeze } from './freeze.js';

export const stateManager = () => {
  let state;
  let callback;

  const set = (nextState) => {
    state = nextState;
    if (typeof callback === 'function') {
      callback(freeze(state));
    }
    return state;
  };

  const get = () => state;

  const onChange = (callbackFunction) => {
    callback = callbackFunction;
  };

  return {
    set,
    get,
    onChange,
  };
};
