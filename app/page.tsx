import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  Code,
  Globe,
  PenTool,
  Calculator,
  Palette,
  Search,
  Zap,
  Shield,
  Crown,
  Cpu,
  BarChart3,
  CreditCard,
} from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { WordRotate } from "@/components/ui/word-rotate";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Marquee } from "@/components/ui/marquee";
import { BorderBeam } from "@/components/ui/border-beam";
import { HeroParticles } from "@/components/hero-particles";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  const skills = [
    { icon: FileText, title: "PDF Özetleme", desc: "Dokümanları analiz et, özet çıkar", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950" },
    { icon: Code, title: "Kod Yardımcısı", desc: "Kod yaz, düzelt, açıkla", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950" },
    { icon: PenTool, title: "İçerik Yazarı", desc: "Blog, LinkedIn, tweet üret", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950" },
    { icon: Globe, title: "Çevirmen", desc: "97+ dilde profesyonel çeviri", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950" },
    { icon: Search, title: "Araştırmacı", desc: "Detaylı araştırma ve rapor", color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-950" },
    { icon: Calculator, title: "Soru Çözücü", desc: "Matematik ve fen soruları", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950" },
    { icon: Palette, title: "Beyin Fırtınası", desc: "Yaratıcı fikirler üret", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950" },
    { icon: Shield, title: "Metin İnceleme", desc: "Sözleşme ve doküman analizi", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950" },
    { icon: BarChart3, title: "Veri Analisti", desc: "Veri ve istatistik analizi", color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950" },
  ];

  const plans = [
    { name: "Ücretsiz", price: "0", credits: "50", models: ["Haiku"], color: "from-gray-500 to-gray-600", popular: false },
    { name: "Starter", price: "9", credits: "500", models: ["Haiku", "Sonnet"], color: "from-amber-500 to-orange-600", popular: false },
    { name: "Pro", price: "29", credits: "2.000", models: ["Haiku", "Sonnet", "Opus"], color: "from-purple-500 to-indigo-600", popular: true },
    { name: "Business", price: "99", credits: "10.000", models: ["Haiku", "Sonnet", "Opus"], color: "from-emerald-500 to-teal-600", popular: false },
  ];

  const marqueeItems = [
    { icon: FileText, label: "PDF Özetle" },
    { icon: Code, label: "Kod Yaz" },
    { icon: PenTool, label: "İçerik Üret" },
    { icon: Globe, label: "Çevir" },
    { icon: Search, label: "Araştır" },
    { icon: Calculator, label: "Soru Çöz" },
    { icon: Palette, label: "Fikir Üret" },
    { icon: Shield, label: "Analiz Et" },
    { icon: BarChart3, label: "Veri İncele" },
    { icon: CreditCard, label: "Kredi Yönet" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">CraftAI</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {isLoggedIn ? (
              <Link
                href="/notes"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-foreground hover:text-amber-600 transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Ücretsiz Başla
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <HeroParticles />
        <div className="relative max-w-6xl mx-auto px-4 pt-24 pb-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full mb-8 border border-amber-500/20">
            <AnimatedShinyText className="text-sm font-medium">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Claude AI ile güçlendirilmiş platform
              </span>
            </AnimatedShinyText>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-tight mb-2">
            AI ile
          </h1>
          <div className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <WordRotate
              words={[
                "PDF özetle.",
                "kod yaz.",
                "içerik üret.",
                "araştırma yap.",
                "soru çöz.",
                "çeviri yap.",
              ]}
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent"
              duration={2500}
            />
          </div>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Tek platform, sınırsız AI yeteneği. Skill seç, model belirle,
            kredini kullan — gerisini AI halletsin.
          </p>

          {/* CTA */}
          <div className="flex items-center justify-center gap-4 mb-20">
            <Link href={isLoggedIn ? "/notes" : "/signup"}>
              <ShimmerButton
                background="linear-gradient(135deg, #d97706, #ea580c)"
                shimmerColor="#fbbf24"
                shimmerSize="0.05em"
                borderRadius="12px"
                className="px-8 py-4 text-base font-semibold shadow-lg shadow-amber-500/25"
              >
                <span className="flex items-center gap-2">
                  {isLoggedIn ? "Dashboard'a Git" : "Ücretsiz Başla"}
                  <ArrowRight className="w-5 h-5" />
                </span>
              </ShimmerButton>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                <NumberTicker value={15} />
                <span className="text-amber-500">+</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">AI Yeteneği</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                <NumberTicker value={3} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">Claude Model</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                <NumberTicker value={50} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">Ücretsiz Kredi</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
          Nasıl Çalışır?
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          Üç adımda AI yeteneklerini kullanmaya başla
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              step: "1",
              icon: Zap,
              title: "Skill seç",
              desc: "15+ AI yeteneğinden ihtiyacına uygun olanı seç veya otomatik tespit ettir.",
              color: "text-amber-500",
              bg: "bg-amber-100 dark:bg-amber-900/30",
            },
            {
              step: "2",
              icon: Cpu,
              title: "Model belirle",
              desc: "Haiku (hızlı), Sonnet (dengeli) veya Opus (güçlü) modelini seç.",
              color: "text-orange-500",
              bg: "bg-orange-100 dark:bg-orange-900/30",
            },
            {
              step: "3",
              icon: Sparkles,
              title: "Sonucu al",
              desc: "AI mesajını işlesin, kredinden düşsün, sonucunu anında al.",
              color: "text-emerald-500",
              bg: "bg-emerald-100 dark:bg-emerald-900/30",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="relative p-6 bg-card border border-border rounded-2xl text-left overflow-hidden"
            >
              <BorderBeam colorFrom="#f59e0b" colorTo="#ea580c" size={60} duration={8} borderWidth={2} />
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">
                  ADIM {item.step}
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
          AI Yetenekleri
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          Her biri uzman bir AI asistanı — ihtiyacına göre seç
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {skills.map((f) => (
            <div
              key={f.title}
              className="group p-5 bg-card border border-border rounded-2xl hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300"
            >
              <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Models */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
          Claude AI Modelleri
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          İhtiyacına göre hız ve güç arasında seç
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { name: "Haiku 4.5", credits: "1", icon: Zap, desc: "Hızlı ve ekonomik. Basit görevler için ideal.", color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30", gradient: "from-emerald-500 to-teal-600" },
            { name: "Sonnet 4.6", credits: "3", icon: Cpu, desc: "Dengeli performans. Çoğu görev için önerilen.", color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30", gradient: "from-amber-500 to-orange-600" },
            { name: "Opus 4.6", credits: "10", icon: Crown, desc: "En güçlü model. Karmaşık analiz için.", color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30", gradient: "from-purple-500 to-indigo-600" },
          ].map((model) => (
            <div key={model.name} className="relative bg-card border border-border rounded-2xl p-6 text-center overflow-hidden group hover:border-amber-500/30 transition-colors">
              <div className={`w-14 h-14 ${model.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <model.icon className={`w-7 h-7 ${model.color}`} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">{model.name}</h3>
              <p className={`text-sm font-bold ${model.color} mb-3`}>{model.credits} kredi/istek</p>
              <p className="text-xs text-muted-foreground">{model.desc}</p>
              <BorderBeam colorFrom="#f59e0b" colorTo="#ea580c" size={40} duration={12} borderWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </section>

      {/* Marquee */}
      <section className="py-12 border-y border-border bg-card/50">
        <Marquee pauseOnHover className="[--duration:30s]">
          {marqueeItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 px-5 py-2.5 bg-background border border-border rounded-full text-sm font-medium text-foreground mx-2"
            >
              <item.icon className="w-4 h-4 text-amber-500" />
              {item.label}
            </div>
          ))}
        </Marquee>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
          Fiyatlandırma
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          İhtiyacına uygun planı seç, hemen başla
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-card border rounded-2xl overflow-hidden ${
                plan.popular ? "border-amber-500 shadow-lg shadow-amber-500/10" : "border-border"
              }`}
            >
              {plan.popular && (
                <BorderBeam colorFrom="#f59e0b" colorTo="#ea580c" size={60} duration={8} borderWidth={1.5} />
              )}
              <div className={`bg-gradient-to-r ${plan.color} px-4 py-3`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{plan.name}</span>
                  {plan.popular && (
                    <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full text-white">
                      Popüler
                    </span>
                  )}
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <span className="text-3xl font-bold text-foreground">
                    {plan.price === "0" ? "Ücretsiz" : `$${plan.price}`}
                  </span>
                  {plan.price !== "0" && <span className="text-xs text-muted-foreground">/ay</span>}
                </div>
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  {plan.credits} kredi/ay
                </p>
                <div className="space-y-2">
                  {plan.models.map((m) => (
                    <div key={m} className="flex items-center gap-2 text-xs text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {m}
                    </div>
                  ))}
                </div>
                <Link
                  href={isLoggedIn ? "/subscription" : "/signup"}
                  className={`block text-center py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 ${
                    plan.popular
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {plan.price === "0" ? "Ücretsiz Başla" : "Planı Seç"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-10 md:p-16 text-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_50%)]" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Hemen başla, 50 kredi ücretsiz.
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-lg mx-auto">
              Kredi kartı gerekmez. Kayıt ol, skill seç, AI&apos;ı kullanmaya başla.
            </p>
            <Link href="/signup">
              <ShimmerButton
                background="rgba(255, 255, 255, 1)"
                shimmerColor="#f59e0b"
                shimmerSize="0.05em"
                borderRadius="12px"
                className="px-8 py-4 text-base font-semibold !text-amber-700"
              >
                <span className="flex items-center gap-2 text-amber-700">
                  Kayıt Ol
                  <ArrowRight className="w-5 h-5" />
                </span>
              </ShimmerButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">CraftAI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CraftAI. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
