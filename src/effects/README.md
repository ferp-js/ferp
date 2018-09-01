## Ferp Effects

### Delay

Allows an update to be triggered after time has passed.
Called as `[state, Delay.millisecond(milliseconds, 'ACTION_TYPE')]`, which will produce a message `{ type: 'ACTION_TYPE' }`.

The `Delay` module exports `Delay.millisecond`, `Delay.second`, `Delay.minute`, and `Delay.hour`, each following the same parameter structure.

**Warning:** This could block an application from exiting _if_ a delay is set for too long; use with caution.
