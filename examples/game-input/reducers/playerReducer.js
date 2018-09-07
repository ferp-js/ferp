const ferp = require('ferp');
const { Effect } = ferp.types;

const playerReducer = id => (message, state) => {
  if (message.playerId !== id) return [state, Effect.none()];
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
        Effect.none(),
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
        Effect.none(),
      ];

    case 'INPUT_DOWN':
      return [
        Object.assign({}, state, {
          [message.key]: true,
        }),
        Effect.none(),
      ];

    case 'INPUT_UP':
      return [
        Object.assign({}, state, {
          [message.key]: false,
        }),
        Effect.none(),
      ];

    default:
      return [
        state,
        Effect.none(),
      ];
  }
};

module.exports = {
  playerReducer,
};
