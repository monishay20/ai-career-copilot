import { syncUser } from "@/lib/actions/user";
import DashboardNav from "@/components/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await syncUser();

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "Inter, sans-serif" }}>
      <DashboardNav />
      <main className="min-h-[calc(100vh-56px)] max-w-6xl mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
}