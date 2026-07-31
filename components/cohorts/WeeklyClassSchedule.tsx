const CLASS_DAYS = [
  { day: "Lunes", start: "20:00", end: "21:30" },
  { day: "Miércoles", start: "15:00", end: "16:30" },
  { day: "Viernes", start: "15:00", end: "16:30" },
] as const;

export default function WeeklyClassSchedule() {
  return <section aria-labelledby="class-schedule-title" className="rounded-2xl border bg-surface p-7">
    <p className="text-sm font-semibold uppercase tracking-wide text-primary">Clases</p>
    <h2 id="class-schedule-title" className="mt-2 text-2xl font-bold">Días y horarios</h2>
    <p className="mt-3 text-muted">Organizá tu semana con los encuentros regulares del módulo.</p>

    <div className="mt-6 rounded-xl border border-primary/25 bg-blue-50 p-4 dark:bg-blue-950/25">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Inicio de clases</p>
      <p className="mt-1 text-lg font-bold">Viernes 7 de agosto de 2026</p>
      <p className="mt-1 text-sm text-muted">Primer encuentro a las <time dateTime="2026-08-07T15:00:00-03:00" className="font-semibold text-foreground">15:00 horas</time>.</p>
    </div>

    <dl className="mt-4 grid gap-3 sm:grid-cols-3">
      {CLASS_DAYS.map(({ day, start, end }) => <div key={day} className="rounded-xl border bg-surface-muted/35 p-4">
        <dt className="font-semibold">{day}</dt>
        <dd className="mt-1 text-sm text-muted"><time>{start}</time> a <time>{end}</time> horas</dd>
      </div>)}
    </dl>
  </section>;
}
