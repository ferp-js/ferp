const ferp = require('ferp');
const fs = require('fs');
const path = require('path');

const { updateLogger } = require('./updateLogger.js');

const { result } = ferp;
const { batch, defer, none } = ferp.effects;

const readFile = (file, messageType) => batch([
  { type: messageType, data: result.pending() },
  defer(new Promise((done) => {
    fs.readFile(file, { encoding: 'utf-8' }, (err, data) => {
      if (err) {
        done({ type: messageType, data: result.error(err) });
      } else {
        done({ type: messageType, data: result.just(data) });
      }
    });
  })),
]);

ferp.app({
  init: [
    {
      data: result.nothing(),
    },
    readFile(path.resolve(__dirname, './hello-world.txt'), 'SET_CONTENTS'),
  ],

  update: updateLogger((message, state) => {
    switch (message.type) {
      case 'SET_CONTENTS':
        return [{ data: message.data }, none()];

      default:
        return [state, none()];
    }
  }),
});
