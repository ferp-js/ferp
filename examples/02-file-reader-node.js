const { app, Message, Result, effects } = require('../src/frp.js');
const fs = require('fs');
const path = require('path');

const readFile = (file, MessageClass) => new Promise((resolve, reject) => {
  fs.readFile(path.resolve(__dirname, file), { encoding: 'utf-8' }, (err, data) => {
    if (err) {
      return reject(err);
    }
    resolve(new MessageClass(new Result(data)));
  });
});

class FileContents extends Message {
  constructor(contents) {
    super();
    this.contents = contents;
  }
}

const log = next => (message, state) => {
  const result = next(message, state);
  console.log(...result);
  return result;
};

app({
  initialState: {
    fileContents: new Result(),
  },

  initialEffect: readFile('./02-file-reader-node.txt', FileContents),

  update: log(Message.process([
    [FileContents, (message, state) => [
      {
        fileContents: message.contents,
      },
    ]],
  ])),
});
