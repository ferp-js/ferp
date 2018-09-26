[![npm version](https://badge.fury.io/js/ferp.svg)](https://badge.fury.io/js/ferp)
[![Build Status](https://travis-ci.org/mrozbarry/ferp.svg?branch=master)](https://travis-ci.org/mrozbarry/ferp)
![Dependencies](https://david-dm.org/mrozbarry/ferp.svg)
[![Known Vulnerabilities](https://snyk.io/test/github/mrozbarry/ferp/badge.svg)](https://snyk.io/test/github/mrozbarry/ferp)

# ferp

Build functional and pure applications for NodeJS and the Browser!

## But...what is it?

 - **Presentation Agnostic** - Tie this into your favorite front-end libraries like React or Vue. :fireworks:, or commandline tasks like an interactive prompt or sever :shipit:.
 - **Functional** - Makes it easy to test :heavy_check_mark:, control side effects :imp:, and keep things immutable. :zap:
 - **Simple** - Everything is standard javascript, there is no misdirection or magic. If you know javascript, you will know how to use ferp. :smile:

## What it isn't

 - **A vdom implementation** - You have to provide your own presentation layer. But the good news is, you can basically pick any one you want. Check out the [superfine example](./examples/with-superfine)
 - **A new language** - This isn't like Elm, in the sense of the language. You can always bring this into typescript, but I don't plan on supporting any other languages out of the box.

## Where did this come from

Like any great idea, it's based on other (much smarter) people's work, namely
[elm](https://elm-lang.org/), my first frp-love, and
[hyperapp](https://github.com/hyperapp/hyperapp), a great functional alternative to react.

## Installing

```bash
npm install --save ferp
```

## Creating an app

Here's an app that infinitely adds a counter, and logs it.

```javascript
const ferp = require('ferp');

const initialState = 0;
const incrementMessage = 1;

ferp.app({
  init: [initialState, incrementMessage],
  update: (message, state) => {
    return [
      state + 1,
      incrementMessage,
    ];
  },
});
```

### Quick anatomy of an app

Every app needs `init` and `update` functions.
Both of these functions must return an array where the first element is the latest state, and the second is an effect you'd like to run, just like `[state, ferp.effects.none()]`.
Effects are also an opportunity to run impure code in a controlled way.

## Digging in

### Managing your data

Ferp has been designed to not care about what your state or messages look like.
Typically, your state should represent how you want to present your data.
I really recommend a great Richard Feldman elm-conf talk, [Making Impossible States Impossible](https://www.youtube.com/watch?v=IcgmSRJHu_8), if you want to think about what your state should look like.

Messages should contain enough information for your update to not need any external data.
Elm and Redux have an interesting pattern of messages having a type along with any extra data update needs to create the next state, and the redux variant ends up looking like `{ type: 'MEANINGFUL_UPDATE', ...otherFieldsOrNot }`.
One thing to keep in mind is that messages are a mechanism to describe the update you want to do, messages shouldn't actually know anything about your state or general state model.
For instance, a message shouldn't contain a copy of state with the changes you want to perform, but it could hold values you want to use in your update function.

[Effects](./src/effects) are a way to fuel the update mechanism of your app.
Both your init tuple and every branch of your update function must return both a state and an effect.
If your update doesn't need to run a further update, you can use `ferp.effects.none()`.
Other options are `ferp.effects.batch(arrayOfEffects)` which lets you run multiple effects at once, `ferp.effects.defer(aPromiseThatResolvesLater)` which lets you run asynchronous code, or `ferp.effects.thunk(method)` which lets you delay starting an effect until it is processed.
The last option is that an effect can simply be a message that your update function can use.
With these options, effects can be combined to do complex and interesting tasks.

[Subscriptions](./src/subscriptions) are a way to inject effects into the app from an external source via a dispatch method.
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


### Initializing your app

| Param    | Type        | Required |
| -------- | ----------- | -------- |
| init     | Array/Tuple | Yes      |

The `init` array/tuple lets you establish initial state, and run an initial [effect](./src/effects).
The structure of this data **must** be `[initialState, initialEffect]` where initialState is the state you want your app to start with, and initialEffect is an [effect](./src/effects) that tells the app how to proceed.


### Keeping up to date

| Param    | Type     | Required |
| -------- | -------- | -------- |
| update   | Function | Yes      |

The `update(message, state)` function gives you the opportunity to make changes to your state.
All updates **must** return the array `[updatedState, effect]`, where:

 - `updatedState` is a new copy of state with any changes you have made
 - `effect` is any effect you want to trigger. See [effects](./src/effects) for more information on what they are and how to use them.


### Subscribe to third-party events

| Param         | Type     | Required |
| ------------- | -------- | -------- |
| subscribe     | Function | No       |

The `subscribe(state)` function describes which [subscriptions](./src/subscriptions) are active and inactive.
This function is run each update, and can and should react to the new state to turn on and off subscriptions.
`subscribe` should return an array in the following format:

```javascript
subscribe: (state) => {
  return [
    [subscriptionMethod, param1, param2, param3, ...],
    [subMethod, param1, param2, param3, ...],
    ...
  ]
}
```

Each subscription needs at least a subscription method.
You can use boolean operations to toggle subscriptions on and off like this:

```javascript
subscribe: (state) => {
  return [
    state.somethingMeaningful && [subscriptionMethod, param1, param2, param3, ...],
  ]
}
```

If you want to write your own subscription, methods should look like the following:

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

When a subscription is deactivated, ferp will run it's cleanup callback, and when it is (re-)activated, it will run a fresh copy of your subscription.
Subscriptions aren't re-used in ferp, so re-activating a subscription will not remember any internal state your subscription previously handled.
If you need your subscription to remember a previous state between activations, you may want to store that data in your state, and run an effect as your subscription ends to store that latest subscription state in your app state.

## Examples

 - Command-line Examples
   - [Timer using effects](./examples/cli/timer-with-effects.js), `cd examples/cli && node ./timer-with-effects.js`.
   - [Timer using subscriptions](./examples/cli/timer-with-subscription), `cd examples/cli && node ./timer-with-subscription.js`.
   - [File reader](./examples/cli/file-reader-node.js), `cd examples/cli && node ./file-reader-node.js`.
   - [Http request](./examples/cli/xhr-request.js), `cd examples/cli && node ./xhr-request.js`.
 - [Node http server](./examples/http-server), `node ./examples/http-server/server.js`.
 - [Web example using superfine for vdom](./examples/with-serverfine), `cd ./examples/with-superfine && npm i && npm start`.

## More docs

 - [Effects](./src/effects/README.md)
 - [Subscriptions](./src/subscriptions/README.md)
 - [Utility](./src/util/README.md)
