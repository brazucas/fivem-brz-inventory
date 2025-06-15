const esbuild = require("esbuild");

const TARGET_ENTRIES = [
  {
    target: "node16",
    entryPoints: ["server/server.ts"],
    platform: "node",
    outfile: "./dist/server/server.js",
  },
  {
    target: "es2020",
    entryPoints: ["client/client.ts"],
    outfile: "./dist/client/client.js",
  },
  {
    target: "ES6",
    entryPoints: ["nui/nui.ts"],
    outdir: "./nui/dist/",
  },
];

const buildBundle = async () => {
  try {
    const baseOptions = {
      logLevel: "info",
      bundle: true,
      charset: "utf8",
      minifyWhitespace: true,
      absWorkingDir: process.cwd(),
    };

    for (const targetOpts of TARGET_ENTRIES) {
      const mergedOpts = { ...baseOptions, ...targetOpts };

      const { errors } = await esbuild.build(mergedOpts);

      if (errors.length) {
        console.error(`[ESBuild] Bundle failed with ${errors.length} errors`);
        process.exit(1);
      }
    }
  } catch (e) {
    console.log("[ESBuild] Build failed with error");
    console.error(e);
    process.exit(1);
  }
};

buildBundle().catch(() => process.exit(1));
