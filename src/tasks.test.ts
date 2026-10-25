import { describe, expect, it } from "vitest";
import { addTask, countsFor, toggleTask, updateCounts } from "./tasks";

describe("tasks", () => {
  it("adds trimmed tasks and ignores blanks", () => {
    const t = addTask(addTask([], "  hello "), "   ");
    expect(t).toHaveLength(1);
    expect(t[0]!.title).toBe("hello");
  });

  it("toggles completion", () => {
    const t = addTask([], "a");
    expect(toggleTask(t, t[0]!.id)[0]!.done).toBe(true);
  });

  it("counts tasks", () => {
    const t = toggleTask(addTask(addTask([], "a"), "b"), addTask([], "a")[0]!.id);
    expect(countsFor(t).total).toBe(2);
  });

  it("updates counters when tasks are added and completed", () => {
    let c = { total: 0, completed: 0, remaining: 0 };
    c = updateCounts(c, { type: "added" });
    c = updateCounts(c, { type: "toggled", nowDone: true });
    expect(c).toEqual({ total: 1, completed: 1, remaining: 0 });
  });

  it("decrements completed when a task is un-completed", () => {
    let c = { total: 1, completed: 0, remaining: 1 };
    const before = c;
    c = updateCounts(c, { type: "toggled", nowDone: true });
    c = updateCounts(c, { type: "toggled", nowDone: false });
    expect(c).toEqual(before);
  });

  it("derives counts from the current task list after complete/un-complete", () => {
    const tasks = addTask(addTask([], "a"), "b");
    const id = tasks[0]!.id;
    const before = countsFor(tasks);
    const done = toggleTask(tasks, id);
    expect(countsFor(done)).toEqual({ total: 2, completed: 1, remaining: 1 });
    expect(countsFor(toggleTask(done, id))).toEqual(before);
  });
});
