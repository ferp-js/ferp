import test from 'ava';
import { app } from './app.js';
import { none } from './effects/core.js';

test('app throws when missing init or init is invalid', (t) => {
  t.throws(() => app());
  t.throws(() => app({}));

  app({
    init: [0, none()],
  });
});

test('app calls dispatch immediately with state and effect', (t) => {
  t.plan(2);

  const init = [0, none()];

  app({
    init,
    observe: (props) => {
      t.deepEqual(props.state, init[0]);
      t.deepEqual(props.effect, none());
    },
  });
});
