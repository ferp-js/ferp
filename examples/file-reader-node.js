const ferp = require('../src/ferp.js');
const { Message, Effect, Result } = ferp.types;
const fs = require('fs');
const path = require('path');

const readFile = (file, MessageClass) => Effect.map([
  Promise.resolve(new MessageClass(Result.pending())),
  new Promise((resolve) => {
    fs.readFile(file, { encoding: 'utf-8' }, (err, data) => {
      if (err) {
        resolve(new MessageClass(Result.error(err)));
      } else {
        resolve(new MessageClass(Result.done(data)));
      }
    });
  }),
]);

class FileContents extends Message {
  constructor(result) {
    super();
    this.contents = result;
  }

  static integrate(message, state) {
    return [
      {
        fileContents: message.contents,
      },
      Effect.none(),
    ]
  }
}

ferp.app({
  init: () => [
    {
      fileContents: Result.nothing(),
    },
    readFile(path.resolve(__dirname, './hello-world.txt'), FileContents),
  ],

  update: Message.process([
    FileContents,
  ]),

  middleware: [ferp.middleware.logger(2)],
});
