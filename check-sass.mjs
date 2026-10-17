import { fileURLToPath } from "node:url";
import { compile } from "sass";

const stylesheetPath = fileURLToPath(new URL("./src/css/index.scss", import.meta.url));
const { css } = compile(stylesheetPath, { quietDeps: true });

console.log(`Sass sources compile successfully (${css.length} CSS characters).`);