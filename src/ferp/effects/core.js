export const effectTypes = {
  none: Symbol('none'),
  defer: Symbol('defer'),
  batch: Symbol('batch'),
  thunk: Symbol('thunk'),
  act: Symbol('act'),
};

export const none = () => ({ type: effectTypes.none });
export const batch = (effects, annotation) => ({ type: effectTypes.batch, effects, annotation });
export const defer = (promise, annotation) => ({ type: effectTypes.defer, promise, annotation });
export const thunk = (method, annotation) => ({
  type: effectTypes.thunk,
  method,
  annotation: annotation || method.alias || method.name,
});
export const act = (action, annotation) => ({
  type: effectTypes.act,
  action,
  annotation: annotation || action.alias || action.name,
});
