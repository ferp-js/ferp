const { gamePadReducer } = require('./gamePadReducer.js');
const { updatesCollectionToStateEffects } = require('./helper.js');

const gamePadsReducer = players => (message, state) => {
  const reduceOverGamePads = gamePads => (
    gamePads.map(gamePad => (
      gamePadReducer(gamePad.index)(players)(message, gamePad)
    ))
  );

  switch (message.type) {
    default:
      return updatesCollectionToStateEffects(reduceOverGamePads(state));
  }
};

module.exports = {
  gamePadsReducer,
};
