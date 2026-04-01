"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, X, MessageSquare, CreditCard, LogIn, LogOut, Loader2, Zap, Trash2, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

interface GroupedConversations {
  label: string;
  conversations: Conversation[];
}

function groupConversationsByDate(conversations: Conversation[], labels: { today: string; yesterday: string; thisWeek: string; older: string }): GroupedConversations[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups: Record<string, Conversation[]> = {
    [labels.today]: [],
    [labels.yesterday]: [],
    [labels.thisWeek]: [],
    [labels.older]: [],
  };

  for (const conv of conversations) {
    const date = new Date(conv.created_at);
    if (date >= today) {
      groups[labels.today].push(conv);
    } else if (date >= yesterday) {
      groups[labels.yesterday].push(conv);
    } else if (date >= weekAgo) {
      groups[labels.thisWeek].push(conv);
    } else {
      groups[labels.older].push(conv);
    }
  }

  return Object.entries(groups)
    .filter(([, convs]) => convs.length > 0)
    .map(([label, conversations]) => ({ label, conversations }));
}

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  onNewChat?: () => void;
  onLoadChat?: (id: string) => void;
}

function formatTokens(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

export function Sidebar({ open, onClose, onNewChat, onLoadChat }: SidebarProps) {
  const { t } = useI18n();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tokensRemaining, setTokensRemaining] = useState(0);
  const [tokensTotal, setTokensTotal] = useState(0);
  const [planName, setPlanName] = useState("Free");

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  // Fetch user info + tokens
  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        setIsLoggedIn(!!data.user);
        if (data.user) {
          fetch("/api/credits").then(r => r.json()).then(d => {
            setTokensRemaining(d.balance?.credits_remaining || 0);
            setTokensTotal(d.balance?.credits_total || 0);
            setPlanName(d.subscription?.plan_id || "free");
          }).catch(() => {});
        }
      });
    });
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Refresh when a new message is sent
  useEffect(() => {
    const handleRefresh = () => {
      setTimeout(fetchConversations, 2000);
      // Also refresh token count
      if (isLoggedIn) {
        setTimeout(() => {
          fetch("/api/credits").then(r => r.json()).then(d => {
            setTokensRemaining(d.balance?.credits_remaining || 0);
          }).catch(() => {});
        }, 3000);
      }
    };
    window.addEventListener("conversation-saved", handleRefresh);
    return () => window.removeEventListener("conversation-saved", handleRefresh);
  }, [fetchConversations, isLoggedIn]);

  const handleDeleteChat = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {}
  };

  const filtered = searchQuery
    ? conversations.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;
  const grouped = groupConversationsByDate(filtered, {
    today: t("sidebar.today"),
    yesterday: t("sidebar.yesterday"),
    thisWeek: t("sidebar.thisWeek"),
    older: t("sidebar.older"),
  });

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-[260px] bg-[#131314] transition-transform duration-300 ease-out flex flex-col pt-2",
          open ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gemini-gradient shadow-md">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-[15px] font-medium text-white/90 font-sans tracking-wide">CraftAI</span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-white/40 hover:text-white/90 hover:bg-white/[0.05] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New Chat */}
        <div className="px-3 mb-4 mt-2 flex-shrink-0">
          <button
            onClick={() => {
              onNewChat?.();
              onClose?.();
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-full bg-[#1e1f20] hover:bg-white/[0.08] text-sm font-medium text-white shadow-sm transition-colors border border-white/[0.04]"
          >
            {t("sidebar.newChat")}
            <Plus className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Search */}
        {conversations.length > 0 && (
          <div className="px-3 mb-4 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("sidebar.search")}
                className="w-full pl-9 pr-4 py-2.5 rounded-full bg-[#1e1f20] text-sm text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors border border-transparent"
              />
            </div>
          </div>
        )}

        {/* Conversation History */}
        <nav className="flex-1 overflow-y-auto px-2 scrollbar-thin">
          {loading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
            </div>
          ) : grouped.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-5 h-5 text-white/15" />
              </div>
              <p className="text-xs text-white/25 leading-relaxed whitespace-pre-line">
                {t("sidebar.noChats")}
              </p>
            </div>
          ) : (
            <div className="space-y-4 pb-2">
              {grouped.map((group) => (
                <div key={group.label}>
                  <p className="px-2 py-1 text-[11px] font-medium text-white/30 uppercase tracking-wider">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className="relative group/item"
                      >
                        <button
                          onClick={() => {
                            onLoadChat?.(conv.id);
                            onClose?.();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-[13px] text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors text-left pr-8"
                          title={conv.title}
                        >
                          <MessageSquare className="w-4 h-4 flex-shrink-0 text-white/30 group-hover/item:text-white/50" />
                          <span className="truncate">{conv.title}</span>
                        </button>
                        <button
                          onClick={(e) => handleDeleteChat(e, conv.id)}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-white/0 group-hover/item:text-white/30 hover:!text-red-400 hover:bg-red-400/10 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/[0.06] px-2.5 py-2 flex-shrink-0 space-y-1">
          {/* Token usage bar */}
          {isLoggedIn && tokensTotal > 0 && (
            <div className="px-3 py-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-medium text-white/40 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {formatTokens(tokensRemaining)} {t("sidebar.remaining")}
                </span>
                <span className="text-[10px] text-white/20 capitalize">{planName}</span>
              </div>
              <div className="w-full h-1.5 bg-[#1e1f20] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gemini-gradient rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (tokensRemaining / tokensTotal) * 100)}%` }}
                />
              </div>
            </div>
          )}

          <Link
            href="/subscription"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white/90 hover:bg-white/[0.04] transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            {t("sidebar.plans")}
          </Link>

          {isLoggedIn ? (
            <button
              onClick={async () => {
                const { createClient } = await import("@/lib/supabase/client");
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white/90 hover:bg-white/[0.04] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t("sidebar.signOut")}
            </button>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white/90 hover:bg-white/[0.04] transition-colors"
            >
              <LogIn className="w-4 h-4" />
              {t("sidebar.signIn")}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
