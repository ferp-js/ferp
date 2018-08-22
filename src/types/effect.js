class Effect extends Promise {
  static none() {
    return undefined;
  }

  static map(effects) {
    return (dispatch) => Promise.all(effects.map((effect) => effect.then(dispatch)));
  }
}

module.exports = {
  Effect,
};
