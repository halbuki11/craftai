import Link from "next/link";
import { Sparkles, Zap, Shield, Globe, ArrowRight, MessageSquare, Code, Brain } from "lucide-react";

export const metadata = {
  title: "CraftAI — AI Skills Platform",
  description: "Chat with Claude, GPT-4o, and Gemini. Use 19+ AI skills to write, research, code, and more. Free to start.",
  openGraph: {
    title: "CraftAI — AI Skills Platform",
    description: "Chat with Claude, GPT-4o, and Gemini. Use 19+ AI skills to write, research, code, and more.",
    url: "https://aimaa.cloud",
  },
};

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Multi-Model Chat",
    desc: "Claude, GPT-4o, Gemini — all in one place. Switch models mid-conversation.",
  },
  {
    icon: Brain,
    title: "19+ AI Skills",
    desc: "Content writing, research, coding, translation, budget planning, and more.",
  },
  {
    icon: Zap,
    title: "Streaming Responses",
    desc: "Real-time token-by-token streaming. See AI thinking in real time.",
  },
  {
    icon: Code,
    title: "Code & Math",
    desc: "Syntax-highlighted code blocks, LaTeX math rendering, markdown tables.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    desc: "Your data stays yours. End-to-end encrypted. No training on your data.",
  },
  {
    icon: Globe,
    title: "Multilingual",
    desc: "Full Turkish and English support. AI auto-detects your language.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#131314]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">CraftAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-white text-[#131314] text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs text-violet-300 mb-6">
          <Sparkles className="w-3 h-3" />
          Claude + GPT-4o in one place
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
          Two AI Giants.
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            One Platform. $19/mo.
          </span>
        </h1>
        <p className="text-lg text-white/50 mt-6 max-w-2xl mx-auto leading-relaxed">
          Stop paying $40/month for ChatGPT Plus and Claude Pro separately. Get both with 20 expert skills for writing, coding, research, and more.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#131314] font-semibold rounded-xl hover:bg-white/90 transition-colors shadow-lg shadow-white/10"
          >
            Start Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.05] text-white/80 font-medium rounded-xl hover:bg-white/[0.08] transition-colors border border-white/[0.08]"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:border-white/[0.12] transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
                <f.icon className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans preview */}
      <section className="px-6 py-16 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Simple Pricing</h2>
        <p className="text-white/40 mb-8">Start free, upgrade when you need more.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          {[
            { name: "Free", price: "$0", tokens: "50K tokens/mo", models: "Haiku + GPT-4o Mini" },
            { name: "Pro", price: "$19", tokens: "2M tokens/mo", models: "Claude Sonnet + GPT-4o + more", popular: true },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`p-6 rounded-2xl border ${
                plan.popular
                  ? "border-violet-500/30 bg-violet-500/5"
                  : "border-white/[0.06] bg-white/[0.02]"
              }`}
            >
              <p className="text-sm font-semibold text-white">{plan.name}</p>
              <p className="text-3xl font-bold text-white mt-2">{plan.price}</p>
              <p className="text-xs text-white/40 mt-1">{plan.tokens}</p>
              <p className="text-xs text-white/30 mt-3">{plan.models}</p>
            </div>
          ))}
        </div>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#131314] font-semibold rounded-xl mt-8 hover:bg-white/90 transition-colors"
        >
          Get Started Free <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-6 py-8 text-center">
        <p className="text-xs text-white/20">
          &copy; {new Date().getFullYear()} CraftAI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
