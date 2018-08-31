const { Effect } = require('../types/effect.js');

module.exports = {
  delay: (milliseconds, message) => new Effect((done) => {
    setTimeout(() => done(message), milliseconds)
  }),
}
