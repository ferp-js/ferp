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

ferp.app({
  init: () => [initialState, ferp.effects.none()],
  update: (message, state) => {
    return [
      state + 1,
      ferp.effects.none(),
    ];
  },
  subscribe: () => [],
});
```

### Quick anatomy of an app

Every app needs `init` and `update` functions.
Both of these functions must return an array where the first element is the latest state, and the second is an effect you'd like to run.
All effects should return a message that can be used to update your app.
Effects are also an opportunity to run impure code in a controlled way.

## Digging in

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
All updates need to return the array `[updatedState, effect]`, where:

 - `updatedState` is a new copy of state with any changes you have made
 - `effect` is any effect you want to trigger. See [effects](./src/effects/README.md) for more information on what they are and how to use them.

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
    [subscriptionMethod, param1, param2, param3, ...],
    [subMethod, param1, param2, param3, ...],
    ...
  ]
}
```

Each subscription needs at least a subscription method.

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
