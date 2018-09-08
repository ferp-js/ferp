import { Effect } from '../types/effect.js';

export const millisecond = (milliseconds, messageType) => new Effect((done) => {
  setTimeout(() => done({ type: messageType }), milliseconds);
});

export const second = (seconds, messageType) => millisecond(seconds * 1000, messageType);
export const minute = (minutes, messageType) => second(minutes * 60, messageType);
export const hour = (hours, messageType) => minute(hours * 60, messageType);

const requestAnimationFrame = typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
  ? callback => window.requestAnimationFrame(callback)
  : callback => setTimeout(callback, 1000 / 60);

export const raf = (messageType, lastTimestamp) => new Effect((done) => {
  requestAnimationFrame((timestamp) => {
    done({
      type: messageType,
      timestamp,
      lastTimestamp,
      delta: lastTimestamp ? timestamp - lastTimestamp : 0,
    });
  });
});
