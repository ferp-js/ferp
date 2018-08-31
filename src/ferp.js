const { app } = require('./app.js');
const { Result } = require('./types/result.js');
const { Effect } = require('./types/effect.js');
const { logger } = require('./middleware/logger.js');
const { delay } = require('./effects/delay.js');
const Every = require('./subscriptions/every.js');
const extras = require('./extras/extras.js');

module.exports = {
  app,
  types: {
    Result,
    Effect,
  },
  effects: {
    delay,
  },
  subscriptions: {
    Every,
  },
  middleware: {
    logger,
  },
  extras,
};
