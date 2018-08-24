const ferp = require('../src/ferp.js');
const { Message } = ferp.types;
const { logger } = ferp.middleware;
const { delay } = ferp.effects;

const detach = ferp.app({
  init: () => [
    0,
    delay(1000, Message),
  ],

  update: (message, state) => [
    state + 1,
    delay(1000, Message),
  ],

  middleware: [logger()],
});

setTimeout(detach, 5000);
