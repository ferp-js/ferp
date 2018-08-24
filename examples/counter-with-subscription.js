const ferp = require('../src/ferp.js');
const { Message, Effect } = ferp.types;
const { Every } = ferp.subscriptions;

const detach = ferp.app({
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

  middleware: [ferp.middleware.logger()],
});

setTimeout(detach, 5000);
