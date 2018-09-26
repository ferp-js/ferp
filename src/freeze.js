export const freeze = (value) => {
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  return new Proxy(value, {
    set: () => false,
    get: (target, property) => freeze(target[property]),
    deleteProperty: () => false,
  });
};
