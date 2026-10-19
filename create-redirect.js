import { readFileSync, writeFileSync } from "node:fs";
const { PUI_VERSION, BASE_URL } = process.env;

const outDir = "dist";
const baseUrl = BASE_URL || "";

const prefix = [baseUrl, PUI_VERSION].filter(Boolean).join("/");

let indexHTML = readFileSync("./redirect.html", "utf-8");
indexHTML = indexHTML.replace("{{url}}", `/${prefix}/index.html`);
writeFileSync(`${outDir}/index.html`, indexHTML);
