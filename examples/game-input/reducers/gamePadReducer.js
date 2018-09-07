const ferp = require('ferp');
const { inputEffect } = require('../effects/inputEffect.js');

const { Effect } = ferp.types;

const standardButtonMapping = {
  0: 'a',
  1: 'b',
  2: 'x',
  3: 'y',

  4: 'leftBumper',
  5: 'rightBumper',

  6: 'leftTrigger',
  7: 'rightTrigger',

  8: 'start',
  9: 'select',

  10: 'leftStick',
  11: 'rightStick',

  12: 'up',
  13: 'down',
  14: 'left',
  15: 'right',
};

const standardAxisMapping = {
  0: 'left-horizontal',
  1: 'left-vertical',
  2: 'right-horizontal',
  3: 'right-vertical',
};

const gamePadReducer = gamePadIndex => players => (message, state) => {
  if (message.gamePadIndex !== gamePadIndex) return [state, Effect.none()];

  switch (message.type) {
    case 'GAMEPAD_BUTTON_DOWN':
      return (() => {
        const isGamePadFree = !state.players
          .find(p => p.gamePadIndex === message.gamePadIndex);
        const playerNeedsGamePadIndex = state.players
          .find(p => p.sourceType === 'gamepad' && p.gamePadIndex === null);

        const effect = (() => {
          if (isGamePadFree && playerNeedsGamePadIndex) {
            return ferp.types.Effect.immediate({
              type: 'ASSIGN_GAMEPAD_INDEX',
              playerId: playerNeedsGamePadIndex.id,
              gamePadIndex: message.gamePadIndex,
            });
          }
          const player = state.players
            .find(p => p.sourceType === 'gamepad' && p.gamePadIndex === message.gamePadIndex);
          if (!player) return ferp.types.Effect.none();

          return inputEffect(true, player.id, message.button);
        })();

        return [
          state,
          effect,
        ];
      })();

    case 'GAMEPAD_BUTTON_UP':
      return (() => {
        const player = state.players
          .find(p => p.sourceType === 'gamepad' && p.gamePadIndex === message.gamePadIndex);
        if (!player) return ferp.types.Effect.none();

        return [
          state,
          inputEffect(false, player.id, message.button),
        ];
      })();

    default:
      return [
        state,
        Effect.none(),
      ];
  }
};

module.exports = {
  gamePadReducer,
};
