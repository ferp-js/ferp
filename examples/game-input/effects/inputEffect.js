const inputEffect = (isDown, playerId, key) => ({
  type: isDown ? 'INPUT_DOWN' : 'INPUT_UP',
  playerId,
  key,
});

module.exports = {
  inputEffect,
};
