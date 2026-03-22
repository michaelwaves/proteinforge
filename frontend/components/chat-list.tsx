"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ChatEntry {
  chat_id: string;
  preview: string;
}

interface JobEntry {
  job_id: string;
  chat_id: string;
  prompt: string;
  status: string;
  current_iteration: number;
}

interface ListItem {
  id: string;
  preview: string;
}

export function ChatList() {
  const router = useRouter();
  const [entries, setEntries] = useState<ListItem[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/chats").then((r) => r.ok ? r.json() : []).catch(() => []),
      fetch("http://localhost:8000/jobs").then((r) => r.ok ? r.json() : []).catch(() => []),
    ]).then(([chats, jobs]: [ChatEntry[], JobEntry[]]) => {
      const items = new Map<string, ListItem>();
      console.log(entries)

      // Jobs first — keyed by chat_id so we group by conversation
      for (const job of jobs) {
        const key = job.chat_id || job.job_id;
        const existing = items.get(key);
        const preview = job.prompt === "(recovered from disk)" ? "" : job.prompt;
        if (!existing || (!existing.preview && preview)) {
          items.set(key, { id: key, preview: preview || existing?.preview || "" });
        }
      }

      // Chats override with better previews
      for (const chat of chats) {
        const existing = items.get(chat.chat_id);
        if (chat.preview) {
          items.set(chat.chat_id, { id: chat.chat_id, preview: chat.preview });
        } else if (!existing) {
          items.set(chat.chat_id, { id: chat.chat_id, preview: "Chat session" });
        }
      }

      // Filter out entries with no useful preview
      const result = [...items.values()].filter((e) => e.preview);
      setEntries(result);
    });
  }, []);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-4 text-center">
        No sessions yet. Start your first design above.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <button
          key={entry.id}
          onClick={() => router.push(`/dashboard/chat/${entry.id}`)}
          className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-blue-300 hover:shadow-sm"
        >
          <p className="text-sm font-medium text-slate-700 truncate">
            {entry.preview}
          </p>
          <p className="text-xs text-slate-400 mt-1">{entry.id}</p>
        </button>
      ))}
    </div>
  );
}
