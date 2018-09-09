import { Effect } from '../types/effect.js';

export const millisecond = (milliseconds, messageType) => new Effect((done) => {
  setTimeout(() => done({ type: messageType }), milliseconds);
});

export const second = (seconds, messageType) => millisecond(seconds * 1000, messageType);
export const minute = (minutes, messageType) => second(minutes * 60, messageType);
export const hour = (hours, messageType) => minute(hours * 60, messageType);

export const raf = (messageType, lastTimestamp) => new Effect((done) => {
  const nextFrame = typeof requestAnimationFrame === 'function'
    ? callback => requestAnimationFrame(callback)
    : callback => setTimeout(() => callback(Date.now()), 1000 / 60);

  nextFrame((timestamp) => {
    done({
      type: messageType,
      timestamp,
      lastTimestamp,
      delta: typeof lastTimestamp !== 'undefined' && lastTimestamp !== null ? timestamp - lastTimestamp : 0,
    });
  });
});
