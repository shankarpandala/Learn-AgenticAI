import{j as e}from"./vendor-Cs56uELc.js";import{C as n,F as h,N as r,S as t,B as s,A as o,a as i,W as u}from"./content-components-CDXEIxVK.js";const m=`from anthropic import Anthropic
import numpy as np

client = Anthropic()

def simple_rag(question: str, documents: list[str]) -> str:
    # Step 1: Retrieve relevant documents (simplified - use real vector DB in production)
    # In production, use embeddings + vector similarity search
    relevant_docs = documents[:2]  # simplified retrieval

    # Step 2: Augment the prompt with context
    context = "\\n\\n".join(relevant_docs)

    # Step 3: Generate with context
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        system="You are a helpful assistant. Answer questions based ONLY on the provided context. If the context doesn't contain the answer, say so.",
        messages=[
            {
                "role": "user",
                "content": f"Context:\\n{context}\\n\\nQuestion: {question}"
            }
        ]
    )
    return response.content[0].text`;function p(){return e.jsxs("div",{className:"lesson-content",children:[e.jsx("h2",{children:"What is RAG?"}),e.jsx("p",{children:"Large language models are trained on vast corpora of text — but that training has a hard cutoff date, and it never includes your private documents, internal wikis, or live data feeds. Ask a model about something that happened last month, and it will either confess ignorance or, worse, confidently fabricate an answer. Retrieval-Augmented Generation, known as RAG, is the standard engineering pattern for solving this problem."}),e.jsx(n,{title:"Retrieval-Augmented Generation (RAG)",definition:"RAG is an architecture that enhances a language model's responses by first retrieving relevant documents or passages from an external knowledge source, then injecting those retrieved pieces as context into the prompt before generation. The model's answer is therefore grounded in real, verifiable content rather than solely in what was baked into its weights during training."}),e.jsx("h2",{children:"Why RAG Exists: The Three Core Problems"}),e.jsx("p",{children:"To understand RAG's value, it helps to be precise about the problems it solves."}),e.jsx("h3",{children:"1. Training Cutoff"}),e.jsx("p",{children:"Every model has a knowledge cutoff — a date beyond which it has no training data. A model trained through early 2024 cannot answer questions about events, releases, or research published afterward. Rather than retraining the model (enormously expensive) or fine-tuning it frequently, RAG lets you push fresh information into the prompt at inference time."}),e.jsx("h3",{children:"2. Hallucination"}),e.jsx("p",{children:"Language models generate statistically plausible text. When they lack knowledge of a specific fact, they sometimes produce fluent-sounding fabrications. Grounding the model with retrieved source documents dramatically reduces this risk: the model can quote or paraphrase the provided text rather than inventing details. It also makes attribution possible — you can show users exactly which document each claim came from."}),e.jsx("h3",{children:"3. Private and Proprietary Data"}),e.jsx("p",{children:"Your company's internal documentation, customer support history, legal contracts, and product manuals were never part of any public training corpus. RAG is the practical way to give a language model access to that institutional knowledge without exposing it through fine-tuning or retraining."}),e.jsx("h2",{children:"The Core RAG Loop"}),e.jsx("p",{children:"Every RAG system, regardless of sophistication, follows the same fundamental loop. A user's question is transformed into a vector, that vector is used to retrieve semantically similar content from a knowledge base, and the retrieved content is combined with the original question before being handed to the language model."}),e.jsx(h,{steps:["Query","Embed Query","Vector Search","Retrieve Chunks","Augment Prompt","Generate Answer"],description:"The six-step RAG pipeline: the user's question is embedded, searched against a vector store, retrieved as context, injected into the prompt, and finally answered by the LLM."}),e.jsx("p",{children:"Let's walk through each step in detail."}),e.jsx("h3",{children:"Step 1 — Query"}),e.jsx("p",{children:"The process begins with a natural language question or instruction from the user. At this stage it is just a string. The goal of the entire pipeline is to answer it accurately."}),e.jsx("h3",{children:"Step 2 — Embed Query"}),e.jsx("p",{children:"The query is converted into a dense numerical vector using an embedding model. This vector captures the semantic meaning of the question — not just the keywords. Two questions phrased differently but asking the same thing will produce similar vectors, enabling true semantic search rather than simple keyword matching."}),e.jsx("h3",{children:"Step 3 — Vector Search"}),e.jsx("p",{children:"The query vector is compared against a database of pre-computed document vectors using a similarity metric such as cosine similarity. The vector database returns the top-k most similar document chunks — typically the closest 3 to 10 results depending on context window budget and precision requirements."}),e.jsx("h3",{children:"Step 4 — Retrieve Chunks"}),e.jsx("p",{children:"The matched document chunks are fetched from storage. These are the actual text passages — paragraphs, sections, or fixed-size windows of your source documents — that were indexed ahead of time. Good chunking strategy has a large effect on final answer quality."}),e.jsx("h3",{children:"Step 5 — Augment Prompt"}),e.jsx("p",{children:"The retrieved chunks are assembled into a context block and injected into the prompt alongside the original question. A typical system prompt for this step instructs the model to answer based only on the provided context and to acknowledge when the context is insufficient. This instruction is what prevents the model from falling back on hallucinated training knowledge."}),e.jsx("h3",{children:"Step 6 — Generate Answer"}),e.jsx("p",{children:"The augmented prompt is sent to the language model, which reads both the retrieved context and the question, and generates a grounded response. Because the relevant information is directly in the context window, the model's answer reflects your actual data rather than parametric memory."}),e.jsx("h2",{children:"RAG vs. Fine-Tuning vs. Pure Prompting"}),e.jsx("p",{children:"RAG is not the only way to adapt a language model to a specific domain. It is worth understanding when each approach makes sense."}),e.jsx("h3",{children:"Pure Prompting"}),e.jsx("p",{children:"If the information you need is small enough to fit in the context window and changes infrequently, you can simply include it in every prompt. This is the simplest approach and works well for concise reference material — a pricing table, a list of valid product codes, a short FAQ. It does not scale to thousands of documents."}),e.jsx("h3",{children:"Fine-Tuning"}),e.jsx("p",{children:"Fine-tuning adapts the model's weights to a specific task or style, not to inject factual knowledge. It is best used when you need consistent output formatting, a particular tone, or strong performance on a narrow task type. Fine-tuning does not reliably implant new factual knowledge, and the resulting model becomes stale as your data changes. It is also more expensive and slower to iterate on than RAG."}),e.jsx("h3",{children:"RAG"}),e.jsx("p",{children:"RAG is the right choice when your knowledge base is large, changes over time, or needs to support attributable answers. It scales independently from the model — you can update your document index without touching the model at all. It is also cheaper to iterate on: changing your chunking strategy or adding new documents requires only re-indexing, not retraining."}),e.jsx(r,{title:"When is RAG the right choice?",content:"Reach for RAG when your use case involves any of the following: a knowledge base larger than roughly 50–100 pages of text, documents that update more frequently than monthly, a requirement for source attribution, or private data that must not be exposed to model providers during training. For very small and stable reference material, consider whether a carefully crafted system prompt with the content inline is simpler and sufficient."}),e.jsx("h2",{children:"Key Benefits of RAG"}),e.jsx("h3",{children:"Freshness"}),e.jsx("p",{children:"Because retrieval happens at inference time, your answers reflect the current state of your document store. Re-index a document and the next query immediately benefits from the update. There is no model deployment cycle."}),e.jsx("h3",{children:"Grounding"}),e.jsx("p",{children:"The model's answer is tethered to real source material. This substantially reduces hallucination, particularly for factual questions where the model might otherwise rely on imprecise parametric memory."}),e.jsx("h3",{children:"Attribution"}),e.jsx("p",{children:"Because you know exactly which chunks were retrieved, you can display source citations alongside the answer. This is essential for enterprise applications where users need to verify claims, for regulated industries where auditability matters, and for any use case where trust depends on transparency."}),e.jsx("h3",{children:"Cost Efficiency"}),e.jsx("p",{children:"Retrieving the right 3–5 paragraphs and sending them with the query is vastly cheaper than sending an entire document library in every prompt. And updating your knowledge base is far cheaper than retraining or fine-tuning."}),e.jsx("h2",{children:"A Minimal RAG Implementation"}),e.jsx("p",{children:"The example below shows the core RAG pattern stripped to its essentials using the Anthropic SDK. In a production system you would replace the simplified retrieval with a real vector database and embedding model — the generation step shown here remains the same."}),e.jsx(t,{title:"Minimal RAG with Anthropic SDK",language:"python",code:m,description:"A minimal RAG pipeline: retrieve relevant documents, build a context string, inject it into the prompt, and generate a grounded answer using Claude."}),e.jsx("p",{children:"Notice the three clearly separated phases: retrieve, augment, generate. This separation is not just organizational — it means you can swap out or improve each phase independently. Better retrieval improves accuracy without touching the generation code. Prompt engineering improvements in the augmentation step affect quality without changing the retrieval logic. This modularity is one of RAG's practical engineering strengths."})]})}const ee=Object.freeze(Object.defineProperty({__proto__:null,default:p},Symbol.toStringTag,{value:"Module"})),g=`import voyageai
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
print(f"Similarity between text 1 and 2: {similarity:.3f}")`;function f(){return e.jsxs("div",{className:"lesson-content",children:[e.jsx("h2",{children:"Vector Embeddings for RAG"}),e.jsx("p",{children:"The retrieval step in any RAG pipeline depends on a mechanism for finding relevant documents given a user's question. Keyword search can work for exact matches, but it breaks down when the user phrases their question differently from how the document was written. Vector embeddings solve this by representing both queries and documents as points in a mathematical space where proximity means semantic similarity, not textual overlap."}),e.jsx(n,{title:"Vector Embeddings",definition:"An embedding is a dense numerical vector — an ordered list of floating-point numbers — that encodes the semantic meaning of a piece of text. Embedding models are trained to map text into a high-dimensional space such that texts with similar meanings land near each other, regardless of the specific words used. The distance between two vectors in this space is a proxy for semantic similarity."}),e.jsx("h2",{children:"How Embedding Models Work"}),e.jsx("p",{children:"Modern embedding models are built on the same transformer architecture that powers generative language models, but with a different training objective. Rather than predicting the next token, an embedding model is trained to produce vector representations where semantically related inputs are pulled closer together and unrelated inputs are pushed apart."}),e.jsx("p",{children:"This training often uses contrastive learning: the model sees pairs of related texts (treated as positive pairs) and unrelated texts (negative pairs), and it is rewarded for assigning high similarity to positive pairs and low similarity to negative ones. After training on massive amounts of this data, the model develops a compressed geometric representation of language where meaning is encoded in direction and distance."}),e.jsx("p",{children:"When you call an embedding model with a sentence, it processes the tokens through its transformer layers and outputs a single fixed-length vector — the embedding. This vector has no inherent human-readable meaning, but its relationship to other vectors is rich with semantic structure."}),e.jsx("h2",{children:"Key Properties of Embeddings"}),e.jsx("h3",{children:"Semantic Similarity"}),e.jsx("p",{children:'The most important property of a good embedding model is that it clusters semantically similar text together. "The car broke down on the highway" and "My vehicle stalled on the freeway" should produce vectors that are very close in the embedding space, even though they share almost no vocabulary. This is what makes embeddings so powerful for retrieval: a question like "How do I reset my password?" will find a document that says "Account credential recovery steps" even though the words do not overlap.'}),e.jsx("h3",{children:"Distance Metrics"}),e.jsx("p",{children:"Two distance metrics dominate in RAG applications."}),e.jsxs("p",{children:[e.jsx("strong",{children:"Cosine similarity"})," measures the angle between two vectors, ranging from -1 (opposite directions) to 1 (same direction). It is invariant to the magnitude of the vectors, which means it compares meaning rather than length. This makes it robust to variations in text length and is the most common metric in RAG systems."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Dot product"})," is the sum of element-wise products. When vectors are normalized to unit length — a common practice — dot product and cosine similarity become equivalent. Many vector databases use dot product internally for performance reasons because it maps naturally to hardware-optimized matrix operations."]}),e.jsx("p",{children:"Euclidean distance (straight-line distance in high-dimensional space) is used less frequently for text because it is sensitive to vector magnitude, which can conflate length effects with semantic ones."}),e.jsx("h2",{children:"Choosing an Embedding Model"}),e.jsx("p",{children:"Not all embedding models are equivalent, and the choice has a direct impact on retrieval quality. The main trade-offs are between dimensionality, speed, cost, and task-specific performance."}),e.jsx("h3",{children:"Voyage AI (voyage-3, voyage-3-lite)"}),e.jsxs("p",{children:["Voyage AI's models consistently rank at the top of retrieval benchmarks and are purpose- built for RAG. The ",e.jsx("code",{children:"voyage-3"})," model produces 1024-dimensional vectors and provides strong performance across a wide range of domains. ",e.jsx("code",{children:"voyage-3-lite"}),"is a smaller, faster, and cheaper variant that trades a modest amount of quality for significantly lower latency — a good choice for high-throughput applications."]}),e.jsx("h3",{children:"OpenAI (text-embedding-3-small, text-embedding-3-large)"}),e.jsxs("p",{children:["OpenAI's third-generation embedding models are widely used and well-integrated into the broader ecosystem. ",e.jsx("code",{children:"text-embedding-3-small"})," produces 1536-dimensional vectors by default and is cost-effective for large-scale indexing. ",e.jsx("code",{children:"text-embedding-3-large"}),"produces 3072-dimensional vectors and achieves higher accuracy at greater cost and latency. Both support dimensionality reduction — you can truncate vectors to fewer dimensions and trade off quality for speed and storage."]}),e.jsx("h3",{children:"Nomic (nomic-embed-text)"}),e.jsx("p",{children:"Nomic's open-source embedding model produces 768-dimensional vectors and can be run locally, making it attractive for privacy-sensitive deployments or offline use cases. Its retrieval quality is competitive with commercial models in many benchmarks, and it supports longer input sequences than some alternatives."}),e.jsx("h2",{children:"Dimensions and Trade-offs"}),e.jsx("p",{children:"The dimensionality of an embedding vector determines how much information it can encode. Higher dimensionality generally allows finer semantic distinctions but comes with costs: larger storage requirements, slower similarity computation, and higher memory pressure in the vector database."}),e.jsx("p",{children:"A 768-dimensional vector from a local model might be entirely sufficient for a focused domain like customer support FAQs, where the vocabulary and concepts are narrow. A 3072-dimensional vector from a large commercial model is more likely to capture subtle distinctions across a broad, mixed-topic knowledge base like a company's entire internal wiki."}),e.jsx("p",{children:"In practice, the quality difference between 768 and 1536 dimensions is often smaller than the quality difference between a mediocre and a well-maintained document corpus. Clean, well-chunked documents will outperform a perfectly dimensioned embedding model applied to noisy, poorly structured text."}),e.jsx("h2",{children:"Chunked vs. Whole-Document Embeddings"}),e.jsx("p",{children:"A critical implementation decision is what unit of text to embed. Embedding an entire document as a single vector compresses all of its information into one point, which means a long document covering multiple topics may not match well against queries about any specific topic. The individual topics dilute each other."}),e.jsx("p",{children:"The standard approach is to split documents into smaller chunks — typically 256 to 1024 tokens each, often with overlap between adjacent chunks to preserve context across boundaries. Each chunk gets its own embedding vector. When a user queries, the retrieved unit is a chunk rather than an entire document."}),e.jsx("p",{children:"Choosing chunk size is a real engineering decision. Smaller chunks produce more precise retrieval but may lack surrounding context when sent to the model. Larger chunks preserve context but may include irrelevant content that dilutes the signal. A common starting point is 512 tokens with 50–100 tokens of overlap, adjusted based on empirical evaluation of your specific corpus and query distribution."}),e.jsx(r,{title:"Choosing an embedding model in practice",content:"Start with Voyage AI's voyage-3 or OpenAI's text-embedding-3-small for most RAG applications — both have strong general-purpose performance and straightforward APIs. Run a small offline evaluation: take 20–50 representative queries, manually identify the correct source documents, and measure how often your chosen model retrieves them in the top-5 results. This retrieval recall metric is a much better guide to model selection than benchmark leaderboards alone. Match your embedding model to your vector database's supported distance metric, and normalize vectors before storing them to avoid magnitude effects."}),e.jsx("h2",{children:"Generating Embeddings in Practice"}),e.jsx("p",{children:"The example below demonstrates generating embeddings with Voyage AI and computing cosine similarity between them. This is the fundamental operation that powers all RAG retrieval."}),e.jsx(t,{title:"Generating and Comparing Embeddings",language:"python",code:g,description:"Generate dense vector embeddings using Voyage AI's voyage-3 model, then compute cosine similarity to measure semantic relatedness between text passages."}),e.jsx("p",{children:"In a production RAG pipeline, you would run this embedding step twice: once offline when building your index (embedding all your documents), and once at query time (embedding the user's question). The vectors produced by both passes need to come from the same model — mixing models produces incomparable vectors and will return garbage results."}),e.jsx("p",{children:"Most vector databases accept the raw embedding vectors returned by embedding APIs and handle the similarity search internally. The embedding model call shown here is all you need to feed a Pinecone, Weaviate, Chroma, or Qdrant index. The vector store handles efficient approximate nearest-neighbor search at scale so you do not need to compute pairwise cosine similarities across your entire corpus on every query."})]})}const te=Object.freeze(Object.defineProperty({__proto__:null,default:f},Symbol.toStringTag,{value:"Module"})),y=`import numpy as np
import voyageai

voyage_client = voyageai.Client()

def embed_texts(texts: list[str]) -> list[list[float]]:
    result = voyage_client.embed(texts, model="voyage-3")
    return result.embeddings

def cosine_similarity(a: list[float], b: list[float]) -> float:
    a_arr, b_arr = np.array(a), np.array(b)
    return float(np.dot(a_arr, b_arr) / (np.linalg.norm(a_arr) * np.linalg.norm(b_arr)))

def top_k_search(query: str, documents: list[str], k: int = 3) -> list[dict]:
    """Brute-force nearest-neighbour search over a small corpus."""
    all_texts = [query] + documents
    embeddings = embed_texts(all_texts)
    query_vec = embeddings[0]
    doc_vecs = embeddings[1:]

    scored = [
        {"document": doc, "score": cosine_similarity(query_vec, vec)}
        for doc, vec in zip(documents, doc_vecs)
    ]
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:k]

# Example corpus
corpus = [
    "HNSW is a graph-based approximate nearest-neighbour algorithm.",
    "Cosine similarity measures the angle between two vectors.",
    "BM25 is a sparse retrieval method based on term frequency.",
    "Vector databases store and index high-dimensional embeddings.",
    "Python is a general-purpose programming language.",
]

results = top_k_search("How does vector similarity search work?", corpus, k=3)
for r in results:
    print(f"Score: {r['score']:.4f} | {r['document']}")`,x=`import Anthropic from "@anthropic-ai/sdk";

// For TypeScript, we use OpenAI embeddings as an example
// In production, use Voyage AI or another provider
import OpenAI from "openai";

const openai = new OpenAI();

async function embedTexts(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return response.data.map((item) => item.embedding);
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

async function topKSearch(
  query: string,
  documents: string[],
  k: number = 3
): Promise<Array<{ document: string; score: number }>> {
  const allEmbeddings = await embedTexts([query, ...documents]);
  const queryVec = allEmbeddings[0];
  const docVecs = allEmbeddings.slice(1);

  const scored = documents.map((doc, i) => ({
    document: doc,
    score: cosineSimilarity(queryVec, docVecs[i]),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

// Example usage
const corpus = [
  "HNSW is a graph-based approximate nearest-neighbour algorithm.",
  "Cosine similarity measures the angle between two vectors.",
  "BM25 is a sparse retrieval method based on term frequency.",
  "Vector databases store and index high-dimensional embeddings.",
  "Python is a general-purpose programming language.",
];

topKSearch("How does vector similarity search work?", corpus, 3).then(
  (results) => {
    results.forEach((r) =>
      console.log(Score: \${r.score.toFixed(4)} | \${r.document})
    );
  }
);`;function v(){return e.jsxs("div",{className:"lesson-content",children:[e.jsx("h2",{children:"Similarity Search"}),e.jsx("p",{children:"Once documents are embedded as vectors and a query has been embedded the same way, the retrieval problem reduces to a single question: which stored vectors are closest to the query vector? This is the nearest-neighbour problem, and solving it efficiently at scale is the core technical challenge of the retrieval step in RAG."}),e.jsx(n,{term:"Nearest-Neighbour Search",definition:"Nearest-neighbour (NN) search finds the k vectors in a collection that are most similar to a query vector, as measured by a distance or similarity metric. In RAG, k is typically 3–10, and the metric is almost always cosine similarity or dot product. Exact NN search compares the query against every stored vector; approximate NN (ANN) search trades a small accuracy loss for dramatically faster lookup."}),e.jsx("h2",{children:"Distance and Similarity Metrics"}),e.jsx("p",{children:"The choice of metric must match the way your embedding model was trained. Using the wrong metric produces meaningless rankings."}),e.jsx("h3",{children:"Cosine Similarity"}),e.jsx("p",{children:"Cosine similarity measures the cosine of the angle between two vectors. Its value ranges from -1 (opposite directions) to 1 (identical direction), with 0 indicating orthogonality. It is scale-invariant: two vectors pointing in the same direction receive a score of 1 regardless of their magnitudes. This makes it robust for text, where the raw length of a passage should not inflate its relevance score."}),e.jsxs("p",{children:["The formula is: ",e.jsx("code",{children:"cosine(A, B) = (A · B) / (‖A‖ × ‖B‖)"}),". Most embedding models are trained with contrastive objectives that reward high cosine similarity for related pairs, so cosine similarity is the natural choice."]}),e.jsx("h3",{children:"Dot Product"}),e.jsx("p",{children:"The dot product of two vectors is the sum of their element-wise products. When vectors are L2-normalized (unit length), dot product and cosine similarity are mathematically equivalent. Many vector databases normalize vectors on insert and then use dot product internally because it is faster to compute in hardware-optimized matrix operations (BLAS routines, GPU GEMM kernels)."}),e.jsx("h3",{children:"Euclidean Distance (L2)"}),e.jsx("p",{children:"L2 distance measures the straight-line distance between two points in high-dimensional space. It is sensitive to vector magnitude, which can cause longer documents (which often have larger-magnitude vectors) to appear less similar than they semantically are. Use it only when your embedding model was explicitly trained with an L2 objective."}),e.jsx("h2",{children:"Exact vs. Approximate Search"}),e.jsx("h3",{children:"Exact (Brute-Force) Search"}),e.jsx("p",{children:"Exact search computes the similarity between the query vector and every vector in the index, then returns the true top-k. It is perfectly accurate but scales as O(n × d) where n is the number of vectors and d is dimensionality. For corpora up to roughly 100,000 vectors, exact search is often fast enough — a brute-force scan of 50,000 1024-dimensional float32 vectors takes well under a second on a single CPU with NumPy. For millions of vectors, you need approximate methods."}),e.jsx("h3",{children:"Approximate Nearest-Neighbour (ANN)"}),e.jsx("p",{children:"ANN algorithms trade a small probability of returning a slightly sub-optimal result for dramatically faster lookup — often 10–100× faster than exact search at scale. The most widely deployed ANN algorithm in production RAG systems is HNSW (Hierarchical Navigable Small World), which structures vectors as a multi-layer navigable graph and achieves sub-millisecond query times on million-vector corpora. IVF (Inverted File Index) is another common approach, partitioning the vector space into clusters and restricting search to nearby clusters. Both are covered in detail in the Indexing Strategies section."}),e.jsx(r,{type:"intuition",title:"When does approximate search matter?",children:"For a typical enterprise RAG system with tens of thousands of document chunks, exact brute-force search is perfectly adequate and eliminates the complexity of ANN index management. Only reach for HNSW or IVF when your corpus exceeds roughly 500,000 vectors or when query latency requirements are tight (under 50ms P99). Most teams over-engineer this step early — start exact, measure, then optimize."}),e.jsx("h2",{children:"The Retrieval Pipeline in Practice"}),e.jsx("p",{children:"At query time, similarity search is just one step in a short sequence:"}),e.jsxs("ol",{children:[e.jsx("li",{children:"Embed the user's query using the same model used to index documents."}),e.jsx("li",{children:"Issue a top-k query to the vector store, specifying k (e.g., 5–10)."}),e.jsx("li",{children:"Receive the k most similar chunk IDs along with their similarity scores."}),e.jsx("li",{children:"Fetch the chunk text from storage (some vector DBs return text inline)."}),e.jsx("li",{children:"Optionally rerank the results using a cross-encoder for higher precision."}),e.jsx("li",{children:"Assemble the top results into the context block for the LLM prompt."})]}),e.jsx("h2",{children:"Score Thresholds and Relevance Filtering"}),e.jsx("p",{children:"The raw similarity score from a nearest-neighbour search is always relative — it tells you which chunks are most similar to the query, but not whether any of them are actually relevant. A query about quantum physics asked against a cooking-recipes database will still return a top-k result, just with low scores."}),e.jsx("p",{children:"Setting a minimum score threshold (for example, only returning chunks with cosine similarity above 0.75) prevents the LLM from receiving irrelevant context. The right threshold varies by embedding model and corpus — calibrate it empirically by examining score distributions on a sample of queries with known relevant and irrelevant documents."}),e.jsx(s,{title:"Always filter by a minimum similarity score",children:`Never pass all top-k results to the LLM unconditionally. Add a score threshold so that queries with no genuinely relevant content return an empty context (allowing the LLM to say "I don't know") rather than a misleading low-quality context that encourages hallucination. Start with 0.70 cosine similarity as a baseline and adjust based on your evaluation results.`}),e.jsx("h2",{children:"Implementing Brute-Force Similarity Search"}),e.jsx("p",{children:"The example below implements top-k similarity search directly with NumPy and the Voyage AI embedding API. This is suitable for corpora up to ~100,000 chunks and is the simplest possible implementation — useful for prototyping before introducing a vector database."}),e.jsx(t,{title:"Top-K Similarity Search",tabs:{python:y,typescript:x}}),e.jsx("p",{children:"In production, you would replace this brute-force loop with a vector database query. The interface is nearly identical — you pass a query vector and receive ranked results — but the database handles efficient indexing so that even millions of vectors are searched in milliseconds."})]})}const ne=Object.freeze(Object.defineProperty({__proto__:null,default:v},Symbol.toStringTag,{value:"Module"})),b=`from langchain.text_splitter import (
    CharacterTextSplitter,
    RecursiveCharacterTextSplitter,
    MarkdownHeaderTextSplitter,
)

sample_text = """
# Introduction to RAG

Retrieval-Augmented Generation (RAG) combines retrieval with LLM generation.
It allows models to access external knowledge at inference time.

## How It Works

First, documents are chunked and embedded into vectors.
Then, at query time, the most relevant chunks are retrieved.
Finally, those chunks are injected into the LLM prompt.

## Benefits

RAG reduces hallucination by grounding answers in real documents.
It also enables knowledge to be updated without retraining the model.
"""

# 1. Fixed-size chunking
fixed_splitter = CharacterTextSplitter(
    chunk_size=200,
    chunk_overlap=40,
    separator="\\n",
)
fixed_chunks = fixed_splitter.split_text(sample_text)
print(f"Fixed-size chunks: {len(fixed_chunks)}")

# 2. Recursive character splitting (recommended default)
recursive_splitter = RecursiveCharacterTextSplitter(
    chunk_size=300,
    chunk_overlap=50,
    separators=["\\n\\n", "\\n", ". ", " ", ""],
)
recursive_chunks = recursive_splitter.split_text(sample_text)
print(f"Recursive chunks: {len(recursive_chunks)}")

# 3. Markdown-aware splitting (document-structure-aware)
md_splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=[
        ("#", "title"),
        ("##", "section"),
        ("###", "subsection"),
    ]
)
md_chunks = md_splitter.split_text(sample_text)
for chunk in md_chunks:
    print(f"Section: {chunk.metadata} | Length: {len(chunk.page_content)}")`,w=`import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MarkdownTextSplitter } from "langchain/text_splitter";

const sampleText = 
# Introduction to RAG

Retrieval-Augmented Generation (RAG) combines retrieval with LLM generation.
It allows models to access external knowledge at inference time.

## How It Works

First, documents are chunked and embedded into vectors.
Then, at query time, the most relevant chunks are retrieved.
Finally, those chunks are injected into the LLM prompt.

## Benefits

RAG reduces hallucination by grounding answers in real documents.
It also enables knowledge to be updated without retraining the model.
;

async function demonstrateChunking() {
  // 1. Recursive character splitting (recommended default)
  const recursiveSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 300,
    chunkOverlap: 50,
    separators: ["\\n\\n", "\\n", ". ", " ", ""],
  });

  const recursiveChunks = await recursiveSplitter.createDocuments([sampleText]);
  console.log(Recursive chunks: \${recursiveChunks.length});
  recursiveChunks.forEach((chunk, i) => {
    console.log(Chunk \${i + 1}: \${chunk.pageContent.length} chars);
  });

  // 2. Markdown-aware splitting
  const markdownSplitter = new MarkdownTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const markdownChunks = await markdownSplitter.createDocuments([sampleText]);
  console.log(\\nMarkdown-aware chunks: \${markdownChunks.length});
  markdownChunks.forEach((chunk, i) => {
    console.log(Chunk \${i + 1}: \${chunk.pageContent.substring(0, 60)}...);
  });
}

demonstrateChunking();`;function k(){return e.jsxs("div",{className:"lesson-content",children:[e.jsx("h2",{children:"Chunking Strategies"}),e.jsx("p",{children:"Chunking is the process of splitting source documents into smaller, retrievable units before embedding them into a vector store. The way you chunk has a larger effect on retrieval quality than almost any other pipeline decision — a well-tuned chunking strategy can improve retrieval recall by 20–40% over a naive fixed-size split."}),e.jsx(n,{term:"Document Chunk",definition:"A chunk is a contiguous segment of source text that is embedded as a single vector and stored as one retrievable unit. At query time, the top-k most similar chunks are fetched and assembled into the LLM's context window. The goal is to make each chunk self-contained enough to be informative in isolation, while small enough for the embedding to capture its specific meaning precisely."}),e.jsx("h2",{children:"Fixed-Size Chunking"}),e.jsx("p",{children:"The simplest strategy splits text into chunks of exactly n tokens (or characters), optionally with an overlap between adjacent chunks. Fixed-size chunking requires no understanding of the document's structure and is fast to implement."}),e.jsx("p",{children:"The main weakness is that it ignores natural boundaries. A 512-token window that starts mid-sentence or cuts a table in half produces chunks that are hard to understand in isolation. The embedding of a poorly bounded chunk may not capture its full meaning, degrading retrieval quality."}),e.jsx("p",{children:"Fixed-size chunking is best used as a quick baseline or for highly uniform documents like database exports or structured logs where semantic boundaries are less important."}),e.jsx("h2",{children:"Recursive Character Splitting"}),e.jsx("p",{children:"Recursive splitting is the recommended default for unstructured text. It works by trying a hierarchy of separators in order — double newlines first, then single newlines, then sentences, then words, then individual characters — and splits only when the current chunk exceeds the target size. The result is chunks that respect paragraph and sentence boundaries whenever possible."}),e.jsxs("p",{children:["LangChain's ",e.jsx("code",{children:"RecursiveCharacterTextSplitter"})," is the most widely used implementation. The default separator list works well for English prose. For code, use language-specific separators (function boundaries, class definitions) to keep logical units intact."]}),e.jsx("h2",{children:"Semantic Chunking"}),e.jsx("p",{children:"Semantic chunking embeds sentences or paragraphs individually, then groups adjacent sentences together as long as their embeddings remain similar. When the similarity between successive sentences drops below a threshold, a chunk boundary is placed. This produces chunks that are topically coherent rather than mechanically uniform."}),e.jsx("p",{children:"The trade-off is cost and latency: semantic chunking requires embedding every sentence during the indexing phase, which multiplies embedding API calls. For large corpora this can be expensive. It pays off when documents cover multiple unrelated topics within a single file, such as a research paper that transitions between methods and results and discussion sections."}),e.jsx("h2",{children:"Document-Aware (Structure-Aware) Chunking"}),e.jsxs("p",{children:["Document-aware chunking uses the inherent structure of the document format — headings in Markdown or HTML, section breaks in PDFs, table boundaries in spreadsheets — as natural chunk boundaries. A Markdown document splits at ",e.jsx("code",{children:"##"})," headers; an HTML page splits at ",e.jsx("code",{children:"<section>"})," or ",e.jsx("code",{children:"<article>"}),"tags; a PDF splits at detected section titles."]}),e.jsx("p",{children:"This approach produces the most semantically coherent chunks because each chunk corresponds to a human-authored unit of content. The chunks also carry rich metadata: the section title, depth in the document hierarchy, and parent heading context. This metadata can be used later for metadata filtering, which dramatically improves retrieval precision."}),e.jsx("h2",{children:"Chunk Overlap"}),e.jsx("p",{children:"All strategies benefit from overlapping adjacent chunks by 10–20% of the chunk size. Overlap ensures that a concept that straddles a chunk boundary appears in at least one chunk in its full context. A chunk split in the middle of a multi-step process will appear in both the preceding and following chunks, so retrieval of either chunk gives the LLM enough context to understand the step."}),e.jsx(r,{type:"tip",title:"Recommended starting parameters",children:"For general prose, start with RecursiveCharacterTextSplitter at chunk_size=512 tokens (roughly 400 words) and chunk_overlap=50 tokens. For technical documentation, use 256–384 tokens to keep chunks tightly focused. Always measure retrieval recall on a held-out query set before committing to a chunk size — the right size depends heavily on your specific corpus and query distribution."}),e.jsx("h2",{children:"The Parent-Child Chunk Pattern"}),e.jsx("p",{children:"An advanced technique is to index small child chunks for retrieval (256 tokens, high precision) but return their larger parent chunks (1024 tokens, rich context) to the LLM. The child embedding captures specific meaning precisely; the parent chunk gives the model enough surrounding context to reason about it. This decouples retrieval precision from generation context richness."}),e.jsx(s,{title:"Preserve heading context in chunk metadata",children:'When splitting structured documents, store the section path (e.g., "Installation > Configuration > Environment Variables") as metadata on every child chunk. This enables metadata filtering and also allows you to prepend the section title to the chunk text before embedding — significantly improving retrieval accuracy for questions about specific sections.'}),e.jsx("h2",{children:"Chunking in Practice"}),e.jsx(t,{title:"Chunking Strategies with LangChain",tabs:{python:b,typescript:w}}),e.jsx("p",{children:"The example above shows three strategies: fixed-size, recursive, and Markdown-aware splitting. In a real pipeline you would feed the resulting chunks directly to an embedding API and then upsert them into a vector store. The metadata attached by document-aware splitters (section titles, header hierarchy) flows through to the vector store and is available for filtering at query time."})]})}const re=Object.freeze(Object.defineProperty({__proto__:null,default:k},Symbol.toStringTag,{value:"Module"})),j=`import chromadb
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
    print(f"  {doc}")`,_=`import { ChromaClient } from "chromadb";

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

metadataFilteringDemo();`;function A(){return e.jsxs("div",{className:"lesson-content",children:[e.jsx("h2",{children:"Metadata Filtering"}),e.jsxs("p",{children:["Pure vector similarity search is powerful, but it answers a single question: which chunks are semantically closest to this query? In real deployments, you often need to answer a more specific question: which chunks are semantically closest to this query",e.jsx("em",{children:" within a specific subset of documents"}),"? That is the problem metadata filtering solves."]}),e.jsx(n,{term:"Metadata Filtering",definition:"Metadata filtering restricts a vector similarity search to a pre-specified subset of documents by applying conditions on structured fields stored alongside each chunk's embedding. The filter is applied before or during the ANN search, so the similarity ranking only considers chunks that match all filter conditions. This combines the precision of structured database queries with the semantic power of vector search."}),e.jsx("h2",{children:"Why Filtering Matters for Precision"}),e.jsx("p",{children:'Consider a knowledge base that contains financial reports, HR policies, product documentation, and security advisories. A query about "Q1 revenue" should retrieve finance documents, not HR guides — even if an HR guide happens to mention revenue numbers in passing. Without filtering, the top-k results can include irrelevant documents that happen to score well due to surface-level term overlap.'}),e.jsxs("p",{children:["Metadata filtering collapses the search space before similarity ranking begins. If you filter to ",e.jsx("code",{children:"source=finance"}),", the ANN algorithm only compares the query against finance chunks. The result is dramatically higher precision and fewer irrelevant documents reaching the LLM."]}),e.jsx("h2",{children:"Common Metadata Fields"}),e.jsx("p",{children:"The most useful metadata fields to attach to chunks during ingestion are:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Source or category"})," — the department, product area, or document type the chunk came from (e.g., ",e.jsx("code",{children:"finance"}),", ",e.jsx("code",{children:"hr"}),", ",e.jsx("code",{children:"security"}),")."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Date or time period"})," — when the document was created or last updated, or which time period it covers (e.g., ",e.jsx("code",{children:'quarter: "Q1-2024"'}),"). Enables temporal filtering to surface recent or period-specific information."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Document type"})," — report, guide, advisory, roadmap, FAQ. Lets you retrieve from specific content formats."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Access level or audience"})," — who the document is intended for. Enables security-aware retrieval where users only see chunks they are authorised to access."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Language"})," — for multilingual corpora, filtering by language before running semantic search avoids cross-language false positives."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Section hierarchy"})," — the heading path from document-aware chunking (e.g., ",e.jsx("code",{children:'section: "Configuration > Database"'}),"). Enables scoping queries to specific parts of large documents."]})]}),e.jsx("h2",{children:"Filter Operators"}),e.jsx("p",{children:"Most vector databases support a standard set of comparison operators for metadata filters. The exact syntax varies by database, but the semantics are consistent:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"$eq"})," / ",e.jsx("code",{children:"$ne"})," — equals / not equals"]}),e.jsxs("li",{children:[e.jsx("code",{children:"$gt"})," / ",e.jsx("code",{children:"$gte"})," / ",e.jsx("code",{children:"$lt"})," / ",e.jsx("code",{children:"$lte"})," — numeric comparisons"]}),e.jsxs("li",{children:[e.jsx("code",{children:"$in"})," / ",e.jsx("code",{children:"$nin"})," — value in / not in a list"]}),e.jsxs("li",{children:[e.jsx("code",{children:"$and"})," / ",e.jsx("code",{children:"$or"})," — compound conditions"]}),e.jsxs("li",{children:[e.jsx("code",{children:"$contains"})," — string substring match (Chroma, Weaviate)"]})]}),e.jsx("p",{children:'Compound filters let you express queries like "finance documents from 2024 of type report" as a nested JSON condition. These compose cleanly and are evaluated efficiently by the vector database before running ANN search.'}),e.jsx("h2",{children:"Extracting Filter Values from User Queries"}),e.jsxs("p",{children:[`A powerful pattern is to use an LLM to extract structured filter criteria from the user's natural language query before issuing the vector search. Given "What did the Q1 2024 finance report say about revenue?", the LLM can extract`,e.jsxs("code",{children:["{",' source: "finance", quarter: "Q1-2024" ',"}"]})," as filter parameters. This bridges the gap between unstructured user input and structured retrieval filters."]}),e.jsx(r,{type:"tip",title:"Use structured output for filter extraction",children:'Prompt the LLM with a JSON schema describing valid filter fields and their possible values. Request a structured JSON response. Validate the extracted filters against the schema before applying them. This approach is robust even when users express filters implicitly ("recent finance reports" → date_year >= 2024, source = finance).'}),e.jsx(s,{title:"Store metadata at ingest time, not query time",children:"Every useful metadata field must be decided at document ingestion time. You cannot retroactively add metadata to indexed chunks without re-indexing. Before building your pipeline, audit your documents and define a metadata schema that covers all the filtering axes your use cases will need — source, date, type, audience, language, and section at a minimum."}),e.jsx("h2",{children:"Metadata Filtering with ChromaDB"}),e.jsx(t,{title:"Metadata Filtering with ChromaDB",tabs:{python:j,typescript:_}}),e.jsx("p",{children:"The pattern above indexes five documents with structured metadata and then issues two filtered queries. The first narrows retrieval to finance documents only; the second compounds two conditions to find high-severity security advisories. In both cases, only chunks that pass the filter participate in the similarity ranking, which means the top results are both relevant and from the right source."})]})}const se=Object.freeze(Object.defineProperty({__proto__:null,default:A},Symbol.toStringTag,{value:"Module"})),S=`from langchain_community.document_loaders import (
    PyPDFLoader,
    UnstructuredHTMLLoader,
    UnstructuredMarkdownLoader,
    CSVLoader,
    DirectoryLoader,
)
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os

# --- PDF Loading ---
pdf_loader = PyPDFLoader("company_handbook.pdf")
pdf_docs = pdf_loader.load()
print(f"PDF pages loaded: {len(pdf_docs)}")
# Each doc has: page_content (text), metadata: {source, page}

# --- HTML Loading ---
html_loader = UnstructuredHTMLLoader("product_docs.html")
html_docs = html_loader.load()
print(f"HTML sections: {len(html_docs)}")

# --- Markdown Loading ---
md_loader = UnstructuredMarkdownLoader("README.md")
md_docs = md_loader.load()

# --- CSV/Tabular Data ---
csv_loader = CSVLoader(
    file_path="faq.csv",
    csv_args={"delimiter": ","},
    source_column="question",  # use as the page_content field
)
csv_docs = csv_loader.load()

# --- Bulk directory loading (all .md files) ---
dir_loader = DirectoryLoader(
    "./docs/",
    glob="**/*.md",
    loader_cls=UnstructuredMarkdownLoader,
    show_progress=True,
)
all_md_docs = dir_loader.load()
print(f"Total markdown docs: {len(all_md_docs)}")

# --- Split and prepare for indexing ---
splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=50)
all_chunks = splitter.split_documents(all_md_docs)
print(f"Total chunks ready for embedding: {len(all_chunks)}")`,T=`import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

async function loadAndChunkDocuments() {
  // --- PDF Loading ---
  const pdfLoader = new PDFLoader("company_handbook.pdf");
  const pdfDocs = await pdfLoader.load();
  console.log(PDF pages loaded: \${pdfDocs.length});

  // --- Web page loading (HTML via Cheerio) ---
  const webLoader = new CheerioWebBaseLoader(
    "https://docs.anthropic.com/en/docs/overview"
  );
  const webDocs = await webLoader.load();
  console.log(Web page sections: \${webDocs.length});

  // --- CSV/tabular data ---
  const csvLoader = new CSVLoader("faq.csv", {
    column: "answer", // which column to use as page_content
  });
  const csvDocs = await csvLoader.load();
  console.log(CSV rows loaded: \${csvDocs.length});

  // --- Directory of text/markdown files ---
  const dirLoader = new DirectoryLoader("./docs/", {
    ".md": (path) => new TextLoader(path),
    ".txt": (path) => new TextLoader(path),
  });
  const allDocs = await dirLoader.load();

  // --- Split into chunks for embedding ---
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 50,
  });
  const chunks = await splitter.splitDocuments(allDocs);
  console.log(Total chunks ready for embedding: \${chunks.length});
  return chunks;
}

loadAndChunkDocuments();`;function q(){return e.jsxs("div",{className:"lesson-content",children:[e.jsx("h2",{children:"Document Loaders"}),e.jsx("p",{children:"Before a document can be chunked, embedded, and indexed, it must be loaded from its source format — a PDF file, an HTML page, a database row, a Markdown file, or a live API — and converted to plain text. Document loaders handle this conversion, extracting text and attaching source metadata so that chunks remain traceable back to their origin."}),e.jsx(n,{term:"Document Loader",definition:"A document loader is a component that reads documents from a source (filesystem, URL, database, API) and returns a list of Document objects, each containing a page_content string and a metadata dictionary. Loaders abstract over format-specific parsing so that the rest of your pipeline (splitters, embedders, vector stores) can work with a uniform interface regardless of source format."}),e.jsx("h2",{children:"PDF Loaders"}),e.jsx("p",{children:"PDFs are one of the most common enterprise document formats, and loading them correctly is non-trivial. PDFs encode visual layout rather than semantic structure, so extracting text requires heuristics to handle multi-column layouts, headers, footers, tables, and embedded images."}),e.jsxs("p",{children:[e.jsx("strong",{children:"PyPDF"})," is the lightest option — pure Python, fast, and adequate for text-heavy PDFs without complex layouts. It extracts text page by page and attaches the page number as metadata, which is invaluable for generating source citations."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Unstructured"})," is the most capable open-source PDF parser. It uses document intelligence models to classify page elements (title, narrative text, table, header) and can reconstruct table data as structured text. It handles scanned PDFs via OCR when configured with Tesseract. For high-stakes enterprise documents, Unstructured's document-element-aware chunking produces significantly better results than page-level splitting."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"AWS Textract, Google Document AI, Azure Form Recognizer"})," are managed cloud services for PDF extraction. They provide state-of-the-art table and form extraction at the cost of per-page pricing and external data transmission."]}),e.jsx("h2",{children:"HTML and Web Loaders"}),e.jsxs("p",{children:["For web content, HTML loaders strip tags and extract the visible text. The key challenge is noise: navigation menus, cookie banners, advertisements, and footers should not pollute your chunks. Good HTML loaders target the main content element (",e.jsx("code",{children:"<main>"}),", ",e.jsx("code",{children:"<article>"}),") and ignore boilerplate."]}),e.jsxs("p",{children:["LangChain's ",e.jsx("strong",{children:"CheerioWebBaseLoader"})," fetches a URL and parses it with the server-side jQuery-compatible Cheerio library. For JavaScript-heavy single-page applications that require browser rendering, use ",e.jsx("strong",{children:"PlaywrightURLLoader"}),"or ",e.jsx("strong",{children:"SeleniumURLLoader"}),", which render the page in a headless browser before extracting text."]}),e.jsx("h2",{children:"Markdown Loaders"}),e.jsx("p",{children:"Markdown is the native format of most developer documentation, wikis, and README files. A structure-aware Markdown loader reads heading levels and creates chunks bounded by headers, attaching the full header path as metadata. This is the recommended approach for documentation corpora because it produces the most semantically coherent chunks."}),e.jsx("h2",{children:"Database and Structured Data Loaders"}),e.jsx("p",{children:"Not all knowledge lives in documents. Product catalogs, customer records, and transactional data live in relational databases. Loaders for structured data need to convert rows into prose representations that embed meaningfully."}),e.jsxs("p",{children:['For CSVs and spreadsheets, each row can be serialised as "Field: Value, Field: Value" text. For SQL databases, ',e.jsx("strong",{children:"SQLDatabase"})," loaders execute queries and convert result sets to text. For the best retrieval quality, consider generating natural language summaries of complex rows using an LLM during the indexing phase — this is more expensive but produces dramatically better embeddings for tabular data."]}),e.jsx("h2",{children:"Other Common Loaders"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"DOCX / Office formats"})," — ",e.jsx("code",{children:"Docx2txtLoader"})," and",e.jsx("code",{children:"UnstructuredWordDocumentLoader"})," handle Microsoft Word files."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Notion, Confluence, Google Docs"})," — API-based loaders that authenticate and fetch pages from knowledge management systems. Typically rate-limited; build incremental sync rather than full re-index on each run."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Email (EML/MBOX)"})," — ",e.jsx("code",{children:"UnstructuredEmailLoader"})," parses email headers and bodies. Useful for support ticket knowledge bases."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"YouTube transcripts"})," — ",e.jsx("code",{children:"YoutubeLoader"})," fetches auto-generated or human captions. Effective for indexing training video content."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Git repositories"})," — ",e.jsx("code",{children:"GitLoader"})," walks a repo and loads source files, docstrings, and README files. Feeds code-search RAG pipelines."]})]}),e.jsx(r,{type:"note",title:"Metadata is as important as content",children:"Every loader should attach at minimum: source (file path or URL), file_type, and ingested_at (timestamp). PDF loaders should add page number; web loaders should add url and title. This metadata powers filtering and citation — without it, you cannot tell users where a retrieved chunk came from."}),e.jsx(s,{title:"Build an incremental ingestion pipeline",children:"Track a content hash or last-modified timestamp for each source document. On each pipeline run, skip documents that have not changed. Only re-chunk and re-embed modified or new documents. This reduces indexing cost by 80–95% for mature corpora where most documents are stable, and it keeps your index fresh without full rebuilds."}),e.jsx("h2",{children:"Loading Documents in Practice"}),e.jsx(t,{title:"Document Loaders with LangChain",tabs:{python:S,typescript:T}}),e.jsxs("p",{children:["The example demonstrates loading from four different source types — PDF, HTML, CSV, and a directory of Markdown files — and then splitting all loaded documents into chunks ready for embedding. The ",e.jsx("code",{children:"metadata"})," dict on each chunk carries the source path through the pipeline, ensuring that every vector in the store can be traced back to its origin document."]})]})}const ie=Object.freeze(Object.defineProperty({__proto__:null,default:q},Symbol.toStringTag,{value:"Module"})),C=`import chromadb
from chromadb.utils import embedding_functions
import voyageai

# Initialize Voyage AI embedding function
voyage_client = voyageai.Client()

# Use ChromaDB as our vector store (runs in-process, no server needed)
client = chromadb.PersistentClient(path="./vector_store")

# Create a collection (analogous to a table in a relational DB)
collection = client.get_or_create_collection(
    name="knowledge_base",
    metadata={"hnsw:space": "cosine"},  # use cosine similarity
)

# Upsert documents — ChromaDB will auto-embed via the embedding function
# or you can supply pre-computed embeddings
documents = [
    "Vector databases store high-dimensional embeddings for fast similarity search.",
    "HNSW is the most widely used approximate nearest-neighbour algorithm.",
    "Pinecone, Weaviate, Qdrant, and Chroma are popular vector database choices.",
    "Metadata filtering combines structured queries with vector similarity search.",
]

collection.upsert(
    ids=["doc_1", "doc_2", "doc_3", "doc_4"],
    documents=documents,
    metadatas=[
        {"topic": "databases", "source": "textbook"},
        {"topic": "algorithms", "source": "paper"},
        {"topic": "databases", "source": "blog"},
        {"topic": "retrieval", "source": "textbook"},
    ],
)

# Query the collection
results = collection.query(
    query_texts=["What algorithms power vector search?"],
    n_results=2,
    where={"topic": "algorithms"},  # metadata pre-filter
)

print("Top results:")
for doc, distance in zip(results["documents"][0], results["distances"][0]):
    print(f"  Distance: {distance:.4f} | {doc}")

# Get collection stats
print(f"\\nTotal vectors in collection: {collection.count()}")`,R=`import { ChromaClient } from "chromadb";

async function vectorDatabaseDemo() {
  const client = new ChromaClient();

  // Create or retrieve a collection
  const collection = await client.getOrCreateCollection({
    name: "knowledge_base",
    metadata: { "hnsw:space": "cosine" },
  });

  // Upsert documents with metadata
  await collection.upsert({
    ids: ["doc_1", "doc_2", "doc_3", "doc_4"],
    documents: [
      "Vector databases store high-dimensional embeddings for fast similarity search.",
      "HNSW is the most widely used approximate nearest-neighbour algorithm.",
      "Pinecone, Weaviate, Qdrant, and Chroma are popular vector database choices.",
      "Metadata filtering combines structured queries with vector similarity search.",
    ],
    metadatas: [
      { topic: "databases", source: "textbook" },
      { topic: "algorithms", source: "paper" },
      { topic: "databases", source: "blog" },
      { topic: "retrieval", source: "textbook" },
    ],
  });

  // Query with metadata filter
  const results = await collection.query({
    queryTexts: ["What algorithms power vector search?"],
    nResults: 2,
  });

  console.log("Top results:");
  results.documents[0].forEach((doc, i) => {
    const distance = results.distances?.[0][i];
    console.log(  Distance: \${distance?.toFixed(4)} | \${doc});
  });

  console.log(\\nTotal vectors: \${await collection.count()});
}

vectorDatabaseDemo();`;function I(){return e.jsxs("div",{className:"lesson-content",children:[e.jsx("h2",{children:"Vector DB Overview"}),e.jsx("p",{children:"Every production RAG system needs a place to store, index, and query embedding vectors at scale. A general-purpose relational database can store vectors as columns, but it cannot perform fast approximate nearest-neighbour (ANN) search — the query pattern that powers retrieval. Vector databases are purpose-built for exactly this workload."}),e.jsx(n,{term:"Vector Database",definition:"A vector database is a data store optimised for storing high-dimensional embedding vectors and executing approximate nearest-neighbour queries against them. Unlike relational databases that organise data in rows and columns and support exact equality lookups, vector databases build specialised index structures (HNSW, IVF, etc.) that enable sub-millisecond semantic search over millions of vectors."}),e.jsx("h2",{children:"How Vector Databases Differ from Traditional Databases"}),e.jsx("h3",{children:"Query Model"}),e.jsx("p",{children:`Relational databases answer queries like "find the row where id = 42" or "find all rows where status = 'active'". These are exact, predicate-based lookups. Vector databases answer queries like "find the 10 vectors most similar to this query vector" — a fundamentally different, proximity-based operation that has no direct analogue in SQL.`}),e.jsx("h3",{children:"Index Structure"}),e.jsx("p",{children:"Relational databases use B-tree or hash indexes optimised for equality and range lookups on low-dimensional keys. Vector databases use graph-based (HNSW) or partition-based (IVF) indexes that support efficient navigation through high-dimensional space, trading a small probability of missing the exact nearest neighbour for orders-of-magnitude faster queries."}),e.jsx("h3",{children:"Hybrid Capability"}),e.jsx("p",{children:"Modern vector databases are not purely vector-only. They also support scalar metadata fields and compound filter queries, combining ANN vector search with SQL-like predicates. This hybrid capability is essential for the metadata filtering patterns covered in the previous section."}),e.jsx(o,{title:"Vector Database Architecture",nodes:[{id:"app",label:"Application",type:"external",x:100,y:200},{id:"vdb",label:"Vector Database",type:"store",x:400,y:200},{id:"idx",label:"ANN Index (HNSW)",type:"store",x:650,y:100},{id:"meta",label:"Metadata Store",type:"store",x:650,y:300},{id:"embed",label:"Embedding Model",type:"llm",x:400,y:50}],edges:[{from:"app",to:"embed",label:"query text"},{from:"embed",to:"vdb",label:"query vector"},{from:"vdb",to:"idx",label:"ANN search"},{from:"vdb",to:"meta",label:"filter"},{from:"idx",to:"app",label:"top-k IDs + scores"}]}),e.jsx("h2",{children:"Major Vector Database Options"}),e.jsx("h3",{children:"Pinecone"}),e.jsx("p",{children:"Pinecone is a fully managed, serverless vector database with no infrastructure to manage. It scales automatically, supports real-time upserts, and provides a simple REST and SDK API. Pinecone is the lowest-friction option for teams that want production- ready vector search without operational overhead. Its main trade-off is vendor lock-in and per-vector pricing."}),e.jsx("h3",{children:"Weaviate"}),e.jsx("p",{children:'Weaviate is an open-source vector database with a GraphQL API and built-in support for multiple modalities (text, image, audio). It offers tight integration with many embedding models via its "modules" system and supports hybrid search (vector + BM25) natively. Available as self-hosted or managed cloud.'}),e.jsx("h3",{children:"Qdrant"}),e.jsx("p",{children:"Qdrant is an open-source vector search engine written in Rust, built for high performance and low memory usage. It supports advanced filtering with a rich payload query language, multiple vector types per record, and sparse vectors for hybrid search. Excellent choice for teams running self-hosted infrastructure who need performance and flexibility."}),e.jsx("h3",{children:"ChromaDB"}),e.jsx("p",{children:"Chroma is an open-source, embeddable vector database designed for developer experience. It runs in-process (no server required) for development and prototyping, and supports a client-server mode for production. Its simple Python and TypeScript SDK makes it the fastest way to get a RAG prototype running. For large production workloads, consider migrating to Pinecone, Qdrant, or Weaviate."}),e.jsx("h3",{children:"pgvector"}),e.jsx("p",{children:"pgvector is a PostgreSQL extension that adds a vector column type and ANN index support. If you already run PostgreSQL, pgvector lets you store embeddings alongside relational data in the same database, eliminating the need for a separate vector store. It supports both HNSW and IVF indexes. Performance is excellent for corpora up to a few million vectors; at larger scales, dedicated vector databases have an edge."}),e.jsx("h2",{children:"When to Use a Vector Database"}),e.jsx("p",{children:"Not every RAG system needs a dedicated vector database. For corpora under ~50,000 chunks, an in-memory NumPy-based brute-force search or ChromaDB in embedded mode is often sufficient and simpler to operate. A vector database becomes the right choice when:"}),e.jsxs("ul",{children:[e.jsx("li",{children:"Your corpus exceeds 100,000 chunks and brute-force search becomes too slow."}),e.jsx("li",{children:"You need low-latency queries (under 100ms) at production scale."}),e.jsx("li",{children:"You require real-time updates (upsert without full rebuild)."}),e.jsx("li",{children:"You need metadata filtering with compound conditions."}),e.jsx("li",{children:"Multiple services or teams need to share the same index."})]}),e.jsx(r,{type:"note",title:"Start with ChromaDB or pgvector",children:"Unless you are building at scale from day one, start with ChromaDB (zero infrastructure, great DX) or pgvector (if PostgreSQL is already in your stack). Both support the same core API patterns as Pinecone and Qdrant, so migrating later requires only a driver swap. Premature optimisation for a database you may not need yet is a common source of wasted engineering time."}),e.jsx(s,{title:"Namespace or partition by tenant from the start",children:"If your application serves multiple tenants or user groups, design namespacing into your vector store schema from day one. Chroma uses collections; Pinecone uses namespaces; Qdrant uses collections or payload filters. Without isolation, a single shared collection will mix tenant data and require expensive post-hoc filtering or re-indexing to separate."}),e.jsx("h2",{children:"Working with a Vector Database"}),e.jsx(t,{title:"Vector Database Operations with ChromaDB",tabs:{python:C,typescript:R}}),e.jsx("p",{children:"The four core operations shown above — create collection, upsert documents, query with filter, count — are the same across all vector databases. The SDK APIs differ in naming and structure, but the conceptual model is identical. Mastering this pattern in ChromaDB transfers directly to Pinecone, Qdrant, or Weaviate with only a driver change."})]})}const ae=Object.freeze(Object.defineProperty({__proto__:null,default:I},Symbol.toStringTag,{value:"Module"})),L=`import hnswlib
import numpy as np
import voyageai

voyage_client = voyageai.Client()

def embed(texts: list[str]) -> np.ndarray:
    result = voyage_client.embed(texts, model="voyage-3")
    return np.array(result.embeddings, dtype=np.float32)

# Sample documents
documents = [
    "HNSW builds a multi-layer navigable graph for fast ANN search.",
    "IVF partitions vector space into Voronoi cells for scalable search.",
    "Flat indexing does exact brute-force comparison of all vectors.",
    "Product quantisation compresses vectors to reduce memory usage.",
    "ScaNN is Google's library for scalable approximate nearest neighbours.",
]

# Generate embeddings
embeddings = embed(documents)
dim = embeddings.shape[1]  # typically 1024 for voyage-3

# --- HNSW Index ---
# M: number of connections per layer (higher = better recall, more memory)
# ef_construction: dynamic candidate list size during build (higher = better quality)
index = hnswlib.Index(space="cosine", dim=dim)
index.init_index(max_elements=10000, ef_construction=200, M=16)
index.add_items(embeddings, ids=list(range(len(documents))))

# ef at query time: higher = better recall, slower query
index.set_ef(50)

# Query
query_vec = embed(["How does approximate nearest neighbour search work?"])
labels, distances = index.knn_query(query_vec, k=3)

print("HNSW results:")
for label, dist in zip(labels[0], distances[0]):
    print(f"  [{dist:.4f}] {documents[label]}")

# Save and reload the index (supports incremental updates)
index.save_index("hnsw_index.bin")
loaded_index = hnswlib.Index(space="cosine", dim=dim)
loaded_index.load_index("hnsw_index.bin", max_elements=10000)`,P=`import faiss
import numpy as np
import voyageai

voyage_client = voyageai.Client()

def embed_batch(texts: list[str]) -> np.ndarray:
    result = voyage_client.embed(texts, model="voyage-3")
    vecs = np.array(result.embeddings, dtype=np.float32)
    # L2-normalize for cosine similarity via inner product
    faiss.normalize_L2(vecs)
    return vecs

# Generate a synthetic corpus for demonstration
# In production, embed your actual document chunks here
np.random.seed(42)
dim = 1024
n_docs = 10000

# Simulated embeddings (replace with real embed_batch calls)
corpus_vecs = np.random.randn(n_docs, dim).astype(np.float32)
faiss.normalize_L2(corpus_vecs)

# --- IVF Index ---
# nlist: number of Voronoi cells (clusters). Rule of thumb: sqrt(n_docs)
nlist = 100
quantizer = faiss.IndexFlatIP(dim)  # inner product (cosine after normalisation)
index = faiss.IndexIVFFlat(quantizer, dim, nlist, faiss.METRIC_INNER_PRODUCT)

# IVF requires a training phase to learn cluster centroids
index.train(corpus_vecs)
index.add(corpus_vecs)

# nprobe: how many clusters to search at query time
# Higher nprobe = better recall, slower query
index.nprobe = 10

# Query
query = np.random.randn(1, dim).astype(np.float32)
faiss.normalize_L2(query)
distances, indices = index.search(query, k=5)

print(f"IVF top-5 indices: {indices[0]}")
print(f"IVF top-5 scores:  {distances[0]}")

# Write to disk
faiss.write_index(index, "ivf_index.faiss")`;function G(){return e.jsxs("div",{className:"lesson-content",children:[e.jsx("h2",{children:"Indexing Strategies"}),e.jsx("p",{children:"The gap between a 10,000-vector corpus and a 100-million-vector corpus is not just one of scale — it requires fundamentally different index structures. Understanding the algorithms that underpin vector database indexes helps you make informed choices about the right tool for your scale, configure index parameters intelligently, and debug retrieval quality issues at their root."}),e.jsx(n,{term:"Approximate Nearest-Neighbour (ANN) Index",definition:"An ANN index is a data structure that enables fast retrieval of the k most similar vectors to a query without scanning every vector in the database. It achieves sub-linear query time by building a pre-computed structure during an indexing phase, accepting a small probability of missing the exact nearest neighbours in exchange for orders-of-magnitude faster queries. The trade-off between accuracy (recall) and speed is controlled by tunable parameters."}),e.jsx("h2",{children:"Flat (Exact) Search"}),e.jsx("p",{children:"The simplest index is no index at all: compute similarity between the query vector and every stored vector, then return the top-k. This is perfectly accurate (recall of 1.0) but scales as O(n × d) where n is number of vectors and d is dimensionality. On a modern CPU, a brute-force scan over 100,000 1024-dimensional float32 vectors takes ~50ms — acceptable for small corpora but impractical at millions of vectors."}),e.jsxs("p",{children:["FAISS's ",e.jsx("code",{children:"IndexFlatIP"})," (inner product) and ",e.jsx("code",{children:"IndexFlatL2"})," (L2 distance) implement exact search with BLAS-optimised matrix operations. Use exact search during development and evaluation because it gives you a ground-truth baseline to compare ANN recall against."]}),e.jsx("h2",{children:"HNSW — Hierarchical Navigable Small World"}),e.jsx("p",{children:"HNSW is the dominant ANN algorithm in production RAG systems and is the default index type in Chroma, Qdrant, Weaviate, and pgvector. It builds a multi-layer graph where:"}),e.jsxs("ul",{children:[e.jsx("li",{children:"Each vector is a node in the graph."}),e.jsx("li",{children:"Nodes are connected to their nearest neighbours with a fixed number of edges (M)."}),e.jsx("li",{children:"Higher layers of the graph are sparse and enable long-range navigation; lower layers are dense for local refinement."}),e.jsx("li",{children:"Search starts at the entry point in the top layer and greedily descends to the query's neighbourhood."})]}),e.jsx("p",{children:"HNSW achieves recall@10 above 0.99 with query latencies under 1ms for million-vector corpora. Its key parameters are:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"M"})," (connections per layer, default 16): Higher M improves recall and lowers query time but increases memory usage and build time. Values of 16–64 cover most production use cases."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"ef_construction"})," (build-time search depth, default 100–200): Higher values produce a higher-quality graph at the cost of slower index building. Set it to at least 2× M."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"ef"})," (query-time search depth): Controls the recall-latency trade-off at query time. Higher ef = better recall, slower query. ef=50 is a common default."]})]}),e.jsx(r,{type:"intuition",title:"HNSW memory usage",children:"HNSW indexes are memory-resident. Each vector requires its raw float32 storage plus graph connectivity overhead — typically 1.5–2× the raw vector size. A 1-million-vector corpus of 1024-dimensional float32 vectors requires ~4GB for raw storage and ~6–8GB total for the HNSW index. Plan your infrastructure memory accordingly."}),e.jsx("h2",{children:"IVF — Inverted File Index"}),e.jsx("p",{children:"IVF (Inverted File) partitions the vector space into a fixed number of clusters (Voronoi cells) using k-means. At query time, only the nearest few clusters are searched, dramatically reducing the number of distance computations."}),e.jsx("p",{children:"IVF requires a training phase on a representative sample of your corpus to learn cluster centroids. Key parameters:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"nlist"})," (number of clusters): A common rule of thumb is sqrt(n) where n is the corpus size. More clusters = higher potential precision but each cluster is smaller, so nprobe must be higher to maintain recall."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"nprobe"})," (clusters to search at query time): Controls the recall-speed trade-off. nprobe=1 is fastest but lowest recall; nprobe=nlist degrades to exact search. nprobe of 5–20% of nlist is typical."]})]}),e.jsxs("p",{children:["IVF is more memory-efficient than HNSW for very large corpora (hundreds of millions of vectors) because the index structure is smaller. FAISS's ",e.jsx("code",{children:"IndexIVFFlat"}),"combines IVF partitioning with exact search within each cluster."]}),e.jsx("h2",{children:"IVF-PQ — Quantisation for Massive Scale"}),e.jsxs("p",{children:["For corpora that do not fit in RAM, Product Quantisation (PQ) compresses vectors by splitting them into sub-vectors and encoding each with a codebook. ",e.jsx("code",{children:"IndexIVFPQ"}),"in FAISS combines IVF partitioning with PQ compression, reducing memory by 8–32× at the cost of some recall. This enables billion-scale vector search on commodity hardware."]}),e.jsx("h2",{children:"ScaNN and DiskANN"}),e.jsxs("p",{children:[e.jsx("strong",{children:"ScaNN"})," (Google, open-source) applies asymmetric quantisation and achieves state-of-the-art recall-speed trade-offs on benchmarks. It is used in Google Search and Vertex AI Vector Search."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"DiskANN"})," (Microsoft, open-source) stores the HNSW graph on disk with an SSD-optimised access pattern, enabling billion-scale ANN search with a small RAM footprint. It is the basis for Azure AI Search's vector capabilities."]}),e.jsx(s,{title:"Measure recall against exact search before deploying ANN",children:"Build a ground-truth evaluation set of 100–500 queries with manually verified relevant documents. Run exact flat search and your ANN index, compare the top-10 results, and compute recall@10. Tune ef (HNSW) or nprobe (IVF) until recall@10 is above 0.95 for your corpus. Never ship an ANN index without measuring its recall — default parameters are starting points, not guarantees."}),e.jsx("h2",{children:"HNSW with hnswlib and IVF with FAISS"}),e.jsx(t,{title:"HNSW Index with hnswlib",tabs:{python:L}}),e.jsx(t,{title:"IVF Index with FAISS",tabs:{python:P}}),e.jsx("p",{children:"In practice, you rarely interact directly with these index libraries — your vector database (Chroma, Qdrant, Pinecone) manages the index for you. But understanding the underlying algorithms lets you configure your database's index parameters intelligently and interpret recall metrics correctly when tuning your RAG pipeline."})]})}const oe=Object.freeze(Object.defineProperty({__proto__:null,default:G},Symbol.toStringTag,{value:"Module"}));function N(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Popular Vector Databases"}),e.jsx("p",{children:"The vector database ecosystem has exploded since 2022. Choosing the right database depends on your scale requirements, deployment constraints, query patterns, and team expertise. This section provides a practical comparison of the leading solutions."}),e.jsx(n,{term:"Vector Database",children:e.jsx("p",{children:"A vector database is a database optimized for storing high-dimensional vectors and performing approximate nearest neighbor (ANN) search at scale. Unlike relational databases that organize data in tables, vector DBs organize data by semantic similarity — enabling you to find the most relevant documents to a query embedding in milliseconds."})}),e.jsx("h2",{children:"Hosted / Cloud Solutions"}),e.jsx("h3",{children:"Pinecone"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Best for:"})," Teams that want zero operational overhead and a fully managed, production-grade service. Pinecone handles infrastructure, scaling, and replication."]}),e.jsxs("ul",{children:[e.jsx("li",{children:"Serverless and pod-based deployment modes"}),e.jsx("li",{children:"Metadata filtering with rich query language"}),e.jsx("li",{children:"Namespace isolation for multi-tenant applications"}),e.jsx("li",{children:"Hybrid search (sparse + dense) with integrated BM25"}),e.jsxs("li",{children:[e.jsx("strong",{children:"Pricing:"})," Pay per query/storage; serverless mode minimizes idle costs"]})]}),e.jsx(i,{language:"python",filename:"pinecone_example.py",children:`from pinecone import Pinecone, ServerlessSpec
import os

# Initialize Pinecone
pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])

# Create an index (one-time setup)
index_name = "rag-knowledge-base"
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=1024,  # Match your embedding model dimensions
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )

index = pc.Index(index_name)

# Upsert vectors with metadata
vectors = [
    {
        "id": "doc-001",
        "values": [0.1, 0.2, ...],  # Your embedding vector
        "metadata": {
            "source": "handbook.pdf",
            "page": 42,
            "section": "Security Policies",
            "date": "2024-01-15"
        }
    }
]
index.upsert(vectors=vectors, namespace="policies")

# Query with metadata filter
results = index.query(
    vector=[0.15, 0.22, ...],  # Query embedding
    top_k=5,
    filter={"section": {"$eq": "Security Policies"}},
    namespace="policies",
    include_metadata=True
)

for match in results.matches:
    print(f"Score: {match.score:.3f} | {match.metadata['source']} p.{match.metadata['page']}")`}),e.jsx("h3",{children:"Weaviate Cloud"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Best for:"})," Teams wanting advanced hybrid search, GraphQL querying, and tight integration with multiple embedding providers."]}),e.jsxs("ul",{children:[e.jsx("li",{children:"Native vector + BM25 hybrid search with configurable alpha weighting"}),e.jsx("li",{children:"Multi-tenancy built-in"}),e.jsx("li",{children:"Generative search modules (RAG built into the query)"}),e.jsx("li",{children:"Rich GraphQL and gRPC query interface"}),e.jsx("li",{children:"Self-hostable (open-source core)"})]}),e.jsx("h2",{children:"Self-Hosted Open Source"}),e.jsx("h3",{children:"Qdrant"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Best for:"})," High-performance self-hosted deployments where you need full control. Written in Rust for exceptional speed and memory efficiency."]}),e.jsxs("ul",{children:[e.jsx("li",{children:"HNSW indexing with excellent recall/speed trade-off"}),e.jsx("li",{children:"Payload filtering with complex conditions"}),e.jsx("li",{children:"Named vectors: store multiple vector types per document"}),e.jsx("li",{children:"Scalar and product quantization for memory reduction"}),e.jsx("li",{children:"gRPC API for production throughput"})]}),e.jsx(i,{language:"python",filename:"qdrant_example.py",children:`from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
)

