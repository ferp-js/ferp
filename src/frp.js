const { app } = require('./app.js');
const { Message } = require('./messages/message.js');
const { delay } = require('./effects/delay.js');

module.exports = {
  app,
  Message,
  effects: {
    delay,
  },
};
