const ferp = require('ferp');

const canvasReducer = (message, state) => [state, ferp.types.Effect.none()];

module.exports = {
  canvasReducer,
};
