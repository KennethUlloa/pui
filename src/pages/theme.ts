const themes = {
  blue: {
    light: "var(--pui-color-blue-600)",
    dark: "var(--pui-color-blue-400)",
  },
  teal: {
    light: "var(--pui-color-teal-700)",
    dark: "var(--pui-color-teal-300)",
  },
  violet: {
    light: "var(--pui-color-violet-700)",
    dark: "var(--pui-color-violet-400)",
  },
  orange: {
    light: "var(--pui-color-orange-700)",
    dark: "var(--pui-color-orange-400)",
  },
} as const;

const storageKey = "pui-primary-scheme";
const modeStorageKey = "pui-theme-mode";
const themeSelect = document.querySelector<HTMLSelectElement>("[data-primary-scheme]");
const modeSelect = document.querySelector<HTMLSelectElement>("[data-theme-mode]");

const applyTheme = (name: string, mode: "light" | "dark") => {
  if (!themeSelect || !Object.hasOwn(themes, name)) return false;

  const scheme = themes[name as keyof typeof themes];
  document.documentElement.style.setProperty("--pui-color-primary-main", scheme[mode]);
  document.documentElement.style.setProperty(
    "--pui-color-primary-contrast",
    mode === "dark" ? "var(--pui-color-background-main)" : "var(--pui-color-white-main)",
  );
  themeSelect.value = name;
  return true;
};

if (themeSelect) {
  let savedTheme: string | null = null;
  try {
    savedTheme = localStorage.getItem(storageKey);
  } catch {
    // The control still works when storage is unavailable.
  }

  applyTheme(savedTheme ?? themeSelect.value, document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  themeSelect.addEventListener("change", () => {
    const name = themeSelect.value;
    const mode = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    if (!applyTheme(name, mode)) return;

    try {
      localStorage.setItem(storageKey, name);
    } catch {
      // The selected scheme remains active for this page.
    }
  });
}

if (modeSelect) {
  const applyMode = (mode: string) => {
    if (mode !== "light" && mode !== "dark") return false;

    document.documentElement.dataset.theme = mode;
    modeSelect.value = mode;
    if (themeSelect) applyTheme(themeSelect.value, mode);
    document.dispatchEvent(new Event("pui-themechange"));
    return true;
  };

  let savedMode: string | null = null;
  try {
    savedMode = localStorage.getItem(modeStorageKey);
  } catch {
    // The control still works when storage is unavailable.
  }

  applyMode(savedMode ?? modeSelect.value);
  modeSelect.addEventListener("change", () => {
    const mode = modeSelect.value;
    if (!applyMode(mode)) return;

    try {
      localStorage.setItem(modeStorageKey, mode);
    } catch {
      // The selected mode remains active for this page.
    }
  });
}