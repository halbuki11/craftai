import { createClient } from "@/lib/supabase/server";
import { User, Mail, Calendar, Globe, Shield, Cpu } from "lucide-react";
import { TimezoneSelector } from "@/components/settings/timezone-selector";
import { ModelSelector } from "@/components/settings/model-selector";
import { BorderBeam } from "@/components/ui/border-beam";

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
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ayarlar</h1>
        <p className="text-muted-foreground mt-1">
          Hesap bilgileriniz ve bağlantılarınız
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Info */}
        <div className="relative bg-card border border-border rounded-2xl overflow-hidden group hover:border-amber-500/20 transition-colors">
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Hesap Bilgileri</h2>
                <p className="text-xs text-muted-foreground">
                  Temel hesap bilgileriniz
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3.5 border-b border-border">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm font-medium">E-posta</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {user.email}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3.5 border-b border-border">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm font-medium">Kayıt Tarihi</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {user.created_at ? formatDate(user.created_at) : "Bilinmiyor"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3.5">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm font-medium">Hesap Durumu</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Aktif
                </span>
              </div>
            </div>
          </div>

          <BorderBeam colorFrom="#f59e0b" colorTo="#ea580c" size={60} duration={12} borderWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Timezone */}
        <div className="relative bg-card border border-border rounded-2xl overflow-hidden group hover:border-amber-500/20 transition-colors">
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Saat Dilimi</h2>
                <p className="text-xs text-muted-foreground">
                  Takvim ve hatırlatmalar için saat dilimi
                </p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <TimezoneSelector currentTimezone={profile?.timezone || "Europe/Istanbul"} />
          </div>
          <BorderBeam colorFrom="#3b82f6" colorTo="#6366f1" size={60} duration={12} borderWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* AI Model */}
        <div className="relative bg-card border border-border rounded-2xl overflow-hidden group hover:border-amber-500/20 transition-colors">
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">AI Model</h2>
                <p className="text-xs text-muted-foreground">
                  Varsayılan AI modelinizi seçin
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
          <BorderBeam colorFrom="#f59e0b" colorTo="#ea580c" size={60} duration={12} borderWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

      </div>
    </div>
  );
}
