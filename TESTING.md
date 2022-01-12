# Ferp testing guide

This is strictly a guide, [click here](./docs/tester/reference.md) for a reference page.

Having a tested app means having a reliable app, and any app in the wild needs to be reliable.

## Build with testing in mind

Keep your actions and methods isolated.

Let's look at this simple example:

```javascript
const ferp = require('ferp');

ferp.app({
  init: [
    {
      count: 0,
      socket: makeSocket(),
    },
    ferp.effects.act(
      (state) => [
        { ...state, count: state.count + 1 },
        ferp.effects.thunk(() => {
          state.socket.send(state.count);
          return ferp.effects.none();
        }),
      ],
    ),
  ],
});
```

How do you test that the program works?
If there were no such thing as a testing framework, you'd probably try and log out the state each tick, and manually verify, but that won't scale.
Instead, let's divide the program up into smaller digestable pieces.

### Isolate Actions and Effects

The first easy win is extracting and testing the action.
You can see in the `ferp.effects.act()` call, we have an action, so let's extract that.

```javascript
export const sendFx = (socket, count) => ferp.effects.thunk(() => {
    socket.send(`count=${count}`);
    return ferp.effects.none();
}, 'sendFx');

export const addOne = (state) => {
  const count = state.count + 1;
  return [
    { ...state, count },
    sendFx(state.socket, count),
  ];
};

export const init = (socket) => [
  { count: 0, socket },
  ferp.effects.act(addOne),
];

ferp.app({
  init: init(makeSocket()),
});
```

If the application is pretty small, you can get away with keeping all the actions and effects in a single file with your application.
If it gets bigger, I tend to follow this flow (which will avoid circular dependencies):
 - `effects.js` contains all effects. This does not import any actions, and instead, effects take actions as parameters as needed.
 - `actions.js` contains all actions, and imports `effects.js`, so actions can return those effects as part of the tuple.

### Test Actions

Using the above code example (and assuming all things are exported from `index.js`):

```javascript
import { effects, tester } from 'ferp';
import { addOne, sendFx } from './index.js';

// This assumes you are using something like jest, but the principles here
// should work in any testing framework.

describe('action only, manual testing result', () => {
  describe('addOne', () => {
    it('adds one to the state', () => {
      const initialState = {
        count: 0,
        socket: {},
      };

      const [state, _ignoredEffect] = addOne({ count: 0 });
      
      expect(state).toDeepEqual({ count: 1, socket: initialState.socket });
    });
  });
});

describe('actions+effects using the tester', () => {
  describe('addOne', () => {
    it('adds one to the state, and sends new count via the socket', async () => {
      const initialState = {
        count: 0,
        socket: {
          send: jest.fn(),
        },
      };

      const t = await tester(initialState)
        .resolveAllEffects() // keep running effects until there are none left
        .willThunk('sendFx') // expect thunk with annotation 'sendFx' to be ran
        .fromAction(addOne); // start the test from an action

      expect(t.ok()).toBeTruthy(); // all expected effects ran
      expect(t.state()).toDeepEqual({ count: 1, socket: initialState.socket });
      expect(initialState.socket.send).toBeCalledWith(1);
    });
  });
});

describe('effects only, using the tester', () => {
  describe('sendFx', () => {
    it('sends the count over the socket', () => {
      const socket = { send: jest.fn() };
      const count = Math.floor(Math.random() * 1000);

      const t = await tester()
        .resolveAllEffects() // keep running effects until there are none left
        .fromEffect(sendFx(socket, count)); // start the test from an effect

      expect(t.ok()).toBeTruthy(); // all expected effects ran
      expect(socket.send).toBeCalledWith(count);
    });
  });
});
```

### Test your application

Unit tests are great for actions, but you need to think through your entire application flow.
To do this, you can run your entire application, which means you will need to isolate this.
Let's wrap our application in a function, and export it from `app.js`.

```javascript
import { app, effects } from 'ferp';

// ...action and effects still live here...

export const appProps = {
  init: [0, effects.act(actions.addOne)],
  observe,
};

export const run = () => app(appProps);
```

With the `appProps` exposed, we can inject an `observe` function to see what the application is doing, and make assertions on it

```javascript
import { app, effects } from 'ferp';
import { appProps, addOne, sendFx } from './app.js';

describe('app.js', () => {
  describe('application', () => {
    it('increments the state by one', (done) => {
      const expectations = [
        { annotation: 'ferpAppInitialize' },
        { annotation: 'addOne' },
        { annotation: 'sendFx' },
      ];

      app({
        ...appProps,
        observe: ({ annotation }) => {
          const expected = expectations.unshift();
          expect(expected.annotation).toBe(annotation);
          if (expectations.length === 0) {
            done();
          }
        },
      });
    });
  });
});
```

### Testing side-effects

Testing side-effects is much harder, but not impossible.
Consider this, your side-effects reach out to the world outside of your application.
This could be getting information from the computer, like the current date/time, making web requests to a server, or waiting on some external calculations.
Obviously, for testing, we need predictability, and also don't want to interact with the real world, which might be slow, non-intuitive, or require sensitive credentials that you can't share.
To get around this, you will need to create mocks or doubles around interfaces that talk to anything outside of the control of your application.

To summarize, your custom side-effects will require per-situation testing logic, but I'm going to try and cover some reasonably common examples.

