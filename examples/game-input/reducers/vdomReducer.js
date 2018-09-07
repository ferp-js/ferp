const { patch } = require('superfine');
const { Effect } = require('ferp').types;

const vdomReducer = view => players => (message, state) => {
  const deferred = Effect.defer();
  switch (message.type) {
    case 'RENDER':
      return [
        Object.assign({}, state, {
          node: patch(
            state.node,
            view(
              players,
              (playerId, sourceType) => {
                deferred.dispatch({ type: 'SOURCE_CHANGE', playerId, sourceType });
              },
            ),
            state.target,
          ),
        }),
        deferred.effect,
      ];

    default:
      return [state, Effect.none()];
  }
};

module.exports = {
  vdomReducer,
};
