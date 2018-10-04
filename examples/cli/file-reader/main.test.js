const test = require('ava');
const sinon = require('sinon');
const { effects } = require('ferp');

const { getFileContents, readFile, init, update, main } = require('./main.js');

test('readFile results a success message on a resolve', (t) => {
  const errMessage = 'ERR';
  const okMessage = 'OK';
  const filePath = 'test.test';
  const effect = readFile(() => Promise.resolve('hi'), errMessage, okMessage)(filePath);
  return effect.promise.then((message) => {
    t.deepEqual(message, { type: okMessage, filePath, data: 'hi' });
  });
});

test('readFile results a error message on a reject', (t) => {
  const errMessage = 'ERR';
  const okMessage = 'OK';
  const filePath = 'test.test';
  const err = new Error('test');
  const effect = readFile(() => Promise.reject(err), errMessage, okMessage)(filePath);
  return effect.promise.then((message) => {
    t.deepEqual(message, { type: errMessage, filePath, err });
  });
});

test('getFileContents handles successful reads', (t) => {
  const goodFileRead = sinon.fake((file, options, callback) => {
    callback(null, 'test');
  });

  return getFileContents(goodFileRead)('')
    .then((contents) => {
      t.is(contents, 'test');
    })
    .catch(() => {
      t.fail();
    });
});

test('getFileContents handles unsuccessful reads', (t) => {
  const error = new Error('test');
  const goodFileRead = sinon.fake((file, options, callback) => {
    callback(new Error('test'));
  });

  return getFileContents(goodFileRead)('')
    .then(() => {
      t.fail();
    })
    .catch((err) => {
      t.deepEqual(err, error);
    });
});

test('init creates the correct initial state', (t) => {
  const result = init(effects.none);
  t.deepEqual(result, [
    {
      content: '',
      error: '',
    },
    effects.batch([
      effects.none(),
      effects.none(),
    ]),
  ]);
});

test('update handles READ_OK', (t) => {
  const message = { type: 'READ_OK', file: '/tmp/test.text', data: 'text' };
  const [state, effect] = update(message, {});
  t.deepEqual(state, { content: 'text' });
  t.deepEqual(effect, effects.none());
});

test('update handles READ_ERR', (t) => {
  const message = { type: 'READ_ERR', file: '/tmp/test.text', err: { message: 'err' } };
  const [state, effect] = update(message, {});
  t.deepEqual(state, { error: 'err' });
  t.deepEqual(effect, effects.none());
});

test('update handle other messages with a no-op', (t) => {
  const [state, effect] = update({ type: 'whatever' }, {});
  t.deepEqual(state, {});
  t.deepEqual(effect, effects.none());
});

test('main creates the app', (t) => {
  const detach = main();
  t.is(typeof detach, 'function');
  detach();
});
