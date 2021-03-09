import { actionStage } from './stages/actionStage.js';
import { subscribeStage } from './stages/subscribeStage.js';
import { observeStage } from './stages/observeStage.js';
import { effectStage } from './stages/effectStage.js';

import { pipeline } from './util/pipeline.js';
import { mutable } from './util/mutable.js';

export const app = ({ init, subscribe, observe }) => {
  const state = mutable();
  const effect = mutable();
  const subscriptions = mutable([]);

  const dispatch = (action) => {
    pipeline(
      actionStage(state, effect),
      subscribeStage(subscriptions, state, subscribe),
      observeStage(state, effect, observe),
      effectStage(effect, dispatch),
    )(action);
  };

  dispatch(function ferpInit() { return init; }); // eslint-disable-line prefer-arrow-callback

  return dispatch;
};
