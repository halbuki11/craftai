"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  SendIcon,
  Square,
  ArrowDown,
  ChevronDown,
  Sparkles,
  Check,
  MessageSquare,
  Paperclip,
  X,
  FileText,
  ImageIcon,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { ChatMessage } from "./chat-message";
import { ChatWelcome } from "./chat-welcome";
import { useAutoResizeTextarea } from "@/components/ui/animated-ai-chat";
import { useI18n } from "@/lib/i18n/context";

export interface TokenInfo {
  input: number;
  output: number;
  total: number;
}

export interface Attachment {
  name: string;
  type: string;
  base64: string;
  preview?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  provider?: string;
  tokens?: TokenInfo;
  cost?: number;
  attachments?: Attachment[];
  timestamp: Date;
}

interface ModelDef {
  label: string;
  provider: string;
  desc: string;
  apiId: string;
}

interface SkillItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const MODELS: Record<string, ModelDef> = {
  "gpt-4o-mini": { label: "GPT-4o Mini", provider: "OpenAI", desc: "Fastest & cheapest", apiId: "gpt-4o-mini" },
  "claude-4.5-haiku": { label: "Claude 4.5 Haiku", provider: "Anthropic", desc: "Fast & efficient", apiId: "haiku" },
  "gpt-4o": { label: "GPT-4o", provider: "OpenAI", desc: "Versatile & popular", apiId: "gpt-4o" },
  "claude-sonnet-4.6": { label: "Claude Sonnet 4.6", provider: "Anthropic", desc: "Balanced performance", apiId: "sonnet" },
  "claude-opus-4.6": { label: "Claude Opus 4.6", provider: "Anthropic", desc: "Most powerful", apiId: "opus" },
};

