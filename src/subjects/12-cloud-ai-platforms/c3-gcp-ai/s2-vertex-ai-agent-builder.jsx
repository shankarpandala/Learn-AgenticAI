import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function VertexAIAgentBuilder() {
  return (
    <article className="prose-content">
      <h2>Vertex AI Agent Builder</h2>
      <p>
        Vertex AI Agent Builder is Google Cloud's managed platform for building production
        agents without writing orchestration code. It combines Dialogflow CX's battle-tested
        conversation management with Gemini's LLM capabilities, wrapping both in a unified
        console, API, and evaluation framework. You can build three types of agents: Playbooks
        (LLM-driven, instruction-following), Flows (deterministic, graph-based), or hybrid
        agents that combine both.
      </p>

      <ArchitectureDiagram
        title="Vertex AI Agent Builder Components"
        width={720}
        height={320}
        nodes={[
          { id: 'user', label: 'End User', type: 'external', x: 60, y: 160 },
          { id: 'agent', label: 'Agent\n(Playbook/Flow)', type: 'agent', x: 220, y: 160 },
          { id: 'datastore', label: 'Data Store\n(RAG)', type: 'store', x: 420, y: 80 },
          { id: 'tools', label: 'Tools\n(OpenAPI/Functions)', type: 'tool', x: 420, y: 160 },
          { id: 'gemini', label: 'Gemini\nLLM', type: 'llm', x: 420, y: 240 },
          { id: 'eval', label: 'Evaluation\nFramework', type: 'tool', x: 600, y: 100 },
          { id: 'deploy', label: 'Deployment\n(API/Messenger)', type: 'external', x: 600, y: 220 },
        ]}
        edges={[
          { from: 'user', to: 'agent', label: 'query' },
          { from: 'agent', to: 'datastore', label: 'RAG lookup' },
          { from: 'agent', to: 'tools', label: 'function call' },
          { from: 'agent', to: 'gemini', label: 'generation' },
          { from: 'gemini', to: 'agent', label: 'response' },
          { from: 'agent', to: 'deploy' },
          { from: 'agent', to: 'eval', label: 'metrics' },
        ]}
      />

      <h2>Core Concepts</h2>

      <ConceptBlock term="Data Stores">
        <p>
          Data stores are the RAG layer of Agent Builder. They ingest documents from multiple
          sources — Cloud Storage (PDF, HTML, TXT, DOCX), BigQuery tables, websites (crawled
          on a schedule), or third-party connectors (Salesforce, SharePoint, Confluence, Jira).
          Agent Builder handles chunking, embedding, and indexing automatically. Each data store
          can be attached to an agent as a grounding tool, so the agent retrieves relevant
          chunks before generating a response. Data stores support metadata filtering and
          access control lists (ACL-aware search) for enterprise scenarios.
        </p>
      </ConceptBlock>

      <ConceptBlock term="Playbooks">
        <p>
          Playbooks are LLM-based agents defined entirely by natural language instructions and
          examples. You write a goal statement, a set of step-by-step instructions, and
          few-shot input/output examples. Gemini interprets these instructions at runtime to
          decide which tools to call and how to respond. Playbooks are the right choice for
          open-ended conversational agents where you can't enumerate every possible user path.
          They support sub-playbooks for modular design — a router playbook can hand off to
          specialist sub-playbooks for billing, technical support, or HR queries.
        </p>
      </ConceptBlock>

      <ConceptBlock term="Flows (Dialogflow CX)">
        <p>
          Flows use Dialogflow CX's deterministic state machine: pages, routes, fulfillments,
          and parameters. Every transition is explicit and auditable — nothing is left to
          LLM interpretation. Flows are ideal for compliance-critical paths (e.g., account
          cancellation that must follow a specific disclosure script) or high-volume, narrow
          intents where latency and predictability matter more than flexibility. Flows can
          call Playbooks for sub-tasks that require open-ended reasoning.
        </p>
      </ConceptBlock>

      <h2>Data Store: Creating and Querying</h2>

      <SDKExample
        title="Data Store Setup and Query (google-cloud-discoveryengine)"
        tabs={{
          python: `from google.cloud import discoveryengine_v1 as discoveryengine
from google.api_core.client_options import ClientOptions

PROJECT_ID = "my-gcp-project"
LOCATION = "us"         # Data stores are global or us/eu
DATA_STORE_ID = "my-docs-store"

# Client with correct endpoint for global/US location
client_options = ClientOptions(
    api_endpoint=f"{LOCATION}-discoveryengine.googleapis.com"
)
client = discoveryengine.SearchServiceClient(client_options=client_options)

# Build the serving config resource name
serving_config = (
    f"projects/{PROJECT_ID}/locations/{LOCATION}"
    f"/collections/default_collection"
    f"/dataStores/{DATA_STORE_ID}"
    f"/servingConfigs/default_config"
)

# 1. Search the data store (semantic + keyword hybrid)
request = discoveryengine.SearchRequest(
    serving_config=serving_config,
    query="What is the refund policy for enterprise contracts?",
    page_size=5,
    content_search_spec=discoveryengine.SearchRequest.ContentSearchSpec(
        snippet_spec=discoveryengine.SearchRequest.ContentSearchSpec.SnippetSpec(
            return_snippet=True,
            max_snippet_count=3,
        ),
        summary_spec=discoveryengine.SearchRequest.ContentSearchSpec.SummarySpec(
            summary_result_count=3,
            include_citations=True,
            model_spec=discoveryengine.SearchRequest.ContentSearchSpec.SummarySpec.ModelSpec(
                version="stable"
            ),
        ),
    ),
)

response = client.search(request)

# The summary contains a grounded answer with citations
print("Summary:", response.summary.summary_text)
for result in response.results:
    doc = result.document
    print(f"  Doc: {doc.name}, Score: {result.model_scores}")

# 2. Import documents from Cloud Storage
import_client = discoveryengine.DocumentServiceClient(client_options=client_options)
parent = (
    f"projects/{PROJECT_ID}/locations/{LOCATION}"
    f"/collections/default_collection/dataStores/{DATA_STORE_ID}/branches/default_branch"
)

operation = import_client.import_documents(
    request=discoveryengine.ImportDocumentsRequest(
        parent=parent,
        gcs_source=discoveryengine.GcsSource(
            input_uris=["gs://my-bucket/docs/**"],
            data_schema="content",  # "content" for unstructured, "custom" for JSON
        ),
        reconciliation_mode=discoveryengine.ImportDocumentsRequest.ReconciliationMode.INCREMENTAL,
    )
)

# Wait for import to complete
print("Waiting for import:", operation.operation.name)
result = operation.result(timeout=300)
print(f"Import complete: {result.error_samples}")`,
        }}
      />

      <h2>Playbook Agent: Python SDK</h2>
      <p>
        The Dialogflow CX SDK (<code>google-cloud-dialogflow-cx</code>) is used to interact
        with deployed Agent Builder agents programmatically — sending messages, managing
        sessions, and streaming responses.
      </p>

      <CodeBlock language="python" filename="agent_builder_playbook.py">
{`from google.cloud.dialogflowcx_v3 import SessionsClient, QueryInput, TextInput
from google.api_core.client_options import ClientOptions
import uuid

PROJECT_ID = "my-gcp-project"
LOCATION = "us-central1"
AGENT_ID = "my-agent-id"   # From Agent Builder console

client_options = ClientOptions(
    api_endpoint=f"{LOCATION}-dialogflow.googleapis.com"
)
client = SessionsClient(client_options=client_options)

# Each conversation gets a unique session ID
session_id = str(uuid.uuid4())
session_path = client.session_path(PROJECT_ID, LOCATION, AGENT_ID, session_id)

def chat(user_message: str) -> str:
    """Send a message and get a response from the agent."""
    request = {
        "session": session_path,
        "query_input": QueryInput(
            text=TextInput(text=user_message),
            language_code="en",
        ),
    }
    response = client.detect_intent(request=request)
    query_result = response.query_result

    # Extract text response
    for message in query_result.response_messages:
        if hasattr(message, "text") and message.text.text:
            return message.text.text[0]
    return ""

# Streaming detect intent (lower time-to-first-token)
def stream_chat(user_message: str):
    """Stream response tokens from the agent."""
    requests = [
        {
            "session": session_path,
            "query_input": QueryInput(
                text=TextInput(text=user_message),
                language_code="en",
            ),
        }
    ]
    for response in client.streaming_detect_intent(iter(requests)):
        if response.detect_intent_response:
            for msg in response.detect_intent_response.query_result.response_messages:
                if hasattr(msg, "text") and msg.text.text:
                    yield msg.text.text[0]

# Example conversation
print(chat("What is your refund policy?"))
print(chat("Can I get a refund on a 2-year contract?"))

for token in stream_chat("Summarize our conversation"):
    print(token, end="", flush=True)`}
      </CodeBlock>

      <h2>Tools: OpenAPI Spec Integration</h2>
      <p>
        Agent Builder tools connect the agent to external APIs using OpenAPI 3.0 specs.
        When the agent decides to call an external system, it constructs the API request
        automatically from the spec and your provided auth configuration.
      </p>

      <CodeBlock language="yaml" filename="weather_tool_spec.yaml">
{`openapi: "3.0.0"
info:
  title: Weather API
  version: "1.0"
servers:
  - url: https://api.weather.example.com
paths:
  /current:
    get:
      operationId: getCurrentWeather
      summary: Get current weather for a location
      parameters:
        - name: city
          in: query
          required: true
          schema:
            type: string
          description: City name or lat,lon
        - name: units
          in: query
          schema:
            type: string
            enum: [metric, imperial]
            default: metric
      responses:
        "200":
          description: Current weather data
          content:
            application/json:
              schema:
                type: object
                properties:
                  temperature: {type: number}
                  condition: {type: string}
                  humidity: {type: number}`}
      </CodeBlock>

      <h2>Evaluation Framework</h2>
      <p>
        Agent Builder's evaluation framework measures agent quality automatically using
        Gemini as an evaluator. Key metrics include tool call accuracy (did the agent
        call the right tool?), trajectory evaluation (did it follow the correct sequence
        of steps?), and response quality (helpfulness, groundedness, safety).
      </p>

      <CodeBlock language="python" filename="agent_evaluation.py">
{`from vertexai.preview.evaluation import EvalTask
from vertexai.preview.generative_models import GenerativeModel
import pandas as pd

# Evaluation dataset: input queries with expected tool calls / responses
eval_dataset = pd.DataFrame({
    "prompt": [
        "What is the weather in London?",
        "Book a flight from NYC to Paris on March 20",
        "What is our refund policy?",
    ],
    "reference": [
        "The weather in London is 12°C and cloudy.",
        "I found flights from NYC to Paris on March 20 starting at $450.",
        "Our refund policy allows returns within 30 days.",
    ],
    # Expected tool calls for trajectory evaluation
    "expected_tool_calls": [
        ["getCurrentWeather"],
        ["searchFlights"],
        [],  # Should use data store, not a tool
    ],
})

# Define evaluation metrics
metrics = [
    "coherence",
    "groundedness",
    "tool_call_valid",       # Checks if tool calls match expected
    "trajectory_exact_match", # Full trajectory must match
]

eval_task = EvalTask(
    dataset=eval_dataset,
    metrics=metrics,
    experiment="agent-eval-v1",
)

# Run evaluation against the deployed agent
eval_result = eval_task.evaluate(
    model=GenerativeModel("gemini-1.5-pro-002"),
)

print(eval_result.summary_metrics)
# Output: {'coherence/mean': 4.2, 'groundedness/mean': 0.91, ...}
eval_result.metrics_table.to_csv("eval_results.csv", index=False)`}
      </CodeBlock>

      <PatternBlock
        name="Hybrid Playbook + Flow Agent"
        category="Agent Architecture"
        whenToUse="When you need flexibility for open-ended queries but deterministic control for compliance-critical paths — e.g., a support agent where most questions are handled by a Playbook but account deletion follows a mandatory script."
      >
        <p>
          Design the top-level agent as a Playbook that routes to either sub-Playbooks or
          Flows based on intent. The Playbook handles free-form queries with LLM reasoning,
          while critical regulated actions (e.g., cancellations, PII collection) use Flows
          with explicit page transitions and fulfillments. This gives you the best of both:
          natural conversation for most paths, and ironclad auditability where it matters.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Data Store Chunking Strategy">
        <p>Agent Builder's default chunking (512 tokens with 50-token overlap) works for
        most documents. For technical documentation with code blocks, override the chunk
        size to 1024 tokens to avoid splitting examples. For FAQ documents, consider
        structured import with one chunk per Q&A pair — use the custom JSON schema import
        format with explicit <code>id</code>, <code>content</code>, and <code>metadata</code>
        fields to give the retriever cleaner signal.</p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Dialogflow Messenger for Quick Deployment">
        <p>
          Agent Builder includes Dialogflow Messenger — a pre-built web chat widget that
          can be embedded with two lines of HTML. It handles session management, rich
          responses (cards, chips, carousels), and supports custom CSS theming. For
          production deployments, combine it with Identity Platform for authenticated
          sessions and Cloud Armor for DDoS protection on the underlying API endpoint.
        </p>
      </NoteBlock>
    </article>
  )
}
