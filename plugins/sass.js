import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { compile } from "sass";

const defaultsSassEntry = resolve("src/css/index.scss");
const devSassOutput = resolve("src/css/index.compiled.css");
const defaultsCssOutput = resolve("dist/css/index.css");

function compileStylesheet(sassEntry, cssOutput) {
  const { css } = compile(sassEntry, { style: "compressed" });
  mkdirSync(dirname(cssOutput), { recursive: true });
  writeFileSync(cssOutput, css);
}

export function sassPlugin({ sassEntry = defaultsSassEntry, cssOutput = defaultsCssOutput } = {}) {
  const state = {
    basePath: "./",
    isBuild: false
  }

  return {
    name: "pui-sass",
    configResolved(config) {
      state.basePath = config.base
    },
    configureServer(server) {
      const compileAndLog = () => {
        try {
          compileStylesheet(sassEntry, devSassOutput);
          server.config.logger.info("Sass stylesheet compiled.");
          server.ws.send({ type: "full-reload" });
        } catch (error) {
          server.config.logger.error(`Sass compilation failed: ${error.message}`);
        }
      };

      compileAndLog();
      server.watcher.add(resolve("src/css"));
      server.watcher.on("change", (filePath) => {
        if (filePath.endsWith(".scss")) compileAndLog();
      });
    },
    transformIndexHtml(html, context) {
      if (!context.server) return html.replace(
        'href="src/css/index.scss"',
        `href="${state.basePath}css/index.css"`,
      );
      return html.replace(
        'href="src/css/index.scss"',
        `href="src/css/index.compiled.css?v=${Date.now()}"`,
      );
    },
    buildStart() {
      state.isBuild = true;
      compileStylesheet(sassEntry, cssOutput);
    },
    closeBundle() {
      compileStylesheet(sassEntry, cssOutput);
    },
  };
}