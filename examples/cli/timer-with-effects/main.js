const ferp = require('ferp');

const { updateLogger } = require('../common/updateLogger.js');

const { delay, none } = ferp.effects;

const update = (_, state) => {
  const nextState = state + 1;
  return [
    nextState,
    nextState < 5 ? delay(null, 1000) : none(),
  ];
};

const main = () => ferp.app({
  init: [
    0,
    delay(null, 1000),
  ],

  update: updateLogger(update),
});

module.exports = {
  update,
  main,
};
