import Link from "next/link";
import { Sparkles, Zap, Brain, Code, Globe, ArrowRight, Check, Star, MessageSquare, PenLine, Search, Mail } from "lucide-react";

export const metadata = {
  title: "CraftAI — Claude + GPT in One Platform",
  description: "Stop paying $40/month for ChatGPT and Claude separately. Get both AI models with 20 expert skills for writing, coding, research, and more. Free to start.",
  openGraph: {
    title: "CraftAI — Claude + GPT in One Platform",
    description: "Two AI giants, one platform, $19/month. 20 expert skills included.",
    url: "https://aimaa.cloud",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CraftAI — Claude + GPT in One Platform",
    description: "Two AI giants, one platform, $19/month.",
  },
};

const SKILLS_PREVIEW = [
  { name: "Content Writer", icon: PenLine, color: "text-pink-400" },
  { name: "Code Writer", icon: Code, color: "text-emerald-400" },
  { name: "Research", icon: Search, color: "text-blue-400" },
  { name: "Email Assistant", icon: Mail, color: "text-amber-400" },
  { name: "Translator", icon: Globe, color: "text-teal-400" },
  { name: "Math Solver", icon: Brain, color: "text-cyan-400" },
];

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Claude + GPT, One Chat",
    desc: "Switch between Claude Sonnet and GPT-4o mid-conversation. Compare outputs. Use the best model for each task.",
  },
  {
    icon: Brain,
    title: "20 Expert Skills",
    desc: "Not just a chatbot. Specialized skills for content writing, coding, research, email drafting, translation, and more.",
  },
  {
    icon: Zap,
    title: "Real-time Streaming",
    desc: "Watch AI think in real time. Smooth token-by-token streaming with markdown, code blocks, and LaTeX rendering.",
  },
  {
    icon: Globe,
    title: "Works in Any Language",
    desc: "Full Turkish and English UI. AI auto-detects your language and responds naturally. 97+ languages supported.",
  },
];

const COMPARISON = [
  { feature: "Claude Sonnet 4.6", us: true, chatgpt: false, claude: true },
  { feature: "GPT-4o", us: true, chatgpt: true, claude: false },
  { feature: "20 Expert Skills", us: true, chatgpt: false, claude: false },
  { feature: "Both AI models", us: true, chatgpt: false, claude: false },
  { feature: "Price", usText: "$19/mo", chatgptText: "$20/mo", claudeText: "$20/mo" },
];

