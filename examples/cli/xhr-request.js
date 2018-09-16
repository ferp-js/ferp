const ferp = require('ferp');
const https = require('https');

const { effect } = ferp;
const { Result } = ferp.types;

const request = (url, messageType) => effect.map([
  effect.immediate({ type: messageType, data: Result.pending() }),
  effect.create((done) => {
    https.get(url, (response) => {
      let data = '';
      response
        .on('data', (chunk) => { data += chunk; })
        .on('end', () => done({ type: messageType, data: Result.done(JSON.parse(data)) }));
    })
      .on('error', err => done({ type: messageType, data: Result.error(err) }))
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
          effect.none(),
        ];

      default:
        return [
          state,
          effect.none(),
        ];
    }
  },

  middleware: [ferp.middleware.logger(2), ferp.middleware.immutable()],
});
