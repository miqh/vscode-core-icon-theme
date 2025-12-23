import { rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import esbuild from "esbuild";

/** @type {esbuild.Plugin} */
const esbuildProblemMatcherOutput = {
  name: "esbuild-problem-matcher",
  setup(build) {
    /** @type {(severity: string, m: esbuild.Message) => string} */
    const format = (severity, m) =>
      `  ${m.location?.file}:${m.location?.line}:${m.location?.column}: ${severity}: ${m.text}`;
    let buildStart = 0;
    build.onStart(() => {
      buildStart = Date.now();
      console.info(`esbuild starting build`);
    });
    build.onEnd((result) => {
      for (const error of result.errors) {
        console.error("\x1b[31m" + format("ERROR", error) + "\x1b[0m");
      }
      for (const warning of result.warnings) {
        console.warn("\x1b[33m" + format("WARN", warning) + "\x1b[0m");
      }
      console.info(`esbuild built in ${Date.now() - buildStart} ms\n`);
    });
  },
};

/** @type {esbuild.BuildOptions} */
const config = {
  bundle: true,
  entryPoints: {
    "extension.desktop": "src/extension.desktop.ts",
    "extension.web": "src/extension.web.ts",
  },
  external: ["vscode"],
  format: "cjs",
  logLevel: "silent",
  outdir: "dist",
  outExtension: {
    ".js": ".cjs",
  },
  platform: "node",
  plugins: [esbuildProblemMatcherOutput],
};

const release = process.argv.includes("--release");

try {
  if (release) {
    console.warn("removing dist directory to prepare for release build\n");
    await rm("dist", { force: true, recursive: true });
  }
  await esbuild.build({
    ...config,
    ...(release && {
      entryPoints: { ...config.entryPoints, scripts: "src/scripts.ts" },
    }),
    minify: release,
    sourcemap: !release,
  });
  if (release) {
    const scripts = await import(
      pathToFileURL(path.resolve(import.meta.dirname, "dist", "scripts.cjs"))
        .href
    );
    await scripts.postbuild();
  }
} catch (e) {
  console.error(e);
  process.exit(1);
}
