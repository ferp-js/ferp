const ferp = require('ferp');
const fs = require('fs');
const path = require('path');

const { updateLogger } = require('./updateLogger.js');

const { batch, defer, none } = ferp.effects;

const readFile = (file, errorMessage, successMessage) => defer(new Promise((done) => {
  fs.readFile(file, { encoding: 'utf-8' }, (err, data) => {
    if (err) {
      done({ type: errorMessage, file, err });
    } else {
      done({ type: successMessage, file, data });
    }
  });
}));

ferp.app({
  init: [
    null,
    batch([
      readFile(path.resolve(__dirname, './hello-world.txt'), 'READ_ERR', 'READ_OK'),
      readFile(path.resolve(__dirname, './hello-world.txt.garbage'), 'READ_ERR', 'READ_OK'),
    ]),
  ],

  update: updateLogger((message, state) => {
    switch (message.type) {
      case 'READ_OK':
        // Can do something with message.data
        return [state, none()];

      case 'READ_ERR':
        // Can do something with message.err
        return [state, none()];

      default:
        return [state, none()];
    }
  }),
});
