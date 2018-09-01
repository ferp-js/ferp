const ferp = require('../src/ferp.js');
const { Effect } = ferp.types;
const { logger, immutable } = ferp.middleware;
const { Delay } = ferp.effects;

ferp.app({
  init: () => [
    0,
    Delay.second(1),
  ],

  update: (_, state) => {
    const nextState = state + 1;
    return [
      nextState,
      nextState < 5 ? Delay.second(1) : Effect.none(),
    ];
  },

  middleware: [logger(), immutable()],
});
