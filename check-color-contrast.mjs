import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { compile } from "sass";

const stylesheetPath = fileURLToPath(new URL("./src/css/index.scss", import.meta.url));
const css = compile(stylesheetPath).css;
const lightTokenBlock = css.match(/:root\s*\{([^}]*)\}/)?.[1];
const darkTokenBlock = css.match(/html\[data-theme=dark\]\s*\{([^}]*)\}/)?.[1];
assert.ok(lightTokenBlock, "Missing light theme color tokens");
assert.ok(darkTokenBlock, "Missing dark theme color tokens");

function colorsFrom(tokenBlock) {
  return new Map(
    [...tokenBlock.matchAll(/--pui-color-([a-z0-9-]+):\s*(#[0-9a-f]{6});/gi)].map(([, name, value]) => [name, value]),
  );
}

const lightColors = colorsFrom(lightTokenBlock);
const darkColors = new Map([...lightColors, ...colorsFrom(darkTokenBlock)]);

const pairs = [
  { label: "body text", foreground: "gray-900", background: "gray-50" },
  { label: "muted body text", foreground: "gray-600", background: "gray-50" },
  { label: "error semantic color", foreground: "gray-50", background: "error-main" },
  { label: "success semantic color", foreground: "gray-50", background: "success-main" },
  { label: "warning semantic color", foreground: "warning-contrast", background: "warning-main" },
  { label: "info semantic color", foreground: "gray-50", background: "info-main" },
  { label: "primary semantic color", foreground: "primary-contrast", background: "primary-main" },
  { label: "secondary semantic color", foreground: "gray-50", background: "secondary-main" },
  { label: "tertiary semantic color", foreground: "tertiary-contrast", background: "tertiary-main" },
  { label: "primary button", foreground: "primary-contrast", background: "primary-main" },
];

const primarySchemes = [
  { name: "blue", light: "blue-600", dark: "blue-400" },
  { name: "teal", light: "teal-700", dark: "teal-300" },
  { name: "violet", light: "violet-700", dark: "violet-400" },
  { name: "orange", light: "orange-700", dark: "orange-400" },
];

function relativeLuminance(hex) {
  const channels = hex.match(/[0-9a-f]{2}/gi).map((channel) => parseInt(channel, 16) / 255);
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );

  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(foreground, background) {
  const luminances = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a);
  return (luminances[0] + 0.05) / (luminances[1] + 0.05);
}

for (const [theme, colors] of [["light", lightColors], ["dark", darkColors]]) {
  for (const pair of pairs) {
    const foreground = colors.get(pair.foreground);
    const background = colors.get(pair.background);

    assert.ok(foreground, `Missing ${theme} foreground color token: ${pair.foreground}`);
    assert.ok(background, `Missing ${theme} background color token: ${pair.background}`);

    const ratio = contrastRatio(foreground, background);
    assert.ok(ratio >= 4.5, `${theme} ${pair.label} contrast is ${ratio.toFixed(2)}:1; expected at least 4.5:1`);
    console.log(`${theme} ${pair.label}: ${ratio.toFixed(2)}:1`);
  }
}

for (const scheme of primarySchemes) {
  const lightRatio = contrastRatio(lightColors.get("white-main"), lightColors.get(scheme.light));
  const darkRatio = contrastRatio(darkColors.get("gray-50"), lightColors.get(scheme.dark));

  assert.ok(lightRatio >= 4.5, `Light ${scheme.name} scheme contrast is ${lightRatio.toFixed(2)}:1; expected at least 4.5:1`);
  assert.ok(darkRatio >= 4.5, `Dark ${scheme.name} scheme contrast is ${darkRatio.toFixed(2)}:1; expected at least 4.5:1`);
  console.log(`light ${scheme.name} scheme: ${lightRatio.toFixed(2)}:1`);
  console.log(`dark ${scheme.name} scheme: ${darkRatio.toFixed(2)}:1`);
}