import { effectTypes } from '../effects/core.js';

const asPromise = (value) => {
  if (value instanceof Promise) return value;
  if (typeof value === 'function') return new Promise(value);
  return Promise.resolve(value);
};

export const runEffect = (dispatch, effect) => {
  switch (effect.type) {
    case effectTypes.none:
      return (void 0);

    case effectTypes.batch:
      return effect.effects.forEach((fx) => runEffect(dispatch, fx));

    case effectTypes.defer:
      return asPromise(effect.promise).then((fx) => runEffect(dispatch, fx));

    case effectTypes.thunk:
      return runEffect(dispatch, effect.method());

    case effectTypes.act:
      return dispatch(
        effect.action,
        effect.name,
      );

    default: {
      const error = new TypeError('Unable to run effect');
      error.effect = effect;
      throw error;
    }
  }
};

export const effectStage = (props) => {
  runEffect(props.dispatch, props.effect);

  return props;
};
