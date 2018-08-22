const frp = require('../src/frp.js');
const { Message, Effect, Result } = frp.types;
const fs = require('fs');
const path = require('path');

const readFile = (file, MessageClass) => Effect.map([
  Promise.resolve(new MessageClass(Result.loading())),
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
      Effect.none,
    ]
  }
}

frp.app({
  init: () => [
    {
      fileContents: Result.idle(),
    },
    readFile(path.resolve(__dirname, './02-file-reader-node.txt'), FileContents),
  ],

  update: Message.process([
    FileContents,
  ]),

  middleware: [frp.middleware.logger(2)],
});
