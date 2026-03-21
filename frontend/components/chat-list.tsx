"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface JobSummary {
  job_id: string;
  prompt: string;
  status: string;
  current_iteration: number;
}

export function ChatList() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobSummary[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/jobs")
      .then((res) => res.json())
      .then(setJobs)
      .catch(() => {});
  }, []);

  if (jobs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No sessions yet. Start your first design above.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {jobs.map((job) => (
        <button
          key={job.job_id}
          onClick={() => router.push(`/dashboard/chat/${job.job_id}`)}
          className="w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-blue-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground truncate pr-4">
              {job.prompt}
            </p>
            <StatusBadge status={job.status} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {job.current_iteration} iteration{job.current_iteration !== 1 ? "s" : ""}
          </p>
        </button>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    completed: "bg-emerald-100 text-emerald-700",
    running: "bg-blue-100 text-blue-700",
    queued: "bg-amber-100 text-amber-700",
    failed: "bg-red-100 text-red-700",
  }[status] ?? "bg-gray-100 text-gray-700";

  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${styles}`}>
      {status}
    </span>
  );
}
