import { createClient } from "@/lib/supabase/server";
import { User, Mail, Calendar, Globe, Shield, Cpu } from "lucide-react";
import { TimezoneSelector } from "@/components/settings/timezone-selector";
import { ModelSelector } from "@/components/settings/model-selector";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone, settings")
    .eq("id", user.id)
    .single();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white/90">Settings</h1>
        <p className="text-white/50 mt-1">
          Your account details and connections
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Info */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.1] transition-colors">
          <div className="p-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white/90">Account Info</h2>
                <p className="text-xs text-white/40">
                  Your basic account details
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3 text-white/50">
                <div className="p-1.5 bg-violet-500/10 rounded-lg">
                  <Mail className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-sm font-medium">Email</span>
              </div>
              <span className="text-sm font-semibold text-white/90">
                {user.email}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3 text-white/50">
                <div className="p-1.5 bg-violet-500/10 rounded-lg">
                  <Calendar className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-sm font-medium">Joined</span>
              </div>
              <span className="text-sm font-semibold text-white/90">
                {user.created_at ? formatDate(user.created_at) : "Unknown"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3.5">
              <div className="flex items-center gap-3 text-white/50">
                <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-sm font-medium">Status</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-emerald-400">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Timezone */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.1] transition-colors">
          <div className="p-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white/90">Timezone</h2>
                <p className="text-xs text-white/40">
                  Timezone for calendar and reminders
                </p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <TimezoneSelector currentTimezone={profile?.timezone || "Europe/Istanbul"} />
          </div>
        </div>

        {/* AI Model */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.1] transition-colors">
          <div className="p-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white/90">AI Model</h2>
                <p className="text-xs text-white/40">
                  Choose your default AI model
                </p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <ModelSelector
              currentModel={profile?.settings?.preferred_model || "sonnet"}
              allowedModels={["haiku", "sonnet", "opus"]}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
