export const effectTypes = {
  none: Symbol('none'),
  defer: Symbol('defer'),
  batch: Symbol('batch'),
  thunk: Symbol('thunk'),
  act: Symbol('act'),
};

const asPromise = (value) => {
  if (value instanceof Promise) return value;
  if (typeof value === 'function') return new Promise(value);
  return Promise.resolve(value);
};

export const none = () => ({ type: effectTypes.none });
export const batch = (effects) => ({ type: effectTypes.batch, effects: [].concat(effects) });
export const defer = (promise) => ({ type: effectTypes.defer, promise: asPromise(promise) });
export const thunk = (method) => ({ type: effectTypes.thunk, method });
export const act = (action, ...params) => ({
  type: effectTypes.act,
  action,
  params,
  name: action.alias || action.name,
});
