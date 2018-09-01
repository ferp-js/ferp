const { Effect } = require('../types/effect.js');

const millisecond = (milliseconds, messageType) => new Effect((done) => {
  setTimeout(() => done({ type: messageType }), milliseconds);
});

const second = (seconds, messageType) => millisecond(seconds * 1000, messageType);
const minute = (minutes, messageType) => second(minutes * 60, messageType);
const hour = (hours, messageType) => minute(hours * 60, messageType);

module.exports = {
  millisecond,
  second,
  minute,
  hour,
};
