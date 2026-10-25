import { describe, expect, it } from "vitest";
import { addTask, countsFor, sortTasks, toggleTask, updateCounts, type Task } from "./tasks";

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
});

describe("sortTasks", () => {
  const tasks: Task[] = [
    { id: "1", title: "banana", done: true, createdAt: 1 },
    { id: "2", title: "Cherry", done: false, createdAt: 2 },
    { id: "3", title: "apple", done: false, createdAt: 3 },
    { id: "4", title: "date", done: true, createdAt: 4 },
  ];
  const ids = (t: Task[]) => t.map((x) => x.id);

  it("sorts oldest first", () => {
    expect(ids(sortTasks(tasks, "oldest"))).toEqual(["1", "2", "3", "4"]);
  });

  it("sorts newest first", () => {
    expect(ids(sortTasks(tasks, "newest"))).toEqual(["4", "3", "2", "1"]);
  });

  it("sorts alphabetically, ignoring case", () => {
    expect(ids(sortTasks(tasks, "alphabetical"))).toEqual(["3", "1", "2", "4"]);
  });

  it("puts incomplete tasks first when enabled, keeping the chosen order within each group", () => {
    expect(ids(sortTasks(tasks, "oldest", true))).toEqual(["2", "3", "1", "4"]);
    expect(ids(sortTasks(tasks, "newest", true))).toEqual(["3", "2", "4", "1"]);
    expect(ids(sortTasks(tasks, "alphabetical", true))).toEqual(["3", "2", "1", "4"]);
  });

  it("orders tasks with the same timestamp by insertion order", () => {
    const same: Task[] = [
      { id: "a", title: "x", done: false, createdAt: 5 },
      { id: "b", title: "y", done: false, createdAt: 5 },
    ];
    expect(ids(sortTasks(same, "oldest"))).toEqual(["a", "b"]);
    expect(ids(sortTasks(same, "newest"))).toEqual(["b", "a"]);
  });

  it("does not mutate the input", () => {
    const copy = [...tasks];
    sortTasks(tasks, "newest", true);
    expect(tasks).toEqual(copy);
  });
});
