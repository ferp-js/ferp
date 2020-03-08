<p align="center">
  <img src="./docs/f%3D>rp.jpg" />
</p>


<p align="center">
  <img src="https://badge.fury.io/js/ferp.svg" />
  <img src="https://github.com/ferp-js/ferp/workflows/Pull%20Request%20CI/badge.svg" />
  <img src="https://img.shields.io/librariesio/release/npm/ferp" />
  <img src="https://snyk.io/test/github/ferp-js/ferp/badge.svg" />
  <a href="https://gitter.im/mrozbarry/ferp?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge" title="Join the chat on gitter.im">
    <img src="https://badges.gitter.im/mrozbarry/ferp.svg" />
  </a>
</p>

# ferp

Ferp is the easiest, functional-reactive, zero dependency javascript app framework for nodejs and modern browsers.

## But...what is it?

 - **Presentation Agnostic** - Tie this into your favorite front-end libraries like React and Vue, or commandline tasks like an interactive prompt or sever.
 - **Functional+Reactive** - Makes it easy to test, control side effects, and keep things immutable.
 - **Simple** - Everything is standard javascript, there is no misdirection or magic.

## What it isn't

 - **A vdom implementation** - You have to provide your own presentation layer. But the good news is, you can basically pick any one you want.
 - **A new language** - This isn't like Elm, in the sense of the language. You can always bring this into typescript, but I don't plan on supporting any other languages out of the box.

## Where did this come from

Like any great idea, it's based on other (much smarter) people's work, namely:
 - [Evan Czaplicki](https://github.com/evancz)'s [Elm](https://elm-lang.org/), the language that made me see the power of the ~dark side~ functional reactive programming.
 - [Jorge Bucaran](https://github.com/jorgebucaran)'s [hyperapp](https://github.com/jorgebucaran/hyperapp), a tiny but powerful functional front-end framework.

## Installing

```bash
npm install --save ferp
```

Or grab it from unpkg

```
<script src="https://unpkg.com/ferp"></script>
<script>
  const { ferp } = window;
</script>
```

## Migrating from 0.x to 1.x

See this handy [migration guide](./MIGRATION.md)!

## Creating an app

Here's an app that infinitely adds a counter, and logs it.

```javascript
const ferp = require('ferp');

const initialState = 0;
const incrementMessage = 1;

ferp.app({
  init: [initialState, incrementMessage],
  update: (message, state) => {
    if (message === incrementMessage) {
      return [
        state + 1,
        incrementMessage,
      ];
    }
    return [state, ferp.effects.none()];
  },
});
```

### Quick anatomy of an app

Every app needs `init` and `update` functions.
Both of these functions must return an array where the first element is the latest state, and the second is an effect you'd like to run, just like `[state, ferp.effects.none()]`.
Effects are also an opportunity to run impure code in a controlled way.

You can read more about setting up an application [here in the docs](./docs/index.md).

## Examples

 - Command-line Examples
   - [Timer using effects](./examples/cli/timer-with-effects.js), `cd examples/cli && node ./timer-with-effects.js`.
   - [Timer using subscriptions](./examples/cli/timer-with-subscription), `cd examples/cli && node ./timer-with-subscription.js`.
   - [File reader](./examples/cli/file-reader-node.js), `cd examples/cli && node ./file-reader-node.js`.
   - [Http request](./examples/cli/xhr-request.js), `cd examples/cli && node ./xhr-request.js`.
 - [Node http server](./examples/http-server), `node ./examples/http-server/server.js`.
 - [Web example using superfine for vdom](./examples/with-serverfine), `cd ./examples/with-superfine && npm i && npm start`.

## More docs

 - [Extended overview](./docs/index.md)
 - [The (git) book](https://app.gitbook.com/@ferp-js/s/ferp/)
 - [Testing Guide](./TESTING.md)
 - [Internals](./INTERNALS.md)
 - [Effects](./src/ferp/effects/README.md)
 - [Subscriptions](./src/ferp/subscriptions/README.md)
 - [Utility](./src/ferp/util/README.md)

## Still have questions?

 - [Open an issue](https://github.com/ferp-js/ferp/issues/new), we're happy to answer any of your questions, or investigate how to fix a bug.
 - [Join us on reddit](https://www.reddit.com/r/ferp), show off what you're doing, post tutorials, or just hang out, but keep things ferp related please.
 - [Chat with us on gitter](https://gitter.im/mrozbarry/ferp), we'll try to be quick to respond.
