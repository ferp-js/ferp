import test from 'ava';
import { app } from './app.js';
import { none } from './effects/core.js';

test.after((t) => {
  const { detach } = t.context;
  if (!detach) return;
  detach();
});

test('app throws when missing init or init is invalid', (t) => {
  t.throws(() => app());
  t.throws(() => app({}));

  const { detach } = app({
    init: [0, none()],
  });

  t.is(typeof detach, 'function');

  detach();

  t.pass();
});

test('app calls dispatch immediately with state and effect', (t) => {
  t.plan(1);

  const init = [0, none()];

  const { detach } = app({
    init,
    observe: (params) => {
      t.deepEqual(params, init);
    },
  });

  detach();
});

test.cb('app recursively dispatches when effect is an action', (t) => {
  const add = (state) => [state + 1, none()];
  const init = [0, add];

  const assertions = [
    (params) => t.deepEqual(params, init),
    (params) => t.is(params, add),
    (params) => {
      t.deepEqual(params, [1, none()]);
      t.end();
    },
  ];

  t.plan(assertions.length);

  const { detach } = app({
    init,
    observe: (params) => {
      const assertion = assertions.shift();
      assertion(params);
    },
  });

  t.context.detach = detach;
});
