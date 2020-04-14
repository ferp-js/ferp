# Ferp Changelog

## v1.2.0 - 2020-04-14

### Performance fixes

 - Pure and memoize were known but accepted memory leaks, but I've finally decided these are quite bad for long running applications.
They have now been removed, which should noticably improve memory and speed issues.

## v1.1.5 - 2020-03-17

### News

 - The ferp github has been published to [ferp.mrbarry.com](https://ferp.mrbarry.com).
Please give it a read and leave me feedback.

### Performance fixes

 - I noticed that ther was a very quick buildup of performance and memory issues using freeze in stateManaager, so that's gone.
I'll need to investigate more if it's an issue with `pure()` or `Proxy`.
Both are probably expensive.

## v1.1.0 - 2018-11-14

### News

 - WIP Gitbook documentation. Check it out @ [https://ferp-js.gitbook.io/ferp](https://ferp-js.gitbook.io/ferp). Will add to README once it's in better shape.
 - Removes git revision links here in the changelog. The git tags and releases is more than enough in github.

### Bug fixes

 - Fixes issue where subscription object arguments were being re-wrapped in freeze() each state update, causing new subscription destroy/create cycles.

### Features

 - Adds `util.pure()`, a way to declare functions as pure, with memoized stores attached to them.

### Internals

 - Adds memoize store implementation
 - Refactors and optimizes subscriptionHandler using memoize

## v1.0.1 - 2018-10-22

### Bug fixes

 - Fixes issue where the call stack would overflow when comparing big/self-referrential objects in subscription arguments.

## v1.0.0 - 2018-10-04

### Breaking changes

 - Renames `Effect.map` to `Effect.batch`
 - Removes `ferp.types.Effect`
 - Moves effect primitives into `ferp.effects` as `none()`, `batch([])`, `defer(promise)`, and **new** `thunk(method)`
 - Disables `ferp.types.Result` - It may come back, or be removed in a future release
 - Changes `ferp.effects.delay`
   - Exposed as a single function that delays for n milliseconds
   - Reverses param order to be `ferp.effects.delay(message, milliseconds)` to align with the raf effect
 - Changes `ferp.subscriptions.every`
   - Exposed as a single function that ticks every n milliseconds
   - Reverses param order to be `ferp.subscriptions.every(message, milliseconds)` to align with `effects.raf` and `effects.delay`

### Features

 - Adds a changelog
 - Huge test coverage improvement
 - Many internal changes that simplify the `ferp.app` function
 - Adds `ferp.util.combineReducers` to manage nested reducers that run effects
 - Adds `ferp.effects.thunk` effect primitive


## v0.1.1 - 2018-09-20

### Features

 - Adds tests around subscriptionHandler

### Fixes

 - Issue where subscriptions that immediately dispatch could cause an infinite loop


## v0.1.0 - 2018-09-16

### Breaking changes

 - Updated subscriptions to not require an id prefix


## v0.0.5 - 2018-09-09

### Features

 - Further linting
 - Adds test for effect ordering

### Fixes

 - Fixes issue with effects not running in a deterministic order


## v0.0.4 - 2018-09-08

### Features

 - Many fixes and touch-ups to the game-input example

### Fixes

 - Issue where mapped effects weren't being executed properly


## v0.0.3 - 2018-09-07

### Features

 - General code cleanup
 - Adds `effects.delay.raf` to requestAnimationFrame

### Fixes

 - Fixed ava tests that were being cached unexpectedly


## v0.0.2 - 2018-09-03

### Features

 - Adds testing with ava
 - Adds linting with eslint
 - Adds game-input example
 - Adds rollup and config
 - Upgrades code to use es6 imports, since ava already brings in babel dependencies
