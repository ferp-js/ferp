## Ferp Effects

### Delay

Allows an update to be triggered after time has passed.
Called as `[state, delay(milliseconds, 'ACTION_TYPE')]`, which will produce a message `{ type: 'ACTION_TYPE' }`.

**Warning:** This could block an application from exiting _if_ a delay is set for long enough, so use with caution.