# Connect to Qdrant (local Docker or cloud)
client = QdrantClient(url="http://localhost:6333")
# OR: client = QdrantClient(url="https://your-cluster.qdrant.tech", api_key="...")

# Create collection
client.recreate_collection(
    collection_name="knowledge_base",
    vectors_config=VectorParams(size=1024, distance=Distance.COSINE),
)

# Upload documents
points = [
    PointStruct(
        id=i,
        vector=embedding,
        payload={
            "text": doc_text,
            "source": filename,
            "category": category
        }
    )
    for i, (embedding, doc_text, filename, category) in enumerate(documents)
]
client.upsert(collection_name="knowledge_base", points=points)

# Search with payload filter
results = client.search(
    collection_name="knowledge_base",
    query_vector=query_embedding,
    query_filter=Filter(
        must=[FieldCondition(key="category", match=MatchValue(value="security"))]
    ),
    limit=5,
    with_payload=True
)

for hit in results:
    print(f"Score: {hit.score:.3f} | {hit.payload['source']}")`}),e.jsx("h3",{children:"Chroma"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Best for:"})," Local development, prototyping, and small-scale deployments. The simplest API for getting started with vector search."]}),e.jsx(i,{language:"python",filename:"chroma_example.py",children:`import chromadb
from chromadb.utils import embedding_functions

