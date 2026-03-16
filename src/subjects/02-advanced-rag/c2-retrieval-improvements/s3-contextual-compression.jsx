import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

export default function ContextualCompression() {
  return (
    <div className="lesson-content">
      <h2>Contextual Compression</h2>

      <p>
        Retrieved chunks often contain more text than what is relevant to the user's question. A
        512-token chunk retrieved for a narrow factual query may have 450 tokens of tangential
        context and only 60 tokens that directly address the question. Contextual compression
        extracts just the relevant portions from each retrieved chunk before passing them to the
        generator, reducing noise and saving context window space.
      </p>

      <ConceptBlock
        title="Contextual Compression"
        definition="Contextual compression is a post-retrieval technique that filters or extracts the relevant portions of retrieved chunks with respect to the user's query. Instead of sending entire chunks as context, it identifies and extracts only the sentences or passages within each chunk that are directly relevant, reducing context length and improving signal-to-noise ratio."
      />

      <h2>Why Compression Matters</h2>

      <p>
        The "lost-in-the-middle" problem shows that LLMs are less reliable at using information
        placed in the middle of long context windows. Shorter, more focused context is better
        processed. Compression also reduces token costs and allows more retrieved chunks to fit
        within a fixed context budget — if each raw chunk is 512 tokens and you compress to 100
        tokens per chunk, you can fit 5× more unique sources in the same context window.
      </p>

      <SDKExample
        title="LLM-Based Contextual Compression"
        tabs={{
          python: `import anthropic

client = anthropic.Anthropic()

EXTRACT_PROMPT = """Given the following document passage and a question, extract ONLY the
sentences from the passage that are directly relevant to answering the question.
If no sentences are relevant, respond with exactly: "NO_RELEVANT_CONTENT"
Do not add any explanation — return only the extracted sentences.

Question: {question}

Passage:
{passage}

Relevant sentences:"""

def compress_chunk(question: str, chunk: str, model: str = "claude-haiku-4-5") -> str | None:
    """
    Extract relevant sentences from a chunk.
    Returns None if no relevant content found.
    """
    response = client.messages.create(
        model=model,
        max_tokens=256,
        temperature=0.0,
        messages=[{
            "role": "user",
            "content": EXTRACT_PROMPT.format(question=question, passage=chunk)
        }]
    )
    result = response.content[0].text.strip()
    if result == "NO_RELEVANT_CONTENT" or not result:
        return None
    return result

def compress_chunks(question: str, chunks: list[str], min_length: int = 20) -> list[str]:
    """
    Compress a list of retrieved chunks, filtering out irrelevant ones.
    Returns only the relevant extracted portions.
    """
    compressed = []
    for chunk in chunks:
        extracted = compress_chunk(question, chunk)
        if extracted and len(extracted) >= min_length:
            compressed.append(extracted)
    return compressed

# Example
question = "What is the maximum context window of Claude claude-opus-4-5?"

chunks = [
    """Anthropic offers several Claude models with varying capabilities.
    Claude claude-opus-4-5 features a 200,000 token context window, making it suitable
    for processing long documents. The model was released in 2024 and supports
    function calling, vision, and streaming. Anthropic's API pricing is token-based.""",

    """Python is a high-level programming language known for its readability.
    It supports multiple programming paradigms including procedural, object-oriented,
    and functional styles. Python is widely used in data science and machine learning.""",
]

compressed = compress_chunks(question, chunks)
print(f"Original: {sum(len(c) for c in chunks)} chars")
print(f"Compressed: {sum(len(c) for c in compressed)} chars")
for i, c in enumerate(compressed):
    print(f"Chunk {i+1}: {c}")`,
        }}
      />

      <h2>LangChain ContextualCompressionRetriever</h2>

      <p>
        LangChain provides a built-in wrapper that combines a base retriever with a compressor,
        handling the pipeline mechanics automatically. The <code>LLMChainExtractor</code> uses an
        LLM to extract relevant content; the <code>EmbeddingsFilter</code> uses cosine similarity
        as a cheaper alternative.
      </p>

      <SDKExample
        title="LangChain ContextualCompressionRetriever"
        tabs={{
          python: `from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor, EmbeddingsFilter
from langchain_anthropic import ChatAnthropic
from langchain_voyageai import VoyageAIEmbeddings
from langchain_community.vectorstores import Chroma

# Base retriever
embeddings = VoyageAIEmbeddings(model="voyage-3")
vectorstore = Chroma(embedding_function=embeddings, persist_directory="./chroma_db")
base_retriever = vectorstore.as_retriever(search_kwargs={"k": 10})

# Option 1: LLM-based extractor (most accurate, most expensive)
llm = ChatAnthropic(model="claude-haiku-4-5")
llm_extractor = LLMChainExtractor.from_llm(llm)
llm_compression_retriever = ContextualCompressionRetriever(
    base_compressor=llm_extractor,
    base_retriever=base_retriever,
)

# Option 2: Embeddings-based filter (fast, cheap, good enough for most cases)
embeddings_filter = EmbeddingsFilter(
    embeddings=embeddings,
    similarity_threshold=0.76,  # Only keep chunks with cosine sim >= 0.76 to query
)
embeddings_compression_retriever = ContextualCompressionRetriever(
    base_compressor=embeddings_filter,
    base_retriever=base_retriever,
)

# Usage — transparent drop-in for any LangChain retrieval chain
question = "What configuration options does pgvector support for HNSW indexing?"

# LLM-compressed results (extracted relevant sentences only)
compressed_docs = llm_compression_retriever.invoke(question)
print(f"LLM compression: {len(compressed_docs)} relevant passages")
for doc in compressed_docs:
    print(f"  {doc.page_content[:100]}...")

# Embeddings-filtered results (entire chunks that pass similarity threshold)
filtered_docs = embeddings_compression_retriever.invoke(question)
print(f"\\nEmbeddings filter: {len(filtered_docs)} relevant chunks")`,
        }}
      />

      <h2>Sentence-Level Compression</h2>

      <p>
        A lightweight alternative to LLM-based extraction is sentence-level filtering: split
        each chunk into sentences, embed each sentence, compute cosine similarity to the query,
        and keep only sentences above a threshold. This avoids an LLM call entirely and runs
        in milliseconds.
      </p>

      <SDKExample
        title="Sentence-Level Embedding Filter"
        tabs={{
          python: `import voyageai
import numpy as np
import re

voyage_client = voyageai.Client()

def split_sentences(text: str) -> list[str]:
    """Simple sentence splitter."""
    sentences = re.split(r"(?<=[.!?])\\s+", text.strip())
    return [s.strip() for s in sentences if len(s.strip()) > 20]

def sentence_level_compress(
    query: str,
    chunk: str,
    threshold: float = 0.75,
    min_sentences: int = 1,
) -> str:
    """Keep only sentences that are cosine-similar to the query."""
    sentences = split_sentences(chunk)
    if not sentences:
        return chunk

    # Embed query and all sentences in one batch
    texts = [query] + sentences
    result = voyage_client.embed(texts, model="voyage-3-lite")  # Use fast model
    vectors = np.array(result.embeddings)

    query_vec = vectors[0]
    sentence_vecs = vectors[1:]

    # Cosine similarities
    norms = np.linalg.norm(sentence_vecs, axis=1, keepdims=True)
    sentence_vecs_norm = sentence_vecs / np.maximum(norms, 1e-8)
    query_norm = query_vec / (np.linalg.norm(query_vec) + 1e-8)
    similarities = sentence_vecs_norm @ query_norm

    relevant_sentences = [s for s, sim in zip(sentences, similarities) if sim >= threshold]

    if len(relevant_sentences) < min_sentences:
        # Fall back to top-scoring sentences if none pass threshold
        top_idx = np.argsort(similarities)[::-1][:min_sentences]
        relevant_sentences = [sentences[i] for i in top_idx]

    return " ".join(relevant_sentences)`,
        }}
      />

      <BestPracticeBlock title="Use Embeddings Filter as Default, LLM Extraction for High-Stakes Queries">
        <p>
          Embeddings-based filtering is 10–50× faster and cheaper than LLM-based extraction.
          Use it as your default compressor. Upgrade to LLM extraction for high-value queries
          where precision matters more than latency, or when chunks are long (over 1000 tokens)
          and the signal-to-noise ratio is especially low. A routing layer that checks query
          complexity or chunk length before choosing the compression method is a practical
          production pattern.
        </p>
      </BestPracticeBlock>

      <NoteBlock
        title="Compression can increase hallucination risk"
        content="When a compressor extracts a sentence out of context, the extracted sentence can be misleading — it may depend on a preceding sentence for correct interpretation. Mitigate this by always including at least one sentence before and after the extracted sentences (sentence window retrieval), or by passing the full chunk alongside the extracted summary so the generator can verify."
      />
    </div>
  );
}
