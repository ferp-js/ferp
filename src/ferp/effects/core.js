export const effectTypes = {
  none: Symbol('none'),
  defer: Symbol('defer'),
  batch: Symbol('batch'),
  thunk: Symbol('thunk'),
};

export const none = () => ({ type: effectTypes.none });
export const batch = (effects) => ({ type: effectTypes.batch, effects: [].concat(effects) });
export const defer = (promise) => ({ type: effectTypes.defer, promise: Promise.resolve(promise) });
export const thunk = (method) => ({ type: effectTypes.thunk, method });
