import { defer } from './core.js';

const nextFrame = typeof requestAnimationFrame === 'function'
  ? callback => requestAnimationFrame(callback)
  : callback => setTimeout(() => callback(Date.now()), 1000 / 60);

export const raf = (message, lastTimestamp) => defer(new Promise((resolve) => {
  nextFrame((timestamp) => {
    const hasLastTimestamp = (
      typeof lastTimestamp !== 'undefined'
      && lastTimestamp !== null
    );

    const delta = hasLastTimestamp ? timestamp - lastTimestamp : 0;

    resolve(Object.assign({}, message, {
      timestamp,
      lastTimestamp,
      delta,
    }));
  });
}));
