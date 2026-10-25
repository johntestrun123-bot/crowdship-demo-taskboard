import { useEffect, useMemo, useState } from "react";
import { addTask, countsFor, loadTasks, saveTasks, toggleTask, type Task } from "./tasks";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [draft, setDraft] = useState("");
  const counts = useMemo(() => countsFor(tasks), [tasks]);

  useEffect(() => saveTasks(tasks), [tasks]);

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setTasks((t) => addTask(t, draft));
    setDraft("");
  }

  function onToggle(task: Task) {
    setTasks((t) => toggleTask(t, task.id));
  }

  return (
    <main className="board">
      <header>
        <p className="eyebrow">Hackathon 2026</p>
        <h1>Event Task Board</h1>
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

      <ul className="tasks" data-testid="task-list">
        {tasks.map((t) => (
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
