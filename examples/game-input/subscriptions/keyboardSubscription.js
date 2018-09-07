const ferp = require('ferp');

const keyboardSubscription = (keyDownType, keyUpType) => (dispatch) => {
  const onKeyDown = (e) => {
    if (e.repeat) return;
    dispatch({ type: keyDownType, key: e.key });
  };

  const onKeyUp = (e) => {
    dispatch({ type: keyUpType, key: e.key });
  };

  document.body.addEventListener('keydown', onKeyDown, false);
  document.body.addEventListener('keyup', onKeyUp, false);

  return () => {
    document.body.removeEventListener('keydown', onKeyDown);
    document.body.removeEventListener('keyup', onKeyUp);
  };
};

module.exports = {
  keyboardSubscription,
};
