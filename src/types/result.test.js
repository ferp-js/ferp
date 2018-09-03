const test = require('ava');
const { Result } = require('./result.js');

test('Result.nothing()', (t) => {
  const r = Result.nothing();
  r.get(t.pass, t.fail, t.fail, t.fail);
  t.is(r.getWithDefault(123), 123);
  t.is(r.serialize(), '<Result Nothing>');
});

test('Result.pending()', (t) => {
  const r = Result.pending();
  r.get(t.fail, t.pass, t.fail, t.fail);
  t.is(r.getWithDefault(123), 123);
  t.is(r.serialize(), '<Result Pending>');
});

test('Result.done()', (t) => {
  const r = Result.done(123);
  r.get(t.fail, t.fail, (v) => t.is(v, 123), t.fail);
  t.is(r.getWithDefault(456), 123);
  t.is(r.serialize(), '<Result Done 123>');
});

test('Result.error()', (t) => {
  const r = Result.error({ message: 'error' });
  r.get(t.fail, t.fail, t.fail, (v) => t.deepEqual(v, { message: 'error' }));
  t.is(r.getWithDefault(123), 123);
  t.is(r.serialize(), '<Result Error {"message":"error"}>');
});

test('creating an invalid result state will throw errors', (t) => {
  t.throws(() => {
    const r = new Result(null, null, null);
  });
});
