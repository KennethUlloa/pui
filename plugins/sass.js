import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { compile } from "sass";

const defaultsSassEntry = resolve("src/css/index.scss");
const defaultsCssOutput = resolve("dist/css/index.css");

function compileStylesheet(sassEntry, cssOutput) {
  const { css } = compile(sassEntry, { style: "compressed" });
  mkdirSync(dirname(cssOutput), { recursive: true });
  writeFileSync(cssOutput, css);
}

export function sassPlugin({ sassEntry = defaultsSassEntry, cssOutput = defaultsCssOutput } = {}) {
  let basePath = "./";

  return {
    name: "pui-sass",
    configResolved(config) {
      basePath = config.base
    },
    configureServer(server) {
      const compileAndLog = () => {
        try {
          compileStylesheet(sassEntry, cssOutput);
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
        /href="(?:\.\/|\/)?dist\/css\/index\.css(?:\?[^\"]*)?"/,
        `href="${basePath}css/index.css"`,
      );
      return html.replace(
        /href="(?:\.\/|\/)?dist\/css\/index\.css(?:\?[^\"]*)?"/,
        `href="/dist/css/index.css?v=${Date.now()}"`,
      );
    },
    buildStart() {
      compileStylesheet(sassEntry, cssOutput);
    },
    closeBundle() {
      compileStylesheet(sassEntry, cssOutput);
    },
  };
}