import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'

export default function CrewAI() {
  return (
    <article className="prose-content">
      <h2>CrewAI</h2>
      <p>
        CrewAI is a multi-agent orchestration framework that models collaboration as a
        "crew" of specialized AI agents working together on tasks. It provides high-level
        abstractions — <code>Crew</code>, <code>Agent</code>, <code>Task</code> — that
        map naturally to how human teams divide and conquer complex problems.
      </p>

      <ConceptBlock term="Crew">
        <p>
          A <strong>Crew</strong> is the top-level orchestrator that manages a group of agents
          and a list of tasks. It handles agent assignment, task sequencing, and inter-agent
          communication. Crews can run in <code>sequential</code> process (one task at a time)
          or <code>hierarchical</code> process (a manager agent delegates to workers).
        </p>
      </ConceptBlock>

      <ConceptBlock term="Agent">
        <p>
          An <strong>Agent</strong> is a specialized role with a defined goal, backstory, and
          set of tools. The role and backstory act as a system prompt that shapes the agent's
          behavior. Agents can delegate tasks to each other when using hierarchical process.
        </p>
      </ConceptBlock>

      <ConceptBlock term="Task">
        <p>
          A <strong>Task</strong> is a specific piece of work assigned to an agent. It includes
          a description, expected output format, and optionally an output file path or Pydantic
          model for structured output. Tasks can depend on the output of previous tasks via
          <code>context</code>.
        </p>
      </ConceptBlock>

      <h2>Installation and Setup</h2>

      <SDKExample
        title="Installing CrewAI"
        tabs={{
          python: `# Install CrewAI with all tools
pip install crewai crewai-tools

# Or minimal install
pip install crewai`,
        }}
      />

      <h2>Research + Writing Crew</h2>
      <p>
        The following example builds a two-agent crew: a researcher that gathers information
        and a writer that produces a polished report. Tasks flow sequentially with the writer
        receiving the researcher's output as context.
      </p>

      <SDKExample
        title="Research and Writing Crew"
        tabs={{
          python: `from crewai import Agent, Task, Crew, Process
from crewai_tools import SerperDevTool, WebsiteSearchTool
from langchain_anthropic import ChatAnthropic
import os

os.environ["ANTHROPIC_API_KEY"] = "your-key"
os.environ["SERPER_API_KEY"] = "your-serper-key"

# Initialize LLM
llm = ChatAnthropic(model="claude-opus-4-6", temperature=0.1)

# Initialize tools
search_tool = SerperDevTool()
web_tool = WebsiteSearchTool()

# Define Agents
researcher = Agent(
    role="Senior AI Research Analyst",
    goal=(
        "Uncover cutting-edge developments in AI and machine learning, "
        "gathering accurate, up-to-date information from reliable sources."
    ),
    backstory=(
        "You are an expert researcher with 10 years of experience in AI/ML. "
        "You have a talent for finding credible sources, synthesizing complex "
        "technical information, and identifying key trends. You always verify "
        "claims with multiple sources."
    ),
    tools=[search_tool, web_tool],
    llm=llm,
    verbose=True,
    allow_delegation=False,
    max_iter=5,  # Max reasoning iterations per task
)

writer = Agent(
    role="Technical Content Writer",
    goal=(
        "Create clear, engaging technical content that makes complex AI topics "
        "accessible to a broad technical audience."
    ),
    backstory=(
        "You are a skilled technical writer who transforms dense research findings "
        "into compelling narratives. You excel at structure, clarity, and making "
        "complex topics approachable without sacrificing accuracy."
    ),
    tools=[],  # Writer only needs research output, no external tools
    llm=llm,
    verbose=True,
    allow_delegation=False,
)

# Define Tasks
research_task = Task(
    description=(
        "Research the current state of {topic}. Focus on: "
        "1) Key recent developments (last 6 months), "
        "2) Leading frameworks and tools, "
        "3) Real-world production use cases, "
        "4) Open challenges and limitations. "
        "Collect specific facts, statistics, and examples."
    ),
    expected_output=(
        "A comprehensive research report with sections for: recent developments, "
        "key frameworks, production use cases, and challenges. "
        "Include specific citations and data points."
    ),
    agent=researcher,
    output_file="research_notes.md",
)

writing_task = Task(
    description=(
        "Using the research provided, write a 800-word technical blog post about {topic}. "
        "The post should: have a compelling title, clear introduction, 3-4 substantive "
        "sections with headers, practical takeaways, and a conclusion. "
        "Tone: authoritative but accessible."
    ),
    expected_output=(
        "A polished, publication-ready blog post in Markdown format with "
        "proper headers, clear structure, and actionable insights."
    ),
    agent=writer,
    context=[research_task],  # Writer receives researcher's output
    output_file="blog_post.md",
)

# Assemble the Crew
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, writing_task],
    process=Process.sequential,  # Tasks run in order
    verbose=True,
    memory=True,          # Enable short-term and long-term memory
    embedder={
        "provider": "openai",
        "config": {"model": "text-embedding-3-small"}
    },
)

# Kick it off
result = crew.kickoff(inputs={"topic": "agentic AI frameworks in 2025"})
print(result.raw)
print(f"\\nToken usage: {result.token_usage}")`,
        }}
      />

      <h2>Hierarchical Process</h2>
      <p>
        In hierarchical mode, CrewAI automatically creates a manager agent (using a more
        powerful LLM) that plans, delegates tasks to worker agents, and validates results.
        This is suitable for complex, open-ended tasks where dynamic task assignment is needed.
      </p>

      <SDKExample
        title="Hierarchical Crew with Manager"
        tabs={{
          python: `from crewai import Agent, Task, Crew, Process
from langchain_anthropic import ChatAnthropic

# Worker agents
analyst = Agent(
    role="Data Analyst",
    goal="Analyze data and extract insights",
    backstory="Expert in statistical analysis and data visualization.",
    llm=ChatAnthropic(model="claude-sonnet-4-6"),
)

developer = Agent(
    role="Software Engineer",
    goal="Write and review code",
    backstory="Senior engineer specializing in Python and data pipelines.",
    llm=ChatAnthropic(model="claude-sonnet-4-6"),
)

# Hierarchical crew — manager is auto-created
crew = Crew(
    agents=[analyst, developer],
    tasks=[complex_task],
    process=Process.hierarchical,
    manager_llm=ChatAnthropic(model="claude-opus-4-6"),  # Smarter manager
    verbose=True,
)

result = crew.kickoff()`,
        }}
      />

      <PatternBlock
        name="Research + Write Crew"
        category="Multi-Agent"
        whenToUse="Content generation pipelines where research quality directly feeds writing quality. The sequential dependency ensures the writer always has verified, structured data to work from."
      >
        <p>
          Assign a dedicated researcher agent with web search tools and a writer agent with
          no external tools. Chain them with <code>context=[research_task]</code> so the
          writer receives the full research output. Use <code>output_file</code> on the
          research task to persist findings for auditing.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Craft Detailed Agent Backstories">
        <p>The <code>backstory</code> field functions as a system prompt for that agent.
        Be specific about expertise level, work style, and constraints. An agent with
        backstory "You always verify claims with multiple sources before reporting" will
        behave measurably differently than one without this instruction. Test backstories
        by running single-agent tasks before assembling a full crew.</p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Memory and Caching">
        <p>Enable <code>memory=True</code> on your Crew to give agents short-term memory
        (within a run) and long-term memory (across runs via a vector store). This is
        especially valuable for crews that run repeatedly on similar topics. Set
        <code>cache=True</code> on individual tools to avoid redundant API calls when
        the same tool is called with identical arguments.</p>
      </NoteBlock>
    </article>
  )
}
