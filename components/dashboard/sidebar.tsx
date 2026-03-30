"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  FileText,
  Settings,
  Sparkles as BrandIcon,
  CheckSquare,
  ChevronRight,
  X,
  MessageCircle,
  Sparkles,
  CreditCard,
  Zap,
  BarChart3,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { CreditBadge } from "@/components/credits/credit-badge";

const navItems = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "/notes", label: "Notlar", icon: FileText },
  { href: "/todos", label: "Görevler", icon: CheckSquare },
  { href: "/skills", label: "Yetenekler", icon: Zap },
  { href: "/subscription", label: "Abonelik", icon: CreditCard },
  { href: "/usage", label: "Kullanım", icon: BarChart3 },
  { href: "/settings", label: "Ayarlar", icon: Settings },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-card transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Branding */}
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
                <BrandIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">
                CraftAI
              </span>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn(
                        "h-4 w-4 transition-colors",
                        isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      {item.label}
                    </div>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 text-white/70" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Tema</span>
              <ThemeToggle />
            </div>
            <CreditBadge />
          </div>
        </div>
      </aside>
    </>
  );
}
