const ferp = require('../src/ferp.js');
const { Effect } = ferp.types;
const { Every } = ferp.subscriptions;

const detach = ferp.app({
  init: () => [
    0,
    Effect.none(),
  ],

  update: (message, state) => {
    switch (message.type) {
      case 'INCREMENT':
        return [
          state + 1,
          Effect.none(),
        ];

      default:
        return [state, Effect.none()];
    }
  },

  subscribe: (state) => {
    return [
      state < 5 && ['ticker', Every.second, 1, 'INCREMENT'],
    ];
  },

  middleware: [ferp.middleware.logger()],
});
