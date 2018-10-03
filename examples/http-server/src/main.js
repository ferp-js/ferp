const http = require('http');
const ferp = require('ferp');

const { router } = require('./router.js');
const { serverSubscription } = require('./subscription.js');

const { defer, none } = ferp.effects;

const responseEffect = ({ response }, status, json) => defer(new Promise((done) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(json), () => done(none()));
}));

const showState = (message, state) => [state, responseEffect(message, 200, state.logs)];
const fourOhFour = (message, state) => [state, responseEffect(message, 404, { error: 'not found' })];

const main = () => ferp.app({
  init: [{ logs: [] }, none()],

  update: router({
    'GET /': showState,
    'GET /not-found': fourOhFour,
  }),

  subscribe: () => [
    [serverSubscription, http.createServer, 8080, 'ROUTE'],
  ],
});

module.exports = {
  responseEffect,
  main,
};
