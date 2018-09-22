const ferp = require('ferp');

const { none } = ferp.effects;

const canvasReducer = players => (message, state) => {
  if (message.type === 'TICK') {
    const target = document.getElementById(state.targetId);
    const context = target.getContext('2d');
    context.fillStyle = 'white';
    context.fillRect(0, 0, 800, 600);
    players.forEach((player) => {
      context.fillStyle = 'black';
      context.fillRect(
        player.x - 2, player.y - 2,
        5, 5,
      );
    });
  }

  return [state, none()];
};

module.exports = {
  canvasReducer,
};