export function ChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("claude-4.5-haiku");
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [allowedModels, setAllowedModels] = useState<string[]>([]);
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamBufferRef = useRef("");
  const rafRef = useRef<number | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const streamingContentRef = useRef("");

  // Check login status + allowed models
  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        const loggedIn = !!data.user;
        setIsLoggedIn(loggedIn);
        if (loggedIn) {
          setSelectedModel("claude-4.5-haiku");
          fetch("/api/credits").then(r => r.json()).then(d => {
            const planId = d.subscription?.plan_id || "free";
            // Fetch allowed models from plan
            const planModels: Record<string, string[]> = {
              free: ["haiku", "gpt-4o-mini"],
              starter: ["haiku", "gpt-4o-mini", "sonnet", "gpt-4o"],
              pro: ["haiku", "gpt-4o-mini", "sonnet", "gpt-4o", "opus"],
              business: ["haiku", "gpt-4o-mini", "sonnet", "gpt-4o", "opus"],
            };
            setAllowedModels(planModels[planId] || ["haiku"]);
          }).catch(() => setAllowedModels(["haiku"]));
        } else {
          setAllowedModels(["haiku"]);
        }
      });
    });
  }, []);

  // Skill command palette
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [showCommands, setShowCommands] = useState(false);
  const [activeCommand, setActiveCommand] = useState(-1);
  const [filteredSkills, setFilteredSkills] = useState<SkillItem[]>([]);
  const commandRef = useRef<HTMLDivElement>(null);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load skills
  useEffect(() => {
    fetch("/api/skills")
      .then((r) => r.json())
      .then((data) => setSkills(data.skills || []))
      .catch(() => {});
  }, []);

  // "/" command detection
  useEffect(() => {
    if (value.startsWith("/") && !value.includes(" ")) {
      const query = value.slice(1).toLowerCase();
      const matched = skills.filter(
        (s) =>
          s.id.includes(query) ||
          s.title.toLowerCase().includes(query)
      );
      setFilteredSkills(matched);
      setShowCommands(true);
      setActiveCommand(matched.length > 0 ? 0 : -1);
    } else {
      setShowCommands(false);
    }
  }, [value, skills]);

  // New chat event
  useEffect(() => {
    const handleNewChat = () => {
      setMessages([]);
      setValue("");
      setSelectedSkill("");
      setCurrentNoteId(null);
      setStreamingContent("");
      setSending(false);
      abortController?.abort();
      setAbortController(null);
      adjustHeight(true);
      window.history.replaceState({}, "", "/");
    };
    window.addEventListener("new-chat", handleNewChat);
    return () => window.removeEventListener("new-chat", handleNewChat);
  }, [abortController, adjustHeight]);

  // Load existing chat from sidebar
  useEffect(() => {
    const handleLoadChat = async (e: Event) => {
      const noteId = (e as CustomEvent).detail;
      if (!noteId) return;
      try {
        const res = await fetch(`/api/conversations/${noteId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.note) {
          setCurrentNoteId(data.note.id);
          window.history.replaceState({}, "", `/?chat=${data.note.id}`);
          const loadedMessages: Message[] = [];
          // Parse stored messages (may have multiple turns)
          const rawParts = (data.note.raw_transcript || "").split("\n---USER---\n");
          const aiParts = (data.note.formatted_content || "").split("\n---ASSISTANT---\n");

          if (rawParts.length > 1 || aiParts.length > 1) {
            // Multi-turn conversation
            for (let idx = 0; idx < Math.max(rawParts.length, aiParts.length); idx++) {
              if (rawParts[idx]) {
                loadedMessages.push({ id: crypto.randomUUID(), role: "user", content: rawParts[idx], timestamp: new Date(data.note.created_at) });
              }
              if (aiParts[idx]) {
                loadedMessages.push({ id: crypto.randomUUID(), role: "assistant", content: aiParts[idx], timestamp: new Date(data.note.created_at) });
              }
            }
          } else {
            // Single turn
            if (data.note.raw_transcript) {
              loadedMessages.push({ id: crypto.randomUUID(), role: "user", content: data.note.raw_transcript, timestamp: new Date(data.note.created_at) });
            }
            if (data.note.formatted_content) {
              loadedMessages.push({ id: crypto.randomUUID(), role: "assistant", content: data.note.formatted_content, timestamp: new Date(data.note.created_at) });
            }
          }
          setMessages(loadedMessages);
        }
      } catch {}
    };
    window.addEventListener("load-chat", handleLoadChat);
    return () => window.removeEventListener("load-chat", handleLoadChat);
  }, []);

  // Load chat from URL param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chatId = params.get("chat");
    if (chatId) {
      window.dispatchEvent(new CustomEvent("load-chat", { detail: chatId }));
    }
  }, []);

  // Auto-focus
  useEffect(() => {
    textareaRef.current?.focus();
  }, [messages.length, textareaRef]);

  const isNearBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 150;
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Only auto-scroll if user is near bottom
  useEffect(() => {
    if (isNearBottom()) scrollToBottom();
  }, [messages, scrollToBottom, isNearBottom]);

  // Scroll button
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const d = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(d > 200);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const handleStop = useCallback(() => {
    abortController?.abort();
    setAbortController(null);
    setSending(false);
  }, [abortController]);

  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback(async (files: File[]) => {
    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 20MB)`);
        continue;
      }
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const preview = file.type.startsWith("image/") ? base64 : undefined;
      setAttachments((prev) => [...prev, { name: file.name, type: file.type, base64, preview }]);
    }
  }, []);

  // Drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) addFiles(files);
  }, [addFiles]);

  // Paste from clipboard (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const imageFiles: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        e.preventDefault();
        addFiles(imageFiles);
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [addFiles]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      addFiles(Array.from(files));
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [addFiles]
  );

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const selectCommand = useCallback(
    (skill: SkillItem) => {
      setSelectedSkill(skill.id);
      setValue("");
      setShowCommands(false);
      textareaRef.current?.focus();
    },
    [textareaRef]
  );

  // Get anonymous usage count from localStorage
  const getAnonCount = useCallback(() => {
    try {
      const data = localStorage.getItem("craft_anon_usage");
      if (!data) return 0;
      const { date, count } = JSON.parse(data);
      if (date !== new Date().toISOString().slice(0, 10)) return 0;
      return count;
    } catch { return 0; }
  }, []);

  const incrementAnonCount = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    const count = getAnonCount() + 1;
    localStorage.setItem("craft_anon_usage", JSON.stringify({ date: today, count }));
    return count;
  }, [getAnonCount]);

  const handleSubmit = useCallback(
    async (text?: string) => {
      const messageText = (text || value).trim();
      if (!messageText || sending) return;

      // Anonymous limit check (client-side)
      const anonCount = getAnonCount();

      setValue("");
      adjustHeight(true);
      setSending(true);

      const currentAttachments = [...attachments];
      setAttachments([]);

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: messageText,
        attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
        timestamp: new Date(),
      };
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setStreamingContent("");
      streamingContentRef.current = "";
      streamBufferRef.current = "";

      const controller = new AbortController();
      setAbortController(controller);

      try {
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/ai/chat/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-anon-count": String(anonCount),
          },
          body: JSON.stringify({
            message: messageText,
            model: MODELS[selectedModel]?.apiId || "sonnet",
            skillId: selectedSkill || undefined,
            noteId: currentNoteId || undefined,
            history,
            attachments: currentAttachments.map((a) => ({
              name: a.name,
              type: a.type,
              data: a.base64,
            })),
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Something went wrong");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("Stream unavailable");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value: chunk } = await reader.read();
          if (done) break;

          buffer += decoder.decode(chunk, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "text") {
                // Buffer tokens, flush via rAF into lightweight streamingContent state
                streamBufferRef.current += data.content;
                if (!rafRef.current) {
                  rafRef.current = requestAnimationFrame(() => {
                    rafRef.current = null;
                    const chunk = streamBufferRef.current;
                    streamBufferRef.current = "";
                    streamingContentRef.current += chunk;
                    setStreamingContent(streamingContentRef.current);
                  });
                }
              } else if (data.type === "done") {
                // Flush remaining buffer and finalize into messages array
                if (rafRef.current) {
                  cancelAnimationFrame(rafRef.current);
                  rafRef.current = null;
                }
                const finalContent = streamBufferRef.current;
                streamBufferRef.current = "";
                if (data.noteId) {
                  setCurrentNoteId(data.noteId);
                  window.history.replaceState({}, "", `/?chat=${data.noteId}`);
                }
                // Get the full accumulated text and merge directly into messages
                const fullText = (streamingContentRef.current || "") + finalContent;
                setMessages((msgs) =>
                  msgs.map((msg, idx) =>
                    idx === msgs.length - 1 && msg.role === "assistant"
                      ? { ...msg, content: fullText, model: data.model, provider: data.provider, tokens: data.tokens, cost: data.cost }
                      : msg
                  )
                );
                setStreamingContent("");
              } else if (data.type === "error") {
                if (rafRef.current) {
                  cancelAnimationFrame(rafRef.current);
                  rafRef.current = null;
                }
                streamBufferRef.current = "";
                setStreamingContent("");
                setMessages((prev) =>
                  prev.map((msg, idx) =>
                    idx === prev.length - 1 && msg.role === "assistant"
                      ? { ...msg, content: data.content }
                      : msg
                  )
                );
              }
            } catch {}
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          const errorMessage =
            err instanceof Error ? err.message : "Something went wrong";
          toast.error(errorMessage);
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === "assistant" && !last.content)
              last.content = errorMessage;
            return updated;
          });
        }
      } finally {
        setSending(false);
        setAbortController(null);
        setSelectedSkill("");
        incrementAnonCount();
        window.dispatchEvent(new Event("conversation-saved"));
      }
    },
    [value, sending, selectedModel, selectedSkill, messages, adjustHeight]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommands) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveCommand((prev) =>
          prev < filteredSkills.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveCommand((prev) =>
          prev > 0 ? prev - 1 : filteredSkills.length - 1
        );
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        if (activeCommand >= 0 && filteredSkills[activeCommand]) {
          selectCommand(filteredSkills[activeCommand]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowCommands(false);
        setValue("");
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) handleSubmit();
    }
  };

  const currentModel = MODELS[selectedModel] || MODELS.auto;
  const activeSkill = skills.find((s) => s.id === selectedSkill);

  return (
    <div
      className="flex flex-col h-full relative overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-violet-500/10 backdrop-blur-sm border-2 border-dashed border-violet-500/30 rounded-2xl flex items-center justify-center"
          >
            <div className="text-center">
              <ImageIcon className="w-10 h-10 text-violet-400 mx-auto mb-2" />
              <p className="text-sm text-violet-300 font-medium">Drop files here</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin relative z-10">
        {messages.length === 0 ? (
          <ChatWelcome onSuggestionClick={(prompt) => {
            // If prompt starts with /, it's a skill selection
            if (prompt.startsWith("/")) {
              const skillId = prompt.slice(1).trim();
              const skill = skills.find((s) => s.id === skillId);
              if (skill) {
                selectCommand(skill);
                return;
              }
            }
            handleSubmit(prompt);
          }} />
        ) : (
          <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            {/* Export button */}
            {!sending && messages.length > 1 && (
              <div className="flex justify-end mb-3">
                <button
                  onClick={() => {
                    const text = messages.map(m => `${m.role === "user" ? "You" : "CraftAI"}:\n${m.content}`).join("\n\n---\n\n");
                    const blob = new Blob([text], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `craftai-chat-${new Date().toISOString().slice(0, 10)}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success(t("chat.exported" as any) || "Exported");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  {t("chat.exportPdf")}
                </button>
              </div>
            )}
            {messages.map((message, i) => {
              const isThisStreaming = sending && i === messages.length - 1 && message.role === "assistant";
              return (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={isThisStreaming ? streamingContent : message.content}
                  model={message.model}
                  provider={message.provider}
                  tokens={message.tokens}
                  cost={message.cost}
                  attachments={message.attachments}
                  isStreaming={isThisStreaming}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Scroll to bottom */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 w-8 h-8 rounded-full bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] shadow-lg flex items-center justify-center text-white/50 hover:text-white/90 transition-colors"
          >
            <ArrowDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="relative z-10">
        <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-[#131314] to-transparent pointer-events-none" />

        <div className="px-4 pb-5 pt-2">
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-[#1e1f20] rounded-[32px] overflow-hidden focus-within:ring-2 ring-white/10 transition-shadow shadow-gemini">
              {/* Command palette */}
              <AnimatePresence>
                {showCommands && filteredSkills.length > 0 && (
                  <motion.div
                    ref={commandRef}
                    className="absolute left-3 right-3 bottom-full mb-2 backdrop-blur-xl bg-[#111113]/95 rounded-xl z-50 shadow-2xl border border-white/[0.08] overflow-hidden"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="px-3 py-2 border-b border-white/[0.06]">
                      <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                        Skills
                      </span>
                    </div>
                    <div className="py-1 max-h-64 overflow-y-auto">
                      {filteredSkills.map((skill, index) => (
                        <motion.button
                          key={skill.id}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 text-[13px] transition-colors cursor-pointer",
                            activeCommand === index
                              ? "bg-white/[0.08] text-white"
                              : "text-white/60 hover:bg-white/[0.04]"
                          )}
                          onClick={() => selectCommand(skill)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.02 }}
                        >
                          <MessageSquare className="w-4 h-4 text-white/30 flex-shrink-0" />
                          <div className="text-left flex-1 min-w-0">
                            <div className="font-medium">{skill.title}</div>
                            <div className="text-[10px] text-white/25 truncate">
                              {skill.description}
                            </div>
                          </div>
                          <span className="text-[10px] text-white/15 font-mono flex-shrink-0">
                            /{skill.id}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active skill badge */}
              <AnimatePresence>
                {activeSkill && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 pt-4"
                  >
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs font-medium text-white/80">
                        {activeSkill.title}
                      </span>
                      <button
                        onClick={() => setSelectedSkill("")}
                        className="ml-1 text-white/40 hover:text-white/80 transition-colors text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Attachment previews */}
              <AnimatePresence>
                {attachments.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-3 pt-3 flex gap-2 flex-wrap"
                  >
                    {attachments.map((file, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative group"
                      >
                        {file.preview ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/[0.08]">
                            <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                            <FileText className="w-4 h-4 text-white/30" />
                            <span className="text-xs text-white/60 max-w-[120px] truncate">{file.name}</span>
                          </div>
                        )}
                        <button
                          onClick={() => removeAttachment(index)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white/70" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Textarea */}
              <div className="px-2 pt-2 pb-1">
                <textarea
                  ref={textareaRef}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    adjustHeight();
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={activeSkill ? t("chat.askSkill", { skill: activeSkill.title }) : t("chat.placeholder")}
                  disabled={sending}
                  className={cn(
                    "w-full px-4 py-3",
                    "resize-none bg-transparent border-none",
                    "text-white/95 text-base",
                    "focus:outline-none",
                    "placeholder:text-white/30",
                    "min-h-[56px] disabled:opacity-50 font-normal leading-relaxed"
                  )}
                  style={{ overflow: "hidden" }}
                />
              </div>

              {/* Bottom toolbar */}
              <div className="h-14 flex items-center">
                <div className="absolute left-4 right-4 bottom-3 flex items-center justify-between w-[calc(100%-32px)]">
                  <div className="flex items-center gap-1.5 pl-2">
                    {/* Model selector — animated with icons */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowModelMenu(!showModelMenu)}
                        className="flex items-center gap-1.5 h-8 px-3 text-sm font-medium rounded-full text-white/70 hover:bg-white/[0.08] transition-colors"
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={selectedModel}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center gap-2"
                          >
                            {currentModel.provider === "Anthropic" ? (
                              <svg fill="#fff" fillRule="evenodd" className="w-4 h-4 opacity-70" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
                              </svg>
                            ) : currentModel.provider === "OpenAI" ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 opacity-70" viewBox="0 0 256 260" fill="#fff">
                                <path d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z" />
                              </svg>
                            ) : (
                              <Sparkles className="w-4 h-4 text-white" />
                            )}
                            <span className="font-medium">{currentModel.label}</span>
                            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                          </motion.div>
                        </AnimatePresence>
                      </button>

                      <AnimatePresence>
                        {showModelMenu && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowModelMenu(false)} />
                            <motion.div
                              className="absolute left-0 bottom-full mb-2 z-50 min-w-[14rem] backdrop-blur-xl bg-gradient-to-b from-[#151517] via-[#111113] to-[#0e0e10] rounded-xl shadow-2xl border border-white/[0.08] overflow-hidden"
                              initial={{ opacity: 0, y: 5, scale: 0.97 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 5, scale: 0.97 }}
                              transition={{ duration: 0.15 }}
                            >
                              {Object.entries(MODELS).map(([id, model]) => {
                                const isLocked = allowedModels.length > 0 && !allowedModels.includes(model.apiId);
                                return (
                                  <button
                                    key={id}
                                    onClick={() => {
                                      if (isLocked) {
                                        toast.error("Upgrade your plan to use this model");
                                        return;
                                      }
                                      setSelectedModel(id);
                                      setShowModelMenu(false);
                                    }}
                                    className={cn(
                                      "w-full flex items-center justify-between gap-2 px-3 py-2.5 text-[13px] transition-colors",
                                      isLocked
                                        ? "text-white/20 cursor-not-allowed"
                                        : selectedModel === id
                                        ? "bg-white/[0.06] text-white"
                                        : "text-white/60 hover:bg-white/[0.04]"
                                    )}
                                  >
                                    <div className="flex items-center gap-2.5">
                                      {model.provider === "Anthropic" ? (
                                        <svg fill="#fff" fillRule="evenodd" className={cn("w-4 h-4", isLocked ? "opacity-15" : "opacity-50")} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
                                        </svg>
                                      ) : model.provider === "OpenAI" ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className={cn("w-4 h-4", isLocked ? "opacity-15" : "opacity-50")} viewBox="0 0 256 260" fill="#fff">
                                          <path d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Z" />
                                        </svg>
                                      ) : (
                                        <Sparkles className="w-4 h-4 text-blue-400 opacity-70" />
                                      )}
                                      <span>{model.label}</span>
                                    </div>
                                    {isLocked ? (
                                      <svg className="w-3.5 h-3.5 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0110 0v4" />
                                      </svg>
                                    ) : selectedModel === id ? (
                                      <Check className="w-4 h-4 text-blue-500" />
                                    ) : null}
                                  </button>
                                );
                              })}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="h-4 w-px bg-white/[0.08] mx-0.5" />

                    {/* File upload */}
                    <label
                      className="rounded-lg p-2 cursor-pointer text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-colors"
                      title="Attach file"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.txt,.md,.csv,.json,.doc,.docx"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Paperclip className="w-4 h-4 transition-colors" />
                    </label>

                  </div>

                {/* Send / Stop */}
                {sending ? (
                  <button
                    type="button"
                    onClick={handleStop}
                    className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.12] flex items-center justify-center transition-colors shadow-sm"
                  >
                    <Square className="w-4 h-4 text-white p-[2px] fill-white bg-white rounded-sm" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={!value.trim() && attachments.length === 0}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm",
                      value.trim() || attachments.length > 0
                        ? "bg-white text-black hover:bg-slate-200"
                        : "bg-white/[0.04] text-white/20"
                    )}
                  >
                    <SendIcon className="w-4 h-4 translate-x-[1px]" />
                  </button>
                )}
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] text-white/30 mt-4 leading-relaxed font-mono">
              {isLoggedIn === false ? (
                <span>{t("chat.signUpPrompt")}</span>
              ) : (
                t("chat.disclaimer")
              )}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
