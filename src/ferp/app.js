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

  const dispatch = (action, annotation) => pipeline(
    actionStage(state, effect),
    subscribeStage(subscriptions, state, dispatch, subscribe),
    observeStage(state, effect, annotation, observe),
    effectStage(effect, dispatch),
  )(action);

  dispatch(() => init, 'ferpAppInitialize');

  return dispatch;
};
