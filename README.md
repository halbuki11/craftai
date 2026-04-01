# CraftAI

AI-powered chat platform with 19 specialized skills. Built with Next.js, Claude AI, Supabase, and Stripe.

## Features

- **Chat Interface** — ChatGPT-style streaming chat with dark glassmorphism UI
- **19 AI Skills** — Content writer, translator, researcher, CV builder, and more
- **Skill Auto-Detection** — AI automatically picks the right skill from your message
- **`/` Command Palette** — Type `/` to browse and select skills manually
- **Model Selection** — Claude Haiku (fast), Sonnet (balanced), Opus (powerful)
- **Token Tracking** — Real-time token usage displayed per message
- **Auth (Optional)** — Works without login, sign in to save history
- **Subscription Plans** — Free / Starter / Pro / Business via Stripe
- **Conversation History** — Saved to Supabase, shown in sidebar

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your keys (Supabase, Anthropic, Stripe)

# Run database migrations
# Go to Supabase Dashboard → SQL Editor → run files in supabase/migrations/

# Start dev server
npm run dev
```

## Project Structure

```
├── app/
│   ├── (auth)/              # Login & Signup pages
│   ├── (dashboard)/         # Chat, Notes, Skills, Settings, Subscription
│   └── api/
│       ├── ai/chat/stream/  # Streaming chat endpoint (SSE)
│       ├── conversations/   # Conversation history API
│       ├── skills/          # Skills list API
│       └── stripe/          # Checkout, Portal, Webhooks
├── components/
│   ├── chat/                # Chat UI components
│   │   ├── chat-view.tsx    # Main chat interface
│   │   ├── chat-message.tsx # Message bubble with markdown
│   │   ├── chat-welcome.tsx # Welcome screen with skill cards
│   │   └── markdown-renderer.tsx
│   ├── dashboard/           # Layout shell & sidebar
│   └── ui/                  # shadcn + custom UI components
├── content/
│   └── skills/              # 19 skill definitions (Markdown + YAML)
├── lib/
│   ├── ai/                  # Claude client & model config
│   ├── credits/             # Credit check & deduction
│   ├── skills/              # Skill loader & registry
│   ├── stripe/              # Stripe client & webhook handlers
│   └── supabase/            # Database client helpers
└── supabase/
    └── migrations/          # SQL migration files
```

## Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| Content Writer | "write a blog post" | Blog, LinkedIn, tweets, articles |
| Translator | "translate this" | 97+ languages |
| Researcher | "research about" | In-depth reports |
| Travel Planner | "plan a trip" | Itineraries & budgets |
| Recipe | "suggest a recipe" | Recipes by ingredients |
| CV Writer | "write a CV" | Professional resumes |
| Petition Writer | "write a petition" | Official documents |
| Budget Planner | "budget plan" | Personal finance |
| Math Solver | "solve this equation" | Step-by-step solutions |
| Email Assistant | "write an email" | Professional emails |
| Social Media | "social media plan" | Content calendars |
| PDF Summarizer | "summarize this PDF" | Document analysis |
| Grammar Fixer | "fix grammar" | Text correction |
| Health Advisor | "health advice" | Wellness tips |
| Motivation Coach | "motivate me" | Goal setting |
| Meeting Notes | "meeting notes" | Structured minutes |
| Legal Review | "review contract" | Document analysis |
| Brainstorm | "brainstorm ideas" | Creative ideation |
| Quick Answer | *(fallback)* | General questions |

## Tech Stack

- **Next.js 16** — React framework with App Router
- **TypeScript** — Type safety
- **Tailwind CSS v4** — Utility-first styling
- **shadcn/ui** — Component library
- **Framer Motion** — Animations
- **Anthropic SDK** — Claude AI integration
- **Supabase** — PostgreSQL, Auth, Real-time
- **Stripe** — Payments & subscriptions

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `STRIPE_SECRET_KEY` | No | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook secret |
| `NEXT_PUBLIC_APP_URL` | No | App URL (default: localhost:3000) |

## License

Private — All rights reserved.
