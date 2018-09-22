const ferp = require('ferp');
const { router } = require('./router.js');
const { serverSubscription } = require('./subscription.js');

const { defer, none } = ferp.effects;

const responseEffect = ({ response }, status, json) => defer(new Promise((done) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(json), () => done(none()));
}));

const welcome = (message, state, params) => [state, responseEffect(message, 200, { hello: 'world', params })];
const logs = (message, state) => [state, responseEffect(message, 200, state.logs)];
const fourOhFour = (message, state) => [state, responseEffect(message, 404, { error: 'not found' })];

ferp.app({
  init: () => [{ logs: [] }, none()],

  update: router({
    'GET /': welcome,
    'GET /logs': logs,
    'GET /not-found': fourOhFour,
  }),

  subscribe: () => [
    [serverSubscription, 8080, 'ROUTE'],
  ],

  listen: [ferp.listeners.logger(2)],
});
