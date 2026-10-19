import { mkdirSync, writeFileSync, readdirSync } from "node:fs";
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

function inspectFiles(dir, prefix) {
  const files = readdirSync(dir);
  const resolved = {};
  for (const file of files) {
    if (file.endsWith(".js") || file.endsWith(".ts")) {
      resolved[prefix + file] = resolve(dir, file);
    }
  }

  return resolved
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
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.names && assetInfo.names.length > 0) {
            const name = assetInfo.names[0];
            if (name.endsWith(".css")) {
              return "css/[name]-[hash][extname]";
            }
            if (name.endsWith(".svg") || name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".webp") || name.endsWith(".gif")) {
              return "assets/[name]-[hash][extname]";
            }
          }
          return "assets/[name]-[hash][extname]";
        },
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name.startsWith("wc/") || chunkInfo.name.startsWith("vendor")) {
            return `js/${chunkInfo.name}.js`;
          }
          return "js/[name]-[hash].js";
        },
        entryFileNames: (chunkInfo) => {
          return "js/[name]-[hash].js";
        },
        advancedChunks: {
          groups: [
            { name: 'vendor', test: /[\\/]node_modules[\\/]/ },
            { debugName: "components", name: (id) => { const m = id.match(/\/src\/components\/([^/]+)\//); return m ? 'wc/' + m[1] : undefined; } },
          ],
        },
      },
      input: {
        main: resolve("index.html"),
        components: resolve("components.html"),
        "web-components": resolve("web-components.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve("src"),
      "@styles": resolve("src/css"),
    },
  },
});