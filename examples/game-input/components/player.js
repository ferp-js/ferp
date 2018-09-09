const { h } = require('superfine');

const playerView = (player, onSourceChange) => {
  const name = `${player.id}-source`;
  const renderInput = (label, value, sourceType) => [
    h('input', {
      class: 'source',
      type: 'radio',
      value,
      name,
      id: `${name}-${value}`,
      checked: sourceType === value,
      onchange: (e) => {
        console.log('playerView.input.onchange', e);
        onSourceChange(e.target.value);
      },
    }),
    h('label', { class: 'source', for: `${name}-${value}` }, label),
  ];

  const gamePadStatus = () => {
    if (player.sourceType !== 'gamepad') return 'Gamepad disabled';
    return player.gamePadIndex === null ? 'Press gamepad button' : `Game pad ${player.gamePadIndex}`;
  };

  return h('div', { class: 'player' }, [
    h('h2', null, `Player ${player.id}`),

    h('div', { class: 'input-group' }, [
      h('div', { class: ['input', 'up', player.up && 'pressed'].filter(Boolean).join(' ') }),
    ]),
    h('div', { class: 'input-group' }, [
      h('div', { class: ['input', 'left', player.left && 'pressed'].filter(Boolean).join(' ') }),
      h('div', { class: ['input', 'right', player.right && 'pressed'].filter(Boolean).join(' ') }),
    ]),
    h('div', { class: 'input-group' }, [
      h('div', { class: ['input', 'down', player.down && 'pressed'].filter(Boolean).join(' ') }),
    ]),

    h(
      'div',
      { class: 'sources' },
      []
        .concat(renderInput('Unassigned', 'empty', player.sourceType))
        .concat(renderInput('WASD Keys', 'wasd', player.sourceType))
        .concat(renderInput('Arrow Keys', 'arrows', player.sourceType))
        .concat(renderInput('Gamepad', 'gamepad', player.sourceType)),
    ),
    h(
      'small',
      null,
      gamePadStatus(),
    ),
  ]);
};

module.exports = {
  playerView,
};
