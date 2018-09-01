const ferp = require('../src/ferp.js');
const { Effect, Result } = ferp.types;
const https = require('https');

const request = (url, messageType) => Effect.map([
  Effect.immediate({ type: messageType, data: Result.pending() }),
  new Effect((done) => {
    https.get(url, (response) => {
      let data = '';
      response
        .on('data', (chunk) => { data += chunk })
        .on('end', () => done({ type: messageType, data: Result.done(JSON.parse(data)) }));
    })
      .on('error', (err) => done({ type: messageType, data: Result.error(err) }))
      .end();
  }),
]);

ferp.app({
  init: () => [
    {
      data: Result.nothing(),
    },
    request('https://jsonplaceholder.typicode.com/todos/1', 'RECV'),
  ],

  update: (message, state) => {
    switch (message.type) {
      case 'RECV':
        return [
          { data: message.data },
          Effect.none(),
        ];

      default:
        return [
          state,
          Effect.none(),
        ];
    }
  },

  middleware: [ferp.middleware.logger(2), ferp.middleware.immutable()],
});
