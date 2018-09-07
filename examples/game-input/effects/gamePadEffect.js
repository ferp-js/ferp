const ferp = require('ferp');
const { Effect } = ferp.types;

const cloneGamePad = gamePad => Object.assign({}, gamePad, {
  buttons: gamePad.buttons.map(button => ({
    pressed: button.pressed,
    value: button.value,
  })),
  axes: [...gamePad.axes],
});

const getGamePads = () => {
  if (navigator.getGamepads) return navigator.getGamepads();
  return navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : [];
};

const messageTypeForButtonPress = pressed => (pressed
  ? 'GAMEPAD_BUTTON_DOWN'
  : 'GAMEPAD_BUTTON_UP'
);

const gamePadEffect = (prevGamePads) => {
  const gamePads = getGamePads().map(cloneGamePad);

  const newlyConnected = gamePads.filter(gp => !prevGamePads.some(pgp => pgp.index === gp.index));
  const newlyDisconnected = prevGamePads.filter((pgp) => {
    const match = gamePads.find(gp => gp.index === pgp.index);
    return !match || !match.connected;
  });

  const defaultButton = { pressed: false, value: 0.0 };
  const defaultAxis = 0.0;
  const changeMessages = gamePads.reduce((messages, gamePad) => {
    const prevGamePad = prevGamePads[gamePad.index] || { buttons: [], axes: [] };

    const buttonMessages = gamePad.buttons.reduce((memo, button, index) => {
      const prevButton = prevGamePad.buttons[index] || defaultButton;
      return []
        .concat(prevButton.pressed !== button.pressed
          ? [{
            type: messageTypeForButtonPress(button.pressed),
            gamePadIndex: gamePad.index,
            buttonIndex: index,
          }] : [])
        .concat(prevButton.value !== button.value
          ? [{
            type: 'GAMEPAD_BUTTON_VALUE',
            gamePadIndex: gamePad.index,
            buttonIndex: index,
            value: button.value,
          }]
          : []);
    }, []);

    const axesMessages = gamePad.axes.reduce((memo, axis, index) => {
      const prevAxis = prevGamePad.axes[index] || defaultAxis;
      return []
        .concat(prevAxis !== axis
          ? [{
            type: 'GAMEPAD_AXES_CHANGE',
            gamePadIndex: gamePad.index,
            axesIndex: index,
            value: axis,
          }]
          : []);
    }, []);

    return [].concat(buttonMessages).concat(axesMessages);
  }, []);

  return Effect.map([
    Effect.immediate({ type: 'GAMEPAD_UPDATE', gamePads }),
    ...newlyConnected.map(gp => Effect.immediate({ type: 'GAMEPAD_CONNECTED', gamePadIndex: gp.index })),
    ...newlyDisconnected.map(gp => Effect.immediate({ type: 'GAMEPAD_DISCONNECTED', gamePadIndex: gp.index })),
    ...changeMessages.map(Effect.immediate),
  ]);
};

module.exports = {
  gamePadEffect,
};
