import { readFileSync, writeFileSync } from "node:fs";
import { KPUI_VERSION, BASE_URL } from "./meta.js";

const outDir = "dist";
const baseUrl = BASE_URL || "";

const prefix = [baseUrl, KPUI_VERSION].filter(Boolean).join("/");

let indexHTML = readFileSync("./redirect.html", "utf-8");
indexHTML = indexHTML.replace("{{url}}", `/${prefix}/index.html`);
writeFileSync(`${outDir}/index.html`, indexHTML);
