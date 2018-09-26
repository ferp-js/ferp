## Ferp Types

**Note:** Currently disabled, may remove later.

### Result

One thing that's very neat about languages that emphasize functional approaches is the concept of [`Maybe`](https://package.elm-lang.org/packages/elm-lang/core/latest/Maybe) or [`Result`](https://package.elm-lang.org/packages/elm-lang/core/latest/Result).
A `ferp.result` combines both of these.

What does a Result look like?

| Attribute                                         | Returns  | Example
| ------------------------------------------------- | -------- | ------- |
| result.nothing()                                  | A result with no data and error    | `result.nothing()` |
| result.pending()                                  | A result with no data and error, but the data is pending    | `result.pending()` |
| result.done()                                     | A result with data    | `result.data({ success: true })` |
| result.error()                                    | A result with an error    | `result.error(new Error('Some exception'))` |
| result.get(onNothing, onPending, onDone, onError)(yourResult) | Return the value based on the current result state.  | `return result.get(() => null, () => <Loading />, (data) => <Component data={data} />, (err) => <ErrorReport error={err} />)` |
| result.getWithDefault(onResult, onDefault)        | Wraps result.get() to return either the current done data value, or a default.    | `return <Component data={Result.getWithDefault(value => value,() => { default: 'payload' }) />` |

To pull the value out, it is recommended to do `ferp.result.getWithDefault(v => v, () => yourDefaultValueHere)`, but if being used with a front-end framework like React, `.get()` may suite your needs more for rendering.

Instead of throwing exceptions, data should be wrapped in stateful Result objects.
This will give you more control on the flow of data and logic.
