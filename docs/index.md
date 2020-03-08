# Docs

## Managing your data

Ferp has been designed to not care about what your state or messages look like.
Typically, your state should represent how you want to present your data.
I really recommend a great Richard Feldman elm-conf talk, [Making Impossible States Impossible](https://www.youtube.com/watch?v=IcgmSRJHu_8), if you want to think about what your state should look like.

Messages should contain enough information for your update to not need any external data.
Elm and Redux have an interesting pattern of messages having a type along with any extra data update needs to create the next state, and the redux variant ends up looking like `{ type: 'MEANINGFUL_UPDATE', ...otherFieldsOrNot }`.
One thing to keep in mind is that messages are a mechanism to describe the update you want to do, messages shouldn't actually know anything about your state or general state model.
For instance, a message shouldn't contain a copy of state with the changes you want to perform, but it could hold values you want to use in your update function.

[Effects](./src/ferp/effects) are a way to fuel the update mechanism of your app.
Both your init tuple and every branch of your update function must return both a state and an effect.
If your update doesn't need to run a further update, you can use `ferp.effects.none()`.
Other options are `ferp.effects.batch(arrayOfEffects)` which lets you run multiple effects at once, `ferp.effects.defer(aPromiseThatResolvesLater)` which lets you run asynchronous code, or `ferp.effects.thunk(method)` which lets you delay starting an effect until it is processed.
The last option is that an effect can simply be a message that your update function can use.
With these options, effects can be combined to do complex and interesting tasks.

[Subscriptions](./src/ferp/subscriptions) are a way to inject effects into the app from an external source via a dispatch method.
A subscription's method signature will look something like this:

```javascript
const mySubscription = (optionalArgsToInitializeWith) => (dispatch) => {
  /* run your code here */
  return () => {
    /*
      Do any cleanup here
      This might include unsubscribing from event listeners or stopping timers.
    */
  };
};
```

Good examples of subscriptions are event listeners, like a websocket server or client connection, global dom events, or generally events that are outside of the control of your app.
Subscriptions can be turned on and off over the course of the app, in a way that reacts to state changes (see the subscribe section below).
It is possible to pass in state values into a subscription, but bear in mind this will re-initialize your subscription each change, so it is often best that your subscription has very little knowledge of your state.

## How to make it go

As mentioned above, messages are how you update your app, and messages are a type of effect.
To start processing events, you will want to add an effect to your init tuple.
A message can be as simple as a string or number, or as complicated as a deeply nested object, but we urge you to keep things simple.
If I had a numeric state (ie `1`), and wanted to add math operation messages, they may look like this:

```javascript
const multiply = amount => ({ type: 'MULTIPLY', amount });
const addition = amount => ({ type: 'ADDITION', amount });
```

And to use them, my init might look like:

```javascript
const init = [
  1, // Our state value
  ferp.effects.batch([ // tell ferp to do multiple effects serially
    multiply(2), // First multiply our state by 2
    addition(-1), // Second subtract 1
  ])
];
```

But passing messages isn't enough.
You'll also need some handlers in the `update` method to actualy perform what you want.

```javascript
const update = (message, previousState) => {
  switch (message.type) { // Switches are good here, because we'll be checking multiple cases for message.type
    case 'MULTIPLY':
      return [
        previousState * message.amount,
        ferp.effects.none(), // We don't need to do any more work, so declare that there are no more effects
      ];

    case 'ADDITION':
      return [
        previousState + message.amount,
        ferp.effects.none(),
      ];

    default: // You should always have a no-op/default case, which will always keep your state, even if you aren't handling a certain message yet.
      return [
        previousState,
        ferp.effects.none(),
      ];
  }
};
```

