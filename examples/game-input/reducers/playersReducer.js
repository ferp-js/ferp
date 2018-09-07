const { playerReducer } = require('./playerReducer.js');
const { updatesCollectionToStateEffects } = require('./helper.js');

const playersReducer = (message, state) => {
  const reduceOverPlayers = players => (
    players.map(player => playerReducer(player.id)(message, player))
  );

  switch (message.type) {
    case 'ADD_PLAYER':
      return updatesCollectionToStateEffects(reduceOverPlayers(state.concat({
        id: message.playerId,
        sourceType: 'empty',
        gamePadIndex: null,
        up: false,
        left: false,
        right: false,
        down: false,
      })));

    case 'REMOVE_PLAYER':
      return updatesCollectionToStateEffects(
        reduceOverPlayers(state.filter(player => player.id !== message.playerId)),
      );

    default:
      return updatesCollectionToStateEffects(reduceOverPlayers(state));
  }
};

module.exports = {
  playersReducer,
};
