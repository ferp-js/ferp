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

## Ferp Types

### Result

One thing that's very neat about languages that emphasize functional approaches is the concept of [`Maybe`](https://package.elm-lang.org/packages/elm-lang/core/latest/Maybe) or [`Result`](https://package.elm-lang.org/packages/elm-lang/core/latest/Result).
A `ferp.types.Result` combines both of these.

What does a Result look like?

| Attribute                                         | Returns  | Example
| ------------------------------------------------- | -------- | ------- |
| Result.nothing()                                  | A result with no data and error    | `Result.nothing()` |
| Result.pending()                                  | A result with no data and error, but the data is pending    | `Result.pending()` |
| Result.done()                                     | A result with data    | `Result.data({ success: true })` |
| Result.error()                                    | A result with an error    | `Result.error(new Error('Some exception'))` |
| Result#get(onNothing, onPending, onDone, onError) | Return the value based on the current result state.  | `return Result.get(() => null, () => <Loading />, (data) => <Component data={data} />, (err) => <ErrorReport error={err} />)` |
| Result#getWithDefault(defaultValue)               | Wraps #get() to return either the current done data value, or a default.    | `return <Component data={Result.getWithDefault({ default: 'payload' }) />` |

To pull the value out, it is recommended to do `myResult.getWithDefault(yourDefaultValueHere)`, but if being used with a front-end framework like React, `.get()` may suite your needs more for rendering.

Instead of throwing exceptions, data should be wrapped in stateful Result objects.
This will give you more control on the flow of data and logic.

## Effect

As describe above, an effect is just a promise that resolves a new message.
That said, an effect should _never_ throw an error.
To deal with errors, turn the message data in your effect into a [Result](./src/types/result.js).

Since `Effect` extends the `Promise` class, they are not special, but I did add some helper methods to deal with certain situations:


| Attribute                                         | Returns                                       | Example
| ------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Effect.none()                                     | An effect that does nothing                   | `return [state, Effect.none()]` |
| Effect.map(effects)                               | A wrapper to return multiple effects.         | `return [state, Effect.map(Effect.immediate(new Message1()), new Effect(done => done(doWorkThenReturnMessageTyp(Message2)))] |
| Effect.immediate(message)                         | A quick want to push another message through. | `return [state, Effect.immediate(new MessageType(params))]` |

## Subscription

A subscription is like an app, in that it reads in your immutable state, and can pass messages into the app, but it does not require a message to trigger new messages.
Another way to think of subscription is a long running effect that can return multiple messages over time, reacting to some external source (ie websocket, timer, interval, etc.).

Subscriptions are self-contained classes that look like this:

| Attribute                                         | Description                                                                     | Example
| ------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Subscription#dispatch(message)                    | Call to pass a message into the app.                                            | `this.dispatch(new SomeMessage())` |
| Subscription#onAttach(state)                      | Called when the subscription starts, recieves state. Override.                  | `onAttach(state) { this.interval = setInterval(this.dispatch, state.delay, new Message()) }` |
| Subscription#onChange(state, prevState)           | Called when the app state changes, recieves state and previous state. Override. | `onChange(state, prevState) { if (state.delay === prevState.delay) { return; }; clearInterval(this.interval); this.interval = setInterval(this.dispatch, state.delay, new Message()) }` |
| Subscription#onDetach(state)                      | Called when the subscription ends, recieves state. Override.                    | `onDetach(state) { if (this.interval) { clearInterval(this.interval); }; this.interval = null; }` |
