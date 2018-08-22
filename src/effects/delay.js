const { Effect } = require('../types/effect.js');

module.exports = {
  delay: (milliseconds, MessageType) => new Effect((done) => {
    setTimeout(() => done(new MessageType()), milliseconds)
  }),
}
