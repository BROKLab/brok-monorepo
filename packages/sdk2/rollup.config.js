import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';


const devMode = (process.env.NODE_ENV === 'development');
console.log(`${devMode ? 'development' : 'production'} mode bundle`)

export default [
    {
        input: './src/sdk.ts',
        output: {
            file: './lib/bundle.js',
            format: 'umd',
            name: "bundle",
            sourcemap: devMode ? 'inline' : false
        },
        watch: {
            include: './src/**',
            clearScreen: false
        },
        plugins: [typescript(), nodeResolve(), commonjs()]
    }
];