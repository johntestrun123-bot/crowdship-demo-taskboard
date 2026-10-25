import { useEffect, useMemo, useState } from "react";
import {
  addTask,
  countsFor,
  loadTasks,
  saveTasks,
  SORT_MODES,
  sortTasks,
  toggleTask,
  updateCounts,
  type Counts,
  type SortMode,
  type Task,
} from "./tasks";
import { applyTheme, loadThemePreference, nextTheme, saveThemePreference, systemTheme, watchSystemTheme, type Theme } from "./theme";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [counts, setCounts] = useState<Counts>(() => countsFor(tasks));
  const [draft, setDraft] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("oldest");
  const [incompleteFirst, setIncompleteFirst] = useState(false);
  const visibleTasks = useMemo(() => sortTasks(tasks, sortMode, incompleteFirst), [tasks, sortMode, incompleteFirst]);

  const [themePreference, setThemePreference] = useState<Theme | null>(() => loadThemePreference());
  const [osTheme, setOsTheme] = useState<Theme>(() => systemTheme());
  const theme = themePreference ?? osTheme;

  useEffect(() => saveTasks(tasks), [tasks]);
  useEffect(() => watchSystemTheme(setOsTheme), []);
  useEffect(() => applyTheme(theme), [theme]);

  function onToggleTheme() {
    const next = nextTheme(theme);
    saveThemePreference(next);
    setThemePreference(next);
  }

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setTasks((t) => addTask(t, draft));
    setCounts((c) => updateCounts(c, { type: "added" }));
    setDraft("");
  }

  function onToggle(task: Task) {
    setTasks((t) => toggleTask(t, task.id));
    setCounts((c) => updateCounts(c, { type: "toggled", nowDone: !task.done }));
  }

  return (
    <main className="board">
      <header className="top">
        <div>
          <p className="eyebrow">Hackathon 2026</p>
          <h1>Event Task Board</h1>
        </div>
        <button
          type="button"
          className="theme-toggle"
          data-testid="theme-toggle"
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          aria-pressed={theme === "dark"}
          onClick={onToggleTheme}
        >
          {theme === "dark" ? "Light" : "Dark"} mode
        </button>
      </header>

      <section className="counts" aria-label="Task counts">
        <div><span data-testid="total-count">{counts.total}</span><label>Total</label></div>
        <div><span data-testid="completed-count">{counts.completed}</span><label>Done</label></div>
        <div><span data-testid="remaining-count">{counts.remaining}</span><label>Left</label></div>
      </section>

      <form className="add" onSubmit={onAdd}>
        <input
          data-testid="new-task-input"
          aria-label="New task"
          placeholder="Add a task…"
          value={draft}
          maxLength={120}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button data-testid="add-task-button" type="submit">Add</button>
      </form>

      <div className="sort" aria-label="Sort tasks">
        <label>
          <span>Sort</span>
          <select data-testid="sort-select" value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}>
            {SORT_MODES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            data-testid="incomplete-first-toggle"
            checked={incompleteFirst}
            onChange={(e) => setIncompleteFirst(e.target.checked)}
          />
          <span>Incomplete first</span>
        </label>
      </div>

      <ul className="tasks" data-testid="task-list">
        {visibleTasks.map((t) => (
          <li key={t.id} data-testid="task-item" className={t.done ? "done" : ""}>
            <label>
              <input type="checkbox" data-testid="task-checkbox" checked={t.done} onChange={() => onToggle(t)} />
              <span>{t.title}</span>
            </label>
          </li>
        ))}
      </ul>
      {tasks.length === 0 && <p className="empty" data-testid="empty-state">No tasks yet. Add one above.</p>}
    </main>
  );
}
