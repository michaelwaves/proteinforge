_job_logs: dict[str, list[str]] = {}


def append_log(job_id: str, message: str) -> None:
    if job_id not in _job_logs:
        _job_logs[job_id] = []
    _job_logs[job_id].append(message)


def get_logs(job_id: str) -> list[str]:
    return _job_logs.get(job_id, [])


def clear_logs(job_id: str | None = None) -> None:
    if job_id:
        _job_logs.pop(job_id, None)
    else:
        _job_logs.clear()
