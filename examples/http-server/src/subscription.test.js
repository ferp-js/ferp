const test = require('ava');
const sinon = require('sinon');
const { serverSubscription } = require('./subscription.js');

const createHttpFake = () => {
  let trigger = null;
  return {
    push: (request, response) => {
      if (!trigger) return;
      trigger(request, response);
    },
    createServer: (callback) => {
      trigger = callback;
      return {
        on: () => {},
        listen: () => {},
        close: () => {},
      };
    },
  };
};

test('generates a runner function', (t) => {
  const httpFake = createHttpFake();
  const runner = serverSubscription(httpFake.createServer, 8000, 'TEST');
  t.is(typeof runner, 'function');
});

test('can accept traffic', (t) => {
  const dispatch = sinon.fake();
  const httpFake = createHttpFake();
  const detach = serverSubscription(httpFake.createServer, 0, 'TEST')(dispatch);
  httpFake.push('A', 'B');
  t.is(dispatch.callCount, 1);
  t.deepEqual(dispatch.getCall(0).args, [{ type: 'TEST', request: 'A', response: 'B' }]);
  detach();
});
