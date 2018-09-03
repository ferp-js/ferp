import { eslint } from 'rollup-plugin-eslint';

export default {
  input: './src/ferp.js',
  plugins: [
    eslint(),
  ],
  output: {
    name: 'ferp',
  },
  dest: 'dist/ferp.js',
  format: 'umd',
};
