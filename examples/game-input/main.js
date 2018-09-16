const ferp = require('ferp');
const { appReducer, initialState } = require('./reducers/appReducer.js');
const { keyboardSubscription } = require('./subscriptions/keyboardSubscription.js');
const { inputEffect } = require('./effects/inputEffect.js');
const { gamePadEffect } = require('./effects/gamePadEffect.js');
const { view } = require('./view.js');

const { effect } = ferp;

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
  if (!sourceType || players.length === 0) return effect.none();

  return effect.map(ps.map(p => (
    inputEffect(isKeyDown, p.id, mapping[sourceType][key])
  )));
};

const withMoreEffects = result => (effects) => {
  const [state, currentEffect] = result;
  return [
    state,
    effect.map([
      currentEffect,
      effect.map(effects),
    ]),
  ];
};

const createApp = () => ferp.app({
  init: () => [
    initialState,
    effect.map([
      effect.immediate({ type: 'ADD_PLAYER', playerId: Math.random().toString(36).substr(7) }),
      effect.immediate({ type: 'ADD_PLAYER', playerId: Math.random().toString(36).substr(7) }),
      effect.immediate({ type: 'ADD_PLAYER', playerId: Math.random().toString(36).substr(7) }),
      effect.immediate({ type: 'ADD_PLAYER', playerId: Math.random().toString(36).substr(7) }),
      effect.immediate({ type: 'TICK' }),
    ]),
  ],
  update: (message, state) => {
    const result = appReducer(view)(message, state);
    switch (message.type) {
      case 'KEY_DOWN':
        return withMoreEffects(result)([
          effectForKeyEvent(true, message.key, state.players),
        ]);

      case 'KEY_UP':
        return withMoreEffects(result)([
          effectForKeyEvent(false, message.key, state.players),
        ]);

      case 'TICK':
        return withMoreEffects(result)([
          ferp.effects.delay.raf('TICK', message.timestamp),
          gamePadEffect(state.gamePads),
        ]);

      case 'RENDER':
        return result;

      default:
        return withMoreEffects(result)([
          effect.immediate({ type: 'RENDER', view }),
        ]);
    }
  },

  subscribe: () => [
    [keyboardSubscription, 'KEY_DOWN', 'KEY_UP'],
  ],
});

createApp();
