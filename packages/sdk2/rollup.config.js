/* eslint-disable no-undef */
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import alias from "rollup-plugin-alias";
import path from "path";
import json from "@rollup/plugin-json";

// eslint-disable-next-line no-undef
const devMode = process.env.NODE_ENV === "development";
console.log(`${devMode ? "development" : "production"} mode bundle`);

export default [
    {
        input: "./src/sdk.ts",
        output: {
            file: "./lib/bundle.js",
            format: "umd",
            name: "bundle",
            sourcemap: devMode ? "inline" : false,
        },
        watch: {
            include: "./src/**",
            clearScreen: true,
        },
        plugins: [
            alias({
                elliptic: path.resolve(__dirname, "includes/elliptic.js"),
            }),
            json(),
            commonjs(),
            typescript(),
            nodeResolve({}),
        ],
        external: [
            "@ceramicnetwork/http-client",
            "@ceramicnetwork/3id-did-resolver",
            "@ceramicnetwork/common",
            "@ceramicnetwork/stream-tile",
            "@ceramicnetwork/stream-model",
        ],
    },
];
