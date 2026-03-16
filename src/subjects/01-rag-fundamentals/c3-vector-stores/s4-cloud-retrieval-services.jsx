import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function CloudRetrievalServices() {
  return (
    <article className="prose-content">
      <h2>Cloud-Native Retrieval Services</h2>
      <p>
        Each major cloud provider offers a fully managed retrieval service optimized for RAG workloads.
        These differ from self-hosted vector databases by integrating directly with cloud storage,
        identity services, and the provider's LLM APIs — eliminating infrastructure management
        while adding enterprise features like ACL-aware search and compliance certifications.
      </p>

      <ArchitectureDiagram
        title="Cloud Retrieval Services Comparison"
        width={700}
        height={260}
        nodes={[
          { id: 'docs', label: 'Documents / Data', type: 'external', x: 80, y: 130 },
          { id: 'azure', label: 'Azure AI Search', type: 'store', x: 280, y: 60 },
          { id: 'bedrock', label: 'Bedrock KBs', type: 'store', x: 280, y: 130 },
          { id: 'vertex', label: 'Vertex AI Search', type: 'store', x: 280, y: 200 },
          { id: 'rag', label: 'RAG Pipeline', type: 'agent', x: 480, y: 130 },
          { id: 'llm', label: 'LLM Response', type: 'llm', x: 620, y: 130 },
        ]}
        edges={[
          { from: 'docs', to: 'azure' },
          { from: 'docs', to: 'bedrock' },
          { from: 'docs', to: 'vertex' },
          { from: 'azure', to: 'rag', label: 'hybrid search' },
          { from: 'bedrock', to: 'rag', label: 'managed RAG' },
          { from: 'vertex', to: 'rag', label: 'grounding' },
          { from: 'rag', to: 'llm' },
        ]}
      />

      <h2>Azure AI Search</h2>

      <ConceptBlock term="Azure AI Search">
        <p>
          Azure AI Search (formerly Azure Cognitive Search) is Microsoft's enterprise search service
          with native vector search, hybrid BM25+vector ranking, semantic reranking, and
          <strong> integrated vectorization</strong> — automatic embedding generation during indexing
          using Azure OpenAI embeddings without writing any embedding code.
        </p>
      </ConceptBlock>

      <h3>Key Features</h3>
      <ul>
        <li><strong>Integrated vectorization:</strong> Define a skill in the indexer to call Azure OpenAI embeddings automatically during document ingestion</li>
        <li><strong>Hybrid search:</strong> BM25 keyword + HNSW vector search combined via Reciprocal Rank Fusion (RRF)</li>
        <li><strong>Semantic ranking:</strong> ML-powered re-ranking of top-50 results for relevance — not just keyword/vector similarity</li>
        <li><strong>Faceted navigation, filters:</strong> Metadata filtering with OData syntax for pre-filtering before vector search</li>
        <li><strong>Security:</strong> AAD integration, field-level security trimming, private endpoints</li>
      </ul>

      <SDKExample
        title="Azure AI Search — Hybrid Search with Vector + BM25"
        tabs={{
          python: `from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizedQuery
from azure.core.credentials import AzureKeyCredential
from openai import AzureOpenAI

# Initialize clients
search_client = SearchClient(
    endpoint="https://<service>.search.windows.net",
    index_name="documents",
    credential=AzureKeyCredential("<admin-key>")  # Or DefaultAzureCredential()
)
openai_client = AzureOpenAI(
    api_key="<key>",
    azure_endpoint="https://<service>.openai.azure.com",
    api_version="2024-02-01"
)

def embed(text: str) -> list[float]:
    response = openai_client.embeddings.create(
        model="text-embedding-3-large",
        input=text
    )
    return response.data[0].embedding

def hybrid_search(query: str, top_k: int = 5) -> list[dict]:
    """BM25 + vector search combined with RRF."""
    vector_query = VectorizedQuery(
        vector=embed(query),
        k_nearest_neighbors=50,
        fields="contentVector"  # indexed vector field
    )

    results = search_client.search(
        search_text=query,             # BM25 full-text query
        vector_queries=[vector_query], # Vector query
        select=["id", "title", "content", "source"],
        query_type="semantic",         # Apply semantic reranking
        semantic_configuration_name="default",
        top=top_k
    )

    return [
        {
            "id": r["id"],
            "title": r["title"],
            "content": r["content"],
            "score": r["@search.score"],
            "reranker_score": r.get("@search.reranker_score"),
        }
        for r in results
    ]

# Usage
results = hybrid_search("What is the Azure OpenAI rate limit policy?")
for r in results:
    print(f"[{r['reranker_score']:.2f}] {r['title']}: {r['content'][:150]}...")`,
        }}
      />

      <h2>Amazon Bedrock Knowledge Bases</h2>

      <ConceptBlock term="Bedrock Knowledge Bases">
        <p>
          Amazon Bedrock Knowledge Bases is a fully managed RAG service that handles the entire
          retrieval pipeline: ingesting documents from S3, chunking, embedding with Titan or Cohere
          embeddings, storing in a vector store (OpenSearch Serverless, Aurora pgvector, or Pinecone),
          and retrieval — all without managing infrastructure. Agents can attach knowledge bases as tools.
        </p>
      </ConceptBlock>

      <h3>Supported Data Sources</h3>
      <ul>
        <li>Amazon S3 (primary — PDF, DOCX, TXT, HTML, CSV, XLSX)</li>
        <li>Web crawler (public websites)</li>
        <li>Confluence, SharePoint, Salesforce (connector library)</li>
        <li>Custom connectors via Lambda</li>
      </ul>

      <SDKExample
        title="Amazon Bedrock Knowledge Bases — Retrieval and RetrieveAndGenerate"
        tabs={{
          python: `import boto3
import json

bedrock_agent = boto3.client("bedrock-agent-runtime", region_name="us-east-1")

KNOWLEDGE_BASE_ID = "ABCDEF1234"
MODEL_ARN = "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0"

def retrieve_only(query: str, top_k: int = 5) -> list[dict]:
    """Pure retrieval — returns documents without generating an answer."""
    response = bedrock_agent.retrieve(
        knowledgeBaseId=KNOWLEDGE_BASE_ID,
        retrievalQuery={"text": query},
        retrievalConfiguration={
            "vectorSearchConfiguration": {
                "numberOfResults": top_k,
                "overrideSearchType": "HYBRID"  # SEMANTIC or HYBRID
            }
        }
    )
    return [
        {
            "content": r["content"]["text"],
            "score": r["score"],
            "location": r["location"].get("s3Location", {}).get("uri", ""),
            "metadata": r.get("metadata", {})
        }
        for r in response["retrievalResults"]
    ]

def retrieve_and_generate(query: str) -> str:
    """Managed RAG — retrieves docs and generates an answer using Bedrock."""
    response = bedrock_agent.retrieve_and_generate(
        input={"text": query},
        retrieveAndGenerateConfiguration={
            "type": "KNOWLEDGE_BASE",
            "knowledgeBaseConfiguration": {
                "knowledgeBaseId": KNOWLEDGE_BASE_ID,
                "modelArn": MODEL_ARN,
                "retrievalConfiguration": {
                    "vectorSearchConfiguration": {"numberOfResults": 5}
                },
                "generationConfiguration": {
                    "promptTemplate": {
                        "textPromptTemplate": (
                            "You are a helpful assistant. Use the following search results "
                            "to answer the question. If you cannot find the answer, say so.\\n\\n"
                            "$search_results$\\n\\nQuestion: $query$"
                        )
                    }
                }
            }
        }
    )
    return response["output"]["text"]

# Retrieve with metadata filtering
def filtered_retrieve(query: str, department: str) -> list[dict]:
    response = bedrock_agent.retrieve(
        knowledgeBaseId=KNOWLEDGE_BASE_ID,
        retrievalQuery={"text": query},
        retrievalConfiguration={
            "vectorSearchConfiguration": {
                "numberOfResults": 5,
                "filter": {
                    "equals": {
                        "key": "department",
                        "value": department
                    }
                }
            }
        }
    )
    return response["retrievalResults"]`,
        }}
      />

      <h2>Vertex AI Search</h2>

      <ConceptBlock term="Vertex AI Search">
        <p>
          Vertex AI Search (part of Vertex AI Agent Builder) is Google Cloud's enterprise search
          service. It provides <strong>grounding</strong> for Gemini models — letting them search
          over your private data or the public web before generating responses. Unlike traditional
          search, it understands natural language queries and returns semantically relevant results.
        </p>
      </ConceptBlock>

      <h3>Data Store Types</h3>
      <ul>
        <li><strong>Unstructured:</strong> Cloud Storage files (PDF, HTML, TXT) — parsed and chunked automatically</li>
        <li><strong>Structured:</strong> BigQuery tables or JSON/CSV for tabular search</li>
        <li><strong>Website:</strong> Index public websites via sitemap crawl</li>
        <li><strong>Healthcare FHIR:</strong> Specialized medical record search</li>
      </ul>

      <SDKExample
        title="Vertex AI Search — Enterprise Data Store Query"
        tabs={{
          python: `from google.cloud import discoveryengine_v1 as discoveryengine
from google.api_core.client_options import ClientOptions

PROJECT_ID = "my-project"
LOCATION = "global"
DATA_STORE_ID = "my-enterprise-datastore"

def search_datastore(query: str, page_size: int = 5) -> list[dict]:
    """Search a Vertex AI Search data store."""
    client_options = ClientOptions(
        api_endpoint=f"{LOCATION}-discoveryengine.googleapis.com"
    )
    client = discoveryengine.SearchServiceClient(client_options=client_options)

    serving_config = (
        f"projects/{PROJECT_ID}/locations/{LOCATION}/"
        f"collections/default_collection/dataStores/{DATA_STORE_ID}/"
        "servingConfigs/default_config"
    )

    request = discoveryengine.SearchRequest(
        serving_config=serving_config,
        query=query,
        page_size=page_size,
        query_expansion_spec=discoveryengine.SearchRequest.QueryExpansionSpec(
            condition=discoveryengine.SearchRequest.QueryExpansionSpec.Condition.AUTO
        ),
        spell_correction_spec=discoveryengine.SearchRequest.SpellCorrectionSpec(
            mode=discoveryengine.SearchRequest.SpellCorrectionSpec.Mode.AUTO
        ),
        content_search_spec=discoveryengine.SearchRequest.ContentSearchSpec(
            snippet_spec=discoveryengine.SearchRequest.ContentSearchSpec.SnippetSpec(
                return_snippet=True
            ),
            extractive_content_spec=discoveryengine.SearchRequest.ContentSearchSpec.ExtractiveContentSpec(
                max_extractive_answer_count=3,
                max_extractive_segment_count=5,
            ),
        ),
    )

    response = client.search(request)

    results = []
    for result in response.results:
        doc = result.document
        results.append({
            "id": doc.id,
            "title": doc.derived_struct_data.get("title", ""),
            "snippets": [
                s.snippet for s in doc.derived_struct_data.get("snippets", [])
            ],
            "link": doc.derived_struct_data.get("link", ""),
        })
    return results

# Grounding Gemini with Vertex AI Search data store
import vertexai
from vertexai.preview.generative_models import GenerativeModel, Tool, grounding

vertexai.init(project=PROJECT_ID, location="us-central1")

def grounded_generate(query: str) -> str:
    """Use Gemini grounded with private enterprise data store."""
    data_store = (
        f"projects/{PROJECT_ID}/locations/{LOCATION}/"
        f"collections/default_collection/dataStores/{DATA_STORE_ID}"
    )
    grounding_tool = Tool.from_retrieval(
        grounding.Retrieval(
            grounding.VertexAISearch(datastore=data_store)
        )
    )

    model = GenerativeModel("gemini-1.5-pro-002", tools=[grounding_tool])
    response = model.generate_content(query)
    return response.text`,
        }}
      />

      <h2>Comparison: Managed RAG Trade-offs</h2>

      <CodeBlock language="text" filename="cloud-rag-comparison.txt">
{`┌─────────────────────┬──────────────────────┬──────────────────────┬──────────────────────┐
│ Feature             │ Azure AI Search       │ Bedrock Knowledge Bs │ Vertex AI Search     │
├─────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ Vector store        │ HNSW (built-in)      │ OpenSearch/Aurora    │ Built-in             │
│ Embedding models    │ Azure OpenAI (BYOE)  │ Titan/Cohere (auto)  │ Gecko (auto)         │
│ Hybrid search       │ BM25 + vector (RRF)  │ Hybrid mode          │ Yes                  │
│ Semantic reranking  │ Yes (ML model)       │ No (reranking model) │ Yes                  │
│ Data sources        │ Indexer connectors   │ S3, web, SharePoint  │ GCS, BQ, web         │
│ Filters/metadata    │ OData filter syntax  │ Metadata filter API  │ Struct filter API    │
│ ACL-aware           │ Security trimming    │ Via IAM on S3        │ Via IAM on GCS       │
│ Compliance          │ SOC2, HIPAA, GDPR    │ SOC2, HIPAA, GDPR    │ SOC2, HIPAA, GDPR    │
│ Private endpoint    │ Yes                  │ VPC endpoint         │ VPC Service Controls │
│ Pricing model       │ Tier-based + index   │ Per query + storage  │ Per query + index    │
│ Max document size   │ 16 MB                │ 5 MB per file        │ 10 MB                │
│ Sync frequency      │ Indexer schedule     │ On-demand or auto    │ On-demand or auto    │
│ Best for            │ Azure-native, hybrid │ AWS-native, agents   │ GCP-native, Gemini   │
└─────────────────────┴──────────────────────┴──────────────────────┴──────────────────────┘`}
      </CodeBlock>

      <BestPracticeBlock title="Choosing a Managed Retrieval Service">
        <p>
          Choose <strong>Azure AI Search</strong> when: you're Azure-native, need hybrid BM25+vector+semantic
          reranking in one service, require fine-grained document-level security trimming (ACLs), or need
          complex OData filter expressions for metadata pre-filtering.
        </p>
        <p>
          Choose <strong>Bedrock Knowledge Bases</strong> when: your data is in S3, you want zero-infrastructure
          RAG that integrates directly with Bedrock Agents, or you need quick prototyping without vector DB management.
        </p>
        <p>
          Choose <strong>Vertex AI Search</strong> when: you're GCP-native, want Gemini grounded on private
          data, need BigQuery table search, or are building on top of Vertex AI Agent Builder.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Egress Costs and Data Locality">
        <p>
          Managed retrieval services avoid cross-region data transfer fees when your LLM and retrieval
          service are in the same region. Always co-locate your retrieval service with your LLM deployment
          to minimize latency and eliminate egress charges. For GDPR/data residency requirements,
          verify that the service offers deployment in your required geographic region.
        </p>
      </NoteBlock>
    </article>
  )
}
