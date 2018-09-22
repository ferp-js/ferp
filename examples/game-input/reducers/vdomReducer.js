const { patch } = require('superfine');

const { defer, none } = require('ferp').effects;

const vdomReducer = view => players => (message, state) => {
  switch (message.type) {
    case 'RENDER':
      return (() => {
        let dispatch = () => {};
        const eventPromise = new Promise((resolve) => {
          dispatch = resolve;
        });
        return [
          Object.assign({}, state, {
            node: patch(
              state.node,
              view(
                players,
                (playerId, sourceType) => {
                  dispatch(
                    { type: 'SOURCE_CHANGE', playerId, sourceType },
                  );
                },
              ),
              state.target,
            ),
          }),
          defer(eventPromise),
        ];
      })();

    default:
      return [state, none()];
  }
};

module.exports = {
  vdomReducer,
};
