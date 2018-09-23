export const resultTypes = {
  result: Symbol('result'),
  nothing: Symbol('nothing'),
  pending: Symbol('pending'),
  just: Symbol('just'),
  error: Symbol('error'),
};

export const result = (subtype, augment = {}) => Object.assign(
  {},
  augment,
  { type: resultTypes.result, subtype },
);

export const nothing = () => result(resultTypes.nothing);
export const pending = () => result(resultTypes.pending);
export const just = value => result(resultTypes.just, { value });
export const error = errorMessage => result(resultTypes.error, { error: errorMessage });

export const get = (onNothing, onPending, onJust, onError) => (message) => {
  switch (message && message.type === resultTypes.result && message.subtype) {
    case resultTypes.nothing:
      return onNothing();

    case resultTypes.pending:
      return onPending();

    case resultTypes.just:
      return onJust(message.value);

    case resultTypes.error:
      return onError(message.error);

    default:
      return onJust(message);
  }
};

export const getWithDefault = (onJust, onDefault) => get(
  onDefault,
  onDefault,
  onJust,
  onDefault,
);
