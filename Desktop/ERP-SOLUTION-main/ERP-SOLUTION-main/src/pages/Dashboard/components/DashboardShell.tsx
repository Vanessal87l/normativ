export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen rounded-2xl glass">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
}
