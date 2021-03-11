import test from 'ava';

import * as ferp from '../ferp.js';
const { none, batch, defer, thunk, act } = ferp.effects;

test.cb('runs an action function as an effect', (t) => {
  t.plan(1);

  const testAction = function x(oldState) {
    t.is(oldState, false);
    t.end();
    return [true, none()];
  };

  ferp.app({
    init: [false, act(testAction)],
  });
});

test('an initial batch of effects runs in order', (t) => {
  t.plan(4);

  const firstAction = () => [1, none()];
  const secondAction = () => [2, none()];
  const thirdAction = () => [3, none()];


  const expectedActionNames = [
    'ferpAppInitialize',
    'firstAction',
    'secondAction',
    'thirdAction',
  ];

  ferp.app({
    init: [
      0,
      batch([
        act(firstAction),
        act(secondAction),
        act(thirdAction),
      ]),
    ],
    observe: (_, actionName) => {
      const expectedActionName = expectedActionNames.shift();
      t.is(actionName, expectedActionName);
    },
  });
});

test.cb('deferred effects run later', (t) => {
  const delay = (fx) => thunk(() => defer((resolve) => {
    setTimeout(resolve, 1, fx);
  }));

  const expectedValues = [
    Math.random() * 1000,
    Math.random() * 1000,
  ];

  const setNum = (num) => {
    const innerAction = () => {
      const expectedValue = expectedValues.shift();
      t.is(num, expectedValue);
      if (expectedValues.length === 0) {
        t.end();
      }
      return [num, none()];
    };

    return innerAction;
  };

  ferp.app({
    init: [
      0,
      batch([
        delay(act(setNum(expectedValues[1]))),
        act(setNum(expectedValues[0])),
      ]),
    ],
  });
});
