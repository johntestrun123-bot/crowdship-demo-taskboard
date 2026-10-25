import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import App from "./App";
import { applyTheme, loadThemePreference, nextTheme, saveThemePreference, systemTheme, THEME_KEY, watchSystemTheme } from "./theme";

type Listener = (e: MediaQueryListEvent) => void;
let systemDark = false;
let listeners: Listener[] = [];

function setSystemDark(dark: boolean) {
  systemDark = dark;
  listeners.forEach((l) => l({ matches: dark } as MediaQueryListEvent));
}

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  systemDark = false;
  listeners = [];
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() { return query === "(prefers-color-scheme: dark)" && systemDark; },
    media: query,
    addEventListener: (_: string, l: Listener) => listeners.push(l),
    removeEventListener: (_: string, l: Listener) => { listeners = listeners.filter((x) => x !== l); },
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("theme helpers", () => {
  it("returns null when no valid preference is saved", () => {
    expect(loadThemePreference()).toBeNull();
    localStorage.setItem(THEME_KEY, "purple");
    expect(loadThemePreference()).toBeNull();
  });

  it("round-trips a saved preference", () => {
    saveThemePreference("dark");
    expect(loadThemePreference()).toBe("dark");
  });

  it("reads and watches the system preference", () => {
    expect(systemTheme()).toBe("light");
    systemDark = true;
    expect(systemTheme()).toBe("dark");
    const seen: string[] = [];
    const stop = watchSystemTheme((t) => seen.push(t));
    setSystemDark(false);
    stop();
    setSystemDark(true);
    expect(seen).toEqual(["light"]);
  });

  it("falls back to light when matchMedia is unavailable", () => {
    vi.stubGlobal("matchMedia", undefined);
    expect(systemTheme()).toBe("light");
    expect(() => watchSystemTheme(() => {})()).not.toThrow();
  });

  it("applies and flips the theme", () => {
    applyTheme("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(nextTheme("dark")).toBe("light");
    expect(nextTheme("light")).toBe("dark");
  });
});

describe("App theme toggle", () => {
  it("follows the system preference by default, including live changes", () => {
    systemDark = true;
    render(<App />);
    expect(document.documentElement.dataset.theme).toBe("dark");
    act(() => setSystemDark(false));
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
  });

  it("toggles and persists the user's choice, which then overrides the system", () => {
    render(<App />);
    const toggle = screen.getByTestId("theme-toggle");
    expect(toggle.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(toggle);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");

    act(() => setSystemDark(false));
    expect(document.documentElement.dataset.theme).toBe("dark");

    fireEvent.click(toggle);
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem(THEME_KEY)).toBe("light");
  });

  it("restores a saved preference on load", () => {
    saveThemePreference("dark");
    render(<App />);
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
