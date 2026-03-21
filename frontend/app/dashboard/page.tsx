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
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg space-y-10">
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-800">
            ProteinForge
          </h1>
          <p className="text-[15px] leading-relaxed text-slate-500">
            Design proteins with AI. Describe what you want in plain English.
          </p>
        </div>

        <button
          onClick={handleNewChat}
          className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left text-[15px] text-slate-400 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
        >
          Describe a protein...
        </button>

        <div className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Recent Sessions
          </h2>
          <ChatList />
        </div>
      </div>
    </div>
  );
}
