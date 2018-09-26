import { eslint } from 'rollup-plugin-eslint';
import minify from 'rollup-plugin-babel-minify';

export default {
  input: './src/ferp.js',
  plugins: [
    eslint(),
    minify(),
  ],
  output: {
    name: 'ferp',
    file: 'dist/ferp.js',
    format: 'umd',
  },
};
