import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'

export default function VertexAiSdk() {
  return (
    <article className="prose-content">
      <h2>Google Cloud AI Platform SDK (Vertex AI)</h2>
      <p>
        Google provides the <strong>google-cloud-aiplatform</strong> Python SDK for Vertex AI,
        which includes Gemini models, embeddings, fine-tuning, and all Vertex AI services.
        For Gemini specifically, you can also use the <strong>google-generativeai</strong>
        package (Gemini API / Google AI Studio), but Vertex AI is required for enterprise
        features: VPC isolation, private endpoints, regional data processing, and compliance.
      </p>

      <ConceptBlock term="Vertex AI vs. Gemini API">
        <p>
          <strong>Vertex AI SDK (<code>google-cloud-aiplatform</code>):</strong> Enterprise,
          GCP-native, uses Application Default Credentials, supports all GCP security controls,
          SLA-backed, models deployed in your GCP project's region.
          <br />
          <strong>Gemini API (<code>google-generativeai</code>):</strong> Consumer-grade,
          uses API keys, simpler setup, no VPC/IAM, designed for prototyping and non-enterprise use.
        </p>
        <p>For production enterprise agents, always use Vertex AI.</p>
      </ConceptBlock>

      <h2>Installation and Authentication</h2>

      <CodeBlock language="bash" filename="install.sh">
{`# Vertex AI SDK
pip install google-cloud-aiplatform

# Application Default Credentials (ADC) setup
# Option 1: Service account key (avoid in production)
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/sa-key.json"

# Option 2: gcloud CLI (local development)
gcloud auth application-default login
gcloud config set project your-project-id

# Option 3: Workload Identity (GKE, Cloud Run, Compute Engine - recommended)
# Automatically uses the GCP service account attached to the workload
# No credentials to manage

# Option 4: Impersonate a service account
gcloud auth application-default login \\
  --impersonate-service-account=sa@project.iam.gserviceaccount.com`}
      </CodeBlock>

      <h2>Gemini with Vertex AI SDK</h2>

      <SDKExample
        title="Vertex AI — GenerativeModel: Chat, Streaming, and Tools"
        tabs={{
          python: `import vertexai
from vertexai.generative_models import (
    GenerativeModel,
    GenerationConfig,
    SafetySetting,
    HarmCategory,
    HarmBlockThreshold,
    FunctionDeclaration,
    Tool,
    Part,
    Content,
)

# Initialize — must call before using any Vertex AI API
vertexai.init(
    project="your-gcp-project",
    location="us-central1"  # Use region close to your users
)

# Basic chat
def chat(message: str, model: str = "gemini-2.0-flash-001") -> str:
    model_instance = GenerativeModel(
        model,
        system_instruction="You are a helpful enterprise assistant."
    )
    response = model_instance.generate_content(
        message,
        generation_config=GenerationConfig(
            temperature=0.1,
            max_output_tokens=2048,
            response_mime_type="text/plain",  # Or "application/json"
        ),
        safety_settings={
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        }
    )
    return response.text

# Multi-turn chat session
def multi_turn():
    model = GenerativeModel("gemini-2.0-flash-001")
    chat = model.start_chat(history=[
        Content(role="user", parts=[Part.from_text("I'm analyzing Q4 financials")]),
        Content(role="model", parts=[Part.from_text("I'll help you analyze Q4 financials.")])
    ])

    responses = [
        "What was the revenue growth rate?",
        "How does that compare to Q3?",
        "Summarize the key findings."
    ]
    for msg in responses:
        response = chat.send_message(msg)
        print(f"User: {msg}")
        print(f"Model: {response.text}\\n")

# Streaming
def stream_chat(message: str) -> None:
    model = GenerativeModel("gemini-2.0-flash-001")
    stream = model.generate_content(message, stream=True)
    for chunk in stream:
        if chunk.text:
            print(chunk.text, end="", flush=True)

# Function calling
get_order = FunctionDeclaration(
    name="get_order_status",
    description="Get the status of a customer order",
    parameters={
        "type": "object",
        "properties": {
            "order_id": {"type": "string", "description": "Order ID (e.g., ORD-12345)"},
            "include_items": {"type": "boolean", "description": "Include line items"}
        },
        "required": ["order_id"]
    }
)

tools = Tool(function_declarations=[get_order])

def agent_with_tools(user_message: str) -> str:
    model = GenerativeModel(
        "gemini-2.0-flash-001",
        tools=[tools]
    )
    chat = model.start_chat()

    while True:
        response = chat.send_message(user_message if not hasattr(agent_with_tools, '_sent') else None)
        agent_with_tools._sent = True

        candidate = response.candidates[0]

        if candidate.finish_reason.name == "STOP":
            return response.text

        # Check for function calls
        for part in candidate.content.parts:
            if part.function_call:
                fc = part.function_call
                # Execute function
                result = {"status": "shipped", "delivery_date": "2025-03-20"}

                # Send function response back
                response = chat.send_message(
                    Part.from_function_response(
                        name=fc.name,
                        response={"content": result}
                    )
                )
                return response.text

    return "No response"`,
        }}
      />

      <h2>Multimodal: Images, Video, and PDFs</h2>

      <SDKExample
        title="Vertex AI — Multimodal Inputs"
        tabs={{
          python: `import vertexai
from vertexai.generative_models import GenerativeModel, Part
import base64

vertexai.init(project="your-project", location="us-central1")

model = GenerativeModel("gemini-2.0-flash-001")

# Image analysis from GCS
def analyze_image_gcs(gcs_uri: str, question: str) -> str:
    image_part = Part.from_uri(gcs_uri, mime_type="image/jpeg")
    response = model.generate_content([image_part, question])
    return response.text

# Image analysis from bytes
def analyze_image_bytes(image_bytes: bytes, question: str) -> str:
    image_part = Part.from_data(image_bytes, mime_type="image/jpeg")
    response = model.generate_content([image_part, question])
    return response.text

# PDF analysis (up to 1000 pages with Gemini 1.5 Pro)
def analyze_pdf(pdf_gcs_uri: str, question: str) -> str:
    pdf_part = Part.from_uri(pdf_gcs_uri, mime_type="application/pdf")
    # Use gemini-1.5-pro-002 or gemini-2.0-flash-001 for documents
    pro_model = GenerativeModel("gemini-1.5-pro-002")
    response = pro_model.generate_content([
        pdf_part,
        f"Analyze this document and answer: {question}"
    ])
    return response.text

# Video understanding
def analyze_video(video_gcs_uri: str, question: str) -> str:
    video_part = Part.from_uri(video_gcs_uri, mime_type="video/mp4")
    # gemini-1.5-pro handles up to 1 hour of video
    pro_model = GenerativeModel("gemini-1.5-pro-002")
    response = pro_model.generate_content([video_part, question])
    return response.text

# Context caching for long documents (reduce cost on repeated queries)
from vertexai.generative_models import CachedContent
import datetime

def cache_document_for_qa(pdf_gcs_uri: str) -> CachedContent:
    """Cache a document to answer multiple questions cheaply."""
    cached = CachedContent.create(
        model_name="gemini-1.5-pro-002",
        contents=[
            Part.from_uri(pdf_gcs_uri, mime_type="application/pdf")
        ],
        system_instruction="You are an expert document analyst.",
        ttl=datetime.timedelta(hours=4)
    )
    return cached

def qa_with_cache(cached_content: CachedContent, question: str) -> str:
    model = GenerativeModel.from_cached_content(cached_content=cached_content)
    response = model.generate_content(question)
    return response.text`,
        }}
      />

      <h2>Embeddings and Grounding</h2>

      <CodeBlock language="python" filename="vertex_embeddings_grounding.py">
{`from vertexai.language_models import TextEmbeddingModel, TextEmbeddingInput
from vertexai.generative_models import GenerativeModel, Tool, grounding
import vertexai

vertexai.init(project="your-project", location="us-central1")

# Text embeddings
def embed_texts(texts: list[str], task_type: str = "RETRIEVAL_DOCUMENT") -> list[list[float]]:
    """
    Task types: RETRIEVAL_QUERY, RETRIEVAL_DOCUMENT, SEMANTIC_SIMILARITY,
                CLASSIFICATION, CLUSTERING, QUESTION_ANSWERING, FACT_VERIFICATION
    """
    model = TextEmbeddingModel.from_pretrained("text-embedding-005")

    inputs = [TextEmbeddingInput(text=t, task_type=task_type) for t in texts]
    embeddings = model.get_embeddings(inputs, output_dimensionality=768)  # Up to 768 dims

    return [e.values for e in embeddings]

# Grounding with Google Search (reduces hallucinations on current events)
def search_grounded_generate(query: str) -> str:
    search_tool = Tool.from_google_search_retrieval(
        grounding.GoogleSearchRetrieval(
            dynamic_retrieval_config=grounding.DynamicRetrievalConfig(
                mode=grounding.DynamicRetrievalConfig.Mode.MODE_DYNAMIC,
                dynamic_threshold=0.7  # Only ground when needed
            )
        )
    )

    model = GenerativeModel("gemini-2.0-flash-001", tools=[search_tool])
    response = model.generate_content(query)

    # Grounding metadata shows which search results were used
    if response.candidates[0].grounding_metadata:
        sources = response.candidates[0].grounding_metadata.grounding_chunks
        print(f"Used {len(sources)} search results")

    return response.text

# Vertex AI Search grounding (private data store)
def private_data_grounded_generate(query: str, data_store_id: str) -> str:
    data_store = (
        f"projects/your-project/locations/global/"
        f"collections/default_collection/dataStores/{data_store_id}"
    )
    retrieval_tool = Tool.from_retrieval(
        grounding.Retrieval(grounding.VertexAISearch(datastore=data_store))
    )

    model = GenerativeModel("gemini-2.0-flash-001", tools=[retrieval_tool])
    response = model.generate_content(query)
    return response.text`}
      </CodeBlock>

      <BestPracticeBlock title="Use Workload Identity Federation in Production">
        <p>
          On GKE and Cloud Run, configure Workload Identity Federation so that pods/services
          automatically receive a GCP service account identity — no key files, no secrets to manage.
          Bind the service account to only the IAM roles needed: <code>roles/aiplatform.user</code>
          for model inference, <code>roles/storage.objectViewer</code> for reading documents.
          Avoid <code>roles/owner</code> or <code>roles/editor</code> for any Vertex AI workload.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Regional Endpoints for Lower Latency">
        <p>
          Always initialize Vertex AI with a region close to your users:
          <code>vertexai.init(project=PROJECT, location="europe-west1")</code> for European users,
          <code>"asia-northeast1"</code> for Japan, etc. Using <code>us-central1</code> for global
          users adds unnecessary latency. Vertex AI models are available in most major regions.
        </p>
      </NoteBlock>
    </article>
  )
}
