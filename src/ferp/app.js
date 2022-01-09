import { actionStage } from './stages/actionStage.js';
import { subscribeStage } from './stages/subscribeStage.js';
import { observeStage } from './stages/observeStage.js';
import { effectStage } from './stages/effectStage.js';

import { pipeline } from './util/pipeline.js';

export const app = ({ init, subscribe, observe }) => {
  let state = {};
  let subscriptions = [];

  const setState = (newState) => {
    state = newState;
  };

  const setSubscriptions = (newSubscriptions) => {
    subscriptions = newSubscriptions;
  };

  const dispatch = (action, annotation) => pipeline(
    actionStage(setState, action),
    subscribeStage(setSubscriptions, dispatch, subscribe),
    observeStage(observe),
    effectStage(dispatch),
  )({
    action,
    annotation,
    state,
    subscriptions,
  });
  dispatch.after = (action, annotation) => setTimeout(
    () => dispatch(action, annotation),
    0,
  );

  dispatch(() => init, 'ferpAppInitialize');

  return dispatch;
};
