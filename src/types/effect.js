export const immediate = message => Promise.resolve(message);

export const none = () => Promise.resolve(null);

export const defer = () => {
  let dispatch = () => {};
  const effect = new Promise((resolve) => {
    dispatch = resolve;
  });
  return { effect, dispatch };
};

export const map = effects => immediate(effects);

export const create = callback => new Promise(callback);
