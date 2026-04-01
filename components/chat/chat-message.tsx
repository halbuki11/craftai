"use client";

import { motion } from "framer-motion";
import { MarkdownRenderer } from "./markdown-renderer";
import { Copy, Check, ThumbsUp, ThumbsDown, FileText, Sparkles } from "lucide-react";
import { useState } from "react";

interface TokenInfo {
  input: number;
  output: number;
  total: number;
}

interface AttachmentInfo {
  name: string;
  type: string;
  preview?: string;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  model?: string;
  provider?: string;
  tokens?: TokenInfo;
  cost?: number;
  attachments?: AttachmentInfo[];
  isStreaming?: boolean;
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

const MODEL_LABELS: Record<string, string> = {
  haiku: "Claude 4.5 Haiku",
  sonnet: "Claude Sonnet 4.6",
  opus: "Claude Opus 4.6",
  "gpt-4o": "GPT-4o",
  "gpt-4o-mini": "GPT-4o Mini",
};

export function ChatMessage({
  role,
  content,
  model,
  provider,
  tokens,
  attachments,
  isStreaming,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex justify-end mb-6"
      >
        <div className="max-w-[85%] md:max-w-[75%]">
          {attachments && attachments.length > 0 && (
            <div className="flex gap-2 mb-2 flex-wrap justify-end">
              {attachments.map((file, i) =>
                file.preview ? (
                  <div key={i} className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-black/5 dark:border-white/10">
                    <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg">
                    <FileText className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-[12px] text-white/70">{file.name}</span>
                  </div>
                )
              )}
            </div>
          )}
          <div className="bg-[#1e1f20] rounded-[24px] px-5 py-3.5">
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-[#e3e3e3]">
              {content}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mb-8 group flex items-start gap-4"
    >
      {/* Icon for AI */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gemini-gradient shadow-sm flex items-center justify-center mt-1">
        <Sparkles className="w-4 h-4 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isStreaming && !content ? (
          <div className="flex items-center gap-1.5 py-3 h-[28px]">
            <motion.div
              className="flex gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>
          </div>
        ) : (
          <>
            <div className="text-[15px] leading-[1.7] text-white/85">
              <MarkdownRenderer content={content} />
              {isStreaming && content && (
                <motion.span
                  className="inline-block w-[6px] h-[6px] bg-white/50 rounded-full ml-1 align-middle"
                  animate={{ opacity: [1, 0.3] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
              )}
            </div>

            {/* Actions */}
            {!isStreaming && content && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-full text-white/30 hover:text-white/90 hover:bg-white/10 transition-colors"
                  title="Copy"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setLiked(liked === true ? null : true)}
                  className={`p-1.5 rounded-full transition-colors ${
                    liked === true
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-white/30 hover:text-white/90 hover:bg-white/10"
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLiked(liked === false ? null : false)}
                  className={`p-1.5 rounded-full transition-colors ${
                    liked === false
                      ? "text-red-400 bg-red-400/10"
                      : "text-white/30 hover:text-white/90 hover:bg-white/10"
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
                {(model || tokens) && (
                  <span className="text-[11px] text-white/30 ml-3 font-mono flex items-center gap-2">
                    {model && <span>{MODEL_LABELS[model] || model}</span>}
                    {tokens && (
                      <>
                        <span>•</span>
                        <span>{formatTokens(tokens.total)} tokens</span>
                      </>
                    )}
                  </span>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
