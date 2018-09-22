const ferp = require('ferp');

const { logger } = ferp.listeners;
const { every } = ferp.subscriptions;

const { none } = ferp.effects;

ferp.app({
  init: () => [
    0,
    none(),
  ],

  update: (_, state) => {
    const nextState = state + 1;
    return [
      nextState,
      none(),
    ];
  },

  subscribe: state => [
    state < 5 && [every.second, 1, 'INCREMENT'],
  ],

  listen: [logger()],
});
