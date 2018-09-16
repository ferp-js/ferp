export const immediate = message => message;

export const none = () => null;

export const defer = () => {
  let dispatch = () => {};
  const effect = new Promise((resolve) => {
    dispatch = resolve;
  });
  return { effect, dispatch };
};

export const map = effects => [].concat(effects);

export const create = callback => new Promise(callback);
