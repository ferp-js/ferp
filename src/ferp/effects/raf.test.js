import test from 'ava';
import sinon from 'sinon';

import * as core from './core.js';

import { raf, getNextFrameMethod } from './raf.js';
import { effectManager } from '../effectManager.js';

test('raf returns a thunk defer effect', (t) => {
  t.is(raf().type, core.effectTypes.thunk);
  t.is(raf().method().type, core.effectTypes.defer);
});

test.cb('raf resolves the correct message with no lastTimestamp', (t) => {
  const manager = effectManager((message) => {
    t.is(message.type, 'test');
    t.is(message.delta, 0);
    t.is(message.lastTimestamp, undefined);
    t.truthy(message.timestamp);
    t.end();
  });
  manager(raf({ type: 'test' }));
});

test.cb('raf resolves the correct message with a lastTimestamp', (t) => {
  const lastTimestamp = Date.now() - 1;
  const manager = effectManager((message) => {
    t.is(message.type, 'test');
    t.truthy(message.delta);
    t.is(message.lastTimestamp, lastTimestamp);
    t.truthy(message.timestamp);
    t.end();
  });
  manager(raf({ type: 'test' }, lastTimestamp));
});

test('getNextFrameMethod uses requestAnimationFrame when available', (t) => {
  global.requestAnimationFrame = sinon.fake(cb => cb());

  const nextMethod = getNextFrameMethod();
  nextMethod(() => {});

  t.truthy(global.requestAnimationFrame.called);

  delete global.requestAnimationFrame;
});
