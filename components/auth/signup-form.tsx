"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles, Loader2, Mail, Lock, UserPlus } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Şifreler eşleşmiyor");
      return;
    }

    if (password.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Hesabınızı onaylamak için e-postanızı kontrol edin");
      router.push("/login");
    } catch {
      toast.error("Beklenmeyen bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo & Branding */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-4 shadow-lg shadow-amber-500/25">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">CraftAI</h1>
        <p className="text-muted-foreground mt-2">Yeni hesap oluşturun</p>
      </div>

      {/* Form Card */}
      <div className="relative bg-card border border-border rounded-3xl p-8 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              E-posta
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="pl-10 h-12 bg-background rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Şifre
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pl-10 h-12 bg-background rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Şifre Tekrar
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pl-10 h-12 bg-background rounded-xl"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 rounded-xl text-base"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Hesap oluşturuluyor...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Kayıt Ol
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Zaten hesabınız var mı?{" "}
            <Link
              href="/login"
              className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              Giriş yapın
            </Link>
          </p>
        </div>

        <BorderBeam colorFrom="#f59e0b" colorTo="#ea580c" size={80} duration={10} borderWidth={1.5} />
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground mt-6">
        Kayıt olarak Kullanım Koşulları ve Gizlilik Politikası&apos;nı kabul etmiş olursunuz.
      </p>
    </div>
  );
}