# Local persistent storage (perfect for development)
client = chromadb.PersistentClient(path="./chroma_db")

# Create collection with auto-embedding
openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key="your-openai-api-key",
    model_name="text-embedding-3-small"
)

collection = client.get_or_create_collection(
    name="documents",
    embedding_function=openai_ef
)

# Add documents — Chroma handles embedding automatically
collection.add(
    documents=["RAG improves LLM accuracy", "Agents use tools to act"],
    ids=["doc1", "doc2"],
    metadatas=[{"source": "intro.md"}, {"source": "agents.md"}]
)

# Query — auto-embeds the query text
results = collection.query(
    query_texts=["how do language models retrieve information?"],
    n_results=2
)
print(results["documents"])`}),e.jsx("h3",{children:"pgvector (PostgreSQL Extension)"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Best for:"})," Teams already running PostgreSQL who want vector search without adding a new infrastructure component."]}),e.jsxs("ul",{children:[e.jsx("li",{children:"Vectors stored in PostgreSQL columns alongside relational data"}),e.jsx("li",{children:"Full SQL query language for complex joins and filters"}),e.jsx("li",{children:"HNSW and IVFFlat indexing support"}),e.jsx("li",{children:"Transactions, ACID guarantees, and familiar operational model"}),e.jsxs("li",{children:[e.jsx("strong",{children:"Trade-off:"})," Not as fast as dedicated vector DBs at very high scale"]})]}),e.jsx(i,{language:"sql",filename:"pgvector_schema.sql",children:`-- Enable the extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Store documents with embeddings
CREATE TABLE documents (
    id          BIGSERIAL PRIMARY KEY,
    content     TEXT NOT NULL,
    source      VARCHAR(255),
    category    VARCHAR(100),
    embedding   vector(1536),  -- OpenAI text-embedding-3-small dimensions
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Create HNSW index for fast ANN search
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Semantic search with metadata filter
SELECT
    id,
    content,
    source,
    1 - (embedding <=> '[0.1, 0.2, ...]'::vector) AS similarity
FROM documents
WHERE category = 'security'
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 5;`}),e.jsx("h2",{children:"FAISS (Facebook AI Similarity Search)"}),e.jsx("p",{children:"FAISS is a C++ library with Python bindings for extremely fast in-memory vector search. It's not a database (no persistence, no metadata, no server) — it's a search index library. Use it when you need maximum throughput for in-memory search."}),e.jsx("h2",{children:"Selection Guide"}),e.jsx("div",{className:"my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{className:"bg-gray-50 dark:bg-gray-800",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300",children:"Database"}),e.jsx("th",{className:"px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300",children:"Best For"}),e.jsx("th",{className:"px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300",children:"Hosting"}),e.jsx("th",{className:"px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300",children:"Scale"})]})}),e.jsx("tbody",{className:"divide-y divide-gray-100 dark:divide-gray-800",children:[["Pinecone","Zero ops, production SaaS","Fully managed","Billion+ vectors"],["Weaviate","Hybrid search, GraphQL","Managed or self-hosted","Large scale"],["Qdrant","High perf, self-hosted","Self-hosted / cloud","Large scale"],["Chroma","Prototyping, local dev","Local / server","Small-medium"],["pgvector","Already use PostgreSQL","Self-hosted","Medium scale"],["FAISS","Max throughput, in-memory","In-process library","Millions"]].map(([a,c,l,d])=>e.jsxs("tr",{className:"hover:bg-gray-50 dark:hover:bg-gray-800/40",children:[e.jsx("td",{className:"px-4 py-3 font-medium text-gray-800 dark:text-gray-200",children:a}),e.jsx("td",{className:"px-4 py-3 text-gray-600 dark:text-gray-400",children:c}),e.jsx("td",{className:"px-4 py-3 text-gray-600 dark:text-gray-400",children:l}),e.jsx("td",{className:"px-4 py-3 text-gray-600 dark:text-gray-400",children:d})]},a))})]})}),e.jsx(s,{title:"Start with Chroma, Graduate to Production DB",children:e.jsx("p",{children:"For new projects: start with Chroma for rapid prototyping. Once you understand your data volume, query patterns, and latency requirements, migrate to Pinecone (if you want zero ops) or Qdrant (if you want self-hosted performance). The embedding model and chunking strategy matter far more than the vector DB choice at early stages."})}),e.jsx(r,{type:"tip",title:"Metadata Filtering Strategy",children:e.jsx("p",{children:"Design your metadata schema before writing your first document. Metadata filters are the primary way to scope retrieval (e.g., filter by date, category, user, or tenant). It's much harder to add metadata after ingestion than to plan for it upfront."})})]})}const ce=Object.freeze(Object.defineProperty({__proto__:null,default:N},Symbol.toStringTag,{value:"Module"}));function M(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Cloud-Native Retrieval Services"}),e.jsx("p",{children:"Each major cloud provider offers a fully managed retrieval service optimized for RAG workloads. These differ from self-hosted vector databases by integrating directly with cloud storage, identity services, and the provider's LLM APIs — eliminating infrastructure management while adding enterprise features like ACL-aware search and compliance certifications."}),e.jsx(o,{title:"Cloud Retrieval Services Comparison",width:700,height:260,nodes:[{id:"docs",label:"Documents / Data",type:"external",x:80,y:130},{id:"azure",label:"Azure AI Search",type:"store",x:280,y:60},{id:"bedrock",label:"Bedrock KBs",type:"store",x:280,y:130},{id:"vertex",label:"Vertex AI Search",type:"store",x:280,y:200},{id:"rag",label:"RAG Pipeline",type:"agent",x:480,y:130},{id:"llm",label:"LLM Response",type:"llm",x:620,y:130}],edges:[{from:"docs",to:"azure"},{from:"docs",to:"bedrock"},{from:"docs",to:"vertex"},{from:"azure",to:"rag",label:"hybrid search"},{from:"bedrock",to:"rag",label:"managed RAG"},{from:"vertex",to:"rag",label:"grounding"},{from:"rag",to:"llm"}]}),e.jsx("h2",{children:"Azure AI Search"}),e.jsx(n,{term:"Azure AI Search",children:e.jsxs("p",{children:["Azure AI Search (formerly Azure Cognitive Search) is Microsoft's enterprise search service with native vector search, hybrid BM25+vector ranking, semantic reranking, and",e.jsx("strong",{children:" integrated vectorization"})," — automatic embedding generation during indexing using Azure OpenAI embeddings without writing any embedding code."]})}),e.jsx("h3",{children:"Key Features"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Integrated vectorization:"})," Define a skill in the indexer to call Azure OpenAI embeddings automatically during document ingestion"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Hybrid search:"})," BM25 keyword + HNSW vector search combined via Reciprocal Rank Fusion (RRF)"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Semantic ranking:"})," ML-powered re-ranking of top-50 results for relevance — not just keyword/vector similarity"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Faceted navigation, filters:"})," Metadata filtering with OData syntax for pre-filtering before vector search"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Security:"})," AAD integration, field-level security trimming, private endpoints"]})]}),e.jsx(t,{title:"Azure AI Search — Hybrid Search with Vector + BM25",tabs:{python:`from azure.search.documents import SearchClient
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
    print(f"[{r['reranker_score']:.2f}] {r['title']}: {r['content'][:150]}...")`}}),e.jsx("h2",{children:"Amazon Bedrock Knowledge Bases"}),e.jsx(n,{term:"Bedrock Knowledge Bases",children:e.jsx("p",{children:"Amazon Bedrock Knowledge Bases is a fully managed RAG service that handles the entire retrieval pipeline: ingesting documents from S3, chunking, embedding with Titan or Cohere embeddings, storing in a vector store (OpenSearch Serverless, Aurora pgvector, or Pinecone), and retrieval — all without managing infrastructure. Agents can attach knowledge bases as tools."})}),e.jsx("h3",{children:"Supported Data Sources"}),e.jsxs("ul",{children:[e.jsx("li",{children:"Amazon S3 (primary — PDF, DOCX, TXT, HTML, CSV, XLSX)"}),e.jsx("li",{children:"Web crawler (public websites)"}),e.jsx("li",{children:"Confluence, SharePoint, Salesforce (connector library)"}),e.jsx("li",{children:"Custom connectors via Lambda"})]}),e.jsx(t,{title:"Amazon Bedrock Knowledge Bases — Retrieval and RetrieveAndGenerate",tabs:{python:`import boto3
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
    return response["retrievalResults"]`}}),e.jsx("h2",{children:"Vertex AI Search"}),e.jsx(n,{term:"Vertex AI Search",children:e.jsxs("p",{children:["Vertex AI Search (part of Vertex AI Agent Builder) is Google Cloud's enterprise search service. It provides ",e.jsx("strong",{children:"grounding"})," for Gemini models — letting them search over your private data or the public web before generating responses. Unlike traditional search, it understands natural language queries and returns semantically relevant results."]})}),e.jsx("h3",{children:"Data Store Types"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Unstructured:"})," Cloud Storage files (PDF, HTML, TXT) — parsed and chunked automatically"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Structured:"})," BigQuery tables or JSON/CSV for tabular search"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Website:"})," Index public websites via sitemap crawl"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Healthcare FHIR:"})," Specialized medical record search"]})]}),e.jsx(t,{title:"Vertex AI Search — Enterprise Data Store Query",tabs:{python:`from google.cloud import discoveryengine_v1 as discoveryengine
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
    return response.text`}}),e.jsx("h2",{children:"Comparison: Managed RAG Trade-offs"}),e.jsx(i,{language:"text",filename:"cloud-rag-comparison.txt",children:`┌─────────────────────┬──────────────────────┬──────────────────────┬──────────────────────┐
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
└─────────────────────┴──────────────────────┴──────────────────────┴──────────────────────┘`}),e.jsxs(s,{title:"Choosing a Managed Retrieval Service",children:[e.jsxs("p",{children:["Choose ",e.jsx("strong",{children:"Azure AI Search"})," when: you're Azure-native, need hybrid BM25+vector+semantic reranking in one service, require fine-grained document-level security trimming (ACLs), or need complex OData filter expressions for metadata pre-filtering."]}),e.jsxs("p",{children:["Choose ",e.jsx("strong",{children:"Bedrock Knowledge Bases"})," when: your data is in S3, you want zero-infrastructure RAG that integrates directly with Bedrock Agents, or you need quick prototyping without vector DB management."]}),e.jsxs("p",{children:["Choose ",e.jsx("strong",{children:"Vertex AI Search"})," when: you're GCP-native, want Gemini grounded on private data, need BigQuery table search, or are building on top of Vertex AI Agent Builder."]})]}),e.jsx(r,{type:"tip",title:"Egress Costs and Data Locality",children:e.jsx("p",{children:"Managed retrieval services avoid cross-region data transfer fees when your LLM and retrieval service are in the same region. Always co-locate your retrieval service with your LLM deployment to minimize latency and eliminate egress charges. For GDPR/data residency requirements, verify that the service offers deployment in your required geographic region."})})]})}const le=Object.freeze(Object.defineProperty({__proto__:null,default:M},Symbol.toStringTag,{value:"Module"})),D=`from anthropic import Anthropic

client = Anthropic()

def build_rag_prompt(
    query: str,
    retrieved_chunks: list[dict],
    system_instruction: str = "",
) -> tuple[str, list[dict]]:
    """
    Construct a RAG prompt from retrieved chunks.

    Args:
        query: The user's question
        retrieved_chunks: List of dicts with 'text', 'source', 'score' keys
        system_instruction: Optional task-specific instructions

    Returns:
        (system_prompt, messages) ready for client.messages.create()
    """
    # Format each chunk with its source citation
    context_blocks = []
    for i, chunk in enumerate(retrieved_chunks, 1):
        source = chunk.get("source", "Unknown")
        text = chunk["text"].strip()
        context_blocks.append(f"[{i}] Source: {source}\\n{text}")

    context_section = "\\n\\n---\\n\\n".join(context_blocks)

    # System prompt: grounding instruction + optional task instructions
    system_prompt = """You are a helpful assistant that answers questions based on the provided context documents.

INSTRUCTIONS:
- Answer based ONLY on the context provided below.
- If the context does not contain enough information to answer fully, say so explicitly.
- Cite the source number [1], [2], etc. for each factual claim.
- Do not fabricate information not present in the context.
""".strip()

    if system_instruction:
        system_prompt += f"\\n\\nADDITIONAL INSTRUCTIONS:\\n{system_instruction}"

    # User message: context + query, clearly separated
    user_message = f"""CONTEXT DOCUMENTS:

{context_section}

---

QUESTION: {query}"""

    return system_prompt, [{"role": "user", "content": user_message}]


# Example usage
chunks = [
    {
        "text": "Claude 3.5 Sonnet was released in June 2024 and achieved state-of-the-art performance on coding and reasoning benchmarks.",
        "source": "Anthropic Blog, June 2024",
        "score": 0.92,
    },
    {
        "text": "Claude models support a 200K token context window, enabling analysis of very long documents in a single API call.",
        "source": "Anthropic Docs",
        "score": 0.87,
    },
]

system, messages = build_rag_prompt(
    query="What is Claude 3.5 Sonnet and how large is its context window?",
    retrieved_chunks=chunks,
)

response = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=512,
    system=system,
    messages=messages,
)

