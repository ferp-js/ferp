const { Result } = require('../types/result.js');

const replacer = (key, value) => {
  if (value && typeof value.serialize === 'function') {
    return value.serialize();
  }
  try {
    return value;
  } catch(err) {
    return `<${value.constructor.name}>`;
  }
};

const logger = (spacing) => (next) => (message, state) => {
  const result = next(message, state);
  setTimeout(() => {
    console.log('[LOG]', JSON.stringify(result, replacer, spacing));
  }, 0);
  return result;
};

module.exports = {
  logger,
};
