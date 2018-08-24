const { app } = require('./app.js');
const { Message } = require('./types/message.js');
const { Result } = require('./types/result.js');
const { Effect } = require('./types/effect.js');
const { Subscription } = require('./types/subscription.js');
const { logger } = require('./middleware/logger.js');
const { delay } = require('./effects/delay.js');
const { Every } = require('./subscriptions/every.js');

module.exports = {
  app,
  types: {
    Message,
    Result,
    Effect,
    Subscription
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
};
