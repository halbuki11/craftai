"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Mail, Crown, Shield, User, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { toast } from "sonner";

interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  role: string;
}

interface Member {
  user_id: string;
  role: string;
  joined_at: string;
  profiles: { full_name: string } | null;
}

const ROLE_ICONS: Record<string, typeof Crown> = {
  owner: Crown,
  admin: Shield,
  member: User,
};

export default function TeamPage() {
  const { t } = useI18n();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWs, setSelectedWs] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [wsName, setWsName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetch("/api/workspaces")
      .then((r) => r.json())
      .then((data) => {
        setWorkspaces(data.workspaces || []);
        if (data.workspaces?.length > 0) {
          setSelectedWs(data.workspaces[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedWs) return;
    fetch(`/api/workspaces/${selectedWs}/members`)
      .then((r) => r.json())
      .then((data) => setMembers(data.members || []));
  }, [selectedWs]);

  async function handleCreate() {
    if (!wsName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: wsName }),
      });
      const data = await res.json();
      if (data.id) {
        setWorkspaces((prev) => [...prev, { id: data.id, name: wsName, owner_id: "", role: "owner" }]);
        setSelectedWs(data.id);
        setWsName("");
        toast.success("Workspace created");
      }
    } catch {
      toast.error("Failed");
    } finally {
      setCreating(false);
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !selectedWs) return;
    setInviting(true);
    try {
      const res = await fetch(`/api/workspaces/${selectedWs}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Invite sent");
        setInviteEmail("");
      } else {
        toast.error(data.error || "Failed");
      }
    } catch {
      toast.error("Failed");
    } finally {
      setInviting(false);
    }
  }

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
        <h1 className="text-2xl font-bold text-white/90">{t("ws.title")}</h1>
        <p className="text-white/50 mt-1">{t("ws.desc")}</p>
      </div>

      {workspaces.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 text-center">
          <Users className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-sm text-white/40 mb-6">{t("ws.noWorkspace")}</p>
          <div className="max-w-sm mx-auto flex gap-2">
            <input
              type="text"
              value={wsName}
              onChange={(e) => setWsName(e.target.value)}
              placeholder={t("ws.name")}
              className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/40"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <button
              onClick={handleCreate}
              disabled={creating || !wsName.trim()}
              className="px-4 py-2.5 bg-white text-[#131314] text-sm font-semibold rounded-xl hover:bg-white/90 transition-colors disabled:opacity-40"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Workspace selector */}
          {workspaces.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => setSelectedWs(ws.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedWs === ws.id
                      ? "bg-white text-[#131314]"
                      : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06]"
                  }`}
                >
                  {ws.name}
                </button>
              ))}
            </div>
          )}

          {/* Members list */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white/90">{t("ws.members")}</h3>
              <span className="text-xs text-white/30">{members.length}</span>
            </div>
            <div className="divide-y divide-white/[0.06]">
              {members.map((m) => {
                const RoleIcon = ROLE_ICONS[m.role] || User;
                return (
                  <div key={m.user_id} className="flex items-center gap-3 p-4">
                    <div className="p-2 bg-violet-500/10 rounded-xl">
                      <RoleIcon className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white/90">
                        {m.profiles?.full_name || "Unknown"}
                      </p>
                      <p className="text-xs text-white/40 capitalize">{t(`ws.${m.role}` as any)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invite */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white/90 mb-4">{t("ws.invite")}</h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={t("ws.inviteEmail")}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/40"
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                />
              </div>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="px-5 py-2.5 bg-white text-[#131314] text-sm font-semibold rounded-xl hover:bg-white/90 transition-colors disabled:opacity-40"
              >
                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : t("ws.invite")}
              </button>
            </div>
          </div>

          {/* Create another */}
          <div className="flex gap-2">
            <input
              type="text"
              value={wsName}
              onChange={(e) => setWsName(e.target.value)}
              placeholder={t("ws.name")}
              className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/40"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <button
              onClick={handleCreate}
              disabled={creating || !wsName.trim()}
              className="px-5 py-2.5 bg-white/[0.05] text-white/70 text-sm font-medium rounded-xl hover:bg-white/[0.08] transition-colors disabled:opacity-40"
            >
              {t("ws.create")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
