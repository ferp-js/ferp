import { effectTypes } from '../effects/core.js';

const asPromise = (value) => {
  if (value instanceof Promise) return value;
  if (typeof value === 'function') return new Promise(value);
  return Promise.resolve(value);
};

const defaultMiddleware = (v) => v;

export const runEffect = (dispatch, effect, middleware = defaultMiddleware) => {
  switch (effect.type) {
    case effectTypes.none: {
      middleware(effect);
      return undefined;
    }

    case effectTypes.batch: {
      const { effects } = middleware(effect);
      return effects
        .forEach((fx) => runEffect(dispatch, fx, middleware));
    }

    case effectTypes.defer: {
      const { promise } = middleware(effect);
      return asPromise(promise)
        .then((fx) => runEffect(dispatch, fx, middleware));
    }

    case effectTypes.thunk: {
      const { method } = middleware(effect);
      return runEffect(dispatch, method(), middleware);
    }

    case effectTypes.act: {
      const { action, annotation } = effect;
      return dispatch(action, annotation);
    }

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
