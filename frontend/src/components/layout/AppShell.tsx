import { ToastContainer } from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";
import { Navigate, Outlet } from "react-router-dom";
import { MobileSidebar, Sidebar } from "./Sidebar";

export default function AppShell() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-svh bg-background font-sans">
      <Sidebar />
      <MobileSidebar />

      <main className="flex-1 overflow-auto lg:pl-0 pl-0">
        <div className="lg:px-8 px-4 py-6 lg:pt-6 pt-14 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      <ToastContainer />
    </div>
  );
}
