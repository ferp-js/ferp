import { effectTypes } from '../effects/core.js';

const asPromise = (value) => {
  if (value instanceof Promise) return value;
  if (typeof value === 'function') return new Promise(value);
  return Promise.resolve(value);
};

const defaultMiddleware = (v) => v;

export const runEffect = (dispatch, effect, middleware = defaultMiddleware) => {
  const {
    type,
    effects,
    promise,
    method,
    action,
    name,
  } = middleware(effect);

  switch (type) {
    case effectTypes.none:
      return undefined;

    case effectTypes.batch:
      return effects.forEach((fx) => runEffect(dispatch, fx, middleware));

    case effectTypes.defer:
      return asPromise(promise).then((fx) => runEffect(dispatch, fx, middleware));

    case effectTypes.thunk:
      return runEffect(dispatch, method(), middleware);

    case effectTypes.act:
      return dispatch(action, name);

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
