import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function VertexAIGemini() {
  return (
    <article className="prose-content">
      <h2>Vertex AI + Gemini: Google's Foundation Models on GCP</h2>
      <p>
        Vertex AI is Google Cloud's unified ML platform, and Gemini is Google's flagship family
        of multimodal foundation models. Together they provide a fully managed, enterprise-ready
        environment for building AI applications — with built-in grounding, function calling,
        safety settings, and a massive 1 million token context window.
      </p>

      <ConceptBlock term="Gemini Model Family">
        <p>
          Google offers three primary Gemini tiers for different workloads. <strong>Gemini 2.0 Flash</strong>{' '}
          (<code>gemini-2.0-flash-001</code>) is optimized for low latency and high throughput,
          making it the default choice for agentic loops and interactive applications.{' '}
          <strong>Gemini 1.5 Pro</strong> (<code>gemini-1.5-pro-002</code>) delivers the highest
          intelligence with a true 1M token context window — enough to process entire codebases,
          hour-long videos, or thousands of documents in a single call.{' '}
          <strong>Gemini 1.5 Flash</strong> sits between them: faster and cheaper than Pro, more
          capable than standard Flash. All models support multimodal inputs: text, images, video,
          audio, and PDF documents natively.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram
        title="Vertex AI Gemini Architecture"
        width={680}
        height={300}
        nodes={[
          { id: 'client', label: 'Application', type: 'external', x: 70, y: 150 },
          { id: 'vertex', label: 'Vertex AI\nEndpoint', type: 'agent', x: 220, y: 150 },
          { id: 'gemini', label: 'Gemini Model\n(Flash / Pro)', type: 'llm', x: 400, y: 80 },
          { id: 'grounding', label: 'Google Search\nGrounding', type: 'store', x: 400, y: 180 },
          { id: 'tools', label: 'Function\nCalling / Tools', type: 'tool', x: 400, y: 260 },
          { id: 'response', label: 'Grounded\nResponse', type: 'external', x: 580, y: 150 },
        ]}
        edges={[
          { from: 'client', to: 'vertex', label: 'request' },
          { from: 'vertex', to: 'gemini' },
          { from: 'vertex', to: 'grounding' },
          { from: 'vertex', to: 'tools' },
          { from: 'gemini', to: 'response' },
          { from: 'grounding', to: 'response' },
          { from: 'tools', to: 'response' },
        ]}
      />

      <h2>Core Capabilities</h2>

      <h3>1 Million Token Context Window</h3>
      <p>
        Gemini 1.5 Pro's context window is genuinely transformative for agentic workloads. You
        can pass an entire codebase, a full legal contract corpus, or 90 minutes of video as
        context and ask questions over it without any retrieval step. This changes the RAG
        equation: for document sets under ~750K tokens, in-context retrieval can outperform
        vector search on precision while dramatically simplifying the pipeline.
      </p>

      <h3>Multimodal Inputs</h3>
      <p>
        Every Gemini model accepts interleaved content: text, images (JPEG, PNG, WebP, HEIC),
        video (MP4, MOV, AVI up to 1 hour), audio (WAV, MP3, FLAC), and PDF documents. Inputs
        are passed as <code>Part</code> objects inside a <code>Content</code> message. For large
        files, use Cloud Storage URIs rather than inline base64 encoding.
      </p>

      <h3>Grounding with Google Search</h3>
      <p>
        Grounding connects Gemini's responses to live web data via Google Search. When enabled,
        the model automatically retrieves relevant web pages and cites them in its response —
        dramatically reducing hallucinations on factual queries. Grounding is configured via
        <code>tools=[Tool(google_search_retrieval=GoogleSearchRetrieval())]</code>.
      </p>

      <h2>SDK: google-cloud-aiplatform</h2>
      <p>
        The canonical SDK for Vertex AI is <code>google-cloud-aiplatform</code>. It provides
        the <code>GenerativeModel</code> class that wraps Gemini models with Vertex AI's
        enterprise features (IAM, audit logging, VPC, regional endpoints).
      </p>

      <NoteBlock type="info" title="Vertex AI SDK vs. google.generativeai">
        <p>
          There are two Python SDKs for Gemini. <code>google.generativeai</code> (the Gemini
          API SDK) uses an API key and targets the Google AI Studio endpoint — suitable for
          prototyping and consumer applications. <code>google-cloud-aiplatform</code> (the
          Vertex AI SDK) uses GCP service account credentials and routes through Vertex AI —
          required for enterprise features: data residency, VPC Service Controls, CMEK
          encryption, Cloud Audit Logs, and committed use discounts. Use Vertex AI for any
          production GCP deployment.
        </p>
      </NoteBlock>

      <SDKExample
        title="Gemini on Vertex AI — Core Usage"
        tabs={{
          python: `import vertexai
from vertexai.generative_models import (
    GenerativeModel,
    GenerationConfig,
    SafetySetting,
    HarmCategory,
    HarmBlockThreshold,
    Part,
    Tool,
    FunctionDeclaration,
    GoogleSearchRetrieval,
)

# Initialize Vertex AI — reads ADC credentials automatically
vertexai.init(project="my-gcp-project", location="us-central1")

# 1. Basic text generation
model = GenerativeModel("gemini-2.0-flash-001")
response = model.generate_content("Explain chain-of-thought prompting in 3 sentences.")
print(response.text)

# 2. System instructions + generation config
model = GenerativeModel(
    "gemini-1.5-pro-002",
    system_instruction=[
        "You are a senior software architect. Be concise and use examples.",
        "Always recommend production-ready patterns."
    ]
)

generation_config = GenerationConfig(
    temperature=0.2,
    top_p=0.8,
    max_output_tokens=2048,
    response_mime_type="application/json",  # Force JSON output
)

response = model.generate_content(
    "List the top 3 patterns for building resilient microservices.",
    generation_config=generation_config,
)

# 3. Multimodal: image + text
with open("architecture_diagram.png", "rb") as f:
    image_bytes = f.read()

image_part = Part.from_data(data=image_bytes, mime_type="image/png")
# Or from Cloud Storage: Part.from_uri("gs://bucket/image.png", mime_type="image/png")

response = model.generate_content([
    image_part,
    "Analyze this architecture diagram. Identify any single points of failure."
])

# 4. Safety settings — reduce blocking for technical content
safety_settings = [
    SafetySetting(
        category=HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold=HarmBlockThreshold.BLOCK_ONLY_HIGH,
    ),
]

response = model.generate_content(
    "How does SQL injection work? (security research context)",
    safety_settings=safety_settings,
)

# 5. Grounding with Google Search
grounded_model = GenerativeModel(
    "gemini-2.0-flash-001",
    tools=[Tool(google_search_retrieval=GoogleSearchRetrieval())]
)

response = grounded_model.generate_content(
    "What is the current Vertex AI pricing for Gemini 1.5 Pro?"
)
# response.candidates[0].grounding_metadata contains cited sources
for chunk in response.candidates[0].grounding_metadata.grounding_chunks:
    print(f"Source: {chunk.web.uri}")
print(response.text)`,
        }}
      />

      <h2>Streaming Responses</h2>
      <p>
        For interactive applications, stream tokens as they are generated. Vertex AI supports
        server-sent events via the <code>stream=True</code> parameter.
      </p>

      <CodeBlock language="python" filename="gemini_streaming.py">
{`import vertexai
from vertexai.generative_models import GenerativeModel

vertexai.init(project="my-gcp-project", location="us-central1")
model = GenerativeModel("gemini-2.0-flash-001")

# Streaming generation
for chunk in model.generate_content("Write a haiku about distributed systems.", stream=True):
    print(chunk.text, end="", flush=True)
print()  # newline after stream

# Async streaming (for FastAPI / asyncio applications)
import asyncio

async def stream_response(prompt: str):
    responses = model.generate_content_async(prompt, stream=True)
    async for chunk in await responses:
        yield chunk.text

# Multi-turn conversation with streaming
chat = model.start_chat()
for chunk in chat.send_message("What is Vertex AI?", stream=True):
    print(chunk.text, end="", flush=True)
print()

# Continue the conversation (history is maintained automatically)
for chunk in chat.send_message("How does it compare to SageMaker?", stream=True):
    print(chunk.text, end="", flush=True)`}
      </CodeBlock>

      <h2>Function Calling</h2>
      <p>
        Gemini supports parallel function calling — it can request multiple tool calls in a
        single response. Define tools via <code>FunctionDeclaration</code> with JSON Schema
        parameter definitions.
      </p>

      <CodeBlock language="python" filename="gemini_function_calling.py">
{`from vertexai.generative_models import (
    GenerativeModel, Tool, FunctionDeclaration, Part
)

# Define function schemas
get_weather = FunctionDeclaration(
    name="get_weather",
    description="Get current weather for a city",
    parameters={
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "City name"},
            "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
        },
        "required": ["city"],
    },
)

search_flights = FunctionDeclaration(
    name="search_flights",
    description="Search for available flights between two cities",
    parameters={
        "type": "object",
        "properties": {
            "origin": {"type": "string"},
            "destination": {"type": "string"},
            "date": {"type": "string", "description": "ISO 8601 date"},
        },
        "required": ["origin", "destination", "date"],
    },
)

tools = Tool(function_declarations=[get_weather, search_flights])
model = GenerativeModel("gemini-2.0-flash-001", tools=[tools])

# Agentic loop
chat = model.start_chat()
response = chat.send_message(
    "I'm flying from NYC to London on 2025-03-20. What's the weather like there?"
)

# Handle parallel function calls
while response.candidates[0].finish_reason.name == "STOP" is False:
    tool_calls = response.candidates[0].content.parts
    tool_responses = []

    for part in tool_calls:
        if part.function_call:
            fn_name = part.function_call.name
            fn_args = dict(part.function_call.args)

            # Execute the actual function
            if fn_name == "get_weather":
                result = {"temp": 12, "condition": "cloudy", "city": fn_args["city"]}
            elif fn_name == "search_flights":
                result = {"flights": [{"airline": "BA", "price": 450}]}
            else:
                result = {"error": "Unknown function"}

            tool_responses.append(
                Part.from_function_response(name=fn_name, response=result)
            )

    response = chat.send_message(tool_responses)

print(response.text)`}
      </CodeBlock>

      <PatternBlock
        name="Grounded Generation with Citation Tracking"
        category="RAG / Grounding"
        whenToUse="When answering factual questions where accuracy is critical and hallucinations would be costly — legal, medical, financial, or technical documentation queries."
      >
        <p>
          Use Vertex AI's native Google Search grounding instead of building a custom RAG
          pipeline for general knowledge queries. The model automatically decides when to
          search, retrieves relevant content, and generates a grounded response with inline
          citations. For private data, combine grounding with Vertex AI Search data stores
          (covered in the Agent Builder section).
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Context Window Strategy">
        <p>For Gemini 1.5 Pro, prefer in-context loading over vector retrieval when your
        document set fits within 500K tokens. This eliminates retrieval errors and gives the
        model full access to all content. For larger corpora, use Vertex AI Search for managed
        chunking and retrieval. Always pass PDFs as <code>Part.from_uri</code> with a GCS URI
        rather than extracting text — Gemini's native PDF parsing preserves tables, charts,
        and layout that text extraction loses.</p>
      </BestPracticeBlock>

      <BestPracticeBlock title="Authentication and Regional Endpoints">
        <p>Use Application Default Credentials (ADC) via <code>gcloud auth application-default login</code>
        in development and Workload Identity Federation in production — never hardcode service
        account keys. Deploy to the same region as your data to minimize latency and satisfy
        data residency requirements. Use <code>us-central1</code> for the broadest model
        availability, <code>europe-west4</code> for EU data residency.</p>
      </BestPracticeBlock>

      <NoteBlock type="warning" title="Token Counting Before Long-Context Calls">
        <p>
          Always call <code>model.count_tokens(contents)</code> before submitting requests
          with large documents. Gemini 1.5 Pro's 1M token limit is per-request, and exceeding
          it raises an error. Token counting is free and fast — use it as a guard before
          every long-context call. A 100-page PDF is roughly 50K–80K tokens depending on
          density.
        </p>
      </NoteBlock>
    </article>
  )
}
