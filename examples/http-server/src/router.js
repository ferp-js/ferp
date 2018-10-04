const ferp = require('ferp');
const url = require('url');

const { batch, none } = ferp.effects;

const requestToMatcher = (request, parsed) => (
  `${request.method.toUpperCase()} ${parsed.pathname}`
);

const logEffect = (date, request, parsed, matcher) => {
  const log = {
    date: date.toISOString(),
    address: request.socket.address().address,
    matcher,
    parsed,
  };
  return { type: 'LOG', log };
};

const router = routes => (message, state) => {
  switch (message.type) {
    case 'ROUTE':
      return (() => {
        const parsed = url.parse(message.request.url);
        const matcher = requestToMatcher(message.request, parsed);

        const handler = routes[matcher] || routes['GET /not-found'];
        if (!handler) return [state, none()];

        const [nextState, effect] = handler(message, state, parsed);

        return [
          nextState,
          batch([
            effect,
            logEffect(new Date(), message.request, matcher),
          ]),
        ];
      })();

    case 'LOG':
      return [
        { ...state, logs: [message.log].concat(state.logs) },
        none(),
      ];

    default:
      return [state, none()];
  }
};

module.exports = {
  requestToMatcher,
  logEffect,
  router,
};
