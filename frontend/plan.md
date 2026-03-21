# Frontend Plan — Protein Design Chat

## Overview

A Next.js 16 app with two-panel layout: chat on the left (Vercel AI SDK streaming), protein viewer + agent console on the right. Dashboard for managing chats.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Dashboard  (/dashboard)                            │
│  ┌──────────────────────────────────────────────┐   │
│  │  Chat 1  │  Chat 2  │  + New Chat            │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Chat View  (/chat/[id])                            │
│  ┌────────────────────┬────────────────────────┐    │
│  │                    │   PDB Viewer            │    │
│  │   Chat Messages    │   ← iteration slider → │    │
│  │   (streaming)      ├────────────────────────┤    │
│  │                    │   Agent Console         │    │
│  │   [input bar]      │   (live tool calls)     │    │
│  └────────────────────┴────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

## Data Flow

```
User types message
  → Vercel AI SDK (useChat)
  → POST /api/chat (Next.js route handler)
  → Claude API (streaming response)
  → Claude decides to call RFdiffusion subagent
  → POST localhost:8000/generate (FastAPI backend)
  → Returns job_id
  → Frontend polls GET localhost:8000/jobs/{job_id} for status
  → On completion, loads PDB artifacts into viewer
```

---

## Pages & Routes

| Route | Purpose |
|-------|---------|
| `/` | Redirect to `/dashboard` |
| `/dashboard` | List all chats, new chat button |
| `/chat/[id]` | Two-panel chat + viewer |
| `/api/chat` | Route handler: Vercel AI SDK → Claude with tool calling |

---

## Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ChatPanel` | `components/chat-panel.tsx` | Message list + input, useChat hook |
| `MessageBubble` | `components/message-bubble.tsx` | Single chat message rendering |
| `ProteinViewer` | `components/protein-viewer.tsx` | 3Dmol.js or Molstar PDB viewer |
| `IterationSlider` | `components/iteration-slider.tsx` | Slider to scrub through v0, v1, v2... |
| `AgentConsole` | `components/agent-console.tsx` | Live stream of backend agent tool calls |
| `ChatList` | `components/chat-list.tsx` | Dashboard chat list |

---

## Tech Choices

| Choice | Option | Why |
|--------|--------|-----|
| AI SDK | `ai` + `@ai-sdk/anthropic` | Vercel AI SDK for streaming chat with Claude |
| PDB Viewer | `3dmol` | Lightweight, works in browser, simple API, no heavy deps |
| UI | shadcn/ui + Tailwind v4 | Minimal, elegant components |
| State | `useChat` hook + React state | AI SDK handles chat state; local state for viewer |

---

## Implementation Steps

### Step 1 — Setup & dependencies
- Init shadcn/ui (`npx shadcn@latest init`)
- Install: `ai`, `@ai-sdk/anthropic`, `3dmol`
- Add shadcn components: button, input, card, slider, scroll-area

### Step 2 — Layout & routing
- `/` redirects to `/dashboard`
- `/dashboard` page with chat list
- `/chat/[id]` page with two-panel layout
- Shared layout with minimal nav

### Step 3 — Chat panel (left side)
- `useChat` hook pointing to `/api/chat`
- Message list with auto-scroll
- Input bar with send button + optional PDB file attach
- Streaming responses rendered in real-time

### Step 4 — API route handler (`/api/chat`)
- Vercel AI SDK `streamText` with Claude
- Define a `generate_protein` tool that calls `localhost:8000/generate`
- Tool results shown inline in chat
- Stream the response back

### Step 5 — Protein viewer (top right)
- 3Dmol.js viewer component
- Loads PDB file content from backend artifacts
- Iteration slider: scrub v0 → v1 → v2 etc.
- Auto-updates when new iteration completes

### Step 6 — Agent console (bottom right)
- Backend needs SSE or polling endpoint for agent logs
- Display tool calls, text, results in a terminal-style view
- Auto-scroll, monospace font

### Step 7 — Dashboard
- List chats with last message preview
- New chat button → creates chat, navigates to `/chat/[id]`
- Simple in-memory or localStorage for POC

---

## Backend Changes Needed

1. **SSE endpoint** for streaming agent logs: `GET /jobs/{job_id}/logs` (EventSource)
2. **Artifacts endpoint**: `GET /jobs/{job_id}/artifacts/{path}` to serve PDB files to viewer
3. **CORS**: allow frontend origin

---

## File Structure (target)

```
frontend/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx                    (redirect to /dashboard)
│   ├── dashboard/
│   │   └── page.tsx
│   ├── chat/
│   │   └── [id]/
│   │       └── page.tsx
│   └── api/
│       └── chat/
│           └── route.ts
├── components/
│   ├── chat-panel.tsx
│   ├── message-bubble.tsx
│   ├── protein-viewer.tsx
│   ├── iteration-slider.tsx
│   ├── agent-console.tsx
│   └── chat-list.tsx
├── lib/
│   ├── api.ts                      (backend API client)
│   └── utils.ts                    (shadcn cn helper)
└── components/ui/                  (shadcn components)
```

---

## Next Steps
1. Setup shadcn + install deps
2. Build the two-panel layout shell
3. Wire up useChat with /api/chat route
4. Add protein viewer with iteration slider
