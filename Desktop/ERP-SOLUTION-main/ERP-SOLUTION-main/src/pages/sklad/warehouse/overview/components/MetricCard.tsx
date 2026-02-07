type Props = {
  title: string
  value: string
  sub?: string
  icon?: string
}

export default function MetricCard({ title, value, sub, icon = "📦" }: Props) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-slate-500">{title}</div>
        <div className="text-lg">{icon}</div>
      </div>

      <div className="mt-2 text-2xl font-extrabold text-slate-900">{value}</div>
      {sub ? <div className="mt-1 text-xs text-slate-500">{sub}</div> : null}
    </div>
  )
}
