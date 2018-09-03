/* global window */

const { Effect } = require('../types/effect.js');

const millisecond = (milliseconds, messageType) => new Effect((done) => {
  setTimeout(() => done({ type: messageType }), milliseconds);
});

const second = (seconds, messageType) => millisecond(seconds * 1000, messageType);
const minute = (minutes, messageType) => second(minutes * 60, messageType);
const hour = (hours, messageType) => minute(hours * 60, messageType);

const requestAnimationFrame = window && typeof window.requestAnimationFrame === 'function'
  ? callback => window.requestAnimationFrame(callback)
  : callback => setTimeout(callback, 1000 / 60);

const raf = messageType => new Effect((done) => {
  requestAnimationFrame((timestamp) => {
    done({ type: messageType, timestamp });
  });
});

module.exports = {
  millisecond,
  second,
  minute,
  hour,
  raf,
};
