const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export interface Job {
  job_id: string;
  user_id: string;
  chat_id: string;
  prompt: string;
  status: "queued" | "running" | "completed" | "failed";
  current_iteration: number;
  max_iterations: number;
  output_dir: string;
  error: string | null;
}

export async function generateProtein(prompt: string, chatId: string): Promise<Job> {
  const response = await fetch(`${BACKEND_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, chat_id: chatId }),
  });
  return response.json();
}

export async function getJob(jobId: string): Promise<Job> {
  const response = await fetch(`${BACKEND_URL}/jobs/${jobId}`);
  return response.json();
}

export async function listJobs(): Promise<Job[]> {
  const response = await fetch(`${BACKEND_URL}/jobs`);
  return response.json();
}

export async function fetchPdbContent(jobId: string, iteration: number): Promise<string> {
  const response = await fetch(
    `${BACKEND_URL}/jobs/${jobId}/artifacts/v${iteration}/design_0.pdb`
  );
  return response.text();
}

export async function fetchJobLogs(jobId: string): Promise<string[]> {
  const response = await fetch(`${BACKEND_URL}/jobs/${jobId}/logs`);
  const data = await response.json();
  return data.logs;
}
