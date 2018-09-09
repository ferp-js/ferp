export class Effect {
  static none() {
    return Effect.map([]);
  }

  static map(effects) {
    return Promise.resolve(effects);
  }

  static immediate(message) {
    return new Effect(done => done(message));
  }

  static defer() {
    let dispatch = () => {};
    const effect = new Effect((done) => {
      dispatch = done;
    });

    return {
      dispatch,
      effect,
    };
  }

  constructor(promiseFunction) {
    this.promise = new Promise(promiseFunction);
  }

  then(callback) {
    return this.promise.then(callback);
  }
}
