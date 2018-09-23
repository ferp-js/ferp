const ferp = require('ferp');

const { updateLogger } = require('./updateLogger.js');

const { delay, none } = ferp.effects;

ferp.app({
  init: [
    0,
    delay(null, 1000),
  ],

  update: updateLogger((_, state) => {
    const nextState = state + 1;
    return [
      nextState,
      nextState < 5 ? delay(null, 1000) : none(),
    ];
  }),
});
