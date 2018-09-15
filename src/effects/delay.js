import * as effect from '../types/effect.js';

export const millisecond = (milliseconds, messageType) => effect.create((done) => {
  setTimeout(() => done({ type: messageType }), milliseconds);
});

export const second = (seconds, messageType) => millisecond(seconds * 1000, messageType);
export const minute = (minutes, messageType) => second(minutes * 60, messageType);
export const hour = (hours, messageType) => minute(hours * 60, messageType);

export const raf = (messageType, lastTimestamp, nextFrameMethod) => effect.create((done) => {
  const requestFrame = nextFrameMethod || requestAnimationFrame;

  requestFrame((timestamp) => {
    done({
      type: messageType,
      timestamp,
      lastTimestamp,
      delta: typeof lastTimestamp !== 'undefined' && lastTimestamp !== null ? timestamp - lastTimestamp : 0,
    });
  });
});
