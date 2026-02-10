import DashboardShell from "../components/DashboardShell";

export default function DebtDashboardPage() {
  return (
    <DashboardShell>
      <div className="rounded-2xl glass border border-slate-200 p-6 ">
        <div className="text-xl font-extrabold text-white">Qarzdorlik dashboard</div>
        <div className="mt-2 text-sm text-white">
          Hozircha demo. Keyin backend bilan qarzlar, to‘lovlar, grafiklar qo‘shamiz.
        </div>
      </div>
    </DashboardShell>
  );
}
