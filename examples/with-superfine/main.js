const ferp = require('ferp');
const { h, patch } = require('superfine');

const { none, batch, defer } = ferp.effects;

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

const renderEffect = (state) => {
  let dispatch = () => {};
  const eventPromise = new Promise((eventResolve) => {
    dispatch = eventResolve;
  });

  const node = patch(state.node, view(state, dispatch), document.body);

  return batch([
    { type: 'UPDATE_NODE', node },
    defer(eventPromise),
  ]);
};

const initialState = { value: 0, node: null };

ferp.app({
  init: () => [
    initialState,
    renderEffect(initialState),
  ],

  update: (message, state) => {
    switch (message.type) {
      case 'SET':
        return (() => {
          const nextState = { node: state.node, value: message.value };
          return [
            nextState,
            renderEffect(nextState),
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
  },
});
