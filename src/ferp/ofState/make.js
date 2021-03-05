export const STOP_GENERATOR = Symbol('StopGenerator');

export const make = (dispatch, generator, ...params) => {
  const iter = generator(dispatch, ...params);
  iter.next();
  return iter;
};

export const stop = (iterator) => iterator.next(STOP_GENERATOR);
