import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function OpenAIAssistants() {
  return (
    <article className="prose-content">
      <h2>OpenAI Assistants API</h2>
      <p>
        The OpenAI Assistants API provides a higher-level abstraction over the Chat Completions
        API: it manages conversation threads, handles file uploads and retrieval, and provides
        built-in tools for code execution (<code>code_interpreter</code>) and document search
        (<code>file_search</code>). For coding agents specifically, <code>code_interpreter</code>
        is the key feature — it runs Python in a sandboxed container and can generate and display
        charts, process files, and iterate on code until it produces correct output.
      </p>

      <ConceptBlock term="Assistants API Primitives">
        <p>
          The API has four core objects:
        </p>
        <ul>
          <li><strong>Assistant</strong> — A configured model with instructions, tools, and optionally attached files. Persists indefinitely.</li>
          <li><strong>Thread</strong> — A conversation history. Messages are appended to a thread; OpenAI manages truncation automatically.</li>
          <li><strong>Message</strong> — A single turn (user or assistant) within a thread. Can contain text, images, and file references.</li>
          <li><strong>Run</strong> — An invocation of an assistant on a thread. A run progresses through statuses: <code>queued → in_progress → completed</code> (or <code>requires_action</code> for custom tool calls).</li>
        </ul>
      </ConceptBlock>

      <h2>Creating a Coding Assistant</h2>

      <SDKExample
        title="Creating an Assistant with code_interpreter"
        tabs={{
          python: `from openai import OpenAI

client = OpenAI()

# Create a reusable assistant (do this once; store the ID)
assistant = client.beta.assistants.create(
    name="Data Analysis Assistant",
    instructions=(
        "You are a Python data analysis expert. "
        "When asked to analyze data, write and execute Python code. "
        "Always show your code and explain your findings. "
        "Use pandas, numpy, and matplotlib as needed."
    ),
    model="gpt-4o",
    tools=[{"type": "code_interpreter"}],
)

print(f"Assistant ID: {assistant.id}")
# Save this ID: asst_abc123... — reuse it in future sessions`,
          typescript: `import OpenAI from 'openai';

const client = new OpenAI();

const assistant = await client.beta.assistants.create({
  name: 'Code Generation Assistant',
  instructions:
    'You are an expert TypeScript developer. Write clean, type-safe code with tests. ' +
    'Use code_interpreter to verify your code compiles and runs correctly.',
  model: 'gpt-4o',
  tools: [{ type: 'code_interpreter' }],
});

console.log('Assistant ID:', assistant.id);`,
        }}
      />

      <h2>Threads and Runs</h2>

      <SDKExample
        title="Full Conversation with Polling"
        tabs={{
          python: `import time
from openai import OpenAI

client = OpenAI()
ASSISTANT_ID = "asst_your_id_here"

# Create a new thread for this conversation
thread = client.beta.threads.create()

# Add a user message
client.beta.threads.messages.create(
    thread_id=thread.id,
    role="user",
    content=(
        "I have a CSV file with columns: date, revenue, expenses. "
        "Calculate the monthly profit, find the best and worst months, "
        "and create a bar chart. Here's the data:\\n"
        "date,revenue,expenses\\n"
        "2024-01,120000,85000\\n"
        "2024-02,135000,90000\\n"
        "2024-03,98000,102000\\n"
        "2024-04,145000,88000\\n"
    ),
)

# Start a run
run = client.beta.threads.runs.create(
    thread_id=thread.id,
    assistant_id=ASSISTANT_ID,
)

# Poll until complete
while run.status in ("queued", "in_progress"):
    time.sleep(1)
    run = client.beta.threads.runs.retrieve(
        thread_id=thread.id,
        run_id=run.id,
    )

print(f"Run status: {run.status}")

# Retrieve the assistant's response
messages = client.beta.threads.messages.list(
    thread_id=thread.id,
    order="desc",
    limit=1,
)

for msg in messages.data:
    for block in msg.content:
        if block.type == "text":
            print(block.text.value)
        elif block.type == "image_file":
            print(f"Generated image: {block.image_file.file_id}")`,
          typescript: `import OpenAI from 'openai';

const client = new OpenAI();
const ASSISTANT_ID = 'asst_your_id_here';

// Create thread and add message
const thread = await client.beta.threads.create();

await client.beta.threads.messages.create(thread.id, {
  role: 'user',
  content: 'Write and run a Python script that generates the first 20 Fibonacci numbers.',
});

// Create a run
let run = await client.beta.threads.runs.create(thread.id, {
  assistant_id: ASSISTANT_ID,
});

// Poll for completion
while (run.status === 'queued' || run.status === 'in_progress') {
  await new Promise(r => setTimeout(r, 1000));
  run = await client.beta.threads.runs.retrieve(thread.id, run.id);
}

// Get response
const messages = await client.beta.threads.messages.list(thread.id, {
  order: 'desc',
  limit: 1,
});

for (const block of messages.data[0].content) {
  if (block.type === 'text') console.log(block.text.value);
}`,
        }}
      />

      <h2>Streaming Runs</h2>
      <p>
        Instead of polling, use streaming to receive run events and assistant output as they
        arrive. This gives a much better user experience for interactive applications.
      </p>

      <SDKExample
        title="Streaming with Event Handler"
        tabs={{
          python: `from openai import OpenAI
from openai.lib.streaming.beta import AssistantEventHandler
from typing_extensions import override

client = OpenAI()

class CodeHandler(AssistantEventHandler):
    @override
    def on_text_delta(self, delta, snapshot):
        print(delta.value, end="", flush=True)

    @override
    def on_tool_call_delta(self, delta, snapshot):
        if delta.type == "code_interpreter":
            if delta.code_interpreter.input:
                print(f"\\n[Code]\\n{delta.code_interpreter.input}", flush=True)
            if delta.code_interpreter.outputs:
                for output in delta.code_interpreter.outputs:
                    if output.type == "logs":
                        print(f"[Output]\\n{output.logs}", flush=True)

ASSISTANT_ID = "asst_your_id_here"
thread = client.beta.threads.create()

client.beta.threads.messages.create(
    thread_id=thread.id,
    role="user",
    content="Sort this list with quicksort and show me the implementation: [3, 1, 4, 1, 5, 9, 2, 6]",
)

with client.beta.threads.runs.stream(
    thread_id=thread.id,
    assistant_id=ASSISTANT_ID,
    event_handler=CodeHandler(),
) as stream:
    stream.until_done()`,
        }}
      />

      <h2>File Uploads and file_search</h2>
      <p>
        Upload files to OpenAI's storage and attach them to a thread or assistant. With the
        <code> file_search</code> tool enabled, the assistant automatically retrieves relevant
        chunks from uploaded documents using semantic search backed by a vector store.
      </p>

      <SDKExample
        title="Uploading Files for code_interpreter"
        tabs={{
          python: `from openai import OpenAI

client = OpenAI()

# Upload a file for code_interpreter to process
with open("data.csv", "rb") as f:
    file = client.files.create(file=f, purpose="assistants")

print(f"File ID: {file.id}")

# Create a thread with the file attached
thread = client.beta.threads.create()
client.beta.threads.messages.create(
    thread_id=thread.id,
    role="user",
    content="Analyze the attached CSV and find any anomalies.",
    attachments=[
        {
            "file_id": file.id,
            "tools": [{"type": "code_interpreter"}],
        }
    ],
)

# For file_search (RAG over documents):
vector_store = client.beta.vector_stores.create(name="Project Docs")
with open("architecture.pdf", "rb") as f:
    client.beta.vector_stores.file_batches.upload_and_poll(
        vector_store_id=vector_store.id,
        files=[f],
    )

# Attach vector store to an assistant
client.beta.assistants.update(
    assistant_id="asst_your_id",
    tool_resources={"file_search": {"vector_store_ids": [vector_store.id]}},
)`,
        }}
      />

      <PatternBlock title="Assistants API vs. Chat Completions API">
        <p>
          Choose the right API for your use case:
        </p>
        <ul>
          <li>Use <strong>Chat Completions</strong> when you manage conversation state yourself, want full control over context, need streaming with tool calls in a custom loop, or are building a simple one-shot code generation endpoint.</li>
          <li>Use <strong>Assistants API</strong> when you want managed conversation history, need <code>code_interpreter</code> for sandboxed execution, are building a multi-session application where users return to the same thread, or need file uploads and vector search.</li>
        </ul>
      </PatternBlock>

      <WarningBlock title="Assistants API Cost Implications">
        <p>
          The Assistants API charges for vector store storage ($0.10/GB/day) and code interpreter
          usage ($0.03/session). Thread storage is also managed by OpenAI. For cost-sensitive
          applications, manually managing state with Chat Completions and a local database is
          significantly cheaper than using the Assistants API for high-volume workloads.
        </p>
      </WarningBlock>

      <BestPracticeBlock title="Assistants API Best Practices">
        <ul>
          <li>Create one Assistant object per persona/configuration and reuse its ID — don't create a new assistant on every request.</li>
          <li>Create a new Thread per user session or task to keep conversations isolated.</li>
          <li>Use <code>additional_instructions</code> on the Run object for task-specific instructions rather than modifying the base Assistant.</li>
          <li>Always handle the <code>requires_action</code> run status for custom function tool calls.</li>
          <li>Delete unused files and vector stores to avoid ongoing storage charges.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Run Steps for Debugging">
        <p>
          Use <code>client.beta.threads.runs.steps.list(thread_id, run_id)</code> to inspect
          every tool call and its result within a run. This is the equivalent of
          <code>--verbose</code> mode — it shows exactly what code the interpreter ran, what
          the output was, and how the model used the results.
        </p>
      </NoteBlock>
    </article>
  )
}
