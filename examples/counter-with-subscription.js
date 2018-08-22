const frp = require('../src/frp.js');
const { Message, Effect } = frp.types;
const { Every } = frp.subscriptions;

const detach = frp.app({
  init: () => [
    0,
    Effect.none(),
  ],

  update: (_, state) => [
    state + 1,
    Effect.none(),
  ],

  subscriptions: [
    Every.second(Message),
  ],

  middleware: [frp.middleware.logger()],
});

setTimeout(detach, 5000);
