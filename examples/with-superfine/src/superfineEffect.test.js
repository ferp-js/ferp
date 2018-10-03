const test = require('ava');
const sinon = require('sinon');
const { effects } = require('ferp');
const { superfineEffect } = require('./superfineEffect.js');

test('will call render and batch some effects', (t) => {
  const render = sinon.fake.returns('node');
  const effect = superfineEffect(render, 'test', { type: 'TEST' });
  t.is(render.callCount, 1);
  t.deepEqual(effect.effects[0], { type: 'TEST', node: 'node' });
  t.is(effect.effects[1].type, effects.defer().type);
});
