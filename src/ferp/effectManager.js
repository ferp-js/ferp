import { effectTypes } from './effects/core.js';

export const runEffect = (dispatch, effect) => {
  switch (effect && effect.type) {
    case effectTypes.none:
      return undefined;

    case effectTypes.batch:
      return effect.effects.forEach((fx) => runEffect(dispatch, fx));

    case effectTypes.defer:
      return Promise.resolve(effect.promise).then((fx) => runEffect(dispatch, fx));

    case effectTypes.thunk:
      return runEffect(dispatch, effect.method());

    default:
      try {
        return dispatch(effect);
      } catch (err) {
        console.log('unable to run effect', effect, err);
      }
  }
};

function* effectGenerator(dispatch) {
  while (true) {
    const pendingEffect = yield;
    if (!pendingEffect) continue;
    runEffect(dispatch, pendingEffect);
  }
}

export const effectManager = (dispatch) => {
  const generator = effectGenerator(dispatch);
  generator.next();
  return generator;
};
