# Ferp testing guide

Having a tested app means having a reliable app, and any app in the wild needs to be reliable.

## Build with testing in mind

Keep your actions and methods isolated.


Let's look at this simple example:

```javascript
const ferp = require('ferp');

const dispatch = ferp.app({
  init: [0, ferp.effects.act((state) => [state + 1, ferp.effects.none()])],
});
```

How do you test that the program works?
If there were no such thing as a testing framework, you'd probably try and log out the state each tick, and manually verify, but that won't scale.
Instead, let's divide the program up into smaller digestable pieces.

### Test your actions

The first easy win is extracting and testing the action.
You can see in the `ferp.effects.act()` call, we have an action, so let's extract that.

```javascript
export const addOne = (state) => [{ ...state, count: state + 1 }, ferp.effects.none()];

export const sendData = (state) => [
  state,
  ferp.effects.thunk(() => {
    state.socket.send(`count=${state.count}`);
    return ferp.effects.none();
  }),
];
```

I'd also make sure you can export it.
In fact, I usually make an `actions.js` file, and put all of my actions in there, but if your application is small, you can probably get away with putting all of your code in an `app.js` file.

Now testing this is very simple.
If I were using something like jest, the test would look like this:

```javascript
import { effects } from 'ferp';
import * as testing from 'ferp/testing';
import { addOne, sendData } from './actions.js';

describe('actions.js', () => {
  // No side-effects
  describe('addOne', () => {
    it('adds one to the state', async () => {
      const dispatch = jest.fn();
      const [state, effect] = addOne({ count: 0 });
      
      expect(state).toDeepEqual(1);

      await testing.runEffect(effect, dispatch);

      expect(dispatch.mock.callCount).toBe(0);
    });
  });

  // With a side-effect
  describe('sendData', () => {
    it('sends count data through websocket', async () => {
      const socket = { send: jest.fn() };
      const initialState = { count: 10, socket };

      const [state, effect] = sendData(initialState);
      
      expect(state).toDeepEqual(1);

      await testing.runEffect(effect);

      expect(socket.mock.callCount).toBe(1);
      expect(socket.mock.calls[0]).toDeepEqual(['count=10']);
    });
  });
});
```

#### A note about side-effects

The more often you can place objects in your state that generate side-effects, the easier it will be to test them.
The benefits are that you don't need to mock a series of imports, and all of your test code can life directly inside a test scenario.

If you cannot put the object in state, you may consider creating a subscription that does contain the object along with an event listener, and have a pairing effect that would emit an event that the subscription could handle.


### Test your application

Unit tests are great for actions, but you need to think through your entire application flow.
To do this, you can run your entire application, which means you will need to isolate this.
Let's wrap our application in a function, and export it from `app.js`.

```javascript
import { app, effects } from 'ferp';
import * as actions from './actions.js';

export const application = (observe) => app({
  init: [0, effects.act(actions.addOne)],
  observe,
});
```

Notice how I added the observe application property - this will allow us to make assertions on the current state of the application, and ensure it is doing what we expect.
Here's how you can test it:

```javascript
import { effects } from 'ferp';
import { application } from './app.js';
import * as actions from './actions.js';

describe('app.js', () => {
  describe('application', () => {
    it('increments the state by one', () => {
      const tupleExpectations = [
        [0, effects.act(actions.addOne)],
        [1, effects.none()];
      ];
      
      application((tuple) => {
        const expectedTuple = tupleExpectations.shift();
        expect(tuple).toDeepEqual(expectedTuple);
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

#### Custom Effects

##### Http Requests

The current standard in javascript is the `fetch` mechanism, so let's pretend that we've built an effect to make get requests to our server:

```javascript
import { effects } from 'ferp';

export const apiFx = ({ endpoint, onSuccess, onFailure }) => effects.defer(() => fetch(`/api${endpoint}`)
  .then((response) => response.json())
  .then((data) => effects.act(onSuccess(data)))
  .catch((err) => effects.act(onFailure(err)));
```

This isn't super intuitive to test, because fetch is unpredictable when it interacts with the real world.
Instead, let's add the ability to swap it out for our test:

```javascript
import { effects } from 'ferp';

export const apiFx = ({ endpoint, onSuccess, onFailure, fetchFn = fetch }) => effects.defer(() => fetchFn(`/api${endpoint}`)
  .then((response) => response.json())
  .then((data) => effects.act(onSuccess(data)))
  .catch((err) => effects.act(onFailure(err)));
```

Now we can test!

```javascript
import { app, effects } from 'ferp';
import { apiFx } from './fx.js';


describe('fx.js', () => {
  describe('apiFx', () => {
    const testSuccessfulFetch = (data) => jest.fake((...params) => Promise.resolve({ json: () => successData }));

    const completeTest = (assertions, done) => (state) => [
      state,
      effects.thunk(() => {
        assertions.forEach((assert) => assert(state));
        done();
        return effects.none();
      }),
    ];

    it('hits the correct endpoint and calls the onSuccess action with the json data result', (done) => {
      const successData = { your: 'data' };
      const testFetch = testSuccessfulFetch(successData);

      const onFailure = jest.fake(() => [null, effects.act(completeTest([
        () => expect(onFailure).not.toHaveBeenCalled(),
      ], done))]);

      const onSuccess = (data) => () => [data, effects.act(completeTest([
        (finalState) => expect(finalState).toDeepEqual(successData),
        () => expect(onFailure).not.toHaveBeenCalled(),
        () => expect(testFetch).toHaveBeenCalledWith('/api/foo'),
      ], done))];


      app({
        init: [null, apiFx({
          endpoint: '/foo',
          onSuccess,
          onFailure,
          fetchFn: testFetch,
      });
    });
  });
});
```

You can see that testing side-effects will almost always have overhead.
Building smaller tools and utilities can dramatically help make testing your side-effects, too!

#### Subscriptions

Subscriptions have two testing surface areas, testing that the subscription does the right things, and that the application starts/stops/restarts it appropriately.
Both of these are even more challenging than basic side effects, because the nature of a subscription is that it is a long-running method with multiple side effects.

Let's make an example subscription:

```javascript
import { sub } from 'ferp';

export const countdownSubscription = sub((dispatch, countFrom, delay, onTick, onDone) => {
  let value = countFrom;
  let exit = false;
  let handle = null;

  const tick = () => {
    if (exit) return;

    value = value - 1;

    if (value === 0) {
      dispatch(act(onDone));
      return;
    }

    dispatch(act(onTick(value)));
    handle = setTimeout(tick, delay);
  };

  dispatch(act(onTick(value));
  handle = setTimeout(tick, delay);

  return () => {
    exit = true;
    clearTimeout(handle);
  };
});
```
