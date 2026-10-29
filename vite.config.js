import { resolve, relative, extname, sep } from "node:path";
import { defineConfig } from "vite";
import { sassPlugin } from "./plugins/sass.js";
import { modifyHtmlFiles } from "./plugins/modifiers.js";
import { globSync } from "tinyglobby";
import { KPUI_VERSION, BASE_URL } from "./meta.js";

const outDir = "dist";

const cssOutput = resolve(`${outDir}/css/index.css`);
const basePath = BASE_URL || "";

const components = Object.fromEntries(
  globSync("src/web-components/**/*.ts").map((file) => [
    // This removes `src/` as well as the file extension from each
    // file, so e.g. src/nested/foo.js becomes nested/foo, and
    // normalizes Windows backslashes to forward slashes.
    "wc/" +
      relative(
        "src/web-components",
        file.slice(
          0,
          file.length -
            (extname(file).length + (file.endsWith("index.ts") ? 5 : 0)),
        ),
      )
        .split(sep)
        .join("/"),
    // This expands the relative paths to absolute paths, so e.g.
    // src/nested/foo.js becomes /project/src/nested/foo.js
    resolve(file),
  ]),
);

export default defineConfig({
  plugins: [
    sassPlugin({ cssOutput }),
    modifyHtmlFiles((html, { isBuild }) => {
      let h = html.replaceAll("{{version}}", KPUI_VERSION);
      if (isBuild) {
        h = h.replaceAll('href="./', `href="${basePath}/`);
      }

      return h;
    }),
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
    rolldownOptions: {
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
          return "js/[name].js";
        },
        entryFileNames: (chunkInfo) => {
          return "js/[name].js";
        },
        advancedChunks: {
          groups: [
            { name: "vendor", test: /[\\/]node_modules[\\/]/ },
          ],
        },
      },
      input: {
        main: resolve("index.html"),
        components: resolve("components.html"),
        "web-components": resolve("web-components.html"),
        ...components,
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
