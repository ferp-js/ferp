import { effectTypes } from './effects/core.js';

export const effectManager = (dispatch) => {
  const manager = (effect) => {
    switch (effect && effect.type) {
      case effectTypes.none:
        return Promise.resolve();

      case effectTypes.batch:
        return effect.effects.reduce((chain, fx) => (
          chain.then(() => manager(fx))
        ), Promise.resolve());

      case effectTypes.defer:
        return effect.promise.then(fx => manager(fx));

      case effectTypes.thunk:
        return manager(effect.method());

      default:
        return Promise.resolve(dispatch(effect));
    }
  };

  return manager;
};
