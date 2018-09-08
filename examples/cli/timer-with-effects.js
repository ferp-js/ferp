const ferp = require('ferp');

const { Effect } = ferp.types;
const { logger, immutable } = ferp.middleware;
const { delay } = ferp.effects;

ferp.app({
  init: () => [
    0,
    delay.second(1),
  ],

  update: (_, state) => {
    const nextState = state + 1;
    return [
      nextState,
      nextState < 5 ? delay.second(1) : Effect.none(),
    ];
  },

  middleware: [logger(), immutable()],
});
