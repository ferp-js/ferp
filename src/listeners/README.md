## Ferp Middleware

### logger(spacing)

The `ferp.middleware.logger()` middleware lets you log out your state for every update.
Handy for debugging, but probably not good in production.

It optionally takes a number argument for spacing, passed into [`JSON.stringify`s third parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#Parameters).

## immutable()

Using the `ferp.middleware.immutable()` middleware lazy-freezes your state to guarantee immutability.
Be aware that if you have any mutating state objects, this will throw an exception.
Only use this if you can guarantee that all objects in the state are immutable.
