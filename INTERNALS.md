# Ferp Internals

## Initializing your app

| Param    | Type        | Required |
| -------- | ----------- | -------- |
| init     | Array/Tuple | Yes      |

The `init` array/tuple lets you establish initial state, and run an initial [effect](./src/effects).
The structure of this data **must** be `[initialState, initialEffect]` where initialState is the state you want your app to start with, and initialEffect is an [effect](./src/effects) that tells the app how to proceed.


## Keeping up to date

| Param    | Type     | Required |
| -------- | -------- | -------- |
| update   | Function | Yes      |

The `update(message, state)` function gives you the opportunity to make changes to your state.
All updates **must** return the array `[updatedState, effect]`, where:

 - `updatedState` is a new copy of state with any changes you have made
 - `effect` is any effect you want to trigger. See [effects](./src/effects) for more information on what they are and how to use them.


## Subscribe to third-party events

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
