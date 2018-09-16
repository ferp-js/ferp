const ferp = require('ferp');
const { inputEffect } = require('../effects/inputEffect.js');

const { effect } = ferp;

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

const axesToInputEffect = (playerId, index, value) => {
  switch (standardAxisMapping[index]) {
    case 'left-horizontal':
      if (value !== 0) return inputEffect(true, playerId, value < 0 ? 'left' : 'right');
      return effect.map([
        inputEffect(false, playerId, 'left'),
        inputEffect(false, playerId, 'right'),
      ]);

    case 'left-vertical':
      if (value !== 0) return inputEffect(true, playerId, value < 0 ? 'up' : 'down');
      return effect.map([
        inputEffect(false, playerId, 'up'),
        inputEffect(false, playerId, 'down'),
      ]);

    default:
      return effect.none();
  }
};

const gamePadReducer = players => (message, state) => {
  const noGamePadIndex = typeof message.gamePadIndex === 'undefined';
  const differentGamePadIndex = state && message.gamePadIndex !== state.index;
  if (noGamePadIndex || differentGamePadIndex) return [state, effect.none()];

  const updateButtons = (buttons, buttonIndex, pressed, value) => {
    const nextButtons = [...buttons];
    nextButtons[buttonIndex].pressed = Boolean(pressed);
    if (typeof value !== 'undefined') {
      nextButtons[buttonIndex].value = value;
    } else {
      nextButtons[buttonIndex].value = pressed
        ? 1.0
        : 0.0;
    }

    return nextButtons;
  };

  const updateAxes = (axes, axesIndex, value) => {
    const nextAxes = [...axes];
    nextAxes[axesIndex] = value;

    return nextAxes;
  };

  switch (message.type) {
    case 'GAMEPAD_BUTTON_DOWN':
      return (() => {
        const isGamePadFree = !players
          .find(p => p.gamePadIndex === message.gamePadIndex);
        const playerNeedsGamePadIndex = players
          .find(p => p.sourceType === 'gamepad' && p.gamePadIndex === null);

        const effect = (() => {
          if (isGamePadFree && playerNeedsGamePadIndex) {
            return {
              type: 'ASSIGN_GAMEPAD_INDEX',
              playerId: playerNeedsGamePadIndex.id,
              gamePadIndex: message.gamePadIndex,
            };
          }
          const player = players
            .find(p => p.sourceType === 'gamepad' && p.gamePadIndex === message.gamePadIndex);

          if (!player) return effect.none();

          return inputEffect(true, player.id, message.button);
        })();

        return [
          Object.assign({}, state, {
            buttons: updateButtons(
              state.buttons,
              message.buttonIndex,
              true,
            ),
          }),
          effect,
        ];
      })();

    case 'GAMEPAD_BUTTON_UP':
      return (() => {
        const player = players
          .find(p => p.sourceType === 'gamepad' && p.gamePadIndex === message.gamePadIndex);
        const effect = player
          ? inputEffect(false, player.id, message.button)
          : effect.none();

        return [
          Object.assign({}, state, {
            buttons: updateButtons(
              state.buttons,
              message.buttonIndex,
              false,
            ),
          }),
          effect,
        ];
      })();

    case 'GAMEPAD_AXES_CHANGE':
      return (() => {
        const player = players
          .find(p => p.sourceType === 'gamepad' && p.gamePadIndex === message.gamePadIndex);

        const effect = player
          ? axesToInputEffect(player.id, message.axesIndex, message.value)
          : effect.none();

        return [
          Object.assign({}, state, {
            axes: updateAxes(state.axes, message.axesIndex, message.value),
          }),
          effect,
        ];
      })();

    default:
      return [
        state,
        effect.none(),
      ];
  }
};

module.exports = {
  gamePadReducer,
};
