import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  Send,
  Globe,
  MessageCircle,
  CheckSquare,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  ListTodo,
  Bell,
  FileText,
  Sparkles,
  Image,
  Search,
  MessageSquare,
  FileSearch,
} from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";

interface Note {
  id: string;
  title: string;
  formatted_content: string;
  raw_transcript: string;
  source: "telegram" | "web" | "whatsapp";
  created_at: string;
  has_action_items: boolean;
  has_calendar_event: boolean;
}

interface Delivery {
  id: string;
  provider: string;
  status: "pending" | "success" | "failed";
  delivered_at: string | null;
  error_message: string | null;
  created_at: string;
}

function renderFormattedContent(content: string) {
  const parts = content.split(/(\*\*.+?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: note } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (!note) return notFound();

  const { data: deliveries } = await supabase
    .from("note_deliveries")
    .select("*")
    .eq("note_id", id)
    .order("created_at", { ascending: false });

  const typedNote = note as Note;
  const typedDeliveries = (deliveries || []) as Delivery[];

  const sourceConfig = {
    telegram: { icon: Send, label: "Telegram", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
    web: { icon: Globe, label: "Web", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
    whatsapp: { icon: MessageCircle, label: "WhatsApp", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30" },
  };

  const statusConfig = {
    pending: { icon: Clock, label: "Bekliyor", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
    success: { icon: CheckCircle, label: "Başarılı", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
    failed: { icon: XCircle, label: "Başarısız", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
  };

  const providerConfig: Record<string, { icon: typeof Mail; label: string; color: string; bg: string }> = {
    gmail: { icon: Mail, label: "Gmail", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
    calendar: { icon: Calendar, label: "Google Calendar", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
    todo: { icon: ListTodo, label: "Görev", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/30" },
    reminder: { icon: Bell, label: "Hatırlatma", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
    note: { icon: FileText, label: "Not", color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-900/30" },
    ai: { icon: Sparkles, label: "AI Asistan", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
    create_content: { icon: Sparkles, label: "İçerik Üretimi", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
    generate_image: { icon: Image, label: "Görsel Üretimi", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-100 dark:bg-rose-900/30" },
    web_research: { icon: Search, label: "Web Araştırma", color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-100 dark:bg-teal-900/30" },
    quick_answer: { icon: MessageSquare, label: "Hızlı Cevap", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
    analyze_document: { icon: FileSearch, label: "Döküman Analizi", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  };

  const source = sourceConfig[typedNote.source];
  const SourceIcon = source.icon;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/notes"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Notlara dön
      </Link>

      {/* Main Card */}
      <div className="relative bg-card border border-border rounded-2xl overflow-hidden">
        <BorderBeam colorFrom="#f59e0b" colorTo="#ea580c" size={80} duration={12} borderWidth={1.5} />

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border">
          <div className="flex items-start justify-between gap-2 sm:gap-4 mb-4">
            <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
              {typedNote.title}
            </h1>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl shrink-0 ${source.bg}`}>
              <SourceIcon className={`w-4 h-4 ${source.color}`} />
              <span className={`text-xs font-semibold ${source.color}`}>
                {source.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">
                {new Date(typedNote.created_at).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {typedNote.has_action_items && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <CheckSquare className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">Aksiyon</span>
              </div>
            )}
            {typedNote.has_calendar_event && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Takvim</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
            {renderFormattedContent(typedNote.formatted_content || typedNote.raw_transcript || '')}
          </div>
        </div>

        {/* Raw Transcript */}
        {typedNote.raw_transcript && (
          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            <details className="bg-muted/50 rounded-xl p-4 border border-border">
              <summary className="cursor-pointer text-sm font-semibold text-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                Ham Transkript
              </summary>
              <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {typedNote.raw_transcript}
              </p>
            </details>
          </div>
        )}

        {/* Deliveries */}
        {typedDeliveries.length > 0 && (
          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Gönderim Durumu
            </h3>
            <div className="space-y-2">
              {typedDeliveries.map((delivery) => {
                const status = statusConfig[delivery.status];
                const StatusIcon = status.icon;
                const provider = providerConfig[delivery.provider] || providerConfig.note;
                const ProviderIcon = provider.icon;

                return (
                  <div
                    key={delivery.id}
                    className="flex items-center justify-between p-3.5 bg-muted/30 border border-border rounded-xl hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${provider.bg}`}>
                        <ProviderIcon className={`w-4 h-4 ${provider.color}`} />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-foreground">
                          {provider.label}
                        </span>
                        {delivery.error_message && (
                          <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                            {delivery.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${status.bg}`}>
                        <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                        <span className={`text-xs font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      {delivery.delivered_at && (
                        <span className="text-xs text-muted-foreground font-medium">
                          {new Date(delivery.delivered_at).toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
