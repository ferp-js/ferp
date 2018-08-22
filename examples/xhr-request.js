const frp = require('../src/frp.js');
const { Message, Effect, Result } = frp.types;
const https = require('https');

const request = (url, MessageClass) => Effect.map([
  Promise.resolve(new MessageClass(Result.loading())),
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

frp.app({
  init: () => [
    {
      data: Result.idle(),
    },
    request('https://jsonplaceholder.typicode.com/todos/1', Receive),
  ],

  update: Message.process([
    Receive,
  ]),

  middleware: [frp.middleware.logger(2)],
});
