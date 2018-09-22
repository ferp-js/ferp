const ferp = require('ferp');

const { none } = ferp.effects;

const playerReducer = id => (message, state) => {
  if (message.playerId !== id) return [state, none()];
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
        none(),
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
        none(),
      ];

    case 'INPUT_DOWN':
      return [
        Object.assign({}, state, {
          [message.key]: true,
        }),
        none(),
      ];

    case 'INPUT_UP':
      return [
        Object.assign({}, state, {
          [message.key]: false,
        }),
        none(),
      ];

    default:
      return [
        state,
        none(),
      ];
  }
};

module.exports = {
  playerReducer,
};
