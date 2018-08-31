const ferp = require('../src/ferp.js');
const { Effect, Result } = ferp.types;
const { Message } = ferp.extras.types;

const fs = require('fs');
const path = require('path');

const readFile = (file, messageType) => Effect.map([
  Effect.immediate({ type: messageType, data: Result.pending() }),
  new Effect((done) => {
    fs.readFile(file, { encoding: 'utf-8' }, (err, data) => {
      if (err) {
        done({ type: messageType, data: Result.error(err) });
      } else {
        done({ type: messageType, data: Result.done(data) });
      }
    });
  }),
]);

ferp.app({
  init: () => [
    {
      data: Result.nothing(),
    },
    readFile(path.resolve(__dirname, './hello-world.txt'), 'SET_CONTENTS'),
  ],

  update: (message, state) => {
    switch (message.type) {
      case 'SET_CONTENTS':
        return [
          { data: message.data },
          Effect.none(),
        ];

      default:
        return [state, Effect.none()];
    }
  },

  middleware: [ferp.middleware.logger(2)],
});
