const ferp = require('../src/ferp.js');
const { Message, Effect, Result } = ferp.types;
const https = require('https');

const request = (url, MessageClass) => Effect.map([
  Promise.resolve(new MessageClass(Result.pending())),
  new Effect((done) => {
    https.get(url, (response) => {
      let data = '';
      response
        .on('data', (chunk) => { data += chunk })
        .on('end', () => done(new MessageClass(Result.done(JSON.parse(data)))));
    })
      .on('error', (err) => done(new MessageClass(Result.error(err))))
      .end();
  }),
]);

class Receive extends Message {
  constructor(result) {
    super();
    this.data = result;
  }

  static integrate(message, state) {
    return [
      {
        data: message.data,
      },
      Effect.none(),
    ]
  }
}

ferp.app({
  init: () => [
    {
      data: Result.nothing(),
    },
    request('https://jsonplaceholder.typicode.com/todos/1', Receive),
  ],

  update: Message.process([
    Receive,
  ]),

  middleware: [ferp.middleware.logger(2)],
});
