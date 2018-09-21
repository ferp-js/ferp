const normalObjectConstructors = [
  ({}).constructor,
  ([]).constructor,
];

export const isAbnormalData = (value) => {
  if (!value || typeof value !== 'object' || !value.constructor) return false;
  return normalObjectConstructors.every(constructor => value.constructor !== constructor);
};

export const format = (key, value) => {
  if (value && typeof value.serialize === 'function') {
    return `<${value.serialize()}>`;
  }
  if (isAbnormalData(value)) {
    return `<${value.constructor.name}>`;
  }
  return value;
};

export const logger = (spacing, log = console.log) => ( // eslint-disable-line no-console
  (message, state) => {
    log('[LOG]', message, JSON.stringify(state, format, spacing));
  }
);
