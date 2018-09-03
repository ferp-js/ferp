const freeze = (value) => {
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  return new Proxy(value, {
    setPrototypeOf: () => false,
    isExtensible: () => false,
    preventExtensions: () => true,
    set: () => false,
    get: (target, property) => freeze(target[property]),
    deleteProperty: () => false,
  });
};

module.exports = {
  freeze,
};
