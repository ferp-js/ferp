## Ferp Effects

### Core

 - `ferp.effects.none()` produces no extra update
 - `ferp.effects.batch()` runs through multiple effects/messages, updating per message
 - `ferp.effects.defer(promise)` waits for the passed promise to resolve before running an update
 - `ferp.effects.thunk(method)` runs a method that returns an effect - similar to defer, but waits to begin execution until processing the effect

All effects, at some point, will back onto these core effects.

### delay

Allows an update to be triggered after time has passed.
Called as `[state, ferp.effects.delay({ type: 'YOUR MESSAGE' }, milliseconds)]`, which will pass your message after your delay.

### raf

Allows an update to be triggered on the next display sync frame (vsync) using `requestAnimationFrame` in the browser, and `setTimeout(cb, 0)` in NodeJS.
Called as `[state, ferp.effects.raf({ type: 'YOUR MESSAGE' }, optionalLastTimestamp)]` which will pass your message, augmented with `delta`, `timestamp`, and `lastTimestamp`.
You can optionally pass the current timestamp as `optionalLastTimestamp` to calculate your deltas.
