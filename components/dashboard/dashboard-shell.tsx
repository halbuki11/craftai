"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Menu } from "lucide-react";

interface DashboardShellProps {
  user: {
    email?: string;
    user_metadata?: {
      avatar_url?: string;
      full_name?: string;
    };
  };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 -ml-2 mr-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
            aria-label="Menüyü aç"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <Header user={user} />
        </header>
        <main className="p-3 sm:p-4 md:p-6">{children}</main>
      </div>
    </>
  );
}
