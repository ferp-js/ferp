const ferp = require('ferp');

const { Effect } = ferp.types;
const { logger, immutable } = ferp.middleware;
const { every } = ferp.subscriptions;

ferp.app({
  init: () => [
    0,
    Effect.none(),
  ],

  update: (_, state) => {
    const nextState = state + 1;
    return [
      nextState,
      Effect.none(),
    ];
  },

  subscribe: state => [
    state < 5 && [every.second, 1, 'INCREMENT'],
  ],

  middleware: [logger(), immutable()],
});
