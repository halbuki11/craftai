import { createClient } from "@/lib/supabase/server";
import {
  FileText,
  ListTodo,
  TrendingUp,
  ArrowRight,
  Clock,
  Sparkles,
  Zap,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { ChatInput } from "@/components/chat/chat-input";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BorderBeam } from "@/components/ui/border-beam";

async function getStats(userId: string) {
  const supabase = await createClient();

  const { count: totalNotes } = await supabase
    .from("notes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: todayNotes } = await supabase
    .from("notes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", today.toISOString());

  const { count: pendingTodos } = await supabase
    .from("todos")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "pending");

  const { data: recentNotes } = await supabase
    .from("notes")
    .select("id, title, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    totalNotes: totalNotes ?? 0,
    todayNotes: todayNotes ?? 0,
    pendingTodos: pendingTodos ?? 0,
    recentNotes: recentNotes ?? [],
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const stats = await getStats(user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hoş geldin</h1>
        <p className="text-muted-foreground mt-1">AI asistanına bir şey sor veya skill seç</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="relative bg-card border border-border rounded-2xl p-4 overflow-hidden group hover:border-amber-500/30 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground"><NumberTicker value={stats.totalNotes} /></p>
              <p className="text-xs text-muted-foreground">Not</p>
            </div>
          </div>
          <BorderBeam colorFrom="#f59e0b" colorTo="#ea580c" size={30} duration={12} borderWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="relative bg-card border border-border rounded-2xl p-4 overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground"><NumberTicker value={stats.todayNotes} /></p>
              <p className="text-xs text-muted-foreground">Bugün</p>
            </div>
          </div>
          <BorderBeam colorFrom="#10b981" colorTo="#059669" size={30} duration={12} borderWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="relative bg-card border border-border rounded-2xl p-4 overflow-hidden group hover:border-orange-500/30 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <ListTodo className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground"><NumberTicker value={stats.pendingTodos} /></p>
              <p className="text-xs text-muted-foreground">Görev</p>
            </div>
          </div>
          <BorderBeam colorFrom="#f97316" colorTo="#dc2626" size={30} duration={12} borderWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <Link href="/skills" className="relative bg-card border border-border rounded-2xl p-4 overflow-hidden group hover:border-purple-500/30 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">15+</p>
              <p className="text-xs text-muted-foreground">Skill</p>
            </div>
          </div>
          <BorderBeam colorFrom="#a855f7" colorTo="#6366f1" size={30} duration={12} borderWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      {/* Chat - Ana Özellik */}
      <ChatInput />

      {/* Recent Notes */}
      {stats.recentNotes.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-sm font-bold text-foreground">Son Konuşmalar</h2>
            <Link href="/notes" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
              Tümü <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {stats.recentNotes.map((note: { id: string; title: string; created_at: string }) => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="flex items-center gap-3 p-3.5 hover:bg-accent/50 transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {note.title}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(note.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
