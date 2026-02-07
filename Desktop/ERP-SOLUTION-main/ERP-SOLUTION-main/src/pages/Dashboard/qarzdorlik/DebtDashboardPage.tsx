import DashboardShell from "../components/DashboardShell";

export default function DebtDashboardPage() {
  return (
    <DashboardShell>
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="text-xl font-extrabold text-slate-900">Qarzdorlik dashboard</div>
        <div className="mt-2 text-sm text-slate-500">
          Hozircha demo. Keyin backend bilan qarzlar, to‘lovlar, grafiklar qo‘shamiz.
        </div>
      </div>
    </DashboardShell>
  );
}
