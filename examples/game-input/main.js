const ferp = require('ferp');
const { h, patch } = require('superfine');
const { appReducer, initialState } = require('./reducers/appReducer.js');
const { keyboardSubscription } = require('./subscriptions/keyboardSubscription.js');
const { inputEffect } = require('./effects/inputEffect.js');

const { Effect } = ferp.types;

const view = (players, onSourceChange) => (
  h('div', { class: 'players' }, players.map((player) => {
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
          onSourceChange(player.id, e.target.value);
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
  }))
);

const effectForKeyEvent = (isKeyDown, key, players) => {
  const mapping = {
    wasd: {
      w: 'up',
      s: 'down',
      a: 'left',
      d: 'right',
    },
    arrows: {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
    },
  };

  const sourceType = ['wasd', 'arrows'].find(type => mapping[type][key]);

  const ps = players.filter(p => p.sourceType === sourceType);
  if (!sourceType || players.length === 0) return Effect.none();

  return Effect.map(ps.map(p => (
    inputEffect(isKeyDown, p.id, mapping[sourceType][key])
  )));
};

ferp.app({
  init: () => [
    initialState,
    Effect.map([
      Effect.immediate({ type: 'ADD_PLAYER', playerId: Math.random().toString(36).substr(7) }),
      Effect.immediate({ type: 'ADD_PLAYER', playerId: Math.random().toString(36).substr(7) }),
      Effect.immediate({ type: 'ADD_PLAYER', playerId: Math.random().toString(36).substr(7) }),
      Effect.immediate({ type: 'ADD_PLAYER', playerId: Math.random().toString(36).substr(7) }),
    ]),
  ],
  update: (message, state) => {
    console.log(message);
    const [nextState, effects] = appReducer(view)(message, state);
    const extraEffects = [];
    switch (message.type) {
      case 'KEY_DOWN':
        extraEffects.push(effectForKeyEvent(true, message.key, state.players));
        break;

      case 'KEY_UP':
        extraEffects.push(effectForKeyEvent(false, message.key, state.players));
        break;

      default:
        break;
    }

    if (message.type !== 'RENDER') {
      extraEffects.push(Effect.immediate({ type: 'RENDER', view }));
    }

    return [
      nextState,
      Effect.map([
        Effect.map(effects),
        Effect.map(extraEffects),
      ])
    ];
  },

  subscribe: (state) => {
    const anyGamePadPlayers = state.players.some(p => p.sourceType === 'gamepad');
    return [
      ['keyhandler', keyboardSubscription, 'KEY_DOWN', 'KEY_UP'],
    ];
  },
});