#### Custom Effects with External Responses

When you're using effects, there's a good possibility your code is talking to something external, and waiting for a response.

For example, http requests wait on an external response.
The current standard in javascript is the `fetch` mechanism, so let's pretend that we've built an effect to make get requests to our server:

```javascript
import { effects } from 'ferp';

export const apiFx = ({ endpoint, onSuccess, onFailure }) => effects.defer(() => fetch(`/api${endpoint}`)
  .then((response) => response.json())
  .then((data) => effects.act(onSuccess(data)), 'fetchSuccess')
  .catch((err) => effects.act(onFailure(err)), 'fetchFailure')
);
```

This isn't super intuitive to test, because fetch is unpredictable when it interacts with the real world.
Instead, let's add the ability to swap it out for our test:

```javascript
import { effects } from 'ferp';

export const apiFx = ({ endpoint, onSuccess, onFailure, fetchFn = fetch }) => effects.defer(
  () => fetchFn(`/api${endpoint}`)
    .then((response) => response.json())
    .then((data) => effects.act(onSuccess(data)), 'fetchSuccess')
    .catch((err) => effects.act(onFailure(err)), 'fetchFailure'),
  'apiFx',
);
```

Now we can test!

```javascript
import { app, effects, tester } from 'ferp';
import { apiFx } from './effects.js';


describe('fx.js', () => {
  describe('apiFx', () => {
    const testSuccessfulFetch = (data) => jest.fn((...params) => Promise.resolve({ json: () => data }));
    const testFailedFetch = (data) => jest.fn((...params) => Promise.reject(new Error()));

    it('hits the correct endpoint and calls the onSuccess action with the json data result', async () => {
      const data = { json: () => data };
      const testSuccessfulFetch = jest.fn((...params) => Promise.resolve(data));
      const testFailedFetch = jest.fn();

      const successData = { your: 'data' };
      const testFetch = testSuccessfulFetch(successData);

      const t = await tester()
        .willDefer('apiFx')
        .willct('fetchSuccess')
        .fromEffect(apiFx({
          endpoint: '',
          onSuccess: (state) => [state, efffects.none()],
        }));

      expect(t.ok()).toBeTruthy();
      expect(testSuccessfulFetch).toBeCalled();
      expect(TestFailedFetch).toNotBeCalled();
    });
  });
});
```

#### Subscriptions

Subscriptions have two testing surface areas, testing that the subscription does the right things, and that the application starts/stops/restarts it appropriately.
Let's focus on testing that the subscription does the right thing first.

Here's an example subscription we can use:

```javascript
import { sub } from 'ferp';

export const countdownSubscription = sub((dispatch, seconds, onTick, timeout = { start: setTimeout, cancel: clearTimeout }) => {
  let value = countFrom;
  let handle = null;

  let schedule = fn => {
    handle = timeout.start(fn, 1000);
  };

  const tick = () => {
    if (value === 0) return;

    value = Math.max(0, value - 1);

    dispatch(act(onTick(value), 'onTick'));
    schedule(tick);
  };

  dispatch.after(act(onTick(value), 'onTick'));
  schedule(tick);

  return () => {
    schedule = () => {};
    timeout.cancel(handle);
  };
});
```

To efficently test this subscription, we need to identify the external events we are using.
In this case, it's `setTimeout` and `clearTimeout`, which have already been identified in the subscription parameters.

```javascript
import { tester, effects } from 'ferp';
import { countdownSubscription } from './subscriptions.js';

describe('subscriptions', () => {
  describe('countdownSubscription', () => {
    it('dispatches onTick immediately with the total seconds', async () => {
      const tickAction = jest.fn(state => [state, effects.none()]);

      const timeout = {
        start: jest.fn((timeoutFn) => {
          timeoutFn();
        }),
        cancel: jest.fn(),
      };

      const t = await tester
        .willAct('onTick')
        .willAct('onTick')
        .willAct('onTick')
        .fromSubscription(countdownSubscription(3, tickAction, timeout))

      t.cancel();

      expect(timeout.start).toHaveBeenCalledTimes(3);
      expect(timeout.cancel).toHaveBeenCalledTimes(1);
    });
  });
});
```

Testing the application's `subscribe` method is pretty straight forward, all you'll need to do is a deep array comparison.

If the application looks like:

```javascript
import { app, effects } from 'ferp';
import { countdownSubscription } from './subscriptions.js';
import * as actions from './actions.js';

export const appProps = {
  init: [
    { secondsRemaining: 3, total: 3 },
    effects.none(),
  ],

  subscribe: (state) => [
    state.secondsRemaining > 0 && countdownSubscription(state.total, actions.decrementSecondsRemaining)
  ],
};
```

The test would be:

```javascript
import { appProps } from './app.js';
import * as actions from './actions.js';

describe('application', () => {
  describe('subscribe', () => {
    it('starts the countdown subscription', () => {
      expect(appProps.subscribe({ secondsRemaining: 1, total: 3 })).toDeepEqual([
        countdownSubscription(3, actions.decrementSecondsRemaining),
      ]);
    });

    it('stops the countdown subscription when the secondsRemaining is 0', () => {
      expect(appProps.subscribe({ secondsRemaining: 0, total: 3 })).toDeepEqual([
        false,
      ]);
    });
  });
});
```
