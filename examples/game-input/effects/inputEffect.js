const ferp = require('ferp');

const inputEffect = (isDown, playerId, key) => ferp.types.Effect.immediate({
  type: isDown ? 'INPUT_DOWN' : 'INPUT_UP',
  playerId,
  key,
});

module.exports = {
  inputEffect,
};
