# Ferp Changelog

## Unreleased - 2018-09-XX - [git](#https://github.com/mrozbarry/ferp/compare/619723b8b35676acaa1196629c35331bcb978b0f...todo)

### Breaking changes

 - Renames `Effect.map` to `Effect.batch`
 - Removes `ferp.types.Effect`
 - Moves effect primitives into `ferp.effects` as `none()`, `batch([])`, and `defer(promise)`
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


## v0.1.1 - 2018-09-20 - [git](https://github.com/mrozbarry/ferp/compare/4e1dbd1e8e82c8197be87ee59c7de827a6ca4741...619723b8b35676acaa1196629c35331bcb978b0f)

### Features

 - Adds tests around subscriptionHandler

### Fixes

 - Issue where subscriptions that immediately dispatch could cause an infinite loop


## v0.1.0 - 2018-09-16 - [git](https://github.com/mrozbarry/ferp/compare/da884fdcfeb8746af2e5b366cc1a7395c64f103d...4e1dbd1e8e82c8197be87ee59c7de827a6ca4741)

### Breaking changes

 - Updated subscriptions to not require an id prefix


## v0.0.5 - 2018-09-09 - [git](https://github.com/mrozbarry/ferp/compare/9a51d0da69d68ddbbe2f86dbb325bb0e7f2e1e4e...da884fdcfeb8746af2e5b366cc1a7395c64f103d)

### Features

 - Further linting
 - Adds test for effect ordering

### Fixes

 - Fixes issue with effects not running in a deterministic order


## v0.0.4 - 2018-09-08 - [git](https://github.com/mrozbarry/ferp/compare/4053daee2e434a9a66ad88d9de056e9d2621243b...9a51d0da69d68ddbbe2f86dbb325bb0e7f2e1e4e)

### Features

 - Many fixes and touch-ups to the game-input example

### Fixes

 - Issue where mapped effects weren't being executed properly


## v0.0.3 - 2018-09-07 - [git](https://github.com/mrozbarry/ferp/compare/1efebd9c67e9ab76c4c44c63d2ab021af1cd2f96...4053daee2e434a9a66ad88d9de056e9d2621243b)

### Features

 - General code cleanup
 - Adds `effects.delay.raf` to requestAnimationFrame

### Fixes

 - Fixed ava tests that were being cached unexpectedly


## v0.0.2 - 2018-09-03 - [git](https://github.com/mrozbarry/ferp/compare/6b9a97ac89f8496a2efe865ea9197bcdf9856da3...1efebd9c67e9ab76c4c44c63d2ab021af1cd2f96)

### Features

 - Adds testing with ava
 - Adds linting with eslint
 - Adds game-input example
 - Adds rollup and config
 - Upgrades code to use es6 imports, since ava already brings in babel dependencies
