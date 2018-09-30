const ferp = require('ferp');

const { updateLogger } = require('../common/updateLogger.js');

const { every } = ferp.subscriptions;

const { none } = ferp.effects;

const update = (message, previousState) => {
  switch (message) {
    case 'INCREMENT':
      return [
        previousState + 1,
        none(),
      ];

    default:
      return [
        previousState,
        none(),
      ];
  }
};

const subscribe = state => [
  state < 5 && [every, 'INCREMENT', 1000],
];

const main = () => ferp.app({
  init: [
    0,
    none(),
  ],

  update: updateLogger(update),

  subscribe,
});

module.exports = {
  update,
  subscribe,
  main,
};