print(response.content[0].text)`,E=`import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

interface RetrievedChunk {
  text: string;
  source: string;
  score: number;
}

function buildRagPrompt(
  query: string,
  retrievedChunks: RetrievedChunk[],
  systemInstruction: string = ""
): { system: string; messages: Array<{ role: "user"; content: string }> } {
  // Format each chunk with its citation number
  const contextBlocks = retrievedChunks.map((chunk, i) => {
    return [\${i + 1}] Source: \${chunk.source}\\n\${chunk.text.trim()};
  });

  const contextSection = contextBlocks.join("\\n\\n---\\n\\n");

  let system = You are a helpful assistant that answers questions based on the provided context documents.

INSTRUCTIONS:
- Answer based ONLY on the context provided below.
- If the context does not contain enough information to answer fully, say so explicitly.
- Cite the source number [1], [2], etc. for each factual claim.
- Do not fabricate information not present in the context.;

  if (systemInstruction) {
    system += \\n\\nADDITIONAL INSTRUCTIONS:\\n\${systemInstruction};
  }

  const userMessage = CONTEXT DOCUMENTS:

\${contextSection}

---

QUESTION: \${query};

  return {
    system,
    messages: [{ role: "user", content: userMessage }],
  };
}

// Example usage
const chunks: RetrievedChunk[] = [
  {
    text: "Claude 3.5 Sonnet was released in June 2024 and achieved state-of-the-art performance on coding and reasoning benchmarks.",
    source: "Anthropic Blog, June 2024",
    score: 0.92,
  },
  {
    text: "Claude models support a 200K token context window, enabling analysis of very long documents in a single API call.",
    source: "Anthropic Docs",
    score: 0.87,
  },
];

