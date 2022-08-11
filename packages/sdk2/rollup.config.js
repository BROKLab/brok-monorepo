// import { nodeResolve } from '@rollup/plugin-node-resolve';
// import commonjs from '@rollup/plugin-commonjs';
import { terser } from "rollup-plugin-terser";
import gzipPlugin from 'rollup-plugin-gzip'

const esmConfig = {
  input: 'dist/index.js',
  output: [{
    file: 'dist/index.mjs',
    format: 'esm',
  }, 
  {
    file: 'dist/index.min.mjs',
    format: 'esm',
    plugins: [terser({
      output: {
      },
      ecma: 2020,
      module: true,
      mangle: true,
      compress: true,
    })]
  },
],
  plugins: [gzipPlugin()]
}
const umdConfig = {
  input: 'dist/index.js',
  output: [{
    file: 'dist/index.umd.js',
    format: 'umd',
    name: "SDK"
  },   {
    file: 'dist/index.umd.min.js',
    format: 'umd',
    name: "SDK",
    plugins: [terser({
      output: {
      },
      ecma: 2020,
      mangle: true,
      compress: true,
    })]
  },]
}

export default [
  esmConfig,
  umdConfig
];