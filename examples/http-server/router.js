const ferp = require('ferp');
const url = require('url');

const requestToMatcher = (request, parsed) => (
  `${request.method.toUpperCase()} ${parsed.pathname}`
);

const logEffect = (date, request, parsed, matcher) => ferp.effect.create((done) => {
  const log = {
    date: date.toISOString(),
    address: request.socket.address().address,
    matcher,
    parsed,
  };
  done({ type: 'LOG', log });
});

const router = routes => (message, state) => {
  switch (message.type) {
    case 'ROUTE':
      return (() => {
        const parsed = url.parse(message.request.url);
        const matcher = requestToMatcher(message.request, parsed);
        const handler = routes[matcher] || routes['GET /not-found'];
        if (handler) {
          const [nextState, effect] = handler(message, state, parsed);
          return [
            nextState,
            ferp.effect.map([
              effect,
              logEffect(new Date(), message.request, parsed, matcher),
            ]),
          ];
        }

        return [state, ferp.effect.none()];
      })();

    case 'LOG':
      return [
        { ...state, logs: [message.log].concat(state.logs) },
        ferp.effect.none(),
      ];

    default:
      return [state, ferp.effect.none()];
  }
}

module.exports = {
  router,
};
