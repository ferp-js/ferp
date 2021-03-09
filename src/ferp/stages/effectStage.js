import { effectTypes, act, none } from '../effects/core.js';

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
      return dispatch(effect.action);

    default:
      if (typeof effect === 'function') {
        console.warn('DEPRECATION', 'Instead of being able to pass messages directly, you must use ferp.effects.act(yourActionHere)');
        console.warn(' -- ', 'For now, ferp will behave as if you have used the act effect, but in the future, this will produce an error');
        return dispatch(act(effect));
      }
      console.warn('*** unable to run effect', effect, effect && effect.toString(), ' ***');
      break;
  }
  return dispatch(none());
};

export const effectStage = (effect, dispatch) => (action) => {
  runEffect(dispatch, effect.get());

  return action;
};
