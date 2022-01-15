# Testing your Ferp App

## `tester` export

The exported `tester` is a function that returns an instance of the `tester` object.
It can accept an initial state, but that's optional.

## `tester` object, as `t`

### Setup functions

The setup functions will always return the tester object for chaining.

#### `t.includeEffectNone()`

By default, the test interface does not include checking against `none` effects, since they only represent when there are no more effects to chain.
Calling `includeEffectNone` disables this behaviour.

#### `t.willAct(actionAnnotation)`

`willAct` adds an expectation that an action named `actionAnnotation` will be dispatched at some point.
The annotation can be an annotation specified by the `effects.act(fn, annotation)` call, `fn.alias`, or finally `fn.name`.

#### `t.willThunk(thunkAnnotation)`

`willThunk` adds an expectation that an thunk named `thunkAnnotation` will be dispatched at some point.
The annotation can be an annotation specified by the `effects.thunk(fn, annotation)` call, `fn.alias`, or finally `fn.name`.

#### `t.willDefer(deferAnnotation)`

`willDefer` adds an expectation that an thunk named `deferAnnotation` will be dispatched at some point.
The annotation can be an annotation specified by the `effects.defer(fnOrPromise, annotation)`.

#### `t.willBatch(annotation)`

`willBatch` adds an expectation that an batch named `batchAnnotation` will be dispatched at some point.
The annotation can be an annotation specified by the `effects.batch(array, annotation)`.

### Executors

#### `t.fromEffect(effect)`

`fromEffect` is an asyncronous function that runs either the top level effect, or all effects if `resolveAllEffects` was called previously.
`fromEffect` returns the tester object after resolving all of the effects scheduled to run.

#### `t.fromAction(action)`

`fromAction` runs `t.fromEffect(effects.act(action))` behind the scenes.

#### `t.fromSubscription(subscription)`

`fromSubscription` accepts a declared subscription, in the form of `[subscriptionFx, prop1, prop2, ...]`.
While `fromSubscription` is not asyncronous, you can still `await` it so it aligns with the other executors.
The tester object returned has a special `cancel` method to call the subscription cancel function for testing purposes.

### Assertions

#### `t.ok()`

If all expectations were met, this will return `true`, otherwise it will return `false`

#### `t.failedOn()`

This returns an array of failed expectations, in the form of `[{ type: effectType, annotation: '' }, ...]`.

#### `t.missed()`

This returns an array of missed expectations, in the form of `[{ type: effectType, annotation: '' }, ...]`.
These can be ignored, but may hint at further expecations you can add to your test.

#### `t.state()`

If an initial state was set in the exported `tester()` function, `state()` will return a copy of state with any modifications ran by any actions during the test.
If no actions were set, and no actions were ran, this will return an empty object, `{}`.
