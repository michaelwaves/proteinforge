"use client";

import { useRouter } from "next/navigation";
import { ChatList } from "@/components/chat-list";

export default function DashboardPage() {
  const router = useRouter();

  function handleNewChat() {
    const id = crypto.randomUUID().slice(0, 8);
    router.push(`/dashboard/chat/${id}`);
  }

  return (
    <div className="flex flex-1 flex-col items-center overflow-hidden p-8">
      <div className="flex w-full max-w-lg flex-col gap-8 min-h-0">
        <div className="shrink-0 space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-800">
            ProteinForge
          </h1>
          <p className="text-[15px] leading-relaxed text-slate-500">
            Design proteins with AI. Describe what you want in plain English.
          </p>
        </div>

        <button
          onClick={handleNewChat}
          className="shrink-0 w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left text-[15px] text-slate-400 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
        >
          Describe a protein...
        </button>

        <div className="flex flex-col gap-3 min-h-0 flex-1">
          <h2 className="shrink-0 text-xs font-medium uppercase tracking-wider text-slate-400">
            Recent Sessions
          </h2>
          <div className="flex-1 overflow-y-auto">
            <ChatList />
          </div>
        </div>
      </div>
    </div>
  );
}
