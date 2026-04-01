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
    telegram: { icon: Send, label: "Telegram", color: "text-violet-400", bg: "bg-violet-500/10" },
    web: { icon: Globe, label: "Web", color: "text-indigo-400", bg: "bg-indigo-500/10" },
    whatsapp: { icon: MessageCircle, label: "WhatsApp", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  };

  const statusConfig = {
    pending: { icon: Clock, label: "Pending", color: "text-white/50", bg: "bg-white/[0.05]" },
    success: { icon: CheckCircle, label: "Sent", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    failed: { icon: XCircle, label: "Failed", color: "text-red-400", bg: "bg-red-500/10" },
  };

  const providerConfig: Record<string, { icon: typeof Mail; label: string; color: string; bg: string }> = {
    gmail: { icon: Mail, label: "Gmail", color: "text-red-400", bg: "bg-red-500/10" },
    calendar: { icon: Calendar, label: "Google Calendar", color: "text-indigo-400", bg: "bg-indigo-500/10" },
    todo: { icon: ListTodo, label: "Task", color: "text-violet-400", bg: "bg-violet-500/10" },
    reminder: { icon: Bell, label: "Reminder", color: "text-violet-400", bg: "bg-violet-500/10" },
    note: { icon: FileText, label: "Note", color: "text-white/50", bg: "bg-white/[0.05]" },
    ai: { icon: Sparkles, label: "AI Assistant", color: "text-violet-400", bg: "bg-violet-500/10" },
    create_content: { icon: Sparkles, label: "Content Generation", color: "text-violet-400", bg: "bg-violet-500/10" },
    generate_image: { icon: Image, label: "Image Generation", color: "text-indigo-400", bg: "bg-indigo-500/10" },
    web_research: { icon: Search, label: "Web Research", color: "text-indigo-400", bg: "bg-indigo-500/10" },
    quick_answer: { icon: MessageSquare, label: "Quick Answer", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    analyze_document: { icon: FileSearch, label: "Document Analysis", color: "text-violet-400", bg: "bg-violet-500/10" },
  };

  const source = sourceConfig[typedNote.source];
  const SourceIcon = source.icon;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/notes"
        className="inline-flex items-center gap-2 text-sm font-medium text-white/50 hover:text-violet-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Notes
      </Link>

      {/* Main Card */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/[0.06]">
          <div className="flex items-start justify-between gap-2 sm:gap-4 mb-4">
            <h1 className="text-lg sm:text-xl font-bold text-white/90 leading-tight">
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
            <div className="flex items-center gap-1.5 text-white/40">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">
                {new Date(typedNote.created_at).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {typedNote.has_action_items && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/10 rounded-lg">
                <CheckSquare className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs font-semibold text-violet-400">Action</span>
              </div>
            )}
            {typedNote.has_calendar_event && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-semibold text-indigo-400">Calendar</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="prose prose-sm prose-invert max-w-none text-white/70 leading-relaxed">
            {renderFormattedContent(typedNote.formatted_content || typedNote.raw_transcript || '')}
          </div>
        </div>

        {/* Raw Transcript */}
        {typedNote.raw_transcript && (
          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            <details className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
              <summary className="cursor-pointer text-sm font-semibold text-white/70 hover:text-violet-400 transition-colors">
                Raw Transcript
              </summary>
              <p className="mt-3 text-sm text-white/50 whitespace-pre-wrap leading-relaxed">
                {typedNote.raw_transcript}
              </p>
            </details>
          </div>
        )}

        {/* Deliveries */}
        {typedDeliveries.length > 0 && (
          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            <h3 className="text-sm font-bold text-white/90 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Delivery Status
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
                    className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${provider.bg}`}>
                        <ProviderIcon className={`w-4 h-4 ${provider.color}`} />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white/90">
                          {provider.label}
                        </span>
                        {delivery.error_message && (
                          <p className="text-xs text-red-400 mt-0.5">
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
                        <span className="text-xs text-white/40 font-medium">
                          {new Date(delivery.delivered_at).toLocaleTimeString("en-US", {
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
