import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'

export default function SpecializedModels() {
  return (
    <article className="prose-content">
      <h2>Specialized Models</h2>
      <p>
        Not every task requires a general-purpose frontier LLM. Specialized models — embedding
        models, vision models, code models, and fine-tuned specialists — often outperform
        general models on their target task while being faster and cheaper. Understanding when
        to reach for a specialist rather than a generalist is a key skill in agentic system design.
      </p>

      <ConceptBlock term="Embedding Model">
        <p>
          A model that converts text (or other data) into a dense, fixed-length numerical vector
          that captures semantic meaning. Semantically similar texts produce similar vectors.
          Embedding models are not generative — they do not produce text. They are used for
          semantic search, clustering, classification, and as the backbone of RAG systems.
        </p>
      </ConceptBlock>

      <h2>Embedding Models</h2>
      <p>
        Embeddings are the foundation of retrieval-augmented generation. The choice of embedding
        model directly impacts retrieval quality, which in turn determines the quality of the
        generative model's context.
      </p>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Model</th>
              <th className="px-4 py-3 text-left font-semibold">Provider</th>
              <th className="px-4 py-3 text-left font-semibold">Dimensions</th>
              <th className="px-4 py-3 text-left font-semibold">Best For</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['text-embedding-3-large', 'OpenAI', '3072 (matryoshka)', 'High-accuracy semantic search, MTEB top performer'],
              ['text-embedding-3-small', 'OpenAI', '1536', 'Cost-effective production RAG'],
              ['embed-v3.0', 'Cohere', '1024', 'Retrieval-optimized, multilingual'],
              ['voyage-3', 'Voyage AI', '1024', 'Code + text retrieval, excellent for codebases'],
              ['nomic-embed-text', 'Nomic', '768', 'Open weights, self-hostable, competitive quality'],
              ['all-MiniLM-L6', 'Sentence Transformers', '384', 'Ultra-fast local embeddings, edge/mobile'],
            ].map(([model, provider, dims, use]) => (
              <tr key={model}>
                <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">{model}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{provider}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{dims}</td>
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-500">{use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SDKExample
        title="Generating and Using Embeddings"
        tabs={{
          python: `from openai import OpenAI
import numpy as np

client = OpenAI()

def embed(texts: list[str], model: str = "text-embedding-3-small") -> list[list[float]]:
    """Embed a batch of texts. Returns one vector per input."""
    response = client.embeddings.create(input=texts, model=model)
    return [item.embedding for item in response.data]

def cosine_similarity(a: list[float], b: list[float]) -> float:
    a, b = np.array(a), np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

# Build a simple in-memory retrieval system
documents = [
    "FastAPI is an async Python web framework built on Starlette.",
    "PostgreSQL is an open-source relational database with full ACID compliance.",
    "Redis is an in-memory data store commonly used for caching and pub/sub.",
    "Celery is a distributed task queue for Python using message brokers.",
]

doc_embeddings = embed(documents)

def search(query: str, top_k: int = 2) -> list[str]:
    query_embedding = embed([query])[0]
    scores = [cosine_similarity(query_embedding, doc_emb) for doc_emb in doc_embeddings]
    ranked = sorted(zip(scores, documents), reverse=True)
    return [doc for _, doc in ranked[:top_k]]

results = search("How do I add caching to my API?")
print(results)  # Redis document should rank highest`,
          typescript: `import OpenAI from 'openai';

const client = new OpenAI();

async function embed(texts: string[]): Promise<number[][]> {
  const response = await client.embeddings.create({
    input: texts,
    model: 'text-embedding-3-small',
  });
  return response.data.map((item) => item.embedding);
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (magA * magB);
}

const documents = [
  'FastAPI is an async Python web framework.',
  'Redis is an in-memory data store for caching.',
];

const docEmbeddings = await embed(documents);

async function search(query: string, topK = 2): Promise<string[]> {
  const [queryEmbedding] = await embed([query]);
  const scored = documents.map((doc, i) => ({
    doc,
    score: cosineSimilarity(queryEmbedding, docEmbeddings[i]),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((s) => s.doc);
}`,
        }}
      />

      <h2>Vision Models</h2>
      <p>
        Vision models accept images (and sometimes video) as input alongside text. Use them when
        your agent needs to understand screenshots, diagrams, charts, documents, or user-provided
        images.
      </p>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Model</th>
              <th className="px-4 py-3 text-left font-semibold">Vision Capability</th>
              <th className="px-4 py-3 text-left font-semibold">Best For</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['Claude 3.7 Sonnet', 'High-res images, charts, code screenshots', 'Document analysis, UI review, chart Q&A'],
              ['GPT-4o', 'Images + audio, strong OCR', 'Rich multimodal conversations, audio transcription'],
              ['Gemini 1.5 Pro', 'Images + video, up to 1hr of video', 'Video understanding, long multimodal documents'],
              ['LLaVA-1.6 (open)', 'Images', 'Self-hosted vision tasks, privacy-sensitive image analysis'],
            ].map(([model, cap, use]) => (
              <tr key={model}>
                <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{model}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{cap}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-500 text-xs">{use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SDKExample
        title="Vision: Analysing a Screenshot with Claude"
        tabs={{
          python: `import anthropic
import base64
from pathlib import Path

client = anthropic.Anthropic()

def analyse_screenshot(image_path: str, question: str) -> str:
    image_data = base64.standard_b64encode(Path(image_path).read_bytes()).decode("utf-8")
    media_type = "image/png" if image_path.endswith(".png") else "image/jpeg"

    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": media_type,
                        "data": image_data,
                    },
                },
                {"type": "text", "text": question},
            ],
        }],
    )
    return response.content[0].text

# Analyse a UI screenshot for accessibility issues
result = analyse_screenshot(
    "dashboard_screenshot.png",
    "List any accessibility issues visible in this UI screenshot. "
    "Check for: missing alt text, low contrast, small touch targets, missing focus indicators."
)
print(result)`,
        }}
      />

      <h2>Code-Specialized Models</h2>
      <p>
        While frontier general models (Claude, GPT-4o) excel at code, dedicated code models
        remain competitive for specific tasks — particularly fill-in-the-middle (FIM) completion,
        inline suggestions, and tasks requiring very low latency.
      </p>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Model</th>
              <th className="px-4 py-3 text-left font-semibold">Specialty</th>
              <th className="px-4 py-3 text-left font-semibold">Use Case</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['Claude 3.7 Sonnet', 'Full code gen, multi-file reasoning, debugging', 'Coding agents, PR review, architecture'],
              ['Codestral (Mistral)', 'FIM completion, 80+ languages', 'IDE autocomplete, inline suggestions'],
              ['DeepSeek-Coder-V2', 'Competitive coding, algorithmic reasoning', 'Hard LeetCode-style tasks, DSA'],
              ['StarCoder2 (open)', 'Multi-language FIM, self-hostable', 'Private codebase autocomplete'],
            ].map(([model, spec, use]) => (
              <tr key={model}>
                <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{model}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{spec}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-500 text-xs">{use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Fine-Tuned Specialist Models</h2>
      <p>
        Fine-tuning adapts a base model to a specific domain, output format, or task by training
        on labelled examples. A fine-tuned 7B model can match or exceed GPT-4 quality on a
        narrow task at 100x lower inference cost.
      </p>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">When to Fine-Tune</th>
              <th className="px-4 py-3 text-left font-semibold">When NOT to Fine-Tune</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-3 align-top text-gray-600 dark:text-gray-400">
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li>Highly domain-specific vocabulary or format</li>
                  <li>{"High volume (>1M requests/month)"}</li>
                  <li>Prompt engineering has plateaued on quality</li>
                  <li>Latency requirements preclude large models</li>
                  <li>Data privacy requires on-premise deployment</li>
                </ul>
              </td>
              <td className="px-4 py-3 align-top text-gray-600 dark:text-gray-400">
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li>You have {"<500"} labelled examples</li>
                  <li>The task changes frequently</li>
                  <li>Few-shot prompting already achieves target quality</li>
                  <li>You need broad generalisation, not narrow precision</li>
                  <li>You lack ML infrastructure for training and serving</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BestPracticeBlock title="Choosing the Right Specialist">
        <ul>
          <li>Use embedding models (not generative LLMs) for semantic search and retrieval — they are 100x cheaper and faster.</li>
          <li>For vision tasks, prefer Claude or GPT-4o if accuracy matters; use open models (LLaVA) for high-volume privacy-sensitive tasks.</li>
          <li>For IDE autocomplete, use FIM-capable code models (Codestral, StarCoder) — they are trained for this latency profile.</li>
          <li>Only consider fine-tuning after you've maximised prompt engineering and have 1K+ labelled examples.</li>
          <li>For reasoning-heavy tasks (math, proofs, competition coding), use reasoning models (o3, QwQ) despite their high cost.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Matryoshka Embeddings">
        <p>
          OpenAI's text-embedding-3 models support Matryoshka representation learning (MRL):
          you can truncate the embedding to a smaller dimension (e.g. 256 instead of 1536)
          and still get high-quality retrieval, at lower storage and similarity-search cost.
          Specify the <code>dimensions</code> parameter to control the trade-off between cost
          and quality.
        </p>
      </NoteBlock>
    </article>
  )
}
