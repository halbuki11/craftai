import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  FileText,
  Calendar,
  CheckSquare,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BorderBeam } from "@/components/ui/border-beam";

export const metadata: Metadata = {
  title: "Notlarım",
};

interface Note {
  id: string;
  title: string;
  source: "telegram" | "web" | "whatsapp";
  created_at: string;
  has_action_items: boolean;
  has_calendar_event: boolean;
}

function formatRelativeTime(date: string) {
  const now = new Date();
  const noteDate = new Date(date);
  const diffMs = now.getTime() - noteDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  return noteDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

const sourceConfig: Record<string, { icon: typeof Sparkles; label: string; color: string; bg: string }> = {
  web: { icon: Sparkles, label: "Web", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  api: { icon: Sparkles, label: "API", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
};
const defaultSource = { icon: Sparkles, label: "AI", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" };

export default async function NotesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: notes } = await supabase
    .from("notes")
    .select("id, title, source, created_at, has_action_items, has_calendar_event")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const totalNotes = notes?.length || 0;
  const todayNotes = notes?.filter(n => {
    const noteDate = new Date(n.created_at);
    const today = new Date();
    return noteDate.toDateString() === today.toDateString();
  }).length || 0;
  const withActions = notes?.filter(n => n.has_action_items).length || 0;

  return (
    <div className="space-y-8">
      <RealtimeRefresh table="notes" filter={`user_id=eq.${user.id}`} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notlarım</h1>
          <p className="text-muted-foreground mt-1">
            Sesli mesajlarından oluşturulan notlar
          </p>
        </div>
      </div>

      {/* Stats */}
      {totalNotes > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative bg-card border border-border rounded-2xl p-5 overflow-hidden group hover:border-amber-500/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  <NumberTicker value={totalNotes} />
                </p>
                <p className="text-sm text-muted-foreground">Toplam Not</p>
              </div>
            </div>
            <BorderBeam colorFrom="#f59e0b" colorTo="#ea580c" size={40} duration={12} borderWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="relative bg-card border border-border rounded-2xl p-5 overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  <NumberTicker value={todayNotes} />
                </p>
                <p className="text-sm text-muted-foreground">Bugün</p>
              </div>
            </div>
            <BorderBeam colorFrom="#10b981" colorTo="#059669" size={40} duration={12} borderWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="relative bg-card border border-border rounded-2xl p-5 overflow-hidden group hover:border-orange-500/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <CheckSquare className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  <NumberTicker value={withActions} />
                </p>
                <p className="text-sm text-muted-foreground">Aksiyonlu</p>
              </div>
            </div>
            <BorderBeam colorFrom="#f97316" colorTo="#dc2626" size={40} duration={12} borderWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      )}

      {/* Content */}
      {!notes || notes.length === 0 ? (
        <div className="relative flex flex-col items-center justify-center py-24 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent rounded-3xl" />
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-3xl flex items-center justify-center mb-6 mx-auto">
              <Sparkles className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Henüz notunuz yok
            </h2>
            <p className="text-muted-foreground max-w-sm mb-6">
              AI asistanına mesaj göndererek ilk notunuzu oluşturun
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              Mesaj Gönder
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {notes.map((note: Note, index: number) => {
            const config = sourceConfig[note.source] || defaultSource;
            const SourceIcon = config.icon;
            const isFirst = index === 0;

            return (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="group relative bg-card border border-border rounded-2xl p-5 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 overflow-hidden"
              >
                {isFirst && (
                  <BorderBeam colorFrom="#f59e0b" colorTo="#ea580c" size={60} duration={8} borderWidth={1.5} />
                )}
                {/* Source badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${config.bg}`}>
                    <SourceIcon className={`w-3.5 h-3.5 ${config.color}`} />
                    <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {note.has_action_items && (
                      <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg" title="Görev içeriyor">
                        <CheckSquare className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                      </div>
                    )}
                    {note.has_calendar_event && (
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg" title="Takvim etkinliği">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-foreground mb-4 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {note.title}
                </h3>

                {/* Footer */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs">{formatRelativeTime(note.created_at)}</span>
                </div>

                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
