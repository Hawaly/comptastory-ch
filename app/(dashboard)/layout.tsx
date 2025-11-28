import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area - responsive margin */}
      <div className="flex-1 lg:ml-72 ml-0">
        {children}
      </div>
    </div>
  );
}


