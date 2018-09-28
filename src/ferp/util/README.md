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
