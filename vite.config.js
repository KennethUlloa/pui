import { resolve } from "node:path";
import { defineConfig } from "vite";
import { sassPlugin } from "./plugins/sass.js";
import { modifyHtmlFiles } from "./plugins/modifiers.js";
import { PUI_VERSION, BASE_URL } from "./meta.js";

const outDir = PUI_VERSION ? "dist/" + PUI_VERSION : "dist";

const cssOutput = resolve(`${outDir}/css/index.css`);
let basePath = [BASE_URL, PUI_VERSION].filter(Boolean).join("/");

if (basePath.endsWith("/")) {
  basePath = basePath.slice(0, -1);
}

if (basePath && !basePath.startsWith("/")) {
  basePath = `/${basePath}`;
}

export default defineConfig({
  plugins: [
    sassPlugin({ cssOutput }),
    modifyHtmlFiles((html) => html.replaceAll("{{version}}", PUI_VERSION).replaceAll("href=\"./",`href="${basePath}/`)),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
      },
    },
  },
  base: basePath,
  build: {
    outDir,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.names && assetInfo.names.length > 0) {
            const name = assetInfo.names[0];
            if (name.endsWith(".css")) {
              return "css/[name]-[hash][extname]";
            }
            if (
              name.endsWith(".svg") ||
              name.endsWith(".png") ||
              name.endsWith(".jpg") ||
              name.endsWith(".jpeg") ||
              name.endsWith(".webp") ||
              name.endsWith(".gif")
            ) {
              return "assets/[name]-[hash][extname]";
            }
          }
          return "assets/[name]-[hash][extname]";
        },
        chunkFileNames: (chunkInfo) => {
          if (
            chunkInfo.name.startsWith("wc/") ||
            chunkInfo.name.startsWith("vendor")
          ) {
            return `js/${chunkInfo.name}.js`;
          }
          return "js/[name]-[hash].js";
        },
        entryFileNames: (chunkInfo) => {
          return "js/[name]-[hash].js";
        },
        advancedChunks: {
          groups: [
            { name: "vendor", test: /[\\/]node_modules[\\/]/ },
            {
              debugName: "components",
              name: (id) => {
                const m = id.match(/\/src\/components\/([^/]+)\//);
                return m ? "wc/" + m[1] : undefined;
              },
            },
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
