const ferp = require('../../src/ferp.js');
const url = require('url');

const requestToMatcher = (request, parsed) => (
  `${request.method.toUpperCase()} ${parsed.pathname}`
);

const logEffect = (date, request, parsed, matcher) => new ferp.types.Effect((done) => {
  const log = {
    date: date.toISOString(),
    address: request.socket.address().address,
    matcher,
    parsed,
  };
  done({ type: 'LOG', log });
});

const router = (routes) => (message, state) => {
  switch (message.type) {
    case 'ROUTE':
      const parsed = url.parse(message.request.url);
      const matcher = requestToMatcher(message.request, parsed);
      const handler = routes[matcher] || routes['GET /not-found'];
      if (handler) {
        const [nextState, effect] = handler(message, state, parsed);
        return [
          nextState,
          ferp.types.Effect.map([
            effect,
            logEffect(new Date(), message.request, parsed, matcher),
          ])
        ]
      }

    case 'LOG':
      return [
        { ...state, logs: [message.log].concat(state.logs) },
        ferp.types.Effect.none(),
      ];

    default:
      return [state, ferp.types.Effect.none()];
  }
}

module.exports = {
  router,
};
