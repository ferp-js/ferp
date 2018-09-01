const ferp = require('../../src/ferp.js');
const { router } = require('./router.js');
const { serverSubscription } = require('./subscription.js');

const responseEffect = ({ response }, status, json) => new ferp.types.Effect((done) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(json), () => done(null));
});

const welcome = (message, state, params) => [state, responseEffect(message, 200, { hello: 'world', params })];
const logs = (message, state) => [state, responseEffect(message, 200, state.logs)];
const fourOhFour = (message, state) => [state, responseEffect(message, 404, { error: 'not found' })];

ferp.app({
  init: () => [{ logs: [] }, ferp.types.Effect.none()],

  update: router({
    'GET /': welcome,
    'GET /logs': logs,
    'GET /not-found': fourOhFour,
  }),

  subscribe: () => [
    ['server', serverSubscription, 8080, 'ROUTE'],
  ],

  middleware: [ferp.middleware.logger(2), ferp.middleware.immutable()],
});

