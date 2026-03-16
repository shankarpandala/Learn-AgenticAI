import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function LlamaIndexOverview() {
  return (
    <article className="prose-content">
      <h2>LlamaIndex Overview</h2>
      <p>
        LlamaIndex (formerly GPT Index) is a data framework for LLM applications focused on
        ingesting, structuring, and querying private or domain-specific data. Where LangChain
        is a general-purpose orchestration framework, LlamaIndex excels at the full data pipeline:
        loading, chunking, embedding, indexing, and retrieval.
      </p>

      <ConceptBlock term="LlamaIndex">
        <p>
          LlamaIndex provides a <strong>data ingestion pipeline</strong> (loaders for 100+
          data sources), <strong>index types</strong> (vector, summary, tree, keyword),
          <strong>retrieval abstractions</strong> (query engines, retrievers, postprocessors),
          and <strong>agent workflows</strong> that compose these components into production
          RAG and agentic applications.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram
        title="LlamaIndex Data Pipeline"
        width={680}
        height={260}
        nodes={[
          { id: 'source', label: 'Data Sources', type: 'external', x: 60, y: 130 },
          { id: 'loader', label: 'Data Loaders', type: 'tool', x: 190, y: 130 },
          { id: 'transform', label: 'Transformations\n(Chunking)', type: 'agent', x: 330, y: 130 },
          { id: 'embed', label: 'Embeddings', type: 'llm', x: 460, y: 80 },
          { id: 'index', label: 'Index', type: 'agent', x: 580, y: 130 },
          { id: 'query', label: 'Query Engine', type: 'external', x: 460, y: 200 },
        ]}
        edges={[
          { from: 'source', to: 'loader' },
          { from: 'loader', to: 'transform' },
          { from: 'transform', to: 'embed' },
          { from: 'embed', to: 'index' },
          { from: 'index', to: 'query' },
        ]}
      />

      <h2>Core Concepts</h2>

      <h3>Documents and Nodes</h3>
      <p>
        A <strong>Document</strong> is the raw loaded data unit — a PDF page, a web page, a
        database row. A <strong>Node</strong> is a chunk of a Document after splitting, with
        metadata and relationships preserved (prev/next node, source document).
      </p>

      <h3>Index Types</h3>
      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Index Type</th>
              <th className="px-4 py-3 text-left font-semibold">Best For</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['VectorStoreIndex', 'Semantic similarity search — the most common for RAG'],
              ['SummaryIndex', 'Summarising a set of documents (e.g., meeting notes)'],
              ['TreeIndex', 'Hierarchical summarisation and multi-step reasoning'],
              ['KeywordTableIndex', 'Exact keyword-based retrieval (BM25-style)'],
              ['KnowledgeGraphIndex', 'Graph-based reasoning over entity relationships'],
            ].map(([idx, desc]) => (
              <tr key={idx}>
                <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">{idx}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Installation and Setup</h2>

      <SDKExample
        title="Installing LlamaIndex"
        tabs={{
          bash: `# Core package
pip install llama-index

# LLM integrations
pip install llama-index-llms-anthropic
pip install llama-index-llms-openai

# Embedding integrations
pip install llama-index-embeddings-openai
pip install llama-index-embeddings-huggingface

# Vector store integrations
pip install llama-index-vector-stores-chroma
pip install llama-index-vector-stores-pinecone

# Document loaders
pip install llama-index-readers-file          # PDF, DOCX, etc.
pip install llama-index-readers-web           # Web pages
pip install llama-index-readers-database      # SQL databases`,
        }}
      />

      <SDKExample
        title="Global Settings and LLM Configuration"
        tabs={{
          python: `from llama_index.core import Settings
from llama_index.llms.anthropic import Anthropic
from llama_index.embeddings.openai import OpenAIEmbedding

# Configure globally — all components inherit these settings
Settings.llm = Anthropic(model="claude-opus-4-6", max_tokens=2048)
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")
Settings.chunk_size = 512           # Tokens per chunk
Settings.chunk_overlap = 64         # Overlap between chunks

# Or use local embeddings (no API key needed)
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")`,
          typescript: `import { Settings } from 'llamaindex';
import { Anthropic } from '@llamaindex/anthropic';
import { OpenAIEmbedding } from 'llamaindex';

Settings.llm = new Anthropic({ model: 'claude-opus-4-6' });
Settings.embedModel = new OpenAIEmbedding({ model: 'text-embedding-3-small' });
Settings.chunkSize = 512;
Settings.chunkOverlap = 64;`,
        }}
      />

      <h2>Loading Data</h2>
      <p>
        LlamaIndex provides <strong>SimpleDirectoryReader</strong> for loading files and
        specialised readers for web, databases, Notion, Slack, and many other sources.
      </p>

      <SDKExample
        title="Loading Documents"
        tabs={{
          python: `from llama_index.core import SimpleDirectoryReader, Document

# Load all files from a directory (PDF, DOCX, TXT, MD, etc.)
documents = SimpleDirectoryReader("./data/docs").load_data()
print(f"Loaded {len(documents)} documents")

# Load a specific file type
pdf_reader = SimpleDirectoryReader(
    input_files=["report.pdf", "appendix.pdf"],
    filename_as_id=True,          # Use filename as doc ID for upserts
)
pdf_docs = pdf_reader.load_data()

# Manually create documents (useful for database rows)
custom_docs = [
    Document(
        text="LlamaIndex supports 100+ data sources.",
        metadata={
            "source": "docs",
            "author": "LlamaIndex Team",
            "date": "2024-01-15",
        },
        id_="doc-001",
    ),
    Document(
        text="VectorStoreIndex is the most common index for RAG.",
        metadata={"source": "docs", "category": "indexing"},
        id_="doc-002",
    ),
]

# Web reader
from llama_index.readers.web import SimpleWebPageReader
web_docs = SimpleWebPageReader(html_to_text=True).load_data([
    "https://docs.llamaindex.ai/en/stable/",
])`,
        }}
      />

      <h2>Transformations and Node Parsing</h2>
      <p>
        The <strong>IngestionPipeline</strong> applies a sequence of transformations to documents:
        splitting, metadata extraction, and embedding. Transformations are cached automatically.
      </p>

      <SDKExample
        title="Ingestion Pipeline with Transformations"
        tabs={{
          python: `from llama_index.core.ingestion import IngestionPipeline
from llama_index.core.node_parser import SentenceSplitter, SemanticSplitterNodeParser
from llama_index.core.extractors import TitleExtractor, QuestionsAnsweredExtractor
from llama_index.core import VectorStoreIndex
from llama_index.embeddings.openai import OpenAIEmbedding

embed_model = OpenAIEmbedding(model="text-embedding-3-small")

pipeline = IngestionPipeline(
    transformations=[
        # Split into chunks
        SentenceSplitter(chunk_size=512, chunk_overlap=64),

        # Automatically extract metadata (LLM-powered)
        TitleExtractor(nodes=5),  # Extract title from first 5 nodes
        QuestionsAnsweredExtractor(questions=3),  # Generate 3 QA pairs per node

        # Embed — must be last
        embed_model,
    ],
    # Optional: cache to disk to avoid re-processing
    # docstore=SimpleDocumentStore(),
)

nodes = pipeline.run(documents=documents)
print(f"Created {len(nodes)} nodes")
print(nodes[0].metadata)  # Shows extracted metadata

# Build index from pre-processed nodes
index = VectorStoreIndex(nodes)`,
        }}
      />

      <BestPracticeBlock title="Use IngestionPipeline with a Docstore for Incremental Updates">
        <p>By attaching a <code>docstore</code> to your <code>IngestionPipeline</code>, LlamaIndex
        will skip documents it has already processed. This makes incremental ingestion efficient —
        only new or changed documents are re-chunked and re-embedded. Use
        <code>SimpleDocumentStore</code> for local development and <code>RedisDocumentStore</code>
        or <code>MongoDocumentStore</code> for production.</p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="SemanticSplitter vs SentenceSplitter">
        <p>The default <code>SentenceSplitter</code> splits by token count, which can break
        paragraphs mid-thought. <code>SemanticSplitterNodeParser</code> uses embedding similarity
        to find natural topic boundaries, producing better chunks for retrieval — at the cost of
        one embedding API call per sentence. Use semantic splitting for high-quality RAG on
        dense technical documents.</p>
      </NoteBlock>
    </article>
  )
}
