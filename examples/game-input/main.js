const ferp = require('ferp');
const { h, patch } = require('superfine');

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

const playerReducer = id => (message, state) => {
  if (message.playerId !== id) return state;
  switch (message.type) {
    case 'SOURCE_CHANGE':
      return Object.assign({}, state, {
        sourceType: message.sourceType,
        gamePadIndex: null,
      });

    case 'ASSIGN_GAMEPAD_INDEX':
      return Object.assign({}, state, {
        sourceType: 'gamepad',
        gamePadIndex: message.gamePadIndex,
      });

    case 'INPUT_DOWN':
      return Object.assign({}, state, {
        [message.key]: true,
      });

    case 'INPUT_UP':
      return Object.assign({}, state, {
        [message.key]: false,
      });

    default:
      return state;
  }
};

const playersReducer = (message, state) => {
  const reduceOverPlayers = players => (
    players.map(player => playerReducer(player.id)(message, player))
  );

  switch (message.type) {
    case 'ADD_PLAYER':
      return reduceOverPlayers(state.concat({
        id: message.playerId,
        sourceType: 'empty',
        gamePadIndex: null,
        up: false,
        left: false,
        right: false,
        down: false,
      }));

    case 'REMOVE_PLAYER':
      return reduceOverPlayers(state.filter(player => player.id !== message.playerId));

    default:
      return reduceOverPlayers(state);
  }
};

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

const inputEffect = (type, playerId, key) => ferp.types.Effect.immediate({
  type,
  playerId,
  key,
});

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
  if (!sourceType || players.length === 0) return ferp.types.Effect.none();

  const type = isKeyDown ? 'INPUT_DOWN' : 'INPUT_UP';

  return ferp.types.Effect.map(ps.map(p => (
    inputEffect(type, p.id, mapping[sourceType][key])
  )));
};

const keyboardSubscription = (keyDownType, keyUpType) => (dispatch) => {
  const onKeyDown = (e) => {
    if (e.repeat) return;
    dispatch({ type: keyDownType, key: e.key });
  };

  const onKeyUp = (e) => {
    dispatch({ type: keyUpType, key: e.key });
  };

  document.body.addEventListener('keydown', onKeyDown, false);
  document.body.addEventListener('keyup', onKeyUp, false);

  return () => {
    document.body.removeEventListener('keydown', onKeyDown);
    document.body.removeEventListener('keyup', onKeyUp);
  };
};

const gamepadSubscription = (
  gamePadConnectedType, gamePadDisconnectedType, gamePadDownType, gamePadUpType,
) => (dispatch) => {
  let rafHandle = null;
  let lastGamePads = {};

  const getGamePads = () => {
    if (navigator.getGamepads) return navigator.getGamepads();
    return navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : [];
  };

  const storeGamePads = (gamePads) => {
    lastGamePads = {};
    for (const gamePad of gamePads) {
      if (gamePad) {
        lastGamePads[gamePad.index] = Object.assign({}, gamePad, {
          buttons: gamePad.buttons.map(button => ({
            pressed: button.pressed,
            value: button.value,
          })),
          axes: [...gamePad.axes],
        });
      }
    }
  };

  const sendChangeMessagesForGamePad = (lastGamePad, gamePad) => {
    if (!lastGamePad) {
      dispatch({ type: gamePadConnectedType, gamePadId: gamePad.id });
      gamePad.buttons.forEach((button, index) => {
        if (button.pressed) {
          dispatch({
            type: gamePadDownType,
            gamePadIndex: gamePad.index,
            button: standardButtonMapping[index],
          });
        }
      });
    } else if (lastGamePad && !gamePad.connected) {
      dispatch({ type: gamePadDisconnectedType, gamePadIndex: gamePad.index });
    } else {
      gamePad.buttons.forEach((button, index) => {
        if (button.pressed !== lastGamePad.buttons[index].pressed) {
          const type = button.pressed
            ? gamePadDownType
            : gamePadUpType;
          dispatch({ type, gamePadIndex: gamePad.index, button: standardButtonMapping[index] });
        }
      });
    }
  };

  const sendChangeMessages = (gamePads) => {
    for (const gamePad of gamePads) {
      if (gamePad) {
        const lastGamePad = lastGamePads[gamePad.index];
        if (!lastGamePad || lastGamePad.timestamp !== gamePad.timestamp) {
          sendChangeMessagesForGamePad(lastGamePad, gamePad);
        }
      }
    }
  };

  const queryGamePads = () => {
    const gamePads = getGamePads();
    sendChangeMessages(gamePads);
    storeGamePads(gamePads);
    rafHandle = requestAnimationFrame(queryGamePads);
  };

  setTimeout(queryGamePads, 500);

  return () => {
    cancelAnimationFrame(rafHandle);
    rafHandle = null;
  };
};

