const { playersReducer } = require('./playersReducer.js');
const { gamePadsReducer } = require('./gamePadsReducer.js');
const { vdomReducer } = require('./vdomReducer.js');
const { canvasReducer } = require('./canvasReducer.js');
const { updatesToStateEffects } = require('./helper.js');

const appReducer = view => (message, state) => updatesToStateEffects({
  players: playersReducer(message, state.players),
  gamePads: gamePadsReducer(state.players)(message, state.gamePads),
  vdom: vdomReducer(view)(state.players)(message, state.vdom),
  canvas: canvasReducer(message, state.canvas),
});

const initialState = {
  players: [],
  gamePads: [],
  vdom: {
    node: null,
    target: document.getElementById('container'),
  },
  canvas: {
    context: null,
    target: document.getElementById('canvas'),
  },
};

module.exports = {
  appReducer,
  initialState,
};
