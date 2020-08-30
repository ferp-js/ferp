export const make = (dispatch, generator, ...params) => {
  const iter = generator(dispatch, ...params);
  iter.next();
  return iter;
};
