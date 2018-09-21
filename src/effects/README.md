## Ferp Effects

### Core

 - `effects.none()` produces no extra update
 - `effects.batch()` runs through multiple effects/messages, updating per message
 - `effects.defer(promise)` waits for the passed promise to resolve before running an update

All promises, at some point, will back onto these core effects.

### Delay

Allows an update to be triggered after time has passed.
Called as `[state, effects.delay.millisecond(milliseconds, { type: 'YOUR MESSAGE' })]`, which will pass your message after your delay.

The `delay` module exports `millisecond`, `second`, `minute`, and `hour`, each following the same parameter structure.

**Warning:** This could block an application from exiting _if_ a delay is set for too long; use with caution.

### RAF

Allows an update to be triggered on the next display sync frame (vsync).
Called as `[state, effects.raf({ type: 'YOUR MESSAGE' }, optionalLastTimestamp)]` which will pass your message, augmented with `delta`, `timestamp`, and `lastTimestamp`.
You can optionally pass the current timestamp as `optionalLastTimestamp` to calculate your deltas.
