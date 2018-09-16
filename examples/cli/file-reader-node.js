const ferp = require('ferp');
const fs = require('fs');
const path = require('path');

const { effect } = ferp;
const { Result } = ferp.types;

const readFile = (file, messageType) => effect.map([
  effect.immediate({ type: messageType, data: Result.pending() }),
  effect.create((done) => {
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
          effect.none(),
        ];

      default:
        return [state, effect.none()];
    }
  },

  middleware: [ferp.middleware.logger(2), ferp.middleware.immutable()],
});
