import { defer, thunk } from './core.js';

export const getNextFrameMethod = () => (
  typeof requestAnimationFrame === 'function'
    ? (callback) => requestAnimationFrame(callback)
    : (callback) => setTimeout(() => callback(Date.now()), 1000 / 60)
);

const nextFrame = getNextFrameMethod();

export const raf = (message, lastTimestamp) => thunk(() => defer(new Promise((resolve) => {
  nextFrame((timestamp) => {
    const hasLastTimestamp = (
      typeof lastTimestamp !== 'undefined'
      && lastTimestamp !== null
    );

    const delta = hasLastTimestamp ? timestamp - lastTimestamp : 0;

    resolve({
      ...message,
      timestamp,
      lastTimestamp,
      delta,
    });
  });
})));
