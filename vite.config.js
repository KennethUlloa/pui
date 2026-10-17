import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { compile } from "sass";
import { defineConfig } from "vite";

const sassEntry = resolve("src/css/index.scss");
const cssOutput = resolve("dist/css/index.css");

function compileStylesheet() {
  const { css } = compile(sassEntry);
  mkdirSync(dirname(cssOutput), { recursive: true });
  writeFileSync(cssOutput, css);
}

function sassPlugin() {
  return {
    name: "pui-sass",
    configureServer(server) {
      const compileAndLog = () => {
        try {
          compileStylesheet();
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
      if (!context.server) return html;

      return html.replace(
        /href="(?:\.\/|\/)?dist\/css\/index\.css(?:\?[^\"]*)?"/,
        `href="/dist/css/index.css?v=${Date.now()}"`,
      );
    },
    buildStart() {
      compileStylesheet();
    },
    closeBundle() {
      compileStylesheet();
    },
  };
}

export default defineConfig({
  plugins: [sassPlugin()],
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve("index.html"),
        components: resolve("components.html"),
      },
    },
  },
});