const { system, messages } = buildRagPrompt(
  "What is Claude 3.5 Sonnet and how large is its context window?",
  chunks
);

client.messages
  .create({
    model: "claude-opus-4-5",
    max_tokens: 512,
    system,
    messages,
  })
  .then((response) => {
    console.log(response.content[0].text);
  });`;function F(){return e.jsxs("div",{className:"lesson-content",children:[e.jsx("h2",{children:"Prompt Construction"}),e.jsx("p",{children:"Retrieval gives you the relevant context; prompt construction determines whether the LLM can use it effectively. A poorly constructed RAG prompt can cause the model to ignore retrieved context, hallucinate facts not in the documents, or produce answers that are technically grounded but misleadingly incomplete. Getting prompt construction right is one of the highest-leverage improvements you can make to a RAG pipeline."}),e.jsx(n,{term:"RAG Prompt",definition:"A RAG prompt is a structured message pair (system + user) that presents retrieved context documents alongside the user's question in a way that instructs the LLM to base its answer on the provided text. Effective RAG prompts separate context from query, assign numbered source citations to each chunk, and include explicit grounding instructions that prevent the model from supplementing retrieved knowledge with parametric memory."}),e.jsx("h2",{children:"The Three Components of a RAG Prompt"}),e.jsx("h3",{children:"1. System Prompt — Grounding and Role"}),e.jsx("p",{children:"The system prompt establishes the model's role and, critically, its grounding constraints. The most important instruction is to answer only from the provided context and to acknowledge when the context is insufficient. Without this, models may silently blend retrieved facts with training knowledge, making it impossible to verify the source of any claim."}),e.jsx("p",{children:"Additional instructions to include: cite source numbers for each factual claim, use a specific response format if required (JSON, bullet points, executive summary), and describe the intended audience and tone."}),e.jsx("h3",{children:"2. Context Block — Retrieved Chunks"}),e.jsx("p",{children:"The context block is where retrieved chunks are assembled. Each chunk should be:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Numbered"})," with a citation label like [1], [2] so the model can reference specific sources."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Annotated with source metadata"})," (document title, URL, date) so the model can include attributable citations in its response."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Separated"})," from other chunks with a clear delimiter (dashes or blank lines) to prevent the model from conflating adjacent chunks."]})]}),e.jsx("p",{children:"The placement of the context block matters for long contexts. For Claude, placing context before the question (as shown in the example) leverages the model's strong performance on tasks where background material precedes the query. Avoid burying the question inside the context block."}),e.jsx("h3",{children:"3. User Query — Clear and Unambiguous"}),e.jsxs("p",{children:["The question should be presented on its own, clearly separated from the context by a visual delimiter. Label it explicitly (",e.jsx("code",{children:"QUESTION:"}),") so the model does not confuse it with a context document. If the original user query is ambiguous, consider a rewriting step before assembly (covered in the Advanced RAG section)."]}),e.jsx("h2",{children:"Citation Formats"}),e.jsx("p",{children:"There are three common citation patterns for RAG outputs:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Inline bracketed citations"})," [1] [2] — closest to academic style, easy to parse programmatically, allows post-processing to replace with hyperlinks."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Footnotes"})," — cleaner prose but harder to parse; useful for long-form reports."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Structured JSON with sources array"})," — best for programmatic downstream use; instruct the model to return",e.jsxs("code",{children:["{",' "answer": "...", "sources": [1, 3] ',"}"]})," and extract the array."]})]}),e.jsx(r,{type:"tip",title:"Request structured citation output for APIs",children:'When building a RAG API that returns structured data to a frontend, instruct the model to return JSON with separate "answer" and "sources" fields. Parse the source indices, then look up the corresponding chunk metadata to return rich citation objects (URL, title, page, excerpt). This enables your UI to render clickable citations without fragile regex parsing of free-text answers.'}),e.jsx("h2",{children:"Handling No-Retrieval Cases"}),e.jsx("p",{children:"Not every query will find relevant context. When retrieval returns nothing above the relevance threshold, you have three options:"}),e.jsxs("ol",{children:[e.jsx("li",{children:`Send an empty context and rely on the system prompt's grounding instruction to produce a "I don't have information about this" response.`}),e.jsx("li",{children:'Detect the empty retrieval case before calling the LLM and return a canned "no information found" response, saving the API call.'}),e.jsx("li",{children:"Fall back to a web search tool for live information, then construct the prompt with the search results (covered in Corrective RAG)."})]}),e.jsx(s,{title:"Never pass raw retrieved text without formatting",children:"Pasting unformatted chunks into a prompt confuses model and degradates citation quality. Always: (1) assign a numbered label to each chunk, (2) include the source metadata on the same line as the label, (3) trim leading/trailing whitespace and duplicate newlines, and (4) separate chunks with a horizontal delimiter. These four steps take under 10 lines of code and measurably improve answer quality."}),e.jsx("h2",{children:"Building a RAG Prompt in Practice"}),e.jsx(t,{title:"RAG Prompt Construction with Citation",tabs:{python:D,typescript:E}}),e.jsxs("p",{children:["The ",e.jsx("code",{children:"build_rag_prompt"})," function above returns a reusable (system, messages) pair that can be passed directly to any Anthropic API call. Notice that the context block uses numbered citation labels and source annotations, the system prompt contains explicit grounding and citation instructions, and the user's question is cleanly separated from the context by a delimiter. This structure is the foundation of reliable, attributable RAG responses."]})]})}const de=Object.freeze(Object.defineProperty({__proto__:null,default:F},Symbol.toStringTag,{value:"Module"})),O=`import tiktoken
