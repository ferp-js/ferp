const freeze = (object) => {
  const type = typeof object;
  if (type === 'string' || type === 'number' || type === 'boolean') {
    return object;
  }
  return new Proxy(object, {
    setPrototypeOf: () => false,
    isExtensible: () => false,
    preventExtensions: () => true,
    set: () => false,
    get: (target, property) => {
      const type = typeof target[property];
      if (type === 'object' || type === 'function') return freeze(target[property]);
      return target[property];
    },
    deleteProperty: () => false,
  });
};

module.exports = {
  freeze,
};
