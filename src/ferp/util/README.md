## Ferp Utils

### Nesting reducers with `combineReducers`

If your main update method gets too big, it may be time to evaluate the reducer pattern.
Redux has a great [write-up on reducers](https://redux.js.org/basics/reducers) if you're not sure what that is.
The problem with this pattern is that if you want to return effects from nested objects or arrays in your state.

Here's an example of the problem:

```javascript
const update = (message, state) => ({
  foo: fooReducer(message, state.foo),
  bar: barReducer(message, state.bar),
});

// Output object might look like this:

console.log(update(message, state));
/*
{
  foo: [nextFoo, myFooEffect],
  bar: [nextBar, myBarEffect],
}
*/
```

To explain further, ferp only accepts an update as `[entireAppState, allEffects]`, and not a set of incremental state and effect groups.

`ferp.util.combineReducers` extracts and re-combines your update from a reducer to look like this:

```javascript
console.log(ferp.util.combineReducers(update(message, state)));
/*
[
  { foo: nextFoo, bar: nextBar },
  batch([myFooEffect, myBarEffect]),
]
*/
```

This function will also automatically detect if you are extracting from an object or an array, so it is also safe to run on a reducer that returns:

```javascript
const update = (message, state) => state.map(item => childReducer(message, item));
console.log(ferp.util.combineReducers(update(message, state)));
/*
[
  [nextItem1, nextItem2, ...],
  batch([nextItem1Effect, nextItem2Effect]),
]
*/
```

To use it, simply wrap your array or object in the `ferp.util.combineReducers` method.
Depending on your nesting, you may need to call this on most/all reducers.

## Speeding up your functions with `pure`

If you have long computations in functions that have no side effects, `ferp.util.pure()` is a great way to memoize your results.

Let's look at a recursive function to calculate the [fibonacci sequence](https://medium.com/developers-writing/fibonacci-sequence-algorithm-in-javascript-b253dc7e320e):

```javascript
const fibonacci = (num) => {
  if (num <= 1) return 1;

  return fibonacci(num - 1) + fibonacci(num - 2);
};
```

This is an expensive call, but pure can be a hero here.

First, let's see how this performs on my system:

```plain
fibonacci(40) ran 10 times
-------------------------------------
fibonacci(40) fastest 1277.1553469848632 milliseconds
fibonacci(40) slowest 1335.1265880126953 milliseconds
fibonacci(40) average 1279.6210448583365 milliseconds
```

Now let's wrap it in pure:


```javascript
const ferp = require('ferp');

const fibonacci = ferp.util.pure((num) => {
  if (num <= 1) return 1;

  return fibonacci(num - 1) + fibonacci(num - 2);
});
```

And run the same test:

```plain
pure(fibonacci)(40) ran 10 times
-------------------------------------
pure(fibonacci)(40) fastest 0.0814580078125 milliseconds
pure(fibonacci)(40) slowest 5.339959045410156 milliseconds
pure(fibonacci)(40) average 1.3942414541244508 milliseconds
```

There is one thing you always need to remember with pure: your code cannot have any side effects.
For example, let's look at the following code:

```javascript
const makeRandomInteger = (low, high) => parseInt(low + (Math.random() * (high - low)), 10);
console.log(makeRandomInteger(1, 10)) // 5
console.log(makeRandomInteger(1, 10)) // 2
console.log(makeRandomInteger(1, 10)) // 4
console.log(makeRandomInteger(1, 10)) // 9
```

This is an impure function, and as a result, wrapping it in pure will prevent it's intended behaviour:

```javascript
const ferp = require('ferp');

const makeRandomInteger = ferp.util.pure((low, high) => parseInt(low + (Math.random() * (high - low)), 10));
console.log(makeRandomInteger(1, 10)) // 5
console.log(makeRandomInteger(1, 10)) // 5
console.log(makeRandomInteger(1, 10)) // 5
console.log(makeRandomInteger(1, 10)) // 5
```

This is because pure records your arguments and the result in a map that looks like `[[arguments, result], ...]`.
If you have the same arguments, pure will always assume you will have the same results.

That is to say, not all your functions will be pure, especially your effects,
but aiming to have more pure functions than not could mean huge performance gains over time.
