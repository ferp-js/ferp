const ferp = require('../../src/ferp.js');
const { serverSubscription } = require('./subscription.js');
const url = require('url');


const responseEffect = ({ response }, status, json) => new ferp.types.Effect((done) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(json), () => done(null));
});

const welcome = (message, state, params) => [state, responseEffect(message, 200, { hello: 'world', params })];
const logs = (message, state) => [state, responseEffect(message, 200, state.logs)];
const fourOhFour = (message, state) => [state, responseEffect(message, 404, { error: 'not found' })];

const router = (routes) => (message, state) => {
  switch (message.type) {
    case 'ROUTE':
      const parsed = url.parse(message.request.url);
      const matcher = `${message.request.method.toUpperCase()} ${parsed.pathname}`;
      const handler = routes[matcher] || routes['GET /not-found'];
      if (handler) {
        const log = {
          date: (new Date()).toISOString(),
          address: message.request.socket.address().address,
          matcher,
          parsed,
        }
        const nextState = { ...state, logs: [log].concat(state.logs) };
        return handler(message, nextState, parsed);
      }

    default:
      return [state, ferp.types.Effect.none()];
  }
}

ferp.app({
  init: () => [
    {
      logs: [],
    },
  ],

  update: router({
    'GET /': welcome,
    'GET /logs': logs,
    'GET /not-found': fourOhFour,
  }),

  subscribe: () => [
    ['server', serverSubscription, 8080, 'ROUTE'],
  ],

  middleware: [ferp.middleware.logger(2)],
});

