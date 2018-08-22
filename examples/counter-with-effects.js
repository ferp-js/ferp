const frp = require('../src/frp.js');
const { Message } = frp.types;

const detach = frp.app({
  init: () => [
    0,
    frp.effects.delay(1000, Message),
  ],

  update: (message, state) => [
    state + 1,
    frp.effects.delay(1000, Message),
  ],

  middleware: [frp.middleware.logger()],
});

setTimeout(detach, 5000);
