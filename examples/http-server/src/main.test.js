const test = require('ava');
const sinon = require('sinon');
const { effects } = require('ferp');
const { responseEffect, main } = require('./main.js');

test('responseEffect writes and ends the resposne', async (t) => {
  const response = {
    writeHead: sinon.fake(),
    end: (_, callback) => {
      callback();
    },
  };
  const effect = responseEffect({ response }, 200, '{ "foo": true }');
  t.truthy(effect.promise instanceof Promise);
  const nextEffect = await effect.promise;
  t.is(response.writeHead.callCount, 1);
  t.is(nextEffect.type, effects.none().type);
});

test('runs the app', (t) => {
  const detach = main();
  t.is(typeof detach, 'function');
  detach();
});
