# ferp

Build functional and pure applications in NodeJS and the Browser!

## But...what is it?

 - *Presentation Agnostic* - Tie this into your favorite front-end libraries like React or Vue. :fireworks:
 - *Functional* - Makes it easy to test :heavy_check_mark:, control side effects :imp:, and keep things immutable. :zap:
 - *Simple* - Everything is standard javascript, there is no misdirection or magic. If you know javascript, you will know how to use frp-js. :smile:

## Where did this come from

Like any great idea, it's based on other (much smarter) people's work, namely
[elm](https://elm-lang.org/), my first frp-love, and
[hyperapp](https://github.com/hyperapp/hyperapp), a great functional alternative to react.

## Creating an app

Here's an app that infinitely adds a counter, and logs it.

```javascript
const ferp = require('ferp');

const initialState = 0;

frp.app({
  init: () => [initialState, ferp.types.Effect.none()],
  update: (message, state) => {
    return [
      state + 1,
      new ferp.types.Effect((done) => done(new ferp.types.message())),
    ];
  },
  subscribe: () => [],
  middleware: [frp.middleware.logger],
});
```

### Initializing your app

| Param    | Type     | Required |
| -------- | -------- | -------- |
| init     | Function | Yes      |

The `init()` function lets you establish initial state, and any initial [side-effects](https://wikipedia.org/wiki/Side_effect_(computer_science)) you want to run.

### Keeping up to date

| Param    | Type     | Required |
| -------- | -------- | -------- |
| update   | Function | Yes      |

The `update(message, state)` function gives you the opportunity to make changes to your state.
All updates need to return the array `[updatedState, effect]`, where state is a new copy of state with any changes you have made, and effect is any effect you want to trigger.
An effect is just a promise that returns a message. Here are some convenience methods to handle the case you need:

 - `Effect.none()` if you do not want to trigger an effect.
 - `new Effect((done) => { done(new YourMessage) })` if you want to do some work and fire a new update.
 - `Effect.map([effect1, effect2, ...])` if you want to fire multiple effects.

### Subscribe to third-party events

| Param         | Type     | Required |
| ------------- | -------- | -------- |
| subscribe     | Function | No       |

The `subscribe(state)` function describes which subscriptions are active and inactive.
This function is run each update, and can and should react to the new state to turn on and off subscriptions.
`subscribe` should return an array in the following format:

```javascript
subscribe: (state) => {
  return [
    ['unique-identifier', subscriptionMethod, param1, param2, param3, ...],
    ['another-subscription-identifier', subMethod, param1, param2, param3, ...],
    ...
  ]
}
```

Each subscription needs at least a unique identifier and a subscription method.

Subscription methods should look like the following:

```javascript
const myCoolSubscription = (param1, param2, param3) => (dispatch) => {
  // Start subscription here
  // ...

  return () => {
    // Clean up subscription here
    // ...
  };
};
```

### Tracking changes through middleware

| Param         | Type     | Required |
| ------------- | -------- | -------- |
| middleware    | Array    | No       |

Middleware is a simple way of letting external sources react to data changes.
A middleware should take the signature `const myMiddleware = (next) => (message, state) => next(message, state)`.
You can use this opportunity to inspect the message that changed the state, or the new state.
Be aware that long running middleware can greatly affect performance!

## More docs

 - [Types](./src/types/README.md)
 - [Effects](./src/effects/README.md)
 - [Subscriptions](./src/subscriptions/README.md)
 - [Middleware](./src/middleware/README.md)
