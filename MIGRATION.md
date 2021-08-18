# Migrating from ferp 1.x to 2.x

## No more app({ update })

Previously, your app entry code may have looked like this:

```javascript
const ferp = require('ferp');

ferp.app({
  init: [initialState, initialEffect],
  update: (message, previousState) => [previousState, ferp.effects.none()],
  subscribe: (state) => [],
});
```

But gone are the days of update+message.
There were some advantages to this, but ultimately it made testing harder, and encouraged users to expose internal functionality for tests.
With no update, you might be wondering how to push state changes and new effects into ferp for processing.
The answer is actions and action builders.

Actions are methods that accept a state, and return `[newState, nextSideEffect]`, just like what update used to return.
The main difference is that actions are intentionally isolated and much more testable.

For instance, here's is what a basic counter app could look like:

```javascript
const ferp = require('ferp');

const Increment = (state) => [
  { ...state, counter: state.counter + 1 },
  ferp.effects.none(),
];

const dispatch = ferp.app({
  init: [{ counter: 0 }, ferp.effects.none()],
});

dispatch(Increment);
```

Action builders are very similar, they are functions that return an action function, pre-populated with some contextual variables:

```javascript
const IncrementBy = (value) => (state) => [
  { ...state, counter: state.counter + value },
  effects.none(),
];

dispatch(IncrementBy(10));
```

## New act effect

Previously, messages were a type of effect, but with effects having a discrete structure, there could be instances where a message could look like an effect.
Instead of fighting with that, I thought it would be much easier to code, and to read, a discrete effect for actions.

```javascript
const Action = (state) => [{ ...state, foo: 'bar' }, effects.none()];
const ActionBuilder = (value) => (state) => [{ ...state, value }, effects.none()];

const RunActionAndBuilder = (state) => [
  state,
  effects.batch([
    effects.act(Action),
    effects.act(ActionBuilder(123)),
  ]),
];
```

# Migrating from ferp 0.x to 1.x

## Minor changes to app initialization

Previously, your app entry code may have looked like this:

```javascript
const ferp = require('ferp');

ferp.app({
  init: () => [initialState, initialEffect],
  update: (message, previousState) => [previousState, ferp.types.Effect.none()],
  subscribe: (state) => [],
});
```

Most of this is the same, but init is not a function any more, and effects have been move (more on this below).
Now the same code should look like this:

```javascript
const ferp = require('ferp');

ferp.app({
  init: [initialState, initialEffect],
  update: (message, previousState) => [previousState, ferp.effects.none()],
  subscribe: (state) => [],
});
```

## Effects have moved, and they have some new friends

Previously, to use an effect, your code may have looked like one of these:

```javascript
const ferp = require('ferp');
const { Effect } = ferp.types;

const myNoOpEffect = Effect.none();

const myImmediateAsyncEffect = new Effect((done) => {
  // Do something
  done({ type: 'MESSAGE YOU WANT TO SEND' });
});

const myManyEffects = Effect.map([
  someEffect1,
  someEffect2,
]);

const myMessageEffect = Effect.immediate({ type: 'MESSAGE FOR RIGHT NOW' });

const { dispatch, effect } = Effect.defer();
const myDeferredAsyncEffect = effect;
// some other code calls dispatch({ type: 'MESSAGE DEFERRED' })
```

Now the same code looks like this:

```javascript
const ferp = require('ferp');
const { effects } = ferp;

const myNoOpEffect = effects.none(); // Looks mostly the same on the outside, much different on the inside.

const myImmediateAsyncEffect = effects.defer(new Promise((done) => { // You can provide your own promise now. Works much better for doing fetches and other things.
  // Do something
  done({ type: 'MESSAGE YOU WANT TO SEND' });
}));

const myManyEffects = effects.batch([ // Note the rename from map to batch
  someEffect1,
  someEffect2,
]);

const myMessageEffect = { type: 'MESSAGE FOR RIGHT NOW' }; // No wrapping effect now

let dispatch = () => {}; // A little more complicated solution here, but I think externally resolved promises like this will be unusual.
const deferredPromise = new Promise((done) => { dispatch = done });
const myDeferredAsyncEffect = effects.defer(deferredPromise);
// some other code calls dispatch({ type: 'MESSAGE DEFERRED' });
```

With a bonus, we have a new effect - introducing `effects.thunk`.
A thunk is a way to only evaluate an effect when it's handled internally.
For example, if you were to compose a new effect with delays, you'd want the inner delay to run after the external delay.
Here's a non-working version:

```javascript
const myDelayEffect = (innerEffect, milliseconds) => effects.defer(new Promise((done) => {
  setTimeout(() => {
    done(innerEffect);
  }, milliseconds);
}));

const composedEffect = myDelay(myDelay({ type: 'INNER' }, 1000), 1000);
```

You would expect the `{ type: 'INNER' }` to be dispatched after 2000 milliseconds, but this is not the case.
Both effects would run almost immediately, and take a total of about 1010 milliseconds.
This is because the setTimeout will run as soon as the promise is created, even though we may not wait for it until later.
To fix this, we could use a thunk like this:

```javascript
const myDelayEffect = (innerEffect, milliseconds) => effects.thunk(() => effects.defer(new Promise((done) => {
  setTimeout(() => {
    done(innerEffect);
  }, milliseconds);
})));

const composedEffect = myDelay(myDelay({ type: 'INNER' }, 1000), 1000);
```

The thunk prevents the promise from even being created until it's evaluated by ferp during a dispatch.

## As seen above, composable core effects

The previous effect implementation made composing effects hard.
Effects have been completely re-written from the ground up to support powerful composition.

## Timer param orderings

Doing `effects.delay`, `effects.raf`, and `subsciptions.every` have had their params re-ordered to be all consistent, `message, timeInformation`,
where `timeInformation` is the length of a delay for `effects.delay`, the last timestamp (or null) for `effects.raf` to calculate deltas, and millisecond interval for `subscriptions.every`.

## Removed timer helpers

Previously, `effects.delay` and `subscriptions.every` exported modules with `milliseconds`, `seconds`, `minutes`, and `hours` being options in how the delay would be timed.
These have been removed, and the exported `delay` and `every` are just the millisecond function variants that were previously available.

## No more types

Effects, as seen above, are first class citizens now, but more importantly, I removed the `Result` type. You can read more about that decision [on PR#7](https://github.com/mrozbarry/ferp/pull/7).
There are various enum and result type libraries available for javascript, and maybe one of those will be a good replacement if you have been using `Result`s.

## No more middleware

Middleware was a hard decision because many libraries like ferp have the concept of middleware in one form or another.
After much thought, I have decided to remove it for a few reasons:

 - Middleware makes sense when a library provides both state and UI, since you may want to intercept state changes before it reaches the UI. Ferp doesn't provide a UI, so it makes this useless.
 - The implementation I chose for ferp originally was inefficient, and allowed state mutations, but of which were hard to justify in an immutable functional app.
 - Functional programming promotes the idea of high-order functions, so if it were absolutely necessary to have a middleware for ferp, it is easy enough to write a wrapping function for your update function.

You can read more on it [on PR#7](https://github.com/mrozbarry/ferp/pull/7)
