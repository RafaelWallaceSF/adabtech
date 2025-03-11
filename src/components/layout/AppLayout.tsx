
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/sonner";

export function AppLayout() {
  return (
    <div className="flex min-h-screen h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="container p-6 max-w-full">
          <Outlet />
        </div>
      </main>
      <Toaster />
    </div>
  );
}
