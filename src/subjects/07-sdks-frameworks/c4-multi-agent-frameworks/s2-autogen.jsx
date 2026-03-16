import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'

export default function AutoGen() {
  return (
    <article className="prose-content">
      <h2>AutoGen</h2>
      <p>
        Microsoft AutoGen is a framework for building multi-agent AI systems through
        conversational patterns. Agents communicate by sending messages to each other,
        enabling complex workflows like code generation with automated execution, debate
        between agents with opposing views, and orchestrated multi-step problem solving.
      </p>

      <ConceptBlock term="AssistantAgent">
        <p>
          <strong>AssistantAgent</strong> is an LLM-backed agent designed to respond to
          messages, generate code, and provide analysis. It does not execute code itself —
          it proposes solutions that other agents (like <code>UserProxyAgent</code>) execute.
          Multiple AssistantAgents can specialize in different domains and collaborate.
        </p>
      </ConceptBlock>

      <ConceptBlock term="UserProxyAgent">
        <p>
          <strong>UserProxyAgent</strong> represents the "human" in the loop. It can execute
          code automatically (configurable), request human input at defined points, and manage
          the conversation termination condition. In fully automated pipelines, it runs code
          in a sandboxed Docker container and feeds results back to the assistant.
        </p>
      </ConceptBlock>

      <ConceptBlock term="GroupChat">
        <p>
          <strong>GroupChat</strong> enables more than two agents to collaborate in a shared
          conversation. A <code>GroupChatManager</code> (backed by an LLM) selects the next
          speaker based on the conversation history. This supports patterns like a manager
          delegating to specialists or agents debating a problem.
        </p>
      </ConceptBlock>

      <h2>Installation</h2>

      <SDKExample
        title="Installing AutoGen 0.4"
        tabs={{
          python: `# AutoGen 0.4 (agentchat package)
pip install pyautogen

# With code execution support (Docker recommended)
pip install pyautogen[docker]

# Or with local execution (less secure)
pip install pyautogen`,
        }}
      />

      <h2>Basic Two-Agent Conversation</h2>

      <SDKExample
        title="AssistantAgent + UserProxyAgent"
        tabs={{
          python: `import autogen

# AutoGen 0.4 configuration
config_list = [
    {
        "model": "claude-opus-4-6",
        "api_key": "your-anthropic-key",
        "api_type": "anthropic",
    }
]

llm_config = {
    "config_list": config_list,
    "temperature": 0,
    "timeout": 120,
    "cache_seed": 42,  # Set to None to disable caching
}

# Assistant: LLM-backed, writes code and provides solutions
assistant = autogen.AssistantAgent(
    name="assistant",
    llm_config=llm_config,
    system_message=(
        "You are a helpful AI assistant specializing in data analysis and Python. "
        "When writing code, always include error handling and comments. "
        "After the user executes code, analyze the output and suggest next steps."
    ),
)

# UserProxy: executes code, represents human feedback
user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",     # "NEVER", "TERMINATE", or "ALWAYS"
    max_consecutive_auto_reply=10,
    is_termination_msg=lambda x: x.get("content", "").rstrip().endswith("TERMINATE"),
    code_execution_config={
        "work_dir": "coding",
        "use_docker": False,  # Set True for production (sandboxed execution)
        "timeout": 60,
    },
)

# Start the conversation — UserProxy sends the initial message
user_proxy.initiate_chat(
    assistant,
    message=(
        "Analyze the CSV file at 'data/sales.csv'. "
        "Calculate monthly revenue trends and plot a line chart. "
        "Save the chart to 'output/revenue_trend.png'."
    ),
)`,
        }}
      />

      <h2>GroupChat: Multi-Agent Collaboration</h2>
      <p>
        GroupChat enables structured conversations between three or more agents. The
        <code>GroupChatManager</code> uses an LLM to select the next speaker, creating
        dynamic delegation patterns.
      </p>

      <SDKExample
        title="GroupChat with Specialized Agents"
        tabs={{
          python: `import autogen

config_list = [{"model": "claude-opus-4-6", "api_type": "anthropic", "api_key": "..."}]
llm_config = {"config_list": config_list, "temperature": 0}

# Specialized agents
planner = autogen.AssistantAgent(
    name="Planner",
    system_message=(
        "You are a project planner. Break down complex tasks into clear steps. "
        "Assign each step to either the Coder or the Reviewer. "
        "Say 'TERMINATE' when all tasks are complete and verified."
    ),
    llm_config=llm_config,
)

coder = autogen.AssistantAgent(
    name="Coder",
    system_message=(
        "You are an expert Python developer. Write clean, tested code. "
        "Always follow PEP 8 and include type hints. "
        "Reply with just the code block when asked to implement something."
    ),
    llm_config=llm_config,
)

reviewer = autogen.AssistantAgent(
    name="Reviewer",
    system_message=(
        "You are a senior code reviewer. Check code for: bugs, security issues, "
        "performance problems, and best practice violations. "
        "Provide specific, actionable feedback."
    ),
    llm_config=llm_config,
)

user_proxy = autogen.UserProxyAgent(
    name="User",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=15,
    code_execution_config={"work_dir": "output", "use_docker": False},
    is_termination_msg=lambda x: "TERMINATE" in x.get("content", ""),
)

# Set up GroupChat
groupchat = autogen.GroupChat(
    agents=[user_proxy, planner, coder, reviewer],
    messages=[],
    max_round=20,
    speaker_selection_method="auto",  # LLM picks next speaker
    allow_repeat_speaker=False,
)

manager = autogen.GroupChatManager(
    groupchat=groupchat,
    llm_config=llm_config,
)

# Kick off the group conversation
user_proxy.initiate_chat(
    manager,
    message=(
        "Build a Python web scraper that: extracts article titles and dates "
        "from a news site, stores results in SQLite, and runs on a schedule. "
        "Include unit tests."
    ),
)`,
        }}
      />

      <h2>Nested Chat Patterns</h2>
      <p>
        AutoGen supports nested chats where an agent's reply is itself generated by
        a sub-conversation between agents. This enables "inner monologue" patterns where
        a specialist consultation happens transparently before the main agent responds.
      </p>

      <SDKExample
        title="Nested Chat for Expert Consultation"
        tabs={{
          python: `import autogen

# Main conversation agents
assistant = autogen.AssistantAgent("assistant", llm_config=llm_config)
user_proxy = autogen.UserProxyAgent(
    "user",
    human_input_mode="NEVER",
    code_execution_config=False,
)

# Expert agents for nested consultation
security_expert = autogen.AssistantAgent(
    "security_expert",
    system_message="You are a cybersecurity expert. Review code for vulnerabilities.",
    llm_config=llm_config,
)
perf_expert = autogen.AssistantAgent(
    "perf_expert",
    system_message="You are a performance engineer. Identify bottlenecks.",
    llm_config=llm_config,
)

# Register nested reply: before assistant responds, consult experts
assistant.register_nested_chats(
    [
        {
            "recipient": security_expert,
            "message": lambda recipient, messages, sender, config: (
                f"Review this code for security issues:\\n{messages[-1]['content']}"
            ),
            "summary_method": "last_msg",
            "max_turns": 2,
        },
        {
            "recipient": perf_expert,
            "message": lambda recipient, messages, sender, config: (
                f"Review this code for performance issues:\\n{messages[-1]['content']}"
            ),
            "summary_method": "last_msg",
            "max_turns": 2,
        },
    ],
    trigger=user_proxy,  # Only trigger when user_proxy sends a message
)

user_proxy.initiate_chat(
    assistant,
    message="Write a function to process 10M records from a CSV file.",
)`,
        }}
      />

      <PatternBlock
        name="Code Generation with Automated Testing"
        category="Multi-Agent"
        whenToUse="When you need to generate and verify code automatically. The UserProxyAgent executes code in a sandbox and feeds results back, creating a feedback loop that catches bugs before delivery."
      >
        <p>
          Configure <code>UserProxyAgent</code> with <code>human_input_mode="NEVER"</code>
          and <code>use_docker=True</code> for safe automated code execution. Set
          <code>is_termination_msg</code> to detect when the assistant indicates success
          (e.g., "all tests pass" or "TERMINATE"). Limit <code>max_consecutive_auto_reply</code>
          to prevent runaway execution loops.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Use Docker for Code Execution in Production">
        <p>Always use <code>use_docker=True</code> when running code generated by LLMs in
        production environments. The Docker sandbox prevents generated code from accessing
        the host filesystem, network, or system resources. Configure the Docker image to
        include only the dependencies your agents need — this also serves as documentation
        of your execution environment.</p>
      </BestPracticeBlock>

      <NoteBlock type="warning" title="AutoGen Version Fragmentation">
        <p>AutoGen has gone through significant API changes. Version 0.2.x uses
        <code>pyautogen</code>. Version 0.4 introduced a complete rewrite with
        <code>autogen-agentchat</code> and <code>autogen-core</code> packages.
        Pin your version in <code>requirements.txt</code> and check the migration
        guide when upgrading. The examples above target the 0.2.x API which remains
        widely deployed.</p>
      </NoteBlock>
    </article>
  )
}
