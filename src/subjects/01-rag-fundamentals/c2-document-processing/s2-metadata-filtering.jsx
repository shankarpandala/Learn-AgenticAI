import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

const metadataPython = `import chromadb
from chromadb.utils import embedding_functions
import voyageai

voyage_client = voyageai.Client()
voyage_ef = embedding_functions.create_langchain_embedding(voyage_client)

# Initialize Chroma with persistence
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(
    name="docs",
    embedding_function=voyage_ef,
)

# Ingest documents with rich metadata
documents = [
    "The quarterly revenue for Q1 2024 was $4.2 million.",
    "Product roadmap update: v2.0 ships in June 2024.",
    "Security patch CVE-2024-1234 must be applied by March 15.",
    "The onboarding guide for new employees covers benefits enrollment.",
    "Customer churn rate decreased by 12% in Q4 2023.",
]

metadatas = [
    {"source": "finance", "quarter": "Q1-2024", "doc_type": "report"},
    {"source": "product", "quarter": "Q2-2024", "doc_type": "roadmap"},
    {"source": "security", "severity": "high", "doc_type": "advisory"},
    {"source": "hr", "doc_type": "guide", "audience": "employees"},
    {"source": "finance", "quarter": "Q4-2023", "doc_type": "report"},
]

collection.add(
    documents=documents,
    metadatas=metadatas,
    ids=[f"doc_{i}" for i in range(len(documents))],
)

# Query with metadata filter — only finance documents
finance_results = collection.query(
    query_texts=["What were the revenue numbers?"],
    n_results=3,
    where={"source": "finance"},
)
print("Finance-only results:")
for doc, meta in zip(finance_results["documents"][0], finance_results["metadatas"][0]):
    print(f"  [{meta['quarter']}] {doc}")

# Compound filter: finance docs from 2024
results_2024 = collection.query(
    query_texts=["revenue performance"],
    n_results=3,
    where={
        "$and": [
            {"source": {"$eq": "finance"}},
            {"quarter": {"$in": ["Q1-2024", "Q2-2024", "Q3-2024", "Q4-2024"]}},
        ]
    },
)
print("\\n2024 Finance results:")
for doc in results_2024["documents"][0]:
    print(f"  {doc}")`;

const metadataTS = `import { ChromaClient } from "chromadb";

const client = new ChromaClient();

async function metadataFilteringDemo() {
  const collection = await client.getOrCreateCollection({
    name: "docs",
  });

  // Add documents with rich metadata
  await collection.add({
    ids: ["doc_0", "doc_1", "doc_2", "doc_3", "doc_4"],
    documents: [
      "The quarterly revenue for Q1 2024 was $4.2 million.",
      "Product roadmap update: v2.0 ships in June 2024.",
      "Security patch CVE-2024-1234 must be applied by March 15.",
      "The onboarding guide for new employees covers benefits enrollment.",
      "Customer churn rate decreased by 12% in Q4 2023.",
    ],
    metadatas: [
      { source: "finance", quarter: "Q1-2024", doc_type: "report" },
      { source: "product", quarter: "Q2-2024", doc_type: "roadmap" },
      { source: "security", severity: "high", doc_type: "advisory" },
      { source: "hr", doc_type: "guide", audience: "employees" },
      { source: "finance", quarter: "Q4-2023", doc_type: "report" },
    ],
  });

  // Query with metadata filter — only finance documents
  const financeResults = await collection.query({
    queryTexts: ["What were the revenue numbers?"],
    nResults: 3,
    where: { source: "finance" },
  });

  console.log("Finance-only results:");
  financeResults.documents[0].forEach((doc, i) => {
    const meta = financeResults.metadatas[0][i];
    console.log(  [\${meta?.quarter}] \${doc});
  });

  // High-severity security advisories
  const securityResults = await collection.query({
    queryTexts: ["urgent patches"],
    nResults: 5,
    where: { $and: [{ source: "security" }, { severity: "high" }] },
  });

  console.log("\\nHigh-severity security results:");
  securityResults.documents[0].forEach((doc) => console.log(  \${doc}));
}

metadataFilteringDemo();`;

