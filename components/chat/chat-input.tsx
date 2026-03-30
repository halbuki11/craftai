"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Loader2, Paperclip, X, Zap, ChevronDown, Cpu, Crown, Copy } from "lucide-react";
import { toast } from "sonner";

interface Skill {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  defaultModel: string;
  creditMultiplier: number;
}

const MODEL_INFO: Record<string, { label: string; credits: number; icon: typeof Zap }> = {
  haiku: { label: "Haiku", credits: 1, icon: Zap },
  sonnet: { label: "Sonnet", credits: 3, icon: Cpu },
  opus: { label: "Opus", credits: 10, icon: Crown },
};

export function ChatInput() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ type: string; content: string; model?: string; creditsUsed?: number } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("sonnet");
  const [showSkills, setShowSkills] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/skills")
      .then(r => r.json())
      .then(data => setSkills(data.skills || []))
      .catch(() => {});
  }, []);

  const handleSubmit = useCallback(async () => {
    const text = message.trim();
    if (!text && !file) return;

    setSending(true);
    setResult(null);

    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        if (text) formData.append("instruction", text);

        const res = await fetch("/api/ai/analyze", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Analiz başarısız");
        }
        const data = await res.json();
        setResult({ type: "analysis", content: data.analysis });
        setFile(null);
      } else {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            model: selectedModel,
            skillId: selectedSkill || undefined,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "İşlem başarısız");
        }
        const data = await res.json();

        const creditsUsed = parseInt(res.headers.get("X-Credits-Used") || "0", 10);

        if (data.response) {
          setResult({
            type: data.type || "answer",
            content: data.response,
            model: data.model,
            creditsUsed,
          });
        } else {
          toast.success("İşlem tamamlandı");
        }
      }

      setMessage("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSending(false);
    }
  }, [message, file, selectedModel, selectedSkill]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 20 * 1024 * 1024) {
        toast.error("Dosya 20MB'dan küçük olmalı");
        return;
      }
      setFile(selected);
    }
  };

  const currentSkill = skills.find(s => s.id === selectedSkill);
  const modelInfo = MODEL_INFO[selectedModel] || MODEL_INFO.sonnet;
  const estimatedCredits = Math.ceil(modelInfo.credits * (currentSkill?.creditMultiplier || 1));

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-4 sm:p-5">
        {/* Header with selectors */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <p className="text-sm font-bold text-foreground">AI Asistan</p>
          <div className="flex-1" />

          {/* Skill selector */}
          <div className="relative">
            <button
              onClick={() => setShowSkills(!showSkills)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
            >
              <Zap className="w-3 h-3" />
              {currentSkill ? currentSkill.title : "Otomatik"}
              <ChevronDown className="w-3 h-3" />
            </button>

            {showSkills && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSkills(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 w-64 max-h-72 overflow-y-auto bg-card border border-border rounded-xl shadow-xl">
                  <button
                    onClick={() => { setSelectedSkill(""); setShowSkills(false); }}
                    className={`w-full text-left px-3 py-2.5 text-xs hover:bg-accent/50 transition-colors ${!selectedSkill ? "bg-amber-50 dark:bg-amber-950/30 font-bold" : ""}`}
                  >
                    Otomatik Tespit
                  </button>
                  {skills.map(skill => (
                    <button
                      key={skill.id}
                      onClick={() => { setSelectedSkill(skill.id); setShowSkills(false); }}
                      className={`w-full text-left px-3 py-2.5 text-xs hover:bg-accent/50 transition-colors border-t border-border ${selectedSkill === skill.id ? "bg-amber-50 dark:bg-amber-950/30 font-bold" : ""}`}
                    >
                      <span className="font-semibold text-foreground">{skill.title}</span>
                      <span className="text-muted-foreground ml-1">· {skill.creditMultiplier > 1 ? `x${skill.creditMultiplier}` : ""}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Model selector */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-2.5 py-1.5 bg-muted text-foreground rounded-lg text-xs font-semibold border-0 focus:ring-2 focus:ring-amber-500"
          >
            <option value="haiku">Haiku (1kr)</option>
            <option value="sonnet">Sonnet (3kr)</option>
            <option value="opus">Opus (10kr)</option>
          </select>

          {/* Credit estimate */}
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-lg">
            ~{estimatedCredits} kr
          </span>
        </div>

        {/* File preview */}
        {file && (
          <div className="flex items-center gap-2 mb-3 p-2.5 bg-accent/50 rounded-xl text-sm">
            <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="flex-1 truncate text-foreground text-xs">{file.name}</span>
            <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={file ? "Analiz talimatı (opsiyonel)..." : "PDF özetle, kod yaz, araştır, çevir..."}
              rows={1}
              disabled={sending}
              className="w-full resize-none rounded-xl border border-input bg-background px-3.5 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              style={{ minHeight: "46px", maxHeight: "120px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "46px";
                target.style.height = Math.min(target.scrollHeight, 120) + "px";
              }}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              className="absolute right-2.5 bottom-2.5 p-1 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              title="Dosya ekle"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={sending || (!message.trim() && !file)}
            className="flex items-center justify-center w-11 h-11 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex-shrink-0"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-4 p-4 bg-accent/30 border border-border rounded-xl">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-lg uppercase">
                {result.type === "content" ? "İçerik" :
                 result.type === "research" ? "Araştırma" :
                 result.type === "analysis" ? "Analiz" :
                 result.type === "image" ? "Görsel" :
                 "Yanıt"}
              </span>
              {result.model && (
                <span className="text-[10px] font-medium text-muted-foreground">
                  {MODEL_INFO[result.model]?.label || result.model}
                </span>
              )}
              {result.creditsUsed ? (
                <span className="text-[10px] font-medium text-muted-foreground">
                  · -{result.creditsUsed} kredi
                </span>
              ) : null}
            </div>
            <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {result.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={result.content} alt="Generated" className="rounded-xl max-w-full" />
              ) : (
                result.content
              )}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(result.content);
                toast.success("Kopyalandı");
              }}
              className="mt-3 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline"
            >
              <Copy className="w-3 h-3" />
              Kopyala
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
