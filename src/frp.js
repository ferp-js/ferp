const { app } = require('./app.js');
const { Message } = require('./types/message.js');
const { Result } = require('./types/result.js');
const { Effect } = require('./types/effect.js');
const { logger } = require('./middleware/logger.js');
const { delay } = require('./effects/delay.js');
const every = require('./subscriptions/every.js');

module.exports = {
  app,
  types: {
    Message,
    Result,
    Effect,
  },
  effects: {
    delay,
  },
  subscriptions: {
    every,
  },
  middleware: {
    logger,
  },
};
