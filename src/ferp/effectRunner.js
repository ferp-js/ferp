import { effectTypes } from './effects/core.js';

export const effectRunner = (dispatch) => {
  const runner = (effect) => {
    switch (effect && effect.type) {
      case effectTypes.none:
        return Promise.resolve();

      case effectTypes.batch:
        return effect.effects.reduce((chain, fx) => (
          chain.then(() => runner(fx))
        ), Promise.resolve());

      case effectTypes.defer:
        return effect.promise.then(fx => runner(fx));

      case effectTypes.thunk:
        return runner(effect.method());

      default:
        return dispatch(effect);
    }
  };

  return runner;
};
