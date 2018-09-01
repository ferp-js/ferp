const { freeze } = require('../freeze.js');

const immutable = () => (next) => (message, state) => next(message, freeze(state));

module.exports = {
  immutable,
};
