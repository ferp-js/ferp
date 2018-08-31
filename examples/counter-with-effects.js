const ferp = require('../src/ferp.js');
const { Effect } = ferp.types;
const { logger, immutable } = ferp.middleware;
const { delay } = ferp.effects;

ferp.app({
  init: () => [
    0,
    delay(1000),
  ],

  update: (_, state) => {
    const nextState = state + 1;
    return [
      nextState,
      nextState < 5 ? delay(1000) : Effect.none(),
    ];
  },

  middleware: [logger(), immutable()],
});
