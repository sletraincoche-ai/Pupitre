import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background lg:flex-row">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto px-5 py-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
