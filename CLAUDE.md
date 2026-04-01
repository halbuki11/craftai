# CraftAI — AI Skills Platform

## Project Overview
CraftAI is a ChatGPT-like AI chat platform with specialized skills. Built with Next.js 16, Supabase, Stripe, and Claude AI (Anthropic SDK).

## Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui (base-nova)
- **AI:** Anthropic Claude SDK (Haiku/Sonnet/Opus)
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **Payments:** Stripe (Checkout + Webhooks + Portal)
- **Animations:** Framer Motion
- **Icons:** Lucide React

## Architecture

```
app/                    → Next.js App Router pages
  (auth)/               → Login, Signup (optional auth)
  (dashboard)/          → Chat, Notes, Skills, Settings, etc.
  api/                  → API routes (chat/stream, conversations, stripe, etc.)
components/
  chat/                 → Chat UI (view, message, welcome, markdown)
  dashboard/            → Shell, sidebar
  ui/                   → shadcn + custom components
content/
  skills/               → 19 AI skill definitions (.md with YAML frontmatter)
lib/
  ai/                   → Claude client, model config, router
  credits/              → Token/credit system
  skills/               → Skill loader, registry, types
  stripe/               → Stripe client, webhooks
  supabase/             → Client + server Supabase helpers
```

## Design System
- **Theme:** Dark-only (#1E1F23 background)
- **Accent:** Violet/Indigo (#a78bfa, #818cf8)
- **Text:** White with opacity levels (white/90, white/50, white/20)
- **Borders:** white/[0.06]
- **Surfaces:** white/[0.02], white/[0.03]
- **Glassmorphism:** backdrop-blur-2xl on inputs/menus
- **Primary buttons:** bg-white text-[#1E1F23]

## Key Rules
- All UI text in English (skills auto-detect user's language)
- No amber/orange colors — use violet/indigo
- No shadcn theme variables (text-foreground etc) in chat components — use raw white opacity
- Auth is optional — chat works without login
- Skills auto-detect from user message OR manual `/skill-name` selection
- Token-based usage tracking (not flat credits)
- Streaming responses via SSE (Server-Sent Events)

## Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests
```

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=
```
