const themes = {
  blue: "var(--pui-color-blue-600)",
  teal: "var(--pui-color-teal-700)",
  violet: "var(--pui-color-violet-700)",
  orange: "var(--pui-color-orange-700)",
} as const;

const storageKey = "pui-primary-scheme";
const themeSelect = document.querySelector<HTMLSelectElement>("[data-primary-scheme]");

if (themeSelect) {
  const applyTheme = (name: string) => {
    if (!Object.hasOwn(themes, name)) return false;

    document.documentElement.style.setProperty(
      "--pui-color-primary-main",
      themes[name as keyof typeof themes],
    );
    themeSelect.value = name;
    return true;
  };

  let savedTheme: string | null = null;
  try {
    savedTheme = localStorage.getItem(storageKey);
  } catch {
    // The control still works when storage is unavailable.
  }

  applyTheme(savedTheme ?? themeSelect.value);
  themeSelect.addEventListener("change", () => {
    const name = themeSelect.value;
    if (!applyTheme(name)) return;

    try {
      localStorage.setItem(storageKey, name);
    } catch {
      // The selected scheme remains active for this page.
    }
  });
}