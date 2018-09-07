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

  constructor(done) {
    this.promise = new Promise(done);
  }

  then(callback) {
    return this.promise.then(callback);
  }
}
