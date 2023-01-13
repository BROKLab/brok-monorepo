import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["deployments/index.ts"],
	outDir: "dist",
	splitting: false,
	sourcemap: true,
	clean: true,
	dts: true,
	format: ["esm", "cjs"],
	minify: true,
});
