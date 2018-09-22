const ferp = require('ferp');

const { logger } = ferp.listeners;
const { delay, none } = ferp.effects;

ferp.app({
  init: () => [
    0,
    delay.second(1),
  ],

  update: (_, state) => {
    const nextState = state + 1;
    return [
      nextState,
      nextState < 5 ? delay.second(1) : none(),
    ];
  },

  listen: [logger()],
});
