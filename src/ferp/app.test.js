import test from 'ava';
import { app } from './app.js';
import { none } from './effects/core.js';

test('app throws when missing init or init is invalid', (t) => {
  t.throws(() => app());
  t.throws(() => app({}));

  const detach = app({
    init: [0, none()],
  });

  t.is(typeof detach, 'function');

  detach();

  t.pass();
});

test('app calls dispatch immediately with state and effect', (t) => {
  t.plan(1);

  const init = [0, none()];

  const detach = app({
    init,
    observe: (params) => {
      t.deepEqual(params, init);
    },
  });

  detach();
});
