# ferp

Build functional and pure applications in NodeJS and the Browser!

## But...what is it?

 - *Presentation Agnostic* - Tie this into your favorite front-end libraries like React or Vue. :fireworks:
 - *Functional* - Makes it easy to test :check:, control side effects :imp:, and keep things immutable. :zap:
 - *Simple* - Everything is standard javascript, there is no misdirection or magic. If you know javascript, you will know how to use frp-js. :smile:

## Creating an app

Here's an app that infinitely adds a counter, and logs it.

```js
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
  subscriptions: [],
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
| subscriptions | Array    | No       |

If you have some external source of data that will frequently update, maybe you want to use a subscription.
Subscriptions should always extend from the `frp.types.Subscription` class, and can override `onAttach`, `onChange`, and `onDetach`.
Think of subscriptions of mini apps that can react to state changes and send data into your real app.

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
