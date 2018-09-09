const { h } = require('superfine');
const { playerView } = require('./components/player.js');

const view = (players, onSourceChange) => (
  h('div', { class: 'players' }, players.map(player => (
    playerView(player, (value => onSourceChange(player.id, value)))
  )))
);

module.exports = {
  view,
};
