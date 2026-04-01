"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isChatPage = pathname === "/";

  return (
    <>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={() => {
          if (pathname !== "/") {
            window.location.href = "/";
          } else {
            window.dispatchEvent(new Event("new-chat"));
          }
        }}
        onLoadChat={(id) => {
          if (pathname !== "/") {
            window.location.href = `/?chat=${id}`;
          } else {
            window.dispatchEvent(new CustomEvent("load-chat", { detail: id }));
          }
        }}
      />
      <div className={`md:pl-[260px] ${isChatPage ? "h-screen flex flex-col" : "min-h-screen"}`}>
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-11 items-center px-3 flex-shrink-0 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 rounded-xl text-white/40 hover:text-white/90 hover:bg-white/[0.05] transition-colors"
            aria-label="Menü"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {isChatPage ? (
          <main className="flex-1 overflow-hidden">{children}</main>
        ) : (
          <main className="p-3 sm:p-4 md:p-6">{children}</main>
        )}
      </div>
    </>
  );
}
