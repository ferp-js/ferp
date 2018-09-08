const ferp = require('ferp');

const { Effect } = ferp.types;
const { every } = ferp.subscriptions;

ferp.app({
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

  subscribe: state => [
    state < 5 && ['ticker', every.second, 1, 'INCREMENT'],
  ],

  middleware: [ferp.middleware.logger(), ferp.middleware.immutable()],
});