export default function MetadataFiltering() {
  return (
    <div className="lesson-content">
      <h2>Metadata Filtering</h2>

      <p>
        Pure vector similarity search is powerful, but it answers a single question: which
        chunks are semantically closest to this query? In real deployments, you often need
        to answer a more specific question: which chunks are semantically closest to this query
        <em> within a specific subset of documents</em>? That is the problem metadata filtering
        solves.
      </p>

      <ConceptBlock
        term="Metadata Filtering"
        definition="Metadata filtering restricts a vector similarity search to a pre-specified subset of documents by applying conditions on structured fields stored alongside each chunk's embedding. The filter is applied before or during the ANN search, so the similarity ranking only considers chunks that match all filter conditions. This combines the precision of structured database queries with the semantic power of vector search."
      />

      <h2>Why Filtering Matters for Precision</h2>

      <p>
        Consider a knowledge base that contains financial reports, HR policies, product
        documentation, and security advisories. A query about "Q1 revenue" should retrieve
        finance documents, not HR guides — even if an HR guide happens to mention revenue
        numbers in passing. Without filtering, the top-k results can include irrelevant
        documents that happen to score well due to surface-level term overlap.
      </p>
      <p>
        Metadata filtering collapses the search space before similarity ranking begins. If you
        filter to <code>source=finance</code>, the ANN algorithm only compares the query
        against finance chunks. The result is dramatically higher precision and fewer
        irrelevant documents reaching the LLM.
      </p>

      <h2>Common Metadata Fields</h2>

      <p>
        The most useful metadata fields to attach to chunks during ingestion are:
      </p>

      <ul>
        <li>
          <strong>Source or category</strong> — the department, product area, or document
          type the chunk came from (e.g., <code>finance</code>, <code>hr</code>, <code>security</code>).
        </li>
        <li>
          <strong>Date or time period</strong> — when the document was created or last updated,
          or which time period it covers (e.g., <code>quarter: "Q1-2024"</code>). Enables
          temporal filtering to surface recent or period-specific information.
        </li>
        <li>
          <strong>Document type</strong> — report, guide, advisory, roadmap, FAQ. Lets you
          retrieve from specific content formats.
        </li>
        <li>
          <strong>Access level or audience</strong> — who the document is intended for. Enables
          security-aware retrieval where users only see chunks they are authorised to access.
        </li>
        <li>
          <strong>Language</strong> — for multilingual corpora, filtering by language before
          running semantic search avoids cross-language false positives.
        </li>
        <li>
          <strong>Section hierarchy</strong> — the heading path from document-aware chunking
          (e.g., <code>section: "Configuration &gt; Database"</code>). Enables scoping queries
          to specific parts of large documents.
        </li>
      </ul>

      <h2>Filter Operators</h2>

      <p>
        Most vector databases support a standard set of comparison operators for metadata
        filters. The exact syntax varies by database, but the semantics are consistent:
      </p>

      <ul>
        <li><code>$eq</code> / <code>$ne</code> — equals / not equals</li>
        <li><code>$gt</code> / <code>$gte</code> / <code>$lt</code> / <code>$lte</code> — numeric comparisons</li>
        <li><code>$in</code> / <code>$nin</code> — value in / not in a list</li>
        <li><code>$and</code> / <code>$or</code> — compound conditions</li>
        <li><code>$contains</code> — string substring match (Chroma, Weaviate)</li>
      </ul>

      <p>
        Compound filters let you express queries like "finance documents from 2024 of type
        report" as a nested JSON condition. These compose cleanly and are evaluated efficiently
        by the vector database before running ANN search.
      </p>

      <h2>Extracting Filter Values from User Queries</h2>

      <p>
        A powerful pattern is to use an LLM to extract structured filter criteria from the
        user's natural language query before issuing the vector search. Given "What did the
        Q1 2024 finance report say about revenue?", the LLM can extract
        <code>{"{"} source: "finance", quarter: "Q1-2024" {"}"}</code> as filter parameters.
        This bridges the gap between unstructured user input and structured retrieval filters.
      </p>

      <NoteBlock
        type="tip"
        title="Use structured output for filter extraction"
        children='Prompt the LLM with a JSON schema describing valid filter fields and their possible values. Request a structured JSON response. Validate the extracted filters against the schema before applying them. This approach is robust even when users express filters implicitly ("recent finance reports" → date_year >= 2024, source = finance).'
      />

      <BestPracticeBlock title="Store metadata at ingest time, not query time">
        Every useful metadata field must be decided at document ingestion time. You cannot
        retroactively add metadata to indexed chunks without re-indexing. Before building
        your pipeline, audit your documents and define a metadata schema that covers all the
        filtering axes your use cases will need — source, date, type, audience, language,
        and section at a minimum.
      </BestPracticeBlock>

      <h2>Metadata Filtering with ChromaDB</h2>

      <SDKExample
        title="Metadata Filtering with ChromaDB"
        tabs={{
          python: metadataPython,
          typescript: metadataTS,
        }}
      />

      <p>
        The pattern above indexes five documents with structured metadata and then issues two
        filtered queries. The first narrows retrieval to finance documents only; the second
        compounds two conditions to find high-severity security advisories. In both cases,
        only chunks that pass the filter participate in the similarity ranking, which means
        the top results are both relevant and from the right source.
      </p>
    </div>
  );
}
