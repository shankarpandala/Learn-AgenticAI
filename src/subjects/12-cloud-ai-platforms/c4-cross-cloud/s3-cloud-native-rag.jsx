import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function CloudNativeRAG() {
  return (
    <article className="prose-content">
      <h2>Cloud-Native RAG: Managed Solutions Across Clouds</h2>
      <p>
        Every major cloud provider now offers a fully managed RAG pipeline that integrates
        their document ingestion, vector search, and LLM generation services. Building on
        these managed solutions dramatically reduces operational overhead compared to
        self-hosted stacks (Weaviate/Qdrant + custom chunking code + embedding pipelines).
        This section compares the three leading managed RAG platforms: Azure AI Search,
        Amazon Bedrock Knowledge Bases, and Vertex AI Search.
      </p>

      <ArchitectureDiagram
        title="Managed RAG Platforms Side-by-Side"
        width={760}
        height={300}
        nodes={[
          { id: 'azure_src', label: 'Azure Blob /\nSharePoint', type: 'store', x: 80, y: 80 },
          { id: 'azure_idx', label: 'Azure AI\nSearch Index', type: 'store', x: 260, y: 80 },
          { id: 'azure_llm', label: 'Azure OpenAI\nGPT-4o', type: 'llm', x: 440, y: 80 },
          { id: 'aws_src', label: 'S3 Bucket', type: 'store', x: 80, y: 180 },
          { id: 'aws_kb', label: 'Bedrock\nKnowledge Base', type: 'store', x: 260, y: 180 },
          { id: 'aws_llm', label: 'Bedrock\nClaude 3.5', type: 'llm', x: 440, y: 180 },
          { id: 'gcp_src', label: 'GCS / BigQuery\n/ Web', type: 'store', x: 80, y: 280 },
          { id: 'gcp_idx', label: 'Vertex AI\nSearch Store', type: 'store', x: 260, y: 280 },
          { id: 'gcp_llm', label: 'Vertex AI\nGemini', type: 'llm', x: 440, y: 280 },
          { id: 'app', label: 'Application', type: 'external', x: 640, y: 180 },
        ]}
        edges={[
          { from: 'azure_src', to: 'azure_idx', label: 'index' },
          { from: 'azure_idx', to: 'azure_llm', label: 'retrieve' },
          { from: 'azure_llm', to: 'app' },
          { from: 'aws_src', to: 'aws_kb', label: 'sync' },
          { from: 'aws_kb', to: 'aws_llm', label: 'retrieve' },
          { from: 'aws_llm', to: 'app' },
          { from: 'gcp_src', to: 'gcp_idx', label: 'ingest' },
          { from: 'gcp_idx', to: 'gcp_llm', label: 'ground' },
          { from: 'gcp_llm', to: 'app' },
        ]}
      />

      <h2>Azure AI Search + Azure OpenAI</h2>

      <ConceptBlock term="Azure AI Search">
        <p>
          Azure AI Search (formerly Cognitive Search) is a fully managed search service
          that supports vector search (HNSW), keyword search (BM25/TF-IDF), and hybrid
          search that combines both. Its <strong>integrated vectorization</strong> pipeline
          automatically chunks, embeds, and indexes documents using Azure OpenAI embeddings
          — no custom ETL code required. <strong>Semantic ranking</strong> adds a reranking
          layer that uses language model comprehension to re-order results by relevance
          beyond keyword matching. AI enrichment skills can extract entities, key phrases,
          translate text, and perform OCR during indexing.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Azure AI Search: Index Creation and RAG Query"
        tabs={{
          python: `from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex, SimpleField, SearchFieldDataType,
    SearchableField, SearchField, VectorSearch,
    HnswAlgorithmConfiguration, VectorSearchProfile,
    SemanticConfiguration, SemanticSearch, SemanticPrioritizedFields,
    SemanticField,
)
from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizedQuery
from azure.core.credentials import AzureKeyCredential
from openai import AzureOpenAI
import os

SEARCH_ENDPOINT = "https://my-search.search.windows.net"
SEARCH_KEY = os.environ["AZURE_SEARCH_KEY"]
INDEX_NAME = "my-rag-index"
AZURE_OAI_ENDPOINT = "https://my-company.openai.azure.com/"
AZURE_OAI_KEY = os.environ["AZURE_OAI_KEY"]

# 1. Create the index with vector field
index_client = SearchIndexClient(SEARCH_ENDPOINT, AzureKeyCredential(SEARCH_KEY))

fields = [
    SimpleField(name="id", type=SearchFieldDataType.String, key=True),
    SearchableField(name="content", type=SearchFieldDataType.String),
    SearchableField(name="title", type=SearchFieldDataType.String),
    SimpleField(name="source", type=SearchFieldDataType.String, filterable=True),
    SimpleField(name="category", type=SearchFieldDataType.String, filterable=True),
    # Vector field for embeddings (text-embedding-3-small = 1536 dims)
    SearchField(
        name="content_vector",
        type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
        searchable=True,
        vector_search_dimensions=1536,
        vector_search_profile_name="my-vector-profile",
    ),
]

vector_search = VectorSearch(
    algorithms=[HnswAlgorithmConfiguration(name="my-hnsw", parameters={"m": 4, "ef_construction": 400})],
    profiles=[VectorSearchProfile(name="my-vector-profile", algorithm_configuration_name="my-hnsw")],
)

semantic_config = SemanticConfiguration(
    name="my-semantic-config",
    prioritized_fields=SemanticPrioritizedFields(
        content_fields=[SemanticField(field_name="content")],
        title_field=SemanticField(field_name="title"),
    ),
)

index = SearchIndex(
    name=INDEX_NAME,
    fields=fields,
    vector_search=vector_search,
    semantic_search=SemanticSearch(configurations=[semantic_config]),
)
index_client.create_or_update_index(index)
print(f"Index '{INDEX_NAME}' created.")

# 2. Embed and upload documents
oai_client = AzureOpenAI(azure_endpoint=AZURE_OAI_ENDPOINT, api_key=AZURE_OAI_KEY, api_version="2024-02-01")

def embed(text: str) -> list[float]:
    return oai_client.embeddings.create(
        model="text-embedding-3-small", input=text
    ).data[0].embedding

documents = [
    {"id": "1", "title": "Refund Policy", "content": "Our refund policy allows returns within 30 days...", "source": "policy.pdf", "category": "billing"},
    {"id": "2", "title": "API Rate Limits", "content": "The API is rate limited to 1000 requests per minute...", "source": "api-docs.pdf", "category": "technical"},
]

for doc in documents:
    doc["content_vector"] = embed(doc["content"])

search_client = SearchClient(SEARCH_ENDPOINT, INDEX_NAME, AzureKeyCredential(SEARCH_KEY))
search_client.upload_documents(documents)

# 3. Hybrid search + semantic reranking
def rag_query(query: str, category_filter: str = None) -> str:
    query_vector = embed(query)

    # Build filter expression
    filter_expr = f"category eq '{category_filter}'" if category_filter else None

    results = search_client.search(
        search_text=query,                # BM25 keyword search
        vector_queries=[VectorizedQuery(  # HNSW vector search
            vector=query_vector,
            k_nearest_neighbors=5,
            fields="content_vector",
        )],
        filter=filter_expr,
        query_type="semantic",            # Re-rank with semantic model
        semantic_configuration_name="my-semantic-config",
        query_answer="extractive",        # Extract exact answer spans
        query_answer_count=3,
        top=5,
        select=["id", "title", "content", "source"],
    )

    # Extract top results
    context_parts = []
    for result in results:
        context_parts.append(f"[{result['source']}] {result['content']}")

    context = "\\n\\n".join(context_parts)

    # Generate answer with Azure OpenAI
    gpt_response = oai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "Answer using only the provided context. Cite sources."},
            {"role": "user", "content": f"Context:\\n{context}\\n\\nQuestion: {query}"},
        ],
        temperature=0.1,
    )
    return gpt_response.choices[0].message.content

print(rag_query("What is the refund policy?", category_filter="billing"))`,
        }}
      />

      <h2>Amazon Bedrock Knowledge Bases</h2>

      <ConceptBlock term="Bedrock Knowledge Bases">
        <p>
          Bedrock Knowledge Bases is Amazon's fully managed RAG service. It ingests documents
          from S3, automatically chunks them (fixed size, semantic, or hierarchical chunking),
          embeds them using Titan Embeddings or Cohere Embed, and stores vectors in either
          OpenSearch Serverless, Aurora PostgreSQL (pgvector), Pinecone, MongoDB Atlas, or
          Redis Enterprise. Retrieval uses hybrid search, and the results are passed directly
          to any Bedrock foundation model for generation — all in a single API call to
          <code>retrieve_and_generate</code>.
        </p>
      </ConceptBlock>

      <CodeBlock language="python" filename="bedrock_knowledge_base.py">
{`import boto3
import json

bedrock_agent = boto3.client("bedrock-agent", region_name="us-east-1")
bedrock_agent_runtime = boto3.client("bedrock-agent-runtime", region_name="us-east-1")

KNOWLEDGE_BASE_ID = "ABCDE12345"  # From Bedrock console or Terraform
MODEL_ARN = "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0"

# 1. Retrieve (without generation) for custom post-processing
def retrieve_only(query: str, num_results: int = 5) -> list[dict]:
    """Retrieve relevant chunks without calling the LLM."""
    response = bedrock_agent_runtime.retrieve(
        knowledgeBaseId=KNOWLEDGE_BASE_ID,
        retrievalQuery={"text": query},
        retrievalConfiguration={
            "vectorSearchConfiguration": {
                "numberOfResults": num_results,
                "overrideSearchType": "HYBRID",  # HYBRID | SEMANTIC | KEYWORD
                "filter": {
                    # Metadata filtering: only return docs from specific source
                    "equals": {"key": "department", "value": "engineering"}
                },
            }
        },
    )
    chunks = []
    for result in response["retrievalResults"]:
        chunks.append({
            "content": result["content"]["text"],
            "source": result["location"]["s3Location"]["uri"],
            "score": result["score"],
            "metadata": result.get("metadata", {}),
        })
    return chunks

# 2. Retrieve and generate in one API call
def rag_query(query: str, session_id: str = None) -> dict:
    """Full RAG: retrieve + generate with Claude 3.5 Sonnet."""
    params = {
        "knowledgeBaseId": KNOWLEDGE_BASE_ID,
        "input": {"text": query},
        "retrieveAndGenerateConfiguration": {
            "type": "KNOWLEDGE_BASE",
            "knowledgeBaseConfiguration": {
                "knowledgeBaseId": KNOWLEDGE_BASE_ID,
                "modelArn": MODEL_ARN,
                "retrievalConfiguration": {
                    "vectorSearchConfiguration": {
                        "numberOfResults": 5,
                        "overrideSearchType": "HYBRID",
                    }
                },
                "generationConfiguration": {
                    "promptTemplate": {
                        "textPromptTemplate": (
                            "You are a helpful assistant. Answer the question using only "
                            "the provided search results. Cite sources using [1], [2], etc.\\n\\n"
                            "$search_results$\\n\\nQuestion: $query$"
                        )
                    },
                    "inferenceConfig": {
                        "textInferenceConfig": {
                            "temperature": 0.1,
                            "maxTokens": 1024,
                        }
                    },
                },
            },
        },
    }

    # Include session ID for multi-turn conversation
    if session_id:
        params["sessionId"] = session_id

    response = bedrock_agent_runtime.retrieve_and_generate(**params)

    return {
        "answer": response["output"]["text"],
        "session_id": response.get("sessionId"),
        "citations": [
            {
                "text": ref["content"]["text"],
                "source": ref["location"]["s3Location"]["uri"],
            }
            for citation in response.get("citations", [])
            for ref in citation.get("retrievedReferences", [])
        ],
    }

# 3. Trigger a sync job (after uploading new docs to S3)
def sync_knowledge_base(data_source_id: str):
    response = bedrock_agent.start_ingestion_job(
        knowledgeBaseId=KNOWLEDGE_BASE_ID,
        dataSourceId=data_source_id,
    )
    job_id = response["ingestionJob"]["ingestionJobId"]
    print(f"Sync job started: {job_id}")
    return job_id

result = rag_query("What are our API rate limits?")
print(result["answer"])
for i, citation in enumerate(result["citations"], 1):
    print(f"[{i}] {citation['source']}")`}
      </CodeBlock>

      <h2>Vertex AI Search (Grounding Data Stores)</h2>

      <ConceptBlock term="Vertex AI Search">
        <p>
          Vertex AI Search (part of Agent Builder) provides enterprise-grade search and
          RAG over structured and unstructured data. It uniquely supports website crawling
          with configurable depth and scheduling, BigQuery table search, and ACL-aware
          results that respect the user's permissions from Google Workspace. The
          <strong>answer generation</strong> mode combines retrieval with Gemini to produce
          cited summaries. Vertex AI Search also integrates directly with Gemini's grounding
          API — when you enable data store grounding on a model, Gemini decides when to search
          and automatically includes results in the response.
        </p>
      </ConceptBlock>

      <CodeBlock language="python" filename="vertex_ai_search_rag.py">
{`from google.cloud import discoveryengine_v1alpha as discoveryengine
from google.api_core.client_options import ClientOptions
import vertexai
from vertexai.generative_models import GenerativeModel, Tool, Retrieval, VertexAISearch

PROJECT_ID = "my-gcp-project"
LOCATION = "global"
DATA_STORE_ID = "my-enterprise-docs"

# ---- Option 1: Direct search with answer generation ----
client_options = ClientOptions(api_endpoint="discoveryengine.googleapis.com")
search_client = discoveryengine.SearchServiceClient(client_options=client_options)

serving_config = (
    f"projects/{PROJECT_ID}/locations/{LOCATION}"
    f"/collections/default_collection"
    f"/dataStores/{DATA_STORE_ID}/servingConfigs/default_config"
)

request = discoveryengine.SearchRequest(
    serving_config=serving_config,
    query="What is our disaster recovery RTO?",
    page_size=10,
    content_search_spec=discoveryengine.SearchRequest.ContentSearchSpec(
        summary_spec=discoveryengine.SearchRequest.ContentSearchSpec.SummarySpec(
            summary_result_count=5,
            include_citations=True,
            ignore_adversarial_query=True,
            ignore_non_summary_seeking_query=False,
            model_spec=discoveryengine.SearchRequest.ContentSearchSpec.SummarySpec.ModelSpec(
                version="preview"
            ),
        ),
        snippet_spec=discoveryengine.SearchRequest.ContentSearchSpec.SnippetSpec(
            return_snippet=True,
        ),
        extractive_content_spec=discoveryengine.SearchRequest.ContentSearchSpec.ExtractiveContentSpec(
            max_extractive_answer_count=3,
            max_extractive_segment_count=5,
        ),
    ),
    # Filter by document metadata
    filter='category: ANY("runbooks", "sre-docs")',
    # Boost recent documents
    boost_spec=discoveryengine.SearchRequest.BoostSpec(
        condition_boost_specs=[
            discoveryengine.SearchRequest.BoostSpec.ConditionBoostSpec(
                condition='freshness("update_time", 30d)',
                boost=0.5,
            )
        ]
    ),
)

response = search_client.search(request)
print("AI Summary:", response.summary.summary_text)
for result in response.results:
    print(f"  - {result.document.name}: score {result.model_scores}")

# ---- Option 2: Gemini with Vertex AI Search grounding (integrated) ----
vertexai.init(project=PROJECT_ID, location="us-central1")

model = GenerativeModel(
    "gemini-1.5-pro-002",
    tools=[
        Tool.from_retrieval(
            retrieval=Retrieval(
                source=VertexAISearch(
                    datastore=f"projects/{PROJECT_ID}/locations/{LOCATION}/collections/default_collection/dataStores/{DATA_STORE_ID}"
                )
            )
        )
    ],
)

response = model.generate_content(
    "What are our SLA commitments to enterprise customers and what is our uptime guarantee?"
)
print(response.text)

# Extract grounding metadata
if response.candidates[0].grounding_metadata:
    for chunk in response.candidates[0].grounding_metadata.grounding_chunks:
        if hasattr(chunk, "retrieved_context"):
            print(f"Source: {chunk.retrieved_context.uri}")`}
      </CodeBlock>

      <h2>Decision Matrix: Managed vs Self-Hosted RAG</h2>

      <CodeBlock language="text" filename="rag_decision_matrix.txt">
{`DIMENSION              | Azure AI Search     | Bedrock KB           | Vertex AI Search    | Self-Hosted (Qdrant+)
-----------------------|---------------------|----------------------|---------------------|----------------------
Setup complexity       | Low (UI + SDK)      | Low (UI + SDK)       | Low (UI + SDK)      | High (infra + code)
Chunking strategies    | Fixed, semantic     | Fixed, semantic,     | Auto (managed)      | Full control
                       |                     | hierarchical         |                     |
Custom chunking        | Via indexer skills  | Limited              | No                  | Yes (fully custom)
Vector DB options      | HNSW (built-in)     | OpenSearch, Aurora,  | Managed (internal)  | Any (Qdrant, Weaviate,
                       |                     | Pinecone, MongoDB    |                     | Milvus, pgvector)
Hybrid search          | Yes (BM25 + HNSW)   | Yes (semantic +      | Yes                 | Varies by DB
                       |                     | keyword)             |                     |
Reranking              | Yes (semantic rank) | No (cross-encoder    | Yes (built-in)      | Yes (cohere/custom)
                       |                     | via Lambda)          |                     |
Web crawling           | Via custom indexers | No (S3 only)         | Yes (native)        | Manual
BigQuery integration   | No                  | No                   | Yes (native)        | Manual ETL
ACL-aware results      | Partial (security   | No                   | Yes (Google         | Manual implementation
                       | trimming)           |                      | Workspace ACL)      |
Multi-modal (images)   | Via OCR skills      | Via Titan multimodal | Via Gemini          | Manual pipeline
                       |                     | embeddings           |                     |
Latency (p50)          | 100-300ms           | 200-500ms            | 100-400ms           | 10-50ms (local)
Cost at 1M queries/mo  | ~$500-2000          | ~$300-1500           | ~$400-1800          | ~$200-500 (infra only)
Data residency         | All Azure regions   | All AWS regions      | 10 GCP regions      | Any cloud/on-prem
HIPAA compliance       | Yes                 | Yes                  | Yes                 | DIY (you own it)
Max document size      | 16MB                | 50MB per file        | 100MB               | No limit
Supported formats      | PDF, DOCX, HTML,    | PDF, DOCX, TXT,      | PDF, HTML, TXT,     | Any (custom parsers)
                       | TXT, Markdown       | HTML, Markdown, CSV  | DOCX, CSV           |
On-demand ingestion    | Real-time           | Manual sync trigger  | Real-time           | Real-time
Scheduled sync         | Indexer schedules   | EventBridge/cron     | Yes (configurable)  | Manual cron`}
      </CodeBlock>

      <PatternBlock
        name="Hybrid Managed + Self-Hosted RAG"
        category="Architecture"
        whenToUse="When you need managed infrastructure for ingestion (to avoid ETL code) but require custom retrieval logic (e.g., custom reranking, multi-index federation, or latency below 50ms) that managed services cannot provide."
      >
        <p>
          Use the cloud provider's managed ingestion pipeline (indexer schedules, skill sets,
          automatic chunking) to populate a self-hosted vector database like Qdrant or pgvector.
          This gives you the operational simplicity of managed ingestion with the query
          flexibility of a self-hosted retrieval layer. Export embeddings from Azure AI Search
          or Bedrock KB via their respective document export APIs, then re-import into your
          vector DB. Run the vector DB on the same cloud/region as your application to minimize
          retrieval latency.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Chunk Size Tuning">
        <p>
          Default chunk sizes (512 tokens for Azure, 300 words for Bedrock, auto for Vertex)
          work well for general prose. For technical documentation with long code examples,
          increase chunk size to 1024–2048 tokens to avoid splitting code blocks. For FAQ
          documents, use a semantic chunker that splits on question boundaries rather than
          token count. For tables and structured data, consider chunking by row or logical
          section and storing structured metadata alongside each chunk for filter-based retrieval.
          Always measure retrieval precision with your actual query distribution — chunk size
          has more impact on RAG quality than almost any other parameter.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Incremental Ingestion with Change Detection">
        <p>
          All three managed platforms support incremental ingestion — only processing changed
          documents. Azure AI Search indexers can detect changes via ETags and
          <code>lastModified</code> metadata. Bedrock Knowledge Bases sync only changed S3
          objects based on the ETag. Vertex AI Search uses document IDs for upserts.
          Store a content hash with each document to detect changes at the application
          layer before triggering a sync, eliminating redundant re-embedding of unchanged
          content and reducing ingestion costs.
        </p>
      </NoteBlock>

      <NoteBlock type="warning" title="Latency of Managed RAG vs. Direct Vector DB">
        <p>
          Managed RAG pipelines add 100–400ms of latency compared to a direct vector DB
          query (10–50ms) because requests traverse additional managed service layers,
          authentication, and network hops between services. For real-time applications
          with strict latency SLAs (&lt;200ms end-to-end), benchmark your managed solution
          carefully. If latency is a concern, use Private Service Connect (GCP), VPC
          Endpoints (AWS), or Private Endpoints (Azure) to minimize network hops, and
          deploy your application and search service in the same region.
        </p>
      </NoteBlock>
    </article>
  )
}