from anthropic import Anthropic
from dataclasses import dataclass

client = Anthropic()
enc = tiktoken.get_encoding("cl100k_base")

@dataclass
class Chunk:
    text: str
    source: str
    score: float

def count_tokens(text: str) -> int:
    return len(enc.encode(text))

def rank_and_fit_chunks(
    chunks: list[Chunk],
    query: str,
    max_context_tokens: int = 4000,
    min_score: float = 0.70,
) -> list[Chunk]:
    """
    Filter by relevance score, sort by score, then fit as many
    chunks as possible within the token budget.
    """
    # 1. Filter below minimum relevance threshold
    relevant = [c for c in chunks if c.score >= min_score]

    # 2. Sort by score descending (most relevant first)
    relevant.sort(key=lambda c: c.score, reverse=True)

    # 3. Greedily add chunks until we hit the token budget
    selected = []
    token_count = 0
    for chunk in relevant:
        chunk_tokens = count_tokens(chunk.text)
        if token_count + chunk_tokens <= max_context_tokens:
            selected.append(chunk)
            token_count += chunk_tokens
        # Skip chunks that don't fit; keep trying smaller ones
    return selected

def rag_with_context_management(
    query: str,
    retrieved_chunks: list[Chunk],
    max_context_tokens: int = 4000,
    max_output_tokens: int = 1024,
) -> str:
    fitted = rank_and_fit_chunks(retrieved_chunks, query, max_context_tokens)

    if not fitted:
        return "I don't have relevant information to answer this question."

    context_parts = [
        f"[{i+1}] Source: {c.source}\\n{c.text.strip()}"
        for i, c in enumerate(fitted)
    ]
    context = "\\n\\n---\\n\\n".join(context_parts)

    print(f"Using {len(fitted)}/{len(retrieved_chunks)} chunks | "
          f"~{count_tokens(context)} context tokens")

    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=max_output_tokens,
        system=(
            "Answer questions using ONLY the provided context. "
            "Cite source numbers [1], [2], etc. "
            "Say 'I don't know' if the context is insufficient."
        ),
        messages=[{
            "role": "user",
            "content": f"CONTEXT:\\n\\n{context}\\n\\n---\\n\\nQUESTION: {query}"
        }],
    )
    return response.content[0].text

# Example
chunks = [
    Chunk("Claude 3.5 Sonnet achieves 92% on SWE-bench, a coding benchmark.", "Anthropic Blog", 0.94),
    Chunk("The model supports a 200K token context window.", "Anthropic Docs", 0.88),
    Chunk("Claude was founded by former OpenAI researchers in 2021.", "Wikipedia", 0.61),  # below threshold
]

answer = rag_with_context_management(
    "What are Claude's key capabilities?",
    chunks,
    max_context_tokens=2000,
)
print(answer)`,B=`import Anthropic from "@anthropic-ai/sdk";
import { encoding_for_model } from "tiktoken";

const client = new Anthropic();

interface Chunk {
  text: string;
  source: string;
  score: number;
}

const enc = encoding_for_model("gpt-4"); // cl100k_base, compatible with Claude token counting

function countTokens(text: string): number {
  return enc.encode(text).length;
}

function rankAndFitChunks(
  chunks: Chunk[],
  maxContextTokens: number = 4000,
  minScore: number = 0.70
): Chunk[] {
  // Filter and sort by relevance
  const relevant = chunks
    .filter((c) => c.score >= minScore)
    .sort((a, b) => b.score - a.score);

  // Greedy token-budget packing
  const selected: Chunk[] = [];
  let tokenCount = 0;
  for (const chunk of relevant) {
    const chunkTokens = countTokens(chunk.text);
    if (tokenCount + chunkTokens <= maxContextTokens) {
      selected.push(chunk);
      tokenCount += chunkTokens;
    }
  }
  return selected;
}

async function ragWithContextManagement(
  query: string,
  retrievedChunks: Chunk[],
  maxContextTokens: number = 4000
): Promise<string> {
  const fitted = rankAndFitChunks(retrievedChunks, maxContextTokens);

  if (fitted.length === 0) {
    return "I don't have relevant information to answer this question.";
  }

  const contextParts = fitted.map(
    (c, i) => [\${i + 1}] Source: \${c.source}\\n\${c.text.trim()}
  );
  const context = contextParts.join("\\n\\n---\\n\\n");

  console.log(
    Using \${fitted.length}/\${retrievedChunks.length} chunks | ~\${countTokens(context)} tokens
  );

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    system:
      "Answer questions using ONLY the provided context. Cite source numbers [1], [2], etc. Say 'I don't know' if the context is insufficient.",
    messages: [
      {
        role: "user",
        content: CONTEXT:\\n\\n\${context}\\n\\n---\\n\\nQUESTION: \${query},
      },
    ],
  });

  return (response.content[0] as { text: string }).text;
}

// Example
const chunks: Chunk[] = [
  { text: "Claude 3.5 Sonnet achieves 92% on SWE-bench, a coding benchmark.", source: "Anthropic Blog", score: 0.94 },
  { text: "The model supports a 200K token context window.", source: "Anthropic Docs", score: 0.88 },
  { text: "Claude was founded by former OpenAI researchers in 2021.", source: "Wikipedia", score: 0.61 },
];

ragWithContextManagement("What are Claude's key capabilities?", chunks, 2000).then(
  console.log
);`;function W(){return e.jsxs("div",{className:"lesson-content",children:[e.jsx("h2",{children:"Context Management"}),e.jsx("p",{children:"Retrieval can return many chunks, but you cannot always send all of them to the LLM. Context windows have token limits, and filling them indiscriminately with low-relevance text increases noise, raises cost, and can degrade answer quality. Context management is the discipline of deciding which retrieved content to include, in what order, and within what budget."}),e.jsx(n,{term:"Context Window Budget",definition:"The context window budget is the number of tokens available for retrieved context after accounting for the system prompt, the user query, and the reserved output space. Effective context management maximises the relevance signal within this budget by filtering low-quality chunks, ranking the remainder by relevance, and packing the highest-value chunks up to the token limit."}),e.jsx("h2",{children:"The Context Window Equation"}),e.jsx("p",{children:"Every LLM has a maximum context window. For Claude models, this is 200K tokens. The tokens in a single API call are consumed by:"}),e.jsxs("ul",{children:[e.jsx("li",{children:"The system prompt (typically 100–500 tokens)."}),e.jsx("li",{children:"The user's question (typically 10–200 tokens)."}),e.jsx("li",{children:"The retrieved context (your budget to manage)."}),e.jsx("li",{children:"The model's output (reserve at least max_tokens here)."})]}),e.jsx("p",{children:'While 200K is enormous, it is not unlimited, and larger contexts cost more (pricing is per input token). More importantly, research consistently shows that LLMs struggle with "lost in the middle" — relevant information buried in the middle of a very long context is less likely to be correctly utilised than information at the beginning or end. Concise, high-relevance context consistently outperforms maximal context stuffing.'}),e.jsx("h2",{children:"Step 1 — Relevance Score Filtering"}),e.jsx("p",{children:"Before you worry about token budgets, filter out chunks that are not genuinely relevant. Set a minimum cosine similarity threshold (typically 0.70–0.80) and discard anything below it. A chunk with a score of 0.60 is probably tangentially related at best and noise at worst. Sending it to the LLM wastes tokens and can confuse the model."}),e.jsx("h2",{children:"Step 2 — Reranking (Optional but Recommended)"}),e.jsx("p",{children:"Embedding similarity scores are a fast first pass, not a precision ranking. A cross-encoder reranker reads each chunk alongside the query and produces a much more accurate relevance score. Apply reranking to the top-20 embedding results, then take the top-5 reranked results. This two-stage pipeline gets both speed (ANN retrieval) and precision (cross-encoder reranking). The Reranking section of Advanced RAG covers this in depth."}),e.jsx("h2",{children:"Step 3 — Token-Budget Packing"}),e.jsx("p",{children:"After filtering and optional reranking, count tokens and greedily pack the highest- ranked chunks into the available budget. Do not truncate individual chunks unless necessary — a truncated chunk can be more misleading than a missing one. If a chunk does not fit, skip it and try the next one (some smaller chunks may fit where larger ones do not)."}),e.jsx("p",{children:"A typical target is 2,000–4,000 tokens of context for a RAG response. This leaves ample room for the system prompt, user query, and a 1,024-token output in even a 4K-token window, and is a small fraction of Claude's 200K limit, keeping costs low."}),e.jsx("h2",{children:'Step 4 — Ordering for "Lost in the Middle" Mitigation'}),e.jsx("p",{children:'When you have multiple relevant chunks, order matters. Research on the "lost in the middle" phenomenon shows that LLMs attend most strongly to context at the beginning and end of the input. A practical heuristic: place the single highest-relevance chunk first, then lower-relevance chunks in the middle, and the second-highest at the end. This maximises the chance the model utilises the most important context.'}),e.jsx(r,{type:"historical",title:"The 'Lost in the Middle' problem",children:'A 2023 paper by Liu et al. ("Lost in the Middle: How Language Models Use Long Contexts") demonstrated that multi-document question-answering performance degrades significantly when the relevant document is placed in the middle of the context window rather than at the start or end. This effect is most pronounced for large contexts (>10 documents). The finding motivates deliberate chunk ordering in RAG prompts rather than arbitrary ordering.'}),e.jsx("h2",{children:"Multi-Turn Context Management"}),e.jsx("p",{children:"In a conversational RAG application, the prompt grows with each turn as the message history accumulates. A conversation with many turns can exhaust the context window even before the retrieved chunks are added. Common strategies include:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Summarisation"}),": Summarise older turns into a compact history block, replacing the raw messages. Store the summary as a special system message."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Sliding window"}),": Keep only the most recent k turns in full detail."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Query-aware retrieval from history"}),": Treat past conversation turns as a retrievable store, retrieving only the past turns most relevant to the current query."]})]}),e.jsx(s,{title:"Set explicit token budgets for each prompt component",children:"Instrument your RAG pipeline to log the token count breakdown for each component on every request: system prompt tokens, history tokens, context tokens, query tokens, and output tokens. Alerts on any component exceeding its allocated budget surface context window issues before they cause truncation errors or cost spikes."}),e.jsx("h2",{children:"Context Management in Practice"}),e.jsx(t,{title:"Relevance Filtering and Token-Budget Packing",tabs:{python:O,typescript:B}}),e.jsx("p",{children:"The code above implements the complete context management pipeline: filter by minimum score, sort by relevance, greedily pack within a token budget, and log how many chunks were used. The low-scoring chunk (0.61) is dropped before the LLM sees it, and the function reports token usage so you can tune the budget for your specific model and cost targets."})]})}const he=Object.freeze(Object.defineProperty({__proto__:null,default:W},Symbol.toStringTag,{value:"Module"})),V=`import json
from anthropic import Anthropic

client = Anthropic()

def rag_with_citations(
    query: str,
    chunks: list[dict],
) -> dict:
    """
    RAG generation that returns structured output with inline citations
    and a sources list.
    """
    context_parts = []
    for i, chunk in enumerate(chunks, 1):
        context_parts.append(f"[{i}] (Source: {chunk['source']})\\n{chunk['text']}")
    context = "\\n\\n".join(context_parts)

    system = """You are a precise research assistant. When answering:
1. Base your answer strictly on the provided context.
2. Cite every factual claim with the source number like [1] or [2].
3. If you cannot find the answer in the context, state: "The provided context does not contain information about this topic."
4. Return a JSON object with this exact schema:
   {
     "answer": "<your answer with inline citations>",
     "sources_used": [<list of source numbers you cited>],
     "confidence": "high" | "medium" | "low"
   }
"""

    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        system=system,
        messages=[{
            "role": "user",
            "content": (
                f"CONTEXT DOCUMENTS:\\n\\n{context}"
                f"\\n\\n---\\n\\nQUESTION: {query}"
                "\\n\\nRespond with valid JSON only."
            )
        }],
    )

    raw = response.content[0].text.strip()
    # Strip markdown code fences if present
    if raw.startswith(""):
        raw = raw.split("\\n", 1)[1].rsplit("", 1)[0]

    result = json.loads(raw)

    # Attach full source metadata to each cited source
    result["citations"] = [
        {"number": n, "source": chunks[n - 1]["source"], "excerpt": chunks[n - 1]["text"][:200]}
        for n in result.get("sources_used", [])
    ]
    return result


# Example
chunks = [
    {
        "text": "Retrieval-Augmented Generation grounds LLM responses in external documents, dramatically reducing hallucination rates compared to vanilla prompting.",
        "source": "Lewis et al., 2020 — RAG paper",
    },
    {
        "text": "In production RAG systems, the generation step typically uses a temperature of 0 to 0.3 for factual Q&A tasks to maximise consistency.",
        "source": "Anthropic Production Guide",
    },
    {
        "text": "The Eiffel Tower was built between 1887 and 1889.",
        "source": "Wikipedia — Eiffel Tower",
    },
]

result = rag_with_citations(
    "How does RAG reduce hallucination, and what temperature should I use?",
    chunks,
)

print("Answer:", result["answer"])
print("Confidence:", result["confidence"])
print("Sources used:", result["sources_used"])`,z=`import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

interface Chunk {
  text: string;
  source: string;
}

interface RagResult {
  answer: string;
  sources_used: number[];
  confidence: "high" | "medium" | "low";
  citations: Array<{ number: number; source: string; excerpt: string }>;
}

