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

export const metadata: Metadata = {
  title: "Notes",
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

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return noteDate.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

const sourceConfig: Record<string, { icon: typeof Sparkles; label: string; color: string; bg: string }> = {
  web: { icon: Sparkles, label: "Web", color: "text-violet-400", bg: "bg-violet-500/10" },
  api: { icon: Sparkles, label: "API", color: "text-indigo-400", bg: "bg-indigo-500/10" },
};
const defaultSource = { icon: Sparkles, label: "AI", color: "text-violet-400", bg: "bg-violet-500/10" };

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
          <h1 className="text-2xl font-bold text-white/90">Notes</h1>
          <p className="text-white/50 mt-1">
            Notes generated from your messages
          </p>
        </div>
      </div>

      {/* Stats */}
      {totalNotes > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-500/10 rounded-xl">
                <FileText className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white/90">
                  {totalNotes}
                </p>
                <p className="text-sm text-white/50">Total Notes</p>
              </div>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white/90">
                  {todayNotes}
                </p>
                <p className="text-sm text-white/50">Today</p>
              </div>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-500/10 rounded-xl">
                <CheckSquare className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white/90">
                  {withActions}
                </p>
                <p className="text-sm text-white/50">With Actions</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {!notes || notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-violet-500/10 rounded-3xl flex items-center justify-center mb-6 mx-auto">
            <Sparkles className="w-10 h-10 text-violet-400" />
          </div>
          <h2 className="text-xl font-bold text-white/90 mb-2">
            No notes yet
          </h2>
          <p className="text-white/50 max-w-sm mb-6">
            Send a message to the AI assistant to create your first note
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1E1F23] font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-4 h-4" />
            Send Message
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {notes.map((note: Note) => {
            const config = sourceConfig[note.source] || defaultSource;
            const SourceIcon = config.icon;

            return (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="group bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300"
              >
                {/* Source badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${config.bg}`}>
                    <SourceIcon className={`w-3.5 h-3.5 ${config.color}`} />
                    <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {note.has_action_items && (
                      <div className="p-1.5 bg-violet-500/10 rounded-lg" title="Has tasks">
                        <CheckSquare className="w-3.5 h-3.5 text-violet-400" />
                      </div>
                    )}
                    {note.has_calendar_event && (
                      <div className="p-1.5 bg-indigo-500/10 rounded-lg" title="Calendar event">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-white/90 mb-4 line-clamp-2 group-hover:text-violet-400 transition-colors">
                  {note.title}
                </h3>

                {/* Footer */}
                <div className="flex items-center gap-2 text-white/40">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs">{formatRelativeTime(note.created_at)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
