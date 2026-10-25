export type Theme = "light" | "dark";

const THEME_KEY = "taskboard:theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function getStoredTheme(): Theme | null {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    return isTheme(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

function darkQuery(): MediaQueryList | null {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia(DARK_QUERY) : null;
}

export function getSystemTheme(): Theme {
  return darkQuery()?.matches ? "dark" : "light";
}

export function resolveTheme(stored: Theme | null, system: Theme): Theme {
  return stored ?? system;
}

export function getInitialTheme(): Theme {
  return resolveTheme(getStoredTheme(), getSystemTheme());
}

/** Calls `onChange` when the OS color scheme changes. Returns an unsubscribe function. */
export function watchSystemTheme(onChange: (theme: Theme) => void): () => void {
  const mql = darkQuery();
  if (!mql) return () => {};
  const listener = (e: MediaQueryListEvent) => onChange(e.matches ? "dark" : "light");
  mql.addEventListener("change", listener);
  return () => mql.removeEventListener("change", listener);
}

export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement) {
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}