async function ragWithCitations(
  query: string,
  chunks: Chunk[]
): Promise<RagResult> {
  const contextParts = chunks.map(
    (chunk, i) => [\${i + 1}] (Source: \${chunk.source})\\n\${chunk.text}
  );
  const context = contextParts.join("\\n\\n");

  const system = You are a precise research assistant. When answering:
1. Base your answer strictly on the provided context.
2. Cite every factual claim with the source number like [1] or [2].
3. If you cannot find the answer, state that explicitly.
4. Return a JSON object:
   {
     "answer": "<your answer with inline citations>",
     "sources_used": [<list of source numbers cited>],
     "confidence": "high" | "medium" | "low"
   };

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    system,
    messages: [
      {
        role: "user",
        content: CONTEXT DOCUMENTS:\\n\\n\${context}\\n\\n---\\n\\nQUESTION: \${query}\\n\\nRespond with valid JSON only.,
      },
    ],
  });

  let raw = (response.content[0] as { text: string }).text.trim();
  if (raw.startsWith("")) {
    raw = raw.split("\\n").slice(1).join("\\n").replace(/$/, "");
  }

  const result = JSON.parse(raw) as Omit<RagResult, "citations">;

  return {
    ...result,
    citations: result.sources_used.map((n) => ({
      number: n,
      source: chunks[n - 1].source,
      excerpt: chunks[n - 1].text.substring(0, 200),
    })),
  };
}

// Example
const chunks: Chunk[] = [
  {
    text: "Retrieval-Augmented Generation grounds LLM responses in external documents, dramatically reducing hallucination rates.",
    source: "Lewis et al., 2020 — RAG paper",
  },
  {
    text: "In production RAG systems, temperature of 0 to 0.3 is recommended for factual Q&A to maximise consistency.",
    source: "Anthropic Production Guide",
  },
];

ragWithCitations("How does RAG reduce hallucination?", chunks).then((result) => {
  console.log("Answer:", result.answer);
  console.log("Confidence:", result.confidence);
  console.log("Citations:", result.citations);
});`;function Q(){return e.jsxs("div",{className:"lesson-content",children:[e.jsx("h2",{children:"Response Generation"}),e.jsx("p",{children:"The generation step is where the retrieved context and the user's query converge into an actual answer. It might seem like the simplest step — just call the API — but the choices made here determine whether the pipeline delivers grounded, attributed answers or drifts into hallucination. This section covers how to configure generation for maximum grounding, how to elicit citations, and how to detect when the model has gone off-context."}),e.jsx(n,{term:"Grounded Generation",definition:"Grounded generation is the practice of instructing an LLM to derive its response exclusively from explicitly provided context documents, rather than drawing on knowledge encoded in its weights during training. A well-grounded response is fully traceable to source text; every factual claim can be verified against a specific retrieved chunk."}),e.jsx("h2",{children:"Temperature and Sampling for RAG"}),e.jsx("p",{children:"Temperature controls the randomness of the model's sampling. For factual question- answering tasks, use a temperature of 0.0 to 0.3. At temperature 0, the model is maximally deterministic — the same prompt produces the same answer — which is ideal for consistency and easier evaluation. Slightly higher temperatures (0.1–0.3) add minor variation while still being factually conservative."}),e.jsx("p",{children:"Reserve higher temperatures (0.5+) for creative tasks like summarisation in a distinctive voice or generating multiple answer variants. For most production RAG applications, low temperature is the right default."}),e.jsx("h2",{children:"Eliciting Citations"}),e.jsx("p",{children:"The most reliable way to get cited responses is to number each context chunk with a label ([1], [2], ...) and explicitly instruct the model to cite each factual claim. Without this instruction, models sometimes produce uncited prose even when they have access to sources."}),e.jsxs("p",{children:["For maximum reliability, combine citation instructions with structured output: instruct the model to return JSON with separate ",e.jsx("code",{children:"answer"})," and",e.jsx("code",{children:"sources_used"})," fields. This makes citation extraction deterministic and eliminates the fragile regex parsing required to extract citations from free-text."]}),e.jsx("h2",{children:"Hallucination Detection and Mitigation"}),e.jsx("p",{children:"Even well-grounded prompts can produce hallucinations. Three practical mitigations:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Faithfulness scoring"}),": After generation, ask a second LLM call to verify each sentence in the answer against the retrieved context. If a sentence cannot be verified, flag it. This is the basis of the RAGAS faithfulness metric."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Abstention instruction"}),`: Include an explicit instruction: "If the context does not contain enough information to answer, say 'I don't know' rather than guessing." Models follow this instruction reliably when it is unambiguous.`]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Retrieval confidence thresholding"}),': If no retrieved chunk exceeds a minimum similarity score, short-circuit the generation entirely and return a "no information found" response without calling the LLM. This is the cheapest and most reliable hallucination prevention.']})]}),e.jsx("h2",{children:"Streaming Responses"}),e.jsxs("p",{children:["For user-facing applications, streaming the response token by token dramatically improves perceived latency. The Anthropic SDK supports streaming via",e.jsx("code",{children:"client.messages.stream()"}),". For RAG pipelines that return structured JSON, streaming is less useful because you need the complete JSON to parse it. Consider streaming for conversational interfaces and batch mode for structured output."]}),e.jsx(r,{type:"tip",title:"Two-call faithfulness verification",children:'For high-stakes RAG applications (legal, medical, financial), add a lightweight second LLM call to verify the generated answer against the context. Prompt: "Does the following answer contain only information present in the context? List any claims that are NOT supported." This adds latency and cost but catches the ~3–5% of responses that contain unsupported assertions even with strong grounding instructions.'}),e.jsx("h2",{children:"Handling Multi-Document Synthesis"}),e.jsx("p",{children:"When multiple retrieved chunks address different aspects of a question, the model must synthesise across them. This is where RAG generation really earns its value — the model can reconcile, compare, and integrate information from several sources into a coherent answer that no single document contains."}),e.jsx("p",{children:'Guide synthesis with explicit instructions: "Synthesise information from all relevant context sources. If sources contradict each other, acknowledge the discrepancy and cite both." This prevents the model from arbitrarily preferring one source over another when they disagree.'}),e.jsx(s,{title:"Log generation inputs and outputs for every production request",children:"Store the full prompt (system + context + query) alongside the generated response and all retrieved chunk IDs for every production request. This audit trail is essential for debugging hallucinations (compare the response against the context that was provided), for fine-tuning (use high-quality request-response pairs), and for compliance (demonstrate what information the model was given for each answer)."}),e.jsx("h2",{children:"Structured Citation Generation in Practice"}),e.jsx(t,{title:"RAG Response Generation with Structured Citations",tabs:{python:V,typescript:z}}),e.jsx("p",{children:"The implementation above returns a structured object containing the answer with inline citations, the list of source numbers used, a confidence signal, and the full citation metadata. This structure is directly consumable by a frontend to render clickable source references. Notice the JSON-parsing step that strips markdown code fences — models sometimes wrap JSON in backtick blocks even when instructed not to, so defensive parsing is necessary."})]})}const ue=Object.freeze(Object.defineProperty({__proto__:null,default:Q},Symbol.toStringTag,{value:"Module"})),H=`from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall,
)
from datasets import Dataset

# RAGAS expects a dataset with these four columns:
# - question: the user query
# - answer: the generated answer from your RAG pipeline
# - contexts: list of retrieved document chunks (list of strings)
# - ground_truth: the reference answer (only needed for context_recall)

eval_data = {
    "question": [
        "What is the capital of France?",
        "How does RAG reduce hallucination?",
        "What temperature should I use for factual RAG tasks?",
    ],
    "answer": [
        "The capital of France is Paris.",
        "RAG reduces hallucination by grounding LLM responses in retrieved documents, "
        "preventing the model from relying on potentially inaccurate parametric memory.",
        "For factual RAG tasks, a temperature between 0.0 and 0.3 is recommended "
        "to maximise answer consistency.",
    ],
    "contexts": [
        ["Paris is the capital and most populous city of France."],
        [
            "RAG grounds responses in external documents, reducing hallucination.",
            "The model generates answers based only on provided context."
        ],
        ["Production RAG systems typically use temperature 0 to 0.3 for factual Q&A."],
    ],
    "ground_truth": [
        "Paris",
        "RAG reduces hallucination by grounding answers in retrieved source documents.",
        "Temperature between 0.0 and 0.3 is recommended for factual tasks.",
    ],
}

dataset = Dataset.from_dict(eval_data)

# Run RAGAS evaluation — uses an LLM internally (defaults to OpenAI GPT-4)
# To use a custom LLM, pass llm= parameter
results = evaluate(
    dataset,
    metrics=[
        faithfulness,         # are claims in the answer supported by context?
        answer_relevancy,     # does the answer address the question?
        context_precision,    # are retrieved chunks relevant to the question?
        context_recall,       # does the context cover the ground truth?
    ],
)

print(results)
# Output: {'faithfulness': 0.97, 'answer_relevancy': 0.95, ...}

# Convert to pandas for analysis
df = results.to_pandas()
print(df[["question", "faithfulness", "answer_relevancy"]].to_string())`;function U(){return e.jsxs("div",{className:"lesson-content",children:[e.jsx("h2",{children:"RAGAS Framework"}),e.jsx("p",{children:"Building a RAG pipeline is relatively straightforward; knowing whether it is working well is harder. Traditional NLP metrics like BLEU or ROUGE require ground-truth reference answers for every evaluation query, which is expensive to produce at scale. RAGAS (Retrieval-Augmented Generation Assessment) is an open-source evaluation framework that solves this by using LLMs as automatic judges — enabling evaluation without hand-written reference answers for most metrics."}),e.jsx(n,{term:"RAGAS",definition:"RAGAS is an evaluation framework for RAG pipelines that measures four core dimensions: faithfulness (are the model's claims supported by retrieved context?), answer relevancy (does the response address the question?), context precision (are the retrieved chunks relevant?), and context recall (does the retrieved context contain enough information to answer?). RAGAS uses LLM-based scoring for most metrics, making it practical to run without labelling ground-truth answers at scale."}),e.jsx("h2",{children:"Why LLM-Based Evaluation?"}),e.jsx("p",{children:"Traditional reference-based metrics measure lexical overlap between a generated answer and a reference answer. This approach has two fundamental problems for RAG:"}),e.jsxs("ol",{children:[e.jsx("li",{children:"It requires a reference answer for every query. Producing high-quality reference answers for a knowledge base with thousands of possible questions is a major labelling effort."}),e.jsx("li",{children:"Lexical overlap is a poor proxy for semantic correctness. An answer can be completely correct while using different words from the reference, and can be factually wrong while matching the reference's phrasing."})]}),e.jsx("p",{children:"RAGAS replaces lexical overlap with LLM judgment. The evaluating LLM reads the question, the answer, and the context, and produces a score based on semantic understanding rather than string matching. This is far more aligned with how humans would judge RAG quality."}),e.jsx("h2",{children:"The Four Core RAGAS Metrics"}),e.jsx("h3",{children:"Faithfulness"}),e.jsx("p",{children:"Faithfulness measures whether every claim in the generated answer is supported by the retrieved context. RAGAS breaks the answer into individual claims, then asks an LLM to verify each claim against the context documents. The score is the fraction of claims that are fully supported. A score of 1.0 means every claim has a source; a lower score indicates hallucination."}),e.jsx("p",{children:"Faithfulness does not require a ground-truth answer — only the question, the answer, and the retrieved context. This makes it the most actionable metric for detecting hallucination in production."}),e.jsx("h3",{children:"Answer Relevancy"}),e.jsx("p",{children:"Answer relevancy measures how well the generated answer addresses the actual question. RAGAS generates several hypothetical questions that the answer could have been responding to, then measures how similar those reverse-engineered questions are to the original query using embedding similarity. A complete, focused answer scores close to 1.0; an evasive or off-topic answer scores lower."}),e.jsx("h3",{children:"Context Precision"}),e.jsx("p",{children:"Context precision measures the signal-to-noise ratio in the retrieved context: what fraction of retrieved chunks are actually relevant to answering the question? High context precision means your retrieval system is not returning junk. A score of 0.5 means half of what you're sending to the LLM is irrelevant — a retrieval quality problem, not a generation quality problem."}),e.jsx("h3",{children:"Context Recall"}),e.jsx("p",{children:"Context recall measures whether the retrieved context contains all the information needed to answer the question correctly. It requires a ground-truth answer to compare against: RAGAS checks whether each sentence of the ground truth can be attributed to a retrieved chunk. Low context recall means your retrieval is missing relevant documents — a sign that you need more data, better chunking, or improved retrieval parameters."}),e.jsx("h2",{children:"The RAGAS Evaluation Loop"}),e.jsx("p",{children:"A typical evaluation workflow:"}),e.jsxs("ol",{children:[e.jsx("li",{children:"Sample 50–200 queries representative of your production distribution. For context recall, also write reference answers."}),e.jsx("li",{children:"Run each query through your full RAG pipeline, recording the question, generated answer, and retrieved context chunks."}),e.jsxs("li",{children:["Assemble the results into a RAGAS dataset and run ",e.jsx("code",{children:"evaluate()"}),"."]}),e.jsx("li",{children:"Analyse per-query scores to identify failure patterns: low faithfulness = hallucination; low context precision = noisy retrieval; low context recall = missing documents."}),e.jsx("li",{children:"Fix the identified issue and re-run the evaluation to confirm improvement."})]}),e.jsx(r,{type:"note",title:"RAGAS uses an LLM for evaluation — which one?",children:"By default, RAGAS uses OpenAI GPT-4 as its evaluating LLM. This adds cost (typically $0.01–0.10 per query evaluated) and a dependency on the OpenAI API. RAGAS supports custom LLM wrappers, so you can substitute any model including Claude via LangChain's Anthropic integration. For cost-sensitive evaluations, GPT-3.5-Turbo or a local model like Llama 3 is adequate for most metrics except faithfulness, which benefits from a stronger judge."}),e.jsx(s,{title:"Evaluate on a stratified query sample",children:'Do not evaluate only on easy, well-formed queries. Deliberately include edge cases: queries where the answer is not in the knowledge base, ambiguous queries, multi-hop questions, and queries that require synthesising multiple documents. Your overall metric scores are less important than understanding failure modes on these hard cases. A pipeline with 0.92 average faithfulness but 0.50 faithfulness on "not in KB" queries will produce hallucinated answers for a significant fraction of real users.'}),e.jsx("h2",{children:"Running RAGAS Evaluation"}),e.jsx(t,{title:"RAGAS Evaluation Pipeline",tabs:{python:H}}),e.jsxs("p",{children:["The example above runs all four core RAGAS metrics on three example queries. The ",e.jsx("code",{children:"evaluate()"})," function returns a ",e.jsx("code",{children:"Result"})," object with aggregate scores and per-query breakdowns accessible via ",e.jsx("code",{children:"to_pandas()"}),". In a real evaluation pipeline, you would collect the dataset by running your full RAG pipeline on each evaluation query and recording the outputs, then pass the collected data to RAGAS."]})]})}const me=Object.freeze(Object.defineProperty({__proto__:null,default:U},Symbol.toStringTag,{value:"Module"})),$=`from anthropic import Anthropic
import json

client = Anthropic()

def extract_claims(answer: str) -> list[str]:
    """Use Claude to decompose an answer into atomic factual claims."""
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        system="You decompose text into atomic factual claims. Return a JSON array of strings.",
        messages=[{
            "role": "user",
            "content": (
                f"Decompose the following answer into a list of atomic factual claims. "
                f"Each claim must be independently verifiable.\\n\\nAnswer: {answer}\\n\\n"
                "Return only a JSON array of strings."
            )
        }],
    )
    raw = response.content[0].text.strip().strip("json").strip("")
    return json.loads(raw)

def check_claim_support(claim: str, context_chunks: list[str]) -> bool:
    """Check whether a single claim is supported by the provided context."""
    context = "\\n\\n".join(f"[{i+1}] {c}" for i, c in enumerate(context_chunks))
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=64,
        system="Answer with JSON: {"supported": true} or {"supported": false}",
        messages=[{
            "role": "user",
            "content": (
                f"Context:\\n{context}\\n\\n"
                f"Claim: {claim}\\n\\n"
                "Is this claim fully supported by the context above?"
            )
        }],
    )
    raw = response.content[0].text.strip().strip("json").strip("")
    return json.loads(raw).get("supported", False)

def compute_faithfulness(
    answer: str,
    context_chunks: list[str],
) -> dict:
    claims = extract_claims(answer)
    supported = [check_claim_support(c, context_chunks) for c in claims]
    score = sum(supported) / len(supported) if supported else 0.0
    return {
        "faithfulness_score": round(score, 3),
        "total_claims": len(claims),
        "supported_claims": sum(supported),
        "unsupported": [c for c, s in zip(claims, supported) if not s],
    }

# Example
answer = (
    "RAG reduces hallucination by grounding responses in retrieved documents. "
    "It was invented at Meta in 2020. "  # hallucinated detail — not in context
    "Production systems typically use temperature 0 to 0.3."
)
context = [
    "RAG grounds LLM responses in retrieved documents, reducing hallucination.",
    "Low temperature (0–0.3) is recommended for factual RAG Q&A tasks.",
]

result = compute_faithfulness(answer, context)
print(f"Faithfulness: {result['faithfulness_score']}")
print(f"Unsupported claims: {result['unsupported']}")`,K=`import numpy as np
import voyageai
from anthropic import Anthropic

voyage_client = voyageai.Client()
anthropic_client = Anthropic()

def generate_reverse_questions(answer: str, n: int = 3) -> list[str]:
    """Generate questions that the given answer could have been responding to."""
    response = anthropic_client.messages.create(
        model="claude-opus-4-5",
        max_tokens=256,
        system="Generate hypothetical questions. Return a JSON array of strings.",
        messages=[{
            "role": "user",
            "content": (
                f"Generate {n} different questions that this answer could have been "
                f"responding to. Return as a JSON array.\\n\\nAnswer: {answer}"
            )
        }],
    )
    import json
    raw = response.content[0].text.strip().strip("json").strip("")
    return json.loads(raw)

