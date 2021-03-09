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

## Importing

```js
// es6
import { app, effects } from 'ferp';

// unpkg
import { app, effects } from 'https://unpkg.com/ferp?module=1';

// from a script tag
// <script src="https://unpkg.com/ferp"></script>
const { app, effects, util } = window.ferp;

// es5/node
const { app, effects, util } = require('ferp');
```

## Migrating from 0.x to 1.x

See this handy [migration guide](./MIGRATION.md)!

## Creating an app

Here's an app that infinitely adds a counter, and logs it.

```javascript
const ferp = require('ferp');

const initialState = 0;

const incrementAction = (state) => [state + 1, ferp.effects.act(incrementAction)];

ferp.app({
  init: [initialState, ferp.effects.act(incrementAction)],
});
```

### Quick anatomy of an app

Every app needs an `init` tuple, with the initial state, and initial side effect (or `ferp.effects.none()` if there isn't one).
There is also a `subscribe` method for managing long-term side-effects, like intervals or websocket communication, and `observe` to watch for application changes.

You can read more about setting up an application [here in the docs](./docs/index.md).

## More docs

 - [The (git) book](https://app.gitbook.com/@ferp-js/s/ferp/)
 - [Testing Guide](./TESTING.md)
 - [Some examples (their dependencies may occasionally be outdated)](https://github.com/ferp-js/examples)
 - [Internals](./INTERNALS.md)
 - [Extended anatomy of an app](./docs/index.md)
 - [Effects](./src/ferp/effects/README.md)
 - [Subscriptions](./src/ferp/subscriptions/README.md)

## Still have questions?

 - [Open an issue](https://github.com/ferp-js/ferp/issues/new), we're happy to answer any of your questions, or investigate how to fix a bug.
 - [Join us on reddit](https://www.reddit.com/r/ferp), show off what you're doing, post tutorials, or just hang out, but keep things ferp related please.
 - [Chat with us on gitter](https://gitter.im/mrozbarry/ferp), we'll try to be quick to respond.
