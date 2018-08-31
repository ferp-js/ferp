const ferp = require('../src/ferp.js');
const { Effect, Result } = ferp.types;
const { Message } = ferp.extras.types;

const fs = require('fs');
const path = require('path');

const SET_CONTENTS = 'SET_CONTENTS';
const setContentsMessage = (contents) => ({ type: SET_CONTENTS, contents });

const readFile = (file) => Effect.map([
  Effect.immediate(setContentsMessage(Result.pending())),
  new Effect((done) => {
    fs.readFile(file, { encoding: 'utf-8' }, (err, data) => {
      if (err) {
        done(setContentsMessage(Result.error(err)));
      } else {
        done(setContentsMessage(Result.done(data)));
      }
    });
  }),
]);

ferp.app({
  init: () => [
    {
      fileContents: Result.nothing(),
    },
    readFile(path.resolve(__dirname, './hello-world.txt')),
  ],

  update: (message, state) => {
    switch (message.type) {
      case SET_CONTENTS:
        return [
          { fileContents: message.contents },
          Effect.none(),
        ];

      default:
        return [state, Effect.none()];
    }
  },

  middleware: [ferp.middleware.logger(2)],
});
