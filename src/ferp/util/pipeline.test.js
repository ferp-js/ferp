import test from 'ava';
import { pipeline } from './pipeline.js';

test('transforms a value in steps', (t) => {
  const step1 = (v) => v + 1;
  const step2 = (v) => v * 3;

  t.is(pipeline(step1, step2)(5), 18);
});
