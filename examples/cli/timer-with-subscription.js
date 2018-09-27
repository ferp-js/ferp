const ferp = require('ferp');

const { updateLogger } = require('./updateLogger.js');

const { every } = ferp.subscriptions;

const { none } = ferp.effects;

ferp.app({
  init: [
    0,
    none(),
  ],

  update: updateLogger((_, state) => {
    const nextState = state + 1;
    return [
      nextState,
      none(),
    ];
  }),

  subscribe: state => [
    state < 5 && [every, 'INCREMENT', 1000],
  ],
});
