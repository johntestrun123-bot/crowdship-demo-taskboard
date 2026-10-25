import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

afterEach(() => {
  cleanup();
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

describe("App theme toggle", () => {
  it("switches between light and dark and stores the choice", () => {
    render(<App />);
    const toggle = screen.getByTestId("theme-toggle");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(toggle.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(toggle);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect(localStorage.getItem("taskboard:theme")).toBe("dark");

    fireEvent.click(toggle);
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem("taskboard:theme")).toBe("light");
  });

  it("restores a stored preference", () => {
    localStorage.setItem("taskboard:theme", "dark");
    render(<App />);
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
