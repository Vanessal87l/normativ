import { getUserName } from "@/shared/useMe"

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const userName = getUserName()

  return (
    <div className="min-h-screen rounded-2xl bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-2xl font-extrabold text-slate-900">
          Xush kelibsiz, {userName}!
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
