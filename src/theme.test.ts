import { afterEach, describe, expect, it, vi } from "vitest";
import { applyTheme, getInitialTheme, getStoredTheme, getSystemTheme, resolveTheme, storeTheme, watchSystemTheme } from "./theme";

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();
  const mql = {
    matches,
    addEventListener: (_: string, l: (e: MediaQueryListEvent) => void) => listeners.add(l),
    removeEventListener: (_: string, l: (e: MediaQueryListEvent) => void) => listeners.delete(l),
  };
  vi.stubGlobal("matchMedia", vi.fn(() => mql));
  return { emit: (dark: boolean) => listeners.forEach((l) => l({ matches: dark } as MediaQueryListEvent)), listeners };
}

afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("theme", () => {
  it("prefers the stored theme over the system theme", () => {
    expect(resolveTheme("light", "dark")).toBe("light");
    expect(resolveTheme("dark", "light")).toBe("dark");
    expect(resolveTheme(null, "dark")).toBe("dark");
  });

  it("persists the preference and ignores invalid stored values", () => {
    expect(getStoredTheme()).toBeNull();
    storeTheme("dark");
    expect(getStoredTheme()).toBe("dark");
    localStorage.setItem("taskboard:theme", "purple");
    expect(getStoredTheme()).toBeNull();
  });

  it("follows the system preference by default", () => {
    mockMatchMedia(true);
    expect(getSystemTheme()).toBe("dark");
    expect(getInitialTheme()).toBe("dark");
    storeTheme("light");
    expect(getInitialTheme()).toBe("light");
  });

  it("falls back to light when matchMedia is unavailable", () => {
    vi.stubGlobal("matchMedia", undefined);
    expect(getSystemTheme()).toBe("light");
  });

  it("notifies on system theme changes and unsubscribes", () => {
    const mq = mockMatchMedia(false);
    const onChange = vi.fn();
    const stop = watchSystemTheme(onChange);
    mq.emit(true);
    expect(onChange).toHaveBeenCalledWith("dark");
    stop();
    expect(mq.listeners.size).toBe(0);
  });

  it("applies the theme to the root element", () => {
    const el = document.createElement("div");
    applyTheme("dark", el);
    expect(el.dataset.theme).toBe("dark");
    expect(el.style.colorScheme).toBe("dark");
  });
});
