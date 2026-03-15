import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';

const embeddingsCode = `import voyageai
from openai import OpenAI

# Using Voyage AI (recommended for RAG)
voyage_client = voyageai.Client()

texts = [
    "RAG combines retrieval with language models",
    "Vector embeddings enable semantic search",
    "Transformers power modern language models"
]

# Generate embeddings
result = voyage_client.embed(texts, model="voyage-3")
embeddings = result.embeddings  # List of 1024-dimensional vectors

print(f"Number of embeddings: {len(embeddings)}")
print(f"Embedding dimensions: {len(embeddings[0])}")

# Cosine similarity
import numpy as np

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

similarity = cosine_similarity(embeddings[0], embeddings[1])
print(f"Similarity between text 1 and 2: {similarity:.3f}")`;

export default function VectorEmbeddings() {
  return (
    <div className="lesson-content">
      <h2>Vector Embeddings for RAG</h2>

      <p>
        The retrieval step in any RAG pipeline depends on a mechanism for finding relevant
        documents given a user's question. Keyword search can work for exact matches, but it
        breaks down when the user phrases their question differently from how the document was
        written. Vector embeddings solve this by representing both queries and documents as points
        in a mathematical space where proximity means semantic similarity, not textual overlap.
      </p>

      <ConceptBlock
        title="Vector Embeddings"
        definition="An embedding is a dense numerical vector — an ordered list of floating-point numbers — that encodes the semantic meaning of a piece of text. Embedding models are trained to map text into a high-dimensional space such that texts with similar meanings land near each other, regardless of the specific words used. The distance between two vectors in this space is a proxy for semantic similarity."
      />

      <h2>How Embedding Models Work</h2>

      <p>
        Modern embedding models are built on the same transformer architecture that powers
        generative language models, but with a different training objective. Rather than predicting
        the next token, an embedding model is trained to produce vector representations where
        semantically related inputs are pulled closer together and unrelated inputs are pushed
        apart.
      </p>

      <p>
        This training often uses contrastive learning: the model sees pairs of related texts
        (treated as positive pairs) and unrelated texts (negative pairs), and it is rewarded for
        assigning high similarity to positive pairs and low similarity to negative ones. After
        training on massive amounts of this data, the model develops a compressed geometric
        representation of language where meaning is encoded in direction and distance.
      </p>

      <p>
        When you call an embedding model with a sentence, it processes the tokens through its
        transformer layers and outputs a single fixed-length vector — the embedding. This vector has
        no inherent human-readable meaning, but its relationship to other vectors is rich with
        semantic structure.
      </p>

      <h2>Key Properties of Embeddings</h2>

      <h3>Semantic Similarity</h3>
      <p>
        The most important property of a good embedding model is that it clusters semantically
        similar text together. "The car broke down on the highway" and "My vehicle stalled on the
        freeway" should produce vectors that are very close in the embedding space, even though
        they share almost no vocabulary. This is what makes embeddings so powerful for retrieval:
        a question like "How do I reset my password?" will find a document that says "Account
        credential recovery steps" even though the words do not overlap.
      </p>

      <h3>Distance Metrics</h3>
      <p>
        Two distance metrics dominate in RAG applications.
      </p>

      <p>
        <strong>Cosine similarity</strong> measures the angle between two vectors, ranging from -1
        (opposite directions) to 1 (same direction). It is invariant to the magnitude of the
        vectors, which means it compares meaning rather than length. This makes it robust to
        variations in text length and is the most common metric in RAG systems.
      </p>

      <p>
        <strong>Dot product</strong> is the sum of element-wise products. When vectors are
        normalized to unit length — a common practice — dot product and cosine similarity become
        equivalent. Many vector databases use dot product internally for performance reasons because
        it maps naturally to hardware-optimized matrix operations.
      </p>

      <p>
        Euclidean distance (straight-line distance in high-dimensional space) is used less
        frequently for text because it is sensitive to vector magnitude, which can conflate length
        effects with semantic ones.
      </p>

      <h2>Choosing an Embedding Model</h2>

      <p>
        Not all embedding models are equivalent, and the choice has a direct impact on retrieval
        quality. The main trade-offs are between dimensionality, speed, cost, and task-specific
        performance.
      </p>

      <h3>Voyage AI (voyage-3, voyage-3-lite)</h3>
      <p>
        Voyage AI's models consistently rank at the top of retrieval benchmarks and are purpose-
        built for RAG. The <code>voyage-3</code> model produces 1024-dimensional vectors and
        provides strong performance across a wide range of domains. <code>voyage-3-lite</code>
        is a smaller, faster, and cheaper variant that trades a modest amount of quality for
        significantly lower latency — a good choice for high-throughput applications.
      </p>

      <h3>OpenAI (text-embedding-3-small, text-embedding-3-large)</h3>
      <p>
        OpenAI's third-generation embedding models are widely used and well-integrated into the
        broader ecosystem. <code>text-embedding-3-small</code> produces 1536-dimensional vectors
        by default and is cost-effective for large-scale indexing. <code>text-embedding-3-large</code>
        produces 3072-dimensional vectors and achieves higher accuracy at greater cost and latency.
        Both support dimensionality reduction — you can truncate vectors to fewer dimensions and
        trade off quality for speed and storage.
      </p>

      <h3>Nomic (nomic-embed-text)</h3>
      <p>
        Nomic's open-source embedding model produces 768-dimensional vectors and can be run
        locally, making it attractive for privacy-sensitive deployments or offline use cases. Its
        retrieval quality is competitive with commercial models in many benchmarks, and it supports
        longer input sequences than some alternatives.
      </p>

      <h2>Dimensions and Trade-offs</h2>

      <p>
        The dimensionality of an embedding vector determines how much information it can encode.
        Higher dimensionality generally allows finer semantic distinctions but comes with costs:
        larger storage requirements, slower similarity computation, and higher memory pressure in
        the vector database.
      </p>

      <p>
        A 768-dimensional vector from a local model might be entirely sufficient for a focused
        domain like customer support FAQs, where the vocabulary and concepts are narrow. A
        3072-dimensional vector from a large commercial model is more likely to capture subtle
        distinctions across a broad, mixed-topic knowledge base like a company's entire internal
        wiki.
      </p>

      <p>
        In practice, the quality difference between 768 and 1536 dimensions is often smaller than
        the quality difference between a mediocre and a well-maintained document corpus. Clean,
        well-chunked documents will outperform a perfectly dimensioned embedding model applied to
        noisy, poorly structured text.
      </p>

      <h2>Chunked vs. Whole-Document Embeddings</h2>

      <p>
        A critical implementation decision is what unit of text to embed. Embedding an entire
        document as a single vector compresses all of its information into one point, which means
        a long document covering multiple topics may not match well against queries about any
        specific topic. The individual topics dilute each other.
      </p>

      <p>
        The standard approach is to split documents into smaller chunks — typically 256 to 1024
        tokens each, often with overlap between adjacent chunks to preserve context across
        boundaries. Each chunk gets its own embedding vector. When a user queries, the retrieved
        unit is a chunk rather than an entire document.
      </p>

      <p>
        Choosing chunk size is a real engineering decision. Smaller chunks produce more precise
        retrieval but may lack surrounding context when sent to the model. Larger chunks preserve
        context but may include irrelevant content that dilutes the signal. A common starting point
        is 512 tokens with 50–100 tokens of overlap, adjusted based on empirical evaluation of your
        specific corpus and query distribution.
      </p>

      <NoteBlock
        title="Choosing an embedding model in practice"
        content="Start with Voyage AI's voyage-3 or OpenAI's text-embedding-3-small for most RAG applications — both have strong general-purpose performance and straightforward APIs. Run a small offline evaluation: take 20–50 representative queries, manually identify the correct source documents, and measure how often your chosen model retrieves them in the top-5 results. This retrieval recall metric is a much better guide to model selection than benchmark leaderboards alone. Match your embedding model to your vector database's supported distance metric, and normalize vectors before storing them to avoid magnitude effects."
      />

      <h2>Generating Embeddings in Practice</h2>

      <p>
        The example below demonstrates generating embeddings with Voyage AI and computing cosine
        similarity between them. This is the fundamental operation that powers all RAG retrieval.
      </p>

      <SDKExample
        title="Generating and Comparing Embeddings"
        language="python"
        code={embeddingsCode}
        description="Generate dense vector embeddings using Voyage AI's voyage-3 model, then compute cosine similarity to measure semantic relatedness between text passages."
      />

      <p>
        In a production RAG pipeline, you would run this embedding step twice: once offline when
        building your index (embedding all your documents), and once at query time (embedding the
        user's question). The vectors produced by both passes need to come from the same model —
        mixing models produces incomparable vectors and will return garbage results.
      </p>

      <p>
        Most vector databases accept the raw embedding vectors returned by embedding APIs and
        handle the similarity search internally. The embedding model call shown here is all you
        need to feed a Pinecone, Weaviate, Chroma, or Qdrant index. The vector store handles
        efficient approximate nearest-neighbor search at scale so you do not need to compute
        pairwise cosine similarities across your entire corpus on every query.
      </p>
    </div>
  );
}