ferp.app({
  init: () => [
    {
      players: [],
      node: null,
      target: document.getElementById('container'),
    },
    ferp.types.Effect.map([
      ferp.types.Effect.immediate({ type: 'ADD_PLAYER', playerId: Math.random().toString(36).substr(7) }),
      ferp.types.Effect.immediate({ type: 'ADD_PLAYER', playerId: Math.random().toString(36).substr(7) }),
      ferp.types.Effect.immediate({ type: 'ADD_PLAYER', playerId: Math.random().toString(36).substr(7) }),
      ferp.types.Effect.immediate({ type: 'ADD_PLAYER', playerId: Math.random().toString(36).substr(7) }),
    ]),
  ],
  update: (message, state) => {
    switch (message.type) {
      case 'RENDER':
        return (() => {
          const deferred = ferp.types.Effect.defer();
          return [
            Object.assign({}, state, {
              node: patch(
                state.node,
                view(
                  state.players,
                  (playerId, sourceType) => {
                    deferred.dispatch({ type: 'SOURCE_CHANGE', playerId, sourceType });
                  },
                ),
                state.target,
              ),
            }),
            deferred.effect,
          ];
        })();

      case 'KEY_DOWN':
        return [
          state,
          effectForKeyEvent(true, message.key, state.players),
        ];

      case 'KEY_UP':
        return [
          state,
          effectForKeyEvent(false, message.key, state.players),
        ];

      case 'GAMEPAD_BUTTON_DOWN':
        return (() => {
          const isGamePadFree = !state.players
            .find(p => p.gamePadIndex === message.gamePadIndex);
          const playerNeedsGamePadIndex = state.players
            .find(p => p.sourceType === 'gamepad' && p.gamePadIndex === null);

          const effect = (() => {
            if (isGamePadFree && playerNeedsGamePadIndex) {
              return ferp.types.Effect.immediate({
                type: 'ASSIGN_GAMEPAD_INDEX',
                playerId: playerNeedsGamePadIndex.id,
                gamePadIndex: message.gamePadIndex,
              });
            }
            const player = state.players
              .find(p => p.sourceType === 'gamepad' && p.gamePadIndex === message.gamePadIndex);
            if (!player) return ferp.types.Effect.none();

            return inputEffect('INPUT_DOWN', player.id, message.button);
          })();

          return [
            state,
            effect,
          ];
        })();

      case 'GAMEPAD_BUTTON_UP':
        return (() => {
          const player = state.players
            .find(p => p.sourceType === 'gamepad' && p.gamePadIndex === message.gamePadIndex);
          if (!player) return ferp.types.Effect.none();

          return [
            state,
            inputEffect('INPUT_UP', player.id, message.button),
          ];
        })();

      default:
        return [
          Object.assign({}, state, {
            players: playersReducer(message, state.players),
          }),
          ferp.types.Effect.immediate({ type: 'RENDER' }),
        ];
    }
  },

  subscribe: (state) => {
    const anyGamePadPlayers = state.players.some(p => p.sourceType === 'gamepad');
    return [
      ['keyhandler', keyboardSubscription, 'KEY_DOWN', 'KEY_UP'],
      anyGamePadPlayers && [
        'gamepadhandler',
        gamepadSubscription,
        'GAMEPAD_CONNECT',
        'GAMEPAD_DISCONNECT',
        'GAMEPAD_BUTTON_DOWN',
        'GAMEPAD_BUTTON_UP',
      ],
    ];
  },
});
