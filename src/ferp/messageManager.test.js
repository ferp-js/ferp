import test from 'ava';
import sinon from 'sinon';
import { messageManager } from './messageManager.js';

const waitForTick = (ms = 1) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

test('exposes dispatch and onDispatch', (t) => {
  const messages = messageManager();
  t.is(typeof messages.dispatch, 'function');
  t.is(typeof messages.onDispatch, 'function');
});

test('will queue many messages when no onDispatch is available', async (t) => {
  const messages = messageManager();
  messages.dispatch('A');

  const dispatch = sinon.fake.returns(Promise.resolve());

  messages.onDispatch(dispatch);

  await waitForTick();

  t.is(dispatch.callCount, 1);
});