def compute_answer_relevancy(question: str, answer: str, n: int = 3) -> float:
    """
    Measure answer relevancy: generate reverse questions from the answer,
    embed them and the original question, compute average cosine similarity.
    """
    reverse_questions = generate_reverse_questions(answer, n)
    all_texts = [question] + reverse_questions
    result = voyage_client.embed(all_texts, model="voyage-3")
    embeddings = np.array(result.embeddings)

    query_vec = embeddings[0]
    reverse_vecs = embeddings[1:]

    similarities = [
        float(np.dot(query_vec, rv) / (np.linalg.norm(query_vec) * np.linalg.norm(rv)))
        for rv in reverse_vecs
    ]
    return round(float(np.mean(similarities)), 3)

# Example
question = "What is the purpose of metadata filtering in RAG?"
answer = (
    "Metadata filtering restricts vector similarity search to a relevant subset of documents "
    "by applying conditions on structured fields like source, date, and document type. "
    "This dramatically improves precision by excluding irrelevant documents from consideration."
)

score = compute_answer_relevancy(question, answer)
print(f"Answer Relevancy Score: {score}")`;function Y(){return e.jsxs("div",{className:"lesson-content",children:[e.jsx("h2",{children:"Faithfulness & Relevance"}),e.jsx("p",{children:"The four RAGAS metrics each illuminate a different failure mode. This section dives deep into faithfulness and answer relevancy — the two metrics that diagnose the generation side of your pipeline — and explains how to implement them, interpret their scores, and act on what they reveal."}),e.jsx(n,{term:"Faithfulness",definition:"Faithfulness measures the degree to which a generated answer's factual claims are supported by the retrieved context documents. It is computed by decomposing the answer into atomic claims, then verifying each claim against the context. The score is the fraction of claims that are fully supported: 1.0 means every claim has a source; lower scores indicate hallucination."}),e.jsx("h2",{children:"Why Faithfulness Is the Primary Metric"}),e.jsx("p",{children:"In a production RAG system, faithfulness is the single most important metric because it directly measures the hallucination rate. A faithfulness score of 0.90 means that roughly 10% of claims in your generated answers are not supported by the retrieved context — they come from the model's parametric memory, which may be outdated, wrong, or fabricated."}),e.jsx("p",{children:"Faithfulness is also actionable: a low score points to specific unsupported claims, which can be traced to either a retrieval failure (the right context was not retrieved) or a generation failure (the model ignored the context or added information beyond it). This distinction determines the fix."}),e.jsx("h2",{children:"How Faithfulness Is Computed"}),e.jsx("p",{children:"RAGAS computes faithfulness in two steps:"}),e.jsxs("ol",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Claim decomposition"}),': An LLM reads the generated answer and extracts a list of atomic factual claims — the smallest independently verifiable statements. "Paris is the capital of France and is home to the Eiffel Tower" becomes two claims: "Paris is the capital of France" and "Paris is home to the Eiffel Tower."']}),e.jsxs("li",{children:[e.jsx("strong",{children:"Entailment verification"}),": For each claim, an LLM checks whether the claim is entailed by the retrieved context. Claims that cannot be found or inferred from the context are marked unsupported."]})]}),e.jsx("p",{children:e.jsx("code",{children:"faithfulness = supported_claims / total_claims"})}),e.jsx("h2",{children:"Answer Relevancy"}),e.jsx(n,{term:"Answer Relevancy",definition:"Answer relevancy measures how directly and completely a generated answer responds to the posed question. It is computed by having an LLM generate several hypothetical questions that the answer could plausibly be responding to, embedding those questions and the original question, and computing the average cosine similarity. High similarity means the answer is on-topic and focused; low similarity means the answer is evasive, off-topic, or incomplete."}),e.jsx("p",{children:"A model might produce a faithful answer (every claim supported by context) that is nonetheless irrelevant — for example, answering a question about pricing by discussing the company's history. Answer relevancy catches this. The metric does not require a ground-truth reference answer, making it cheap to run at scale."}),e.jsx("h2",{children:"Context Precision and Context Recall"}),e.jsx("p",{children:"While faithfulness and answer relevancy diagnose the generation step, context precision and context recall diagnose the retrieval step:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Context precision"})," = (relevant chunks retrieved) / (total chunks retrieved). Low precision means your retrieval is returning too much noise, diluting the context and confusing the model. Fix: raise your similarity score threshold, add metadata filters, or use reranking."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Context recall"})," = (ground-truth claims covered by retrieved context) / (total ground-truth claims). Low recall means your retrieval is missing key information. Fix: lower your similarity threshold, increase k, improve chunking, or add missing documents to the index."]})]}),e.jsx("h2",{children:"The Metric Trade-offs"}),e.jsx("p",{children:"These four metrics interact in important ways. Increasing k (more chunks retrieved) improves recall but hurts precision. Raising the similarity threshold improves precision but hurts recall. Context stuffing (many chunks) can paradoxically reduce faithfulness if it adds irrelevant context that confuses the model."}),e.jsx("p",{children:"Optimise for your use case: customer support benefits most from high faithfulness (no hallucinated policies); research tools benefit most from high recall (all relevant information surfaced); enterprise search benefits from high precision (no irrelevant noise)."}),e.jsx(r,{type:"tip",title:"Per-query analysis reveals more than averages",children:"An average faithfulness score of 0.85 hides important variance. Export per-query scores and look at the bottom quartile — the 25% of queries with lowest scores. These queries reveal specific failure patterns: questions about entities not well represented in your knowledge base, multi-hop questions that require synthesising across documents, or questions that trigger the model's parametric memory. Fix the systemic issues in these failure patterns to move the overall metric."}),e.jsx(s,{title:"Track metrics over time, not just at launch",children:"Run your evaluation suite on every significant pipeline change: new documents added, chunking strategy changed, embedding model updated, prompt revised. Plot faithfulness and answer relevancy over time. Regressions in these metrics after a deployment indicate that a change degraded generation quality even if individual tests passed. Treat these metrics like you treat test coverage: required, tracked, and defended."}),e.jsx("h2",{children:"Implementing Faithfulness and Relevancy Checks"}),e.jsx(t,{title:"Faithfulness Scoring with Claude",tabs:{python:$}}),e.jsx(t,{title:"Answer Relevancy Scoring with Embeddings",tabs:{python:K}}),e.jsx("p",{children:"The first example implements faithfulness scoring by decomposing the answer into atomic claims and verifying each against the context using Claude. The second implements answer relevancy by generating reverse questions from the answer and measuring their semantic similarity to the original question. Together, these two implementations give you the two most important generation-quality metrics without requiring any pre-labelled ground-truth answers."})]})}const pe=Object.freeze(Object.defineProperty({__proto__:null,default:Y},Symbol.toStringTag,{value:"Module"}));function J(){return e.jsxs("div",{className:"lesson-content",children:[e.jsx("h2",{children:"End-to-End Testing for RAG"}),e.jsx("p",{children:"Automated metrics like RAGAS scores are valuable, but they do not replace the discipline of building a structured test suite. End-to-end RAG testing means specifying expected behaviour, running the full pipeline against it, and catching regressions before they reach production. Without tests, every change to chunking strategy, embedding model, prompt, or retrieval parameters is a gamble."}),e.jsx(n,{title:"Golden Dataset",definition:"A golden dataset is a curated collection of (question, expected answer, source documents) triples that represents the range of queries your RAG system must handle correctly. It is the ground truth against which all automated evaluation runs. A good golden dataset is small enough to maintain manually but diverse enough to catch real failure modes."}),e.jsx("h2",{children:"Building a Golden Dataset"}),e.jsx("p",{children:"Start with 50–100 question-answer pairs covering: common queries, edge cases, questions the system should refuse to answer, questions requiring multi-document synthesis, and questions with answers that have changed over time. For each pair, record the exact source chunks that should be retrieved and the key facts that must appear in the answer."}),e.jsx(t,{title:"Golden Dataset Structure and Creation",tabs:{python:`import json
from dataclasses import dataclass, asdict
from pathlib import Path

@dataclass
class GoldenSample:
    id: str
    question: str
    expected_answer_contains: list[str]   # Key facts that must be present
    expected_source_ids: list[str]        # Document IDs that should be retrieved
    should_abstain: bool = False          # True if the system should say "I don't know"
    category: str = "factual"            # factual | synthesis | abstain | edge_case

# Build your golden dataset
GOLDEN_DATASET = [
    GoldenSample(
        id="Q001",
        question="What is the refund window for digital products?",
        expected_answer_contains=["14 days", "digital"],
        expected_source_ids=["policy-doc-v3"],
        category="factual",
    ),
    GoldenSample(
        id="Q002",
        question="Compare the performance of Model A vs Model B on classification tasks.",
        expected_answer_contains=["accuracy", "F1"],
        expected_source_ids=["benchmark-2024", "model-a-docs", "model-b-docs"],
        category="synthesis",
    ),
    GoldenSample(
        id="Q003",
        question="What is the weather like on Mars today?",
        expected_answer_contains=[],
        expected_source_ids=[],
        should_abstain=True,
        category="abstain",
    ),
]

# Save to JSON for use in CI
dataset_path = Path("tests/golden_dataset.json")
dataset_path.parent.mkdir(exist_ok=True)
with open(dataset_path, "w") as f:
    json.dump([asdict(s) for s in GOLDEN_DATASET], f, indent=2)

print(f"Saved {len(GOLDEN_DATASET)} golden samples to {dataset_path}")`}}),e.jsx("h2",{children:"Pytest Test Suite for RAG"}),e.jsx("p",{children:"Structure your tests with pytest so they run in CI. Each test loads the golden dataset, runs the full RAG pipeline, and asserts on specific measurable properties: retrieval recall, answer completeness, abstention behaviour, and response latency."}),e.jsx(t,{title:"Pytest RAG Test Suite",tabs:{python:`import pytest
import time
import json
from pathlib import Path

# Assume these are your actual RAG pipeline functions
from your_rag_pipeline import retrieve_chunks, generate_answer

GOLDEN_PATH = Path("tests/golden_dataset.json")

@pytest.fixture(scope="session")
def golden_dataset():
    with open(GOLDEN_PATH) as f:
        return json.load(f)

@pytest.fixture(scope="session")
def rag_results(golden_dataset):
    """Run the full pipeline once and cache results for all tests."""
    results = {}
    for sample in golden_dataset:
        start = time.time()
        chunks = retrieve_chunks(sample["question"], top_k=5)
        answer = generate_answer(sample["question"], chunks)
        latency = time.time() - start
        results[sample["id"]] = {
            "answer": answer,
            "retrieved_ids": [c["source_id"] for c in chunks],
            "latency": latency,
        }
    return results


class TestRetrieval:
    def test_retrieval_recall(self, golden_dataset, rag_results):
        """Every expected source document must appear in the top-5 retrieved chunks."""
        failures = []
        for sample in golden_dataset:
            if not sample["expected_source_ids"]:
                continue
            retrieved = set(rag_results[sample["id"]]["retrieved_ids"])
            expected = set(sample["expected_source_ids"])
            missing = expected - retrieved
            if missing:
                failures.append(f"{sample['id']}: missing sources {missing}")
        assert not failures, "Retrieval recall failures:\\n" + "\\n".join(failures)

    def test_retrieval_latency(self, golden_dataset, rag_results):
        """End-to-end latency must be under 3 seconds for all queries."""
        slow = [
            f"{s['id']}: {rag_results[s['id']]['latency']:.2f}s"
            for s in golden_dataset
            if rag_results[s["id"]]["latency"] > 3.0
        ]
        assert not slow, "Slow queries (>3s):\\n" + "\\n".join(slow)


class TestGeneration:
    def test_answer_contains_key_facts(self, golden_dataset, rag_results):
        """Answer must mention all key facts specified in the golden sample."""
        failures = []
        for sample in golden_dataset:
            if sample["should_abstain"]:
                continue
            answer = rag_results[sample["id"]]["answer"].lower()
            for fact in sample["expected_answer_contains"]:
                if fact.lower() not in answer:
                    failures.append(f"{sample['id']}: missing '{fact}'")
        assert not failures, "Missing key facts:\\n" + "\\n".join(failures)

    def test_abstention_on_out_of_scope(self, golden_dataset, rag_results):
        """System must abstain (not hallucinate) for out-of-scope questions."""
        abstain_phrases = ["don't know", "cannot find", "not in", "no information"]
        failures = []
        for sample in golden_dataset:
            if not sample["should_abstain"]:
                continue
            answer = rag_results[sample["id"]]["answer"].lower()
            if not any(phrase in answer for phrase in abstain_phrases):
                failures.append(f"{sample['id']}: expected abstention but got: {answer[:100]}")
        assert not failures, "Unexpected answers (should have abstained):\\n" + "\\n".join(failures)`}}),e.jsx("h2",{children:"Regression Testing Strategy"}),e.jsx("p",{children:"RAG pipelines have many moving parts — embedding models, chunk sizes, vector DB parameters, prompt wording, LLM version. Any change can degrade performance on previously passing cases. Track evaluation metrics over time by storing test run results with a timestamp and the pipeline configuration hash."}),e.jsx(t,{title:"Regression Tracking",tabs:{python:`import json
import hashlib
import datetime
from pathlib import Path

def compute_config_hash(config: dict) -> str:
    """Deterministic hash of pipeline configuration for change tracking."""
    config_str = json.dumps(config, sort_keys=True)
    return hashlib.sha256(config_str.encode()).hexdigest()[:12]

def save_eval_run(metrics: dict, config: dict, results_dir: str = "tests/eval_runs"):
    Path(results_dir).mkdir(parents=True, exist_ok=True)
    config_hash = compute_config_hash(config)
    timestamp = datetime.datetime.utcnow().isoformat()
    run_record = {
        "timestamp": timestamp,
        "config_hash": config_hash,
        "config": config,
        "metrics": metrics,
    }
    filename = f"{results_dir}/{timestamp[:10]}_{config_hash}.json"
    with open(filename, "w") as f:
        json.dump(run_record, f, indent=2)
    return filename

def check_for_regression(
    current_metrics: dict,
    baseline_path: str,
    tolerance: float = 0.05,
) -> list[str]:
    """Return list of metric regressions exceeding tolerance."""
    with open(baseline_path) as f:
        baseline = json.load(f)["metrics"]

    regressions = []
    for metric, value in current_metrics.items():
        if metric not in baseline:
            continue
        drop = baseline[metric] - value
        if drop > tolerance:
            regressions.append(
                f"{metric}: {baseline[metric]:.3f} -> {value:.3f} (drop: {drop:.3f})"
            )
    return regressions

# Example usage in CI
PIPELINE_CONFIG = {
    "embedding_model": "voyage-3",
    "chunk_size": 512,
    "chunk_overlap": 50,
    "top_k": 5,
    "llm_model": "claude-opus-4-5",
    "temperature": 0.1,
}

current_metrics = {
    "retrieval_recall_at_5": 0.87,
    "answer_completeness": 0.82,
    "abstention_accuracy": 0.95,
    "faithfulness": 0.91,
}

filename = save_eval_run(current_metrics, PIPELINE_CONFIG)
print(f"Run saved to {filename}")`}}),e.jsx("h2",{children:"CI/CD Integration"}),e.jsx("p",{children:"RAG quality gates belong in your CI pipeline alongside unit tests and linting. The key challenge is cost and speed: running the full golden dataset through the LLM on every PR is expensive. Use a tiered strategy: fast retrieval-only tests on every commit, full end-to-end evaluation on merges to main."}),e.jsx(t,{title:"GitHub Actions Workflow for RAG Evaluation",tabs:{yaml:`name: RAG Quality Gate

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
  VOYAGE_API_KEY: \${{ secrets.VOYAGE_API_KEY }}

jobs:
  retrieval-tests:
    # Fast: runs on every PR — no LLM calls, only embedding + vector search
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install -r requirements.txt
      - run: pytest tests/test_retrieval.py -v --timeout=60

  full-rag-eval:
    # Full evaluation: only runs on merge to main to save API costs
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install -r requirements.txt
      - name: Run full test suite
        run: pytest tests/ -v --timeout=300
      - name: Check for regressions vs baseline
        run: python scripts/check_regression.py
      - name: Upload eval results
        uses: actions/upload-artifact@v4
        with:
          name: eval-results
          path: tests/eval_runs/`}}),e.jsx(s,{title:"Keep the Golden Dataset Small and Curated",children:e.jsx("p",{children:"Resist the temptation to auto-generate hundreds of test cases. A carefully curated set of 50–100 questions that cover your actual failure modes is more valuable than a machine-generated set of 1000. Each golden sample should be reviewed by a domain expert, cover a distinct scenario, and have clearly verifiable expected outputs. Review and update the dataset quarterly as you discover new failure modes in production."})}),e.jsx(u,{title:"LLM-Generated Test Cases Are Circular",children:e.jsx("p",{children:"Generating golden answers with the same LLM you are testing creates a circular evaluation loop — the model will tend to regenerate similar outputs and any systematic error will not be caught. Write expected answers manually or have domain experts review LLM-generated drafts before including them in the golden dataset."})}),e.jsx(r,{title:"Minimum viable test suite",content:"If you are starting from zero, implement these three tests first: (1) retrieval recall — are the right documents retrieved? (2) abstention — does the system say 'I don't know' when it should? (3) latency — does the pipeline complete within your SLA? These three tests catch the majority of production failures and take under a day to implement."})]})}const ge=Object.freeze(Object.defineProperty({__proto__:null,default:J},Symbol.toStringTag,{value:"Module"}));export{te as a,ne as b,re as c,se as d,ie as e,ae as f,oe as g,ce as h,le as i,de as j,he as k,ue as l,me as m,pe as n,ge as o,ee as s};
