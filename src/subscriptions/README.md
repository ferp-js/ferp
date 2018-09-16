## Ferp subscriptions

### Every

This subscription triggers a new update every n units.
The `Every` module exports `Every.millisecond`, `Every.second`, `Every.minute`, and `Every.hour`.

A subscription using every may look something like:

```javascript
app({
  // ...
  subscribe: () => [
    [ferp.subscriptions.Every.minute, 1, 'SOME_ACTION'],
  ],
})
```

This will send a `{ type: 'SOME_ACTION' }` through `update` every `1` minute.


## Creating your own subscription

The most basic subscription looks like this:

```javascript
const mySub = () => (dispatch) => {
  dispatch({ my: 'message' });
  return () => {};
};
```

And it would be called like this:

```javascript
app({
  // ...
  subscribe: () => [
    [mySub],
  ],
})
```

This, of course, doesn't do much at all other than push a single update.
To be an effective subscription, it needs a way to send sensible information back to the app through dispatch.
The simplest way is to pass a pre-build message like this:


```javascript
const mySub = (message) => (dispatch) => {
  dispatch(message)
  return () => {};
};
```

Now we can pass our message to the subscription:

```javascript
app({
  // ...
  subscribe: () => [
    [mySub, { my: 'message' }],
  ],
})
```

A subscription can take as many arguments as you need to pass.

Normally, you will have some sort of event listener that you will attach in your subscription, and dispatch appropriate messages.
For a more complex example, check out the [http server example](../../examples/http-server/subscription.js).
