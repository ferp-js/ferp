const { gamePadReducer } = require('./gamePadReducer.js');
const { updatesCollectionToStateEffects } = require('./helper.js');

const gamePadsReducer = players => (message, state) => {
  const reduceOverGamePads = gamePads => (
    gamePads.map(gamePad => (
      gamePadReducer(players)(message, gamePad)
    ))
  );

  switch (message.type) {
    case 'GAMEPAD_CONNECTED':
      return updatesCollectionToStateEffects(reduceOverGamePads(state.concat(message.gamePad)));

    case 'GAMEPAD_DISCONNECTED':
      return updatesCollectionToStateEffects(
        reduceOverGamePads(state.filter(gp => gp.index !== message.gamePadIndex)),
      );

    default:
      return updatesCollectionToStateEffects(reduceOverGamePads(state));
  }
};

module.exports = {
  gamePadsReducer,
};
