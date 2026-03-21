import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    async for message in query(
        prompt="Generate a new protein using sample commands from /workspace",
        options = ClaudeAgentOptions(allowed_tools=["Read","Edit","Bash"]),
    ):
        print(message)
asyncio.run(main())