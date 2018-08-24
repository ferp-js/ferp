const test = require('ava');
const sinon = require('sinon');
const { Subscription } = require('./subscription.js');

test('creates new Subscription, which matches snapshot', t => {
  t.snapshot(new Subscription());
});

test('connect triggers onAttach', t => {
  const sub = new Subscription();
  sub.onAttach = sinon.fake()
  sub.onChange = sinon.fake()
  sub.onDetach = sinon.fake()
  sub.connect();
  t.is(sub.onAttach.callCount, 1);
  t.is(sub.onChange.callCount, 0);
  t.is(sub.onDetach.callCount, 0);
});

test.cb('setState triggers onChange', t => {
  t.plan(5);
  const nextState = 123;
  const sub = new Subscription();
  sub.onAttach = sinon.fake()
  sub.onChange = sinon.fake((state, prevState) => {
    t.is(prevState, null);
    t.is(state, nextState);
    t.end();
  })
  sub.onDetach = sinon.fake()
  sub.setState(nextState);
  t.is(sub.onAttach.callCount, 0);
  t.is(sub.onChange.callCount, 1);
  t.is(sub.onDetach.callCount, 0);
});

test('cleanup triggers onDetach', t => {
  const sub = new Subscription();
  sub.onAttach = sinon.fake()
  sub.onChange = sinon.fake()
  sub.onDetach = sinon.fake()
  sub.cleanup();
  t.is(sub.onAttach.callCount, 0);
  t.is(sub.onChange.callCount, 0);
  t.is(sub.onDetach.callCount, 1);
});
