const esbuild = require("esbuild");

const production = process.argv.findIndex((argItem) => argItem === "--mode=production") >= 0;

const onRebuild = (context) => {
  return async (err, res) => {
    if (err) {
      return console.error(`[${context}]: Rebuild failed`, err);
    }

    console.log(`[${context}]: Rebuild succeeded, warnings:`, res.warnings);
  };
};

const client = {
  entryPoints: [`client/client.ts`],
  outfile: `dist/client.js`,
  platform: "browser",
  target: ["chrome93"],
  format: "iife",
};

for (const context of [client]) {
  esbuild
    .build({
      ...context,
      bundle: true,
      watch: production
        ? false
        : {
            onRebuild: onRebuild(context.outfile),
          },
    })
    .then(() => console.log(`[${context.outfile}]: Built successfully!`))
    .catch(() => process.exit(1));
}
