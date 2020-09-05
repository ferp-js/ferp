import { app } from '../app.js';

export const appTestRig = ({
  init,
  ofState,
  beforeOfState = () => {},
  afterOfState = () => {},
}) => app({
  init,
  ofState: [
    beforeOfState,
    ...ofState,
    afterOfState,
  ],
});
