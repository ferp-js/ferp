const ferp = require('ferp');

const { effect } = ferp;
const { logger, immutable } = ferp.middleware;
const { every } = ferp.subscriptions;

ferp.app({
  init: () => [
    0,
    effect.none(),
  ],

  update: (_, state) => {
    const nextState = state + 1;
    return [
      nextState,
      effect.none(),
    ];
  },

  subscribe: state => [
    state < 5 && [every.second, 1, 'INCREMENT'],
  ],

  middleware: [logger(), immutable()],
});
