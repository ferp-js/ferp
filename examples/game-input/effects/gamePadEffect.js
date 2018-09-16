const ferp = require('ferp');

const { effect } = ferp;

const axisActive = value => Math.abs(value) >= 0.1;
const axisNormalized = value => Math.round(value);

const cloneGamePad = (gamePad) => {
  if (!gamePad) return null;

  return {
    index: gamePad.index,
    id: gamePad.id,
    connected: gamePad.connected,
    displayId: gamePad.displayId,
    mapping: gamePad.mapping,
    buttons: gamePad.buttons.map(button => ({
      pressed: button.pressed,
      value: button.value,
    })),
    axes: gamePad.axes.map(axis => (axisActive(axis) ? axisNormalized(axis) : 0.0)),
  };
};

const getGamePads = () => {
  if (navigator.getGamepads) return navigator.getGamepads();
  return navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : [];
};

const messageTypeForButtonPress = pressed => (pressed
  ? 'GAMEPAD_BUTTON_DOWN'
  : 'GAMEPAD_BUTTON_UP'
);

const gamePadEffect = (prevGamePads) => {
  const gamePads = Array.from(getGamePads())
    .filter(gp => gp !== null)
    .map(cloneGamePad);

  const newlyConnected = gamePads.filter(gp => (
    !prevGamePads.some(pgp => !pgp || pgp.index === gp.index)
  ));
  const newlyDisconnected = prevGamePads.filter((pgp) => {
    const match = gamePads.find(gp => pgp && gp.index === pgp.index);
    return !match || !match.connected;
  });

  const changeMessages = gamePads.reduce((messages, gamePad) => {
    const prevGamePad = prevGamePads.find(pgp => pgp && pgp.index === gamePad.index);
    if (!prevGamePad) return [];

    const buttonMessages = gamePad.buttons.reduce((buttonMemo, button, index) => {
      const prevButton = prevGamePad.buttons[index];
      if (prevButton.pressed === button.pressed) return buttonMemo;
      return buttonMemo.concat({
        type: messageTypeForButtonPress(button.pressed),
        gamePadIndex: gamePad.index,
        buttonIndex: index,
      });
    }, []);


    const axesMessages = gamePad.axes.reduce((axesMemo, axis, index) => {
      const prevAxis = prevGamePad.axes[index];
      const value = axisNormalized(axis);
      if (prevAxis === value) return axesMemo;
      return axesMemo
        .concat({
          type: 'GAMEPAD_AXES_CHANGE',
          gamePadIndex: gamePad.index,
          axesIndex: index,
          value,
        });
    }, []);

    return messages.concat(buttonMessages).concat(axesMessages);
  }, []);

  return effect.map([
    ...effect.map(newlyConnected.map(gp => ({ type: 'GAMEPAD_CONNECTED', gamePad: gp }))),
    ...effect.map(newlyDisconnected.map(gp => ({ type: 'GAMEPAD_DISCONNECTED', gamePadIndex: gp.index }))),
    ...effect.map(changeMessages),
  ]);
};

module.exports = {
  gamePadEffect,
};
