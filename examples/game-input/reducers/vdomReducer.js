const { patch } = require('superfine');
const { effect } = require('ferp');

const vdomReducer = view => players => (message, state) => {
  const deferred = effect.defer();
  switch (message.type) {
    case 'RENDER':
      return [
        Object.assign({}, state, {
          node: patch(
            state.node,
            view(
              players,
              (playerId, sourceType) => {
                deferred.dispatch(
                  effect.immediate({ type: 'SOURCE_CHANGE', playerId, sourceType }),
                );
              },
            ),
            state.target,
          ),
        }),
        deferred.effect,
      ];

    default:
      return [state, effect.none()];
  }
};

module.exports = {
  vdomReducer,
};
