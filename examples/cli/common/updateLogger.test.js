const test = require('ava');
const sinon = require('sinon');
const { updateLogger } = require('./updateLogger.js');

test.beforeEach((t) => {
  const consoleLog = global.console.log;
  global.console.log = sinon.fake();
  t.context.data = consoleLog; // eslint-disable-line no-param-reassign
});

test.afterEach((t) => {
  global.console.log = t.context.data;
});

test('calls update, and forwards update', (t) => {
  const updateResult = [1, {}];
  const update = sinon.fake.returns(updateResult);
  const message = { type: 'TEST' };
  const previousState = 1;

  const result = updateLogger(update)(message, previousState);
  t.deepEqual(result, updateResult);
  t.is(update.callCount, 1);
  t.deepEqual(update.getCall(0).args, [message, previousState]);
});
