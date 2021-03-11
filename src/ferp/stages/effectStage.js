import { effectTypes, act } from '../effects/core.js';

const runEffect = (dispatch, effect) => {
  switch (effect && effect.type) {
    case effectTypes.none:
      return undefined;

    case effectTypes.batch:
      return effect.effects.forEach((fx) => runEffect(dispatch, fx));

    case effectTypes.defer:
      return effect.promise.then((fx) => runEffect(dispatch, fx));

    case effectTypes.thunk:
      return runEffect(dispatch, effect.method());

    case effectTypes.act:
      return dispatch(effect.action, effect.name);

    default: {
      if (typeof effect === 'function') {
        console.warn( // eslint-disable-line no-console
          'DEPRECATION',
          `Instead of being able to pass messages directly, you must use ferp.effects.act(yourActionHere)
For now, ferp will behave as if you have used the act effect, but in the future, this will produce an error`,
        );
        return dispatch(act(effect));
      }
    }
  }

  const error = new TypeError('Unable to run effect');
  error.effect = effect;
  throw error;
};

export const effectStage = (effect, dispatch) => (action) => {
  runEffect(dispatch, effect.get());

  return action;
};
