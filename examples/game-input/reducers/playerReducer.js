const ferp = require('ferp');
const { effect } = ferp;

const playerReducer = id => (message, state) => {
  if (message.playerId !== id) return [state, effect.none()];
  switch (message.type) {
    case 'SOURCE_CHANGE':
      return [
        Object.assign({}, state, {
          sourceType: message.sourceType,
          gamePadIndex: null,
          up: false,
          down: false,
          left: false,
          right: false,
        }),
        effect.none(),
      ];

    case 'ASSIGN_GAMEPAD_INDEX':
      return [
        Object.assign({}, state, {
          sourceType: 'gamepad',
          gamePadIndex: message.gamePadIndex,
          up: false,
          down: false,
          left: false,
          right: false,
        }),
        effect.none(),
      ];

    case 'INPUT_DOWN':
      return [
        Object.assign({}, state, {
          [message.key]: true,
        }),
        effect.none(),
      ];

    case 'INPUT_UP':
      return [
        Object.assign({}, state, {
          [message.key]: false,
        }),
        effect.none(),
      ];

    default:
      return [
        state,
        effect.none(),
      ];
  }
};

module.exports = {
  playerReducer,
};
