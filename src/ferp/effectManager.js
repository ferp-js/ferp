import { effectTypes } from './effects/core.js';

const effectHandler = {
  [effectTypes.none]: () => Promise.resolve(),
  [effectTypes.batch]: (effect, manager) => effect.effects.reduce((chain, fx) => (
    chain.then(() => manager(fx))
  ), Promise.resolve()),
  [effectTypes.defer]: (effect, manager) => effect.promise.then(manager),
  [effectTypes.thunk]: (effect, manager) => manager(effect.method()),
};

export const effectManager = (dispatch) => {
  const manager = (effect) => {
    const handler = effectHandler[effect && effect.type];
    if (handler) return handler(effect, manager);
    return Promise.resolve(dispatch(effect));
  };

  return manager;
};
