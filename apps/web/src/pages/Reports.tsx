import type { Task } from '../api/tasks';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate } from '../lib/format';

export interface ReportsProps {
  tasks: Task[];
}

export function Reports({ tasks }: ReportsProps) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'doing').length;
  const completionRate = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <main data-testid="reports">
      <h1 className="page-title">Reports</h1>
      <p className="page-sub">How this project is tracking.</p>

      <section className="stat-grid">
        <KpiCard label="Completion rate" value={`${completionRate}%`} accent />
        <KpiCard label="In progress" value={String(inProgress)} />
        <KpiCard label="Total tasks" value={String(total)} />
      </section>

      <table className="table" data-testid="reports-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Due</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id}>
              <td>{t.title}</td>
              <td>
                <StatusBadge status={t.status} />
              </td>
              <td className="note">{t.dueDate ? formatDate(t.dueDate) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

function KpiCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      data-testid={`kpi-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className={`stat${accent ? ' stat--accent' : ''}`}
    >
      <div className="stat__value">{value}</div>
      <div className="stat__label">{label}</div>
    </div>
  );
}
