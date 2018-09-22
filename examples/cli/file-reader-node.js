const ferp = require('ferp');
const fs = require('fs');
const path = require('path');

const { Result } = ferp.types;
const { batch, defer, none } = ferp.effects;

const readFile = (file, messageType) => batch([
  { type: messageType, data: Result.pending() },
  defer(new Promise((done) => {
    fs.readFile(file, { encoding: 'utf-8' }, (err, data) => {
      if (err) {
        done({ type: messageType, data: Result.error(err) });
      } else {
        done({ type: messageType, data: Result.done(data) });
      }
    });
  })),
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
        return [{ data: message.data }, none()];

      default:
        return [state, none()];
    }
  },

  listen: [ferp.listeners.logger(2)],
});
