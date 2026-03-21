import os

from api.models import Job

OUTPUTS_ROOT = "/workspace/RFdiffusion/outputs/users"

_jobs: dict[str, Job] = {}


def save_job(job: Job) -> None:
    _jobs[job.job_id] = job


def get_job(job_id: str) -> Job | None:
    return _jobs.get(job_id)


def list_jobs(user_id: str | None = None) -> list[Job]:
    jobs = list(_jobs.values())
    if user_id:
        jobs = [j for j in jobs if j.user_id == user_id]
    return sorted(jobs, key=lambda j: j.created_at, reverse=True)


def clear_jobs() -> None:
    _jobs.clear()


def discover_existing_jobs() -> None:
    if not os.path.isdir(OUTPUTS_ROOT):
        return
    for user_id in os.listdir(OUTPUTS_ROOT):
        user_dir = os.path.join(OUTPUTS_ROOT, user_id)
        if not os.path.isdir(user_dir):
            continue
        for chat_id in os.listdir(user_dir):
            chat_dir = os.path.join(user_dir, chat_id)
            if not os.path.isdir(chat_dir):
                continue
            for job_id in os.listdir(chat_dir):
                job_dir = os.path.join(chat_dir, job_id)
                if not os.path.isdir(job_dir) or job_id in _jobs:
                    continue
                iterations = count_iterations(job_dir)
                save_job(Job(
                    job_id=job_id,
                    user_id=user_id,
                    chat_id=chat_id,
                    prompt="(recovered from disk)",
                    status="completed",
                    current_iteration=iterations,
                    output_dir=job_dir,
                ))


def count_iterations(job_dir: str) -> int:
    return sum(
        1 for d in os.listdir(job_dir)
        if d.startswith("v") and os.path.isdir(os.path.join(job_dir, d))
    )
