import { describe, expect, it } from "vitest";
import { progressPercent } from "./ProgressBar";

describe("progressPercent", () => {
  it("is 25% with 4 tasks and 1 complete", () => expect(progressPercent(1, 4)).toBe(25));
  it("is 0 when there are no tasks", () => expect(progressPercent(0, 0)).toBe(0));
  it("rounds and caps at 100", () => {
    expect(progressPercent(1, 3)).toBe(33);
    expect(progressPercent(5, 4)).toBe(100);
  });
});
