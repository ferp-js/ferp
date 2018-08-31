const { Effect } = require('../types/effect.js');

module.exports = {
  delay: (milliseconds, messageType) => new Effect((done) => {
    setTimeout(() => done({ type: messageType }), milliseconds);
  }),
};