const FAQ = [
  {
    q: "How is this different from ChatGPT or Claude?",
    a: "ChatGPT only gives you GPT models. Claude only gives you Claude models. CraftAI gives you both in one place, plus 20 specialized skills that make the AI much better at specific tasks like writing, coding, and research.",
  },
  {
    q: "What are Skills?",
    a: "Skills are expert prompts that transform the AI into a specialist. Instead of a generic chatbot, you get a professional content writer, a code reviewer, a math tutor, or an email drafter — each optimized for that specific task.",
  },
  {
    q: "Is the free plan really free?",
    a: "Yes. 50,000 tokens per month with Claude Haiku and GPT-4o Mini. No credit card required. Enough for ~100 conversations.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no commitments. Cancel your Pro plan anytime from the settings page.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[var(--background)]/80 border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-6 py-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-semibold">CraftAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-full text-xs text-teal-300 mb-8">
            <Sparkles className="w-3 h-3" />
            Claude + GPT-4o — one subscription
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
            Stop paying for
            <br />
            <span className="bg-gradient-to-r from-teal-400 via-sky-400 to-teal-400 bg-clip-text text-transparent">
              two AI subscriptions
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/40 mt-6 max-w-2xl mx-auto leading-relaxed">
            ChatGPT Plus is $20/mo. Claude Pro is $20/mo.
            Get <strong className="text-white/70">both models</strong> with <strong className="text-white/70">20 expert skills</strong> for <strong className="text-white/70">$19/mo</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]"
            >
              Start Free — No Credit Card
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-white/60 font-medium rounded-xl hover:text-white transition-colors"
            >
              I already have an account
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 mt-12 text-sm text-white/30">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
            </div>
            <span>Free plan available</span>
            <span>•</span>
            <span>No credit card required</span>
          </div>
        </div>
      </section>

      {/* Skills Preview */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {SKILLS_PREVIEW.map((skill) => (
              <div
                key={skill.name}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-full"
              >
                <skill.icon className={`w-4 h-4 ${skill.color}`} />
                <span className="text-sm text-white/60">{skill.name}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-full">
              <span className="text-sm text-white/40">+14 more skills</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Why teams choose CraftAI</h2>
            <p className="text-white/40 mt-3 text-lg">Everything you need, nothing you don&apos;t.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-6 sm:p-8 bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:border-white/[0.12] transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5 group-hover:bg-teal-500/20 transition-colors">
                  <f.icon className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">CraftAI vs. the rest</h2>
            <p className="text-white/40 mt-3">One platform to replace two subscriptions.</p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 gap-0 p-4 border-b border-white/[0.06] text-sm font-semibold">
              <div></div>
              <div className="text-center text-teal-400">CraftAI</div>
              <div className="text-center text-white/40">ChatGPT</div>
              <div className="text-center text-white/40">Claude</div>
            </div>
            {COMPARISON.map((row) => (
              <div key={row.feature} className="grid grid-cols-4 gap-0 p-4 border-b border-white/[0.04] text-sm last:border-0">
                <div className="text-white/60">{row.feature}</div>
                {row.usText ? (
                  <>
                    <div className="text-center font-bold text-teal-400">{row.usText}</div>
                    <div className="text-center text-white/30">{row.chatgptText}</div>
                    <div className="text-center text-white/30">{row.claudeText}</div>
                  </>
                ) : (
                  <>
                    <div className="text-center">{row.us ? <Check className="w-5 h-5 text-emerald-400 mx-auto" /> : <span className="text-white/15">—</span>}</div>
                    <div className="text-center">{row.chatgpt ? <Check className="w-5 h-5 text-white/20 mx-auto" /> : <span className="text-white/15">—</span>}</div>
                    <div className="text-center">{row.claude ? <Check className="w-5 h-5 text-white/20 mx-auto" /> : <span className="text-white/15">—</span>}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Simple, honest pricing</h2>
          <p className="text-white/40 mt-3 mb-12">No hidden fees. No surprises. Cancel anytime.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            {/* Free */}
            <div className="p-8 bg-white/[0.02] border border-white/[0.06] rounded-2xl text-left">
              <p className="text-sm font-semibold text-white/50">Free</p>
              <p className="text-4xl font-bold mt-2">$0</p>
              <p className="text-xs text-white/30 mt-1">50K tokens/month</p>
              <ul className="mt-6 space-y-3">
                {["Claude Haiku", "GPT-4o Mini", "All 20 skills", "No credit card"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/50">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center mt-8 py-3 bg-white/[0.05] text-white/70 font-semibold rounded-xl hover:bg-white/[0.08] transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div className="p-8 bg-teal-500/5 border border-teal-500/20 rounded-2xl text-left relative overflow-hidden">
              <div className="absolute top-4 right-4 px-2.5 py-0.5 bg-teal-500/20 rounded-full text-[10px] font-bold text-teal-300">
                POPULAR
              </div>
              <p className="text-sm font-semibold text-teal-400">Pro</p>
              <p className="text-4xl font-bold mt-2">$19<span className="text-lg font-normal text-white/30">/mo</span></p>
              <p className="text-xs text-white/30 mt-1">2M tokens/month</p>
              <ul className="mt-6 space-y-3">
                {["Claude Sonnet 4.6", "GPT-4o", "Claude Haiku + GPT-4o Mini", "All 20 skills", "Priority response"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/50">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center mt-8 py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-colors shadow-lg shadow-white/10"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Questions?</h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                <h3 className="font-semibold text-white/90">{item.q}</h3>
                <p className="text-sm text-white/40 mt-2 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to try?</h2>
          <p className="text-white/40 mt-3 mb-8">Start free. No credit card. Upgrade when you need more.</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all text-lg shadow-[0_0_40px_rgba(255,255,255,0.1)]"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-white/40">CraftAI</span>
          </div>
          <p className="text-xs text-white/20">&copy; {new Date().getFullYear()} CraftAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
