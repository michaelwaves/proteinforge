"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ChatPanel } from "@/components/chat-panel";
import { IterationSlider } from "@/components/iteration-slider";
import { AgentConsole } from "@/components/agent-console";
import { RenderCarousel } from "@/components/render-carousel";

const ProteinViewer = dynamic(
  () => import("@/components/protein-viewer").then((m) => m.ProteinViewer),
  { ssr: false },
);

const BACKEND = "http://localhost:8000";

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [jobId, setJobId] = useState<string | null>(null);
  const [iteration, setIteration] = useState(0);
  const [maxIteration, setMaxIteration] = useState(0);
  const userSelectedRef = useRef(false);

  useEffect(() => {
    async function loadJob() {
      // Try as job ID first
      let res = await fetch(`${BACKEND}/jobs/${id}`);
      if (res.ok) {
        const job = await res.json();
        applyJob(job);
        return;
      }
      // Fallback: search by chat_id
      res = await fetch(`${BACKEND}/jobs?chat_id=${id}`);
      if (res.ok) {
        const jobs = await res.json();
        if (jobs.length > 0) applyJob(jobs[0]);
      }
    }

    function applyJob(job: { job_id: string; current_iteration: number }) {
      setJobId(job.job_id);
      const iters = job.current_iteration || 0;
      if (iters > 0) {
        setMaxIteration(iters - 1);
        setIteration(iters - 1);
      }
    }

    loadJob().catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND}/jobs/${jobId}`);
        if (!res.ok) return;
        const job = await res.json();
        const iters = job.current_iteration || 0;
        if (iters <= 0) return;

        const newMax = iters - 1;
        if (newMax > maxIteration) {
          setMaxIteration(newMax);
          if (!userSelectedRef.current) {
            setIteration(newMax);
          }
        }
        if (job.status === "completed" || job.status === "failed") {
          clearInterval(interval);
          userSelectedRef.current = false;
        }
      } catch { /* backend unreachable */ }
    }, 5000);

    return () => clearInterval(interval);
  }, [jobId, maxIteration]);

  function handleIterationChange(value: number) {
    userSelectedRef.current = true;
    setIteration(value);
  }

  return (
    <div className="flex h-full w-full">
      <div className="flex w-1/2 flex-col border-r border-slate-200">
        <ChatPanel
          chatId={id}
          onJobCreated={(newJobId) => {
            setJobId(newJobId);
            setIteration(0);
            setMaxIteration(0);
            userSelectedRef.current = false;
          }}
          onJobCompleted={() => { userSelectedRef.current = false; }}
        />
      </div>

      <div className="flex w-1/2 flex-col">
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              ← Dashboard
            </button>
            {jobId && (
              <span className="text-[11px] text-slate-400 font-mono">{jobId}</span>
            )}
          </div>
          <div className="flex flex-1 flex-col">
            <ProteinViewer jobId={jobId} iteration={iteration} />
            {maxIteration > 0 && (
              <IterationSlider
                value={iteration}
                max={maxIteration}
                onChange={handleIterationChange}
              />
            )}
          </div>
        </div>
        <RenderCarousel jobId={jobId} iterationCount={maxIteration + 1} />
        <div className="h-1/3 min-h-0">
          <AgentConsole jobId={jobId} />
        </div>
      </div>
    </div>
  );
}
