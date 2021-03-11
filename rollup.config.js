import { eslint } from 'rollup-plugin-eslint';
import { terser } from 'rollup-plugin-terser';
import strip from '@rollup/plugin-strip';
import cleanup from 'rollup-plugin-cleanup';

export default {
  input: './src/ferp.js',
  plugins: [
    eslint(),
    strip(),
    cleanup(),
  ],
  output: [
    {
      name: 'ferp',
      file: 'ferp.esm.js',
      format: 'esm',
      exports: 'named',
      plugins: [
        terser(),
      ],
    },
    {
      name: 'ferp',
      file: 'ferp.js',
      format: 'cjs',
      exports: 'named',
    },
    {
      name: 'ferp',
      file: 'ferp.min.js',
      format: 'cjs',
      exports: 'named',
      plugins: [
        terser(),
      ],
    },
  ],
};
