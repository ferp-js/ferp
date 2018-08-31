const ferp = require('../src/ferp.js');
const { Effect } = ferp.types;
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

  subscribe: (state) => {
    return [
      state < 5 && ['ticker', Every.second, 1],
    ];
  },

  middleware: [ferp.middleware.logger()],
});
