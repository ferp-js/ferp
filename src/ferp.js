const { app } = require('./app.js');
const { Result } = require('./types/result.js');
const { Effect } = require('./types/effect.js');
const effects = require('./effects/effects.js');
const middleware = require('./middleware/middleware.js');
const Every = require('./subscriptions/every.js');

module.exports = {
  app,
  types: {
    Result,
    Effect,
  },
  subscriptions: {
    Every,
  },
  middleware,
  effects,
};
