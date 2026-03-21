# Frontend Plan — Protein Design Chat

## Overview

Next.js 16 app. Chat on left (Vercel AI SDK streaming), protein viewer + agent console on right. All protected routes under `/dashboard`.

---

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Login page (redirects to /dashboard for now) |
| `/dashboard` | Chat list, new chat button |
| `/dashboard/chat/[id]` | Two-panel: chat + viewer |
| `/api/chat` | Route handler: AI SDK → Claude → subagent |

---

## Layout

```
┌─────────────────────────────────────────────────────┐
│  /dashboard/chat/[id]                               │
│  ┌────────────────────┬────────────────────────┐    │
│  │                    │   PDB Viewer (3Dmol)    │    │
│  │   Chat Messages    │   ← iteration slider → │    │
│  │   (streaming)      ├────────────────────────┤    │
│  │                    │   Agent Console         │    │
│  │   [input bar]      │   (live tool calls)     │    │
│  └────────────────────┴────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## Implementation Steps

1. Setup: shadcn, ai, @ai-sdk/anthropic, @ai-sdk/react, 3dmol, zod
2. Login page (/) → redirect to /dashboard
3. Dashboard layout + chat list page
4. Chat page with two-panel layout
5. Chat panel: useChat + sendMessage + streaming
6. API route: streamText + generate_protein tool
7. Protein viewer: 3Dmol.js + iteration slider
8. Agent console: poll job logs from backend
9. Backend: CORS, artifacts endpoint, logs endpoint

---

## File Structure

```
app/
├── layout.tsx
├── globals.css
├── page.tsx                          (login → redirect)
├── dashboard/
│   ├── layout.tsx                    (sidebar nav)
│   ├── page.tsx                      (chat list)
│   └── chat/
│       └── [id]/
│           └── page.tsx              (two-panel view)
└── api/
    └── chat/
        └── route.ts
components/
├── chat-panel.tsx
├── message-bubble.tsx
├── protein-viewer.tsx
├── iteration-slider.tsx
├── agent-console.tsx
└── chat-list.tsx
lib/
├── api.ts                            (backend client)
└── utils.ts                          (cn helper)
```
