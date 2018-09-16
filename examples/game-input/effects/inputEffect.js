const { effect } = require('ferp');

const inputEffect = (isDown, playerId, key) => effect.immediate({
  type: isDown ? 'INPUT_DOWN' : 'INPUT_UP',
  playerId,
  key,
});

module.exports = {
  inputEffect,
};
