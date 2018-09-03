export class Effect {
  static none() {
    return Effect.map([]);
  }

  static map(effects) {
    return dispatch => Promise.all(effects.map(effect => effect.then(dispatch)));
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
