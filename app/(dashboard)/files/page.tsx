"use client";

import { useEffect, useState } from "react";
import { FileText, ImageIcon, Loader2, MessageSquare } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface FileUpload {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  note_id: string | null;
  created_at: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function FilesPage() {
  const { t, locale } = useI18n();
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/files")
      .then((r) => r.json())
      .then((data) => setFiles(data.files || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white/90">{t("files.title")}</h1>
        <p className="text-white/50 mt-1">{t("files.desc")}</p>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-sm text-white/30">{t("files.noFiles")}</p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="divide-y divide-white/[0.06]">
            {files.map((file) => {
              const isImage = file.file_type.startsWith("image/");
              return (
                <div key={file.id} className="flex items-center gap-3 p-4 hover:bg-white/[0.03] transition-colors">
                  <div className={`p-2.5 rounded-xl ${isImage ? "bg-violet-500/10" : "bg-indigo-500/10"}`}>
                    {isImage ? (
                      <ImageIcon className="w-5 h-5 text-violet-400" />
                    ) : (
                      <FileText className="w-5 h-5 text-indigo-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90 truncate">{file.file_name}</p>
                    <p className="text-xs text-white/40">
                      {file.file_type} · {formatSize(file.file_size)} · {new Date(file.created_at).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  {file.note_id && (
                    <button
                      onClick={() => {
                        window.location.href = `/?chat=${file.note_id}`;
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/40 hover:text-white/80 hover:bg-white/[0.05] rounded-lg transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {t("files.openChat")}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
