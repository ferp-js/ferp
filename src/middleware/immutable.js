import { freeze } from '../freeze.js';

export const immutable = () => next => (message, state) => next(message, freeze(state));
