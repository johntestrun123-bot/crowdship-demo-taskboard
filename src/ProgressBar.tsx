export function progressPercent(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((Math.min(completed, total) / total) * 100);
}

export function ProgressBar({ completed, total }: { completed: number; total: number }) {
  if (total === 0) return null;
  const pct = progressPercent(completed, total);
  return (
    <div className="progress" data-testid="progress-bar" role="progressbar" aria-label="Tasks completed" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress-label" data-testid="progress-label">{pct}%</span>
    </div>
  );
}
