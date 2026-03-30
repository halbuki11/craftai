import { FileText, Clock, Loader, Plug } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BorderBeam } from "@/components/ui/border-beam";

interface StatsCardsProps {
  totalNotes: number;
  processedToday: number;
  pending: number;
  integrations: number;
}

export function StatsCards({
  totalNotes,
  processedToday,
  pending,
  integrations,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Toplam Not",
      value: totalNotes,
      icon: FileText,
      description: "Tüm sesli notlar",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/30",
      beamFrom: "#f59e0b",
      beamTo: "#ea580c",
      hoverBorder: "hover:border-amber-500/30",
    },
    {
      title: "Bugün İşlenen",
      value: processedToday,
      icon: Clock,
      description: "Bugün işlenen notlar",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      beamFrom: "#10b981",
      beamTo: "#059669",
      hoverBorder: "hover:border-emerald-500/30",
    },
    {
      title: "Bekleyen",
      value: pending,
      icon: Loader,
      description: "İşlem bekliyor",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-900/30",
      beamFrom: "#f97316",
      beamTo: "#dc2626",
      hoverBorder: "hover:border-orange-500/30",
    },
    {
      title: "Entegrasyonlar",
      value: integrations,
      icon: Plug,
      description: "Aktif entegrasyonlar",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      beamFrom: "#3b82f6",
      beamTo: "#6366f1",
      hoverBorder: "hover:border-blue-500/30",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className={`relative bg-card border border-border rounded-2xl p-5 overflow-hidden group ${stat.hoverBorder} transition-colors`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 ${stat.bg} rounded-xl`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                <NumberTicker value={stat.value} />
              </p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
          </div>
          <BorderBeam
            colorFrom={stat.beamFrom}
            colorTo={stat.beamTo}
            size={40}
            duration={12}
            borderWidth={1.5}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      ))}
    </div>
  );
}
