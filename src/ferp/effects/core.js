export const effectTypes = {
  none: Symbol('none'),
  defer: Symbol('defer'),
  batch: Symbol('batch'),
  thunk: Symbol('thunk'),
  act: Symbol('act'),
};

export const none = () => ({ type: effectTypes.none });
export const batch = (effects) => ({ type: effectTypes.batch, effects });
export const defer = (promise) => ({ type: effectTypes.defer, promise });
export const thunk = (method, methodName) => ({
  type: effectTypes.thunk,
  method,
  methodName: methodName || method.alias || method.name,
});
export const act = (action, methodName) => ({
  type: effectTypes.act,
  action,
  name: methodName || action.alias || action.name,
});
