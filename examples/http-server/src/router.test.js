const test = require('ava');
const sinon = require('sinon');
const { effects } = require('ferp');
const { requestToMatcher, router } = require('./router.js');

test('requestToMatcher', (t) => {
  t.is(
    requestToMatcher({ method: 'get' }, { pathname: '/index.html' }),
    'GET /index.html',
  );
});

test('route uses 404 when available', (t) => {
  const message = {
    type: 'ROUTE',
    request: {
      method: 'get',
      url: 'http://localhost:8080/index.html',
      socket: {
        address: () => ({ address: 'fake' }),
      },
    },
  };
  const initialState = { logs: [] };
  const fakeRoute = sinon.fake.returns([initialState, effects.none()]);
  const [state, fx] = router({
    'GET /not-found': fakeRoute,
  })(message, initialState);

  t.deepEqual(state, initialState);
  t.is(fx.type, effects.batch([]).type);
});

test('route does not handle ROUTE message with an unmatched route', (t) => {
  const message = {
    type: 'ROUTE',
    request: {
      method: 'get',
      url: 'http://localhost:8080/index.html',
    },
  };
  const result = router({})(message, { logs: [] });
  t.deepEqual(result, [{ logs: [] }, effects.none()]);
});

test('router handles LOG message by appending to front', (t) => {
  const result = router()({ type: 'LOG', log: 'TEST' }, { logs: ['ORIGINAL'] });
  t.deepEqual(result, [{ logs: ['TEST', 'ORIGINAL'] }, effects.none()]);
});

test('router does nothing on unhandled message', (t) => {
  const result = router()({ type: 'TEST' }, 1);
  t.deepEqual(result, [1, effects.none()]);
});
