const ferp = require('ferp');
const https = require('https');

const { Result } = ferp.types;
const { batch, defer, none } = ferp.effects;

const request = (url, messageType) => batch([
  { type: messageType, data: Result.pending() },
  defer(new Promise((done) => {
    https.get(url, (response) => {
      let data = '';
      response
        .on('data', (chunk) => { data += chunk; })
        .on('end', () => done({ type: messageType, data: Result.done(JSON.parse(data)) }));
    })
      .on('error', err => done({ type: messageType, data: Result.error(err) }))
      .end();
  })),
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
          none(),
        ];

      default:
        return [
          state,
          none(),
        ];
    }
  },

  listen: [ferp.listeners.logger(2)],
});
