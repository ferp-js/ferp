const ferp = require('ferp');
const fs = require('fs');
const path = require('path');

const { updateLogger } = require('../common/updateLogger.js');

const { batch, defer, none } = ferp.effects;

const getFileContents = readFile => file => new Promise((resolve, reject) => {
  readFile(file, { encoding: 'utf-8' }, (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  });
});

const readFile = (getter, errorMessage, successMessage) => filePath => defer(
  getter(filePath)
    .then(data => ({ type: successMessage, filePath, data }))
    .catch(err => ({ type: errorMessage, filePath, err })),
);

const init = reader => [
  { content: '', error: '' },
  batch([
    reader(path.resolve(__dirname, './hello-world.txt')),
    reader(path.resolve(__dirname, './hello-world.txt.garbage')),
  ]),
];

const update = (message, state) => {
  switch (message.type) {
    case 'READ_OK':
      // Can do something with message.data
      return [Object.assign({}, state, { content: message.data }), none()];

    case 'READ_ERR':
      // Can do something with message.err
      return [Object.assign({}, state, { error: message.err.message }), none()];

    default:
      return [state, none()];
  }
};

const main = () => ferp.app({
  init: init(readFile(getFileContents(fs.readFile), 'READ_ERR', 'READ_OK')),
  update: updateLogger(update),
});

module.exports = {
  getFileContents,
  readFile,
  init,
  update,
  main,
};
