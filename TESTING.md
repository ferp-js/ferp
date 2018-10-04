# Ferp testing guide

Having a tested app means having a reliable app, and any app in the wild needs to be reliable.

## Build with testing in mind

Keep your methods isolated.
It's easy to inline your `update`, and `subscribe` methods, but keeping them as separate, exportable methods means you can run more isolated tests.

Let's look at this simple example:

```javascript
const ferp = require('ferp');

const detach = ferp.app({
  init: [0, ferp.effects.none()],
  update: (message, previousState) => {
    switch (message.type) {
      case 'ADD_ONE':
        return [previousState + 1, ferp.effects.none()];

      default:
        return [previousState, ferp.effects.none()];
    }
  },
});
```

There's two main problems that are going to prevent us from testing this well.
First, this app will automatically run, and that's not helpful for tests.
Second, there is no way to dispatch messages or observe state changes from outside the ferp app.
It looks like we're going to have to extract the things we want to test.

```javascript
const ferp = require('ferp');

const update = (message, previousState) => {
  switch (message.type) {
    case 'ADD_ONE':
      return [previousState + 1, ferp.effects.none()];

    default:
      return [previousState, ferp.effects.none()];
  }
};

const runApp = () => ferp.app({
  init: [0, ferp.effects.none()],
  update,
});

module.exports = {
  update,
  runApp,
};
```

With `update` isolated, and `runApp` prevents our app from executing in the background of our tests.
