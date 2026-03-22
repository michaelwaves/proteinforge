import logging
import os
from datetime import datetime

from claude_agent_sdk import (
    AssistantMessage,
    ClaudeAgentOptions,
    ResultMessage,
    TextBlock,
    ToolResultBlock,
    ToolUseBlock,
    query,
)

from api.agent import REPO_ROOT, build_system_prompt, build_user_prompt
from api.jobs import count_iterations, save_job
from api.logs import append_log
from api.models import Job

log = logging.getLogger(__name__)


async def run_design_agent(job: Job) -> None:
    update_job_status(job, "running")
    try:
        os.makedirs(job.output_dir, exist_ok=True)
        input_pdb_path = save_input_pdb_if_provided(job)
        await invoke_claude_agent(job, input_pdb_path)
        job.current_iteration = count_iterations(job.output_dir)
        update_job_status(job, "completed")
    except Exception as error:
        update_job_status(job, "failed", error=str(error))


async def invoke_claude_agent(job: Job, input_pdb_path: str | None = None) -> None:
    options = ClaudeAgentOptions(
        system_prompt=build_system_prompt(),
        allowed_tools=["Bash", "Read", "Edit"],
        cwd=REPO_ROOT,
        max_turns=job.max_iterations * 10,
        permission_mode="bypassPermissions",
    )
    user_prompt = build_user_prompt(job, input_pdb_path)

    log.info(f"[{job.job_id}] Starting agent for: {job.prompt}")

    async for message in query(prompt=user_prompt, options=options):
        log_agent_message(job.job_id, message)
        update_iteration_count(job)
        if isinstance(message, ResultMessage) and message.is_error:
            raise RuntimeError(message.result or "Agent failed")


def update_iteration_count(job: Job) -> None:
    new_count = count_iterations(job.output_dir)
    if new_count != job.current_iteration:
        job.current_iteration = new_count
        save_job(job)


def update_job_status(job: Job, status: str, error: str | None = None) -> None:
    job.status = status
    job.updated_at = datetime.now()
    if error:
        job.error = error
    save_job(job)


def log_agent_message(job_id: str, message) -> None:
    tag = f"[{job_id}]"

    if isinstance(message, AssistantMessage):
        for block in message.content:
            if isinstance(block, TextBlock):
                line = f"💬 {block.text[:300]}"
                log.info(f"{tag} {line}")
                append_log(job_id, line)
            elif isinstance(block, ToolUseBlock):
                line = f"🔧 {block.name}({_summarize_input(block.input)})"
                log.info(f"{tag} {line}")
                append_log(job_id, line)
            elif isinstance(block, ToolResultBlock):
                if not block.content:
                    continue
                for result_line in _format_tool_result(block):
                    log.info(f"{tag} {result_line}")
                    append_log(job_id, result_line)

    elif isinstance(message, ResultMessage):
        line = f"🏁 Done — turns={message.num_turns} cost=${message.total_cost_usd}"
        log.info(f"{tag} {line}")
        append_log(job_id, line)


def _extract_text_from_content(content) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, dict) and "text" in item:
                parts.append(item["text"])
            else:
                parts.append(str(item))
        return "\n".join(parts)
    return str(content)


def _format_tool_result(block: ToolResultBlock) -> list[str]:
    icon = "❌" if block.is_error else "  "
    raw = _extract_text_from_content(block.content)
    lines = raw.split("\n")
    result = []
    for line in lines[:40]:
        trimmed = line.rstrip()
        if not trimmed:
            continue
        result.append(f"{icon} {trimmed[:200]}")
    if len(lines) > 40:
        result.append(f"{icon} ... ({len(lines) - 40} more lines)")
    return result


def _summarize_input(tool_input: dict) -> str:
    if "command" in tool_input:
        return tool_input["command"][:300]
    if "file_path" in tool_input:
        return tool_input["file_path"]
    return str(tool_input)[:120]


def save_input_pdb_if_provided(job: Job) -> str | None:
    if not job.pdb:
        return None
    os.makedirs(job.output_dir, exist_ok=True)
    path = f"{job.output_dir}/input.pdb"
    with open(path, "w") as f:
        f.write(job.pdb)
    return path
