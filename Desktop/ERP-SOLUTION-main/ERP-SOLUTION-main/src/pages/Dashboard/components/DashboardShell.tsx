export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen rounded-2xl bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
}
