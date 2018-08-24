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

