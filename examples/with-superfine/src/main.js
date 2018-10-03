const ferp = require('ferp');
const { h, patch } = require('superfine');

const { superfineEffect } = require('./superfineEffect.js');

const { none } = ferp.effects;

const view = (state, dispatch) => (
  h('div', null, [
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
      [
        h('button', { type: 'button', onclick: () => dispatch({ type: 'SET', value: state.value - 1 }) }, '-'),
        h('h1', { style: { width: '200px', textAlign: 'center' } }, state.value),
        h('button', { type: 'button', onclick: () => dispatch({ type: 'SET', value: state.value + 1 }) }, '+'),
      ],
    ),
  ])
);

const render = (state, dispatch) => (
  patch(state.node, view(state, dispatch), document.body)
);

const initialState = { value: 0, node: null };

const update = (message, state) => {
  switch (message.type) {
    case 'SET':
      return (() => {
        const nextState = { node: state.node, value: message.value };
        return [
          nextState,
          superfineEffect(render, nextState, { type: 'UPDATE_NODE' }),
        ];
      })();

    case 'UPDATE_NODE':
      return [
        { node: message.node, value: state.value },
        none(),
      ];

    default:
      return [state, none()];
  }
};

const main = () => ferp.app({
  init: [
    initialState,
    superfineEffect(render, initialState, { type: 'UPDATE_NODE' }),
  ],

  update,
});

module.exports = {
  update,
  main,
};
