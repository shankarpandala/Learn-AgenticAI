import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

const responseGenPython = `import json
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
print("Sources used:", result["sources_used"])`;

const responseGenTS = `import Anthropic from "@anthropic-ai/sdk";

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
});`;

export default function ResponseGeneration() {
  return (
    <div className="lesson-content">
      <h2>Response Generation</h2>

      <p>
        The generation step is where the retrieved context and the user's query converge
        into an actual answer. It might seem like the simplest step — just call the API
        — but the choices made here determine whether the pipeline delivers grounded,
        attributed answers or drifts into hallucination. This section covers how to
        configure generation for maximum grounding, how to elicit citations, and how to
        detect when the model has gone off-context.
      </p>

      <ConceptBlock
        term="Grounded Generation"
        definition="Grounded generation is the practice of instructing an LLM to derive its response exclusively from explicitly provided context documents, rather than drawing on knowledge encoded in its weights during training. A well-grounded response is fully traceable to source text; every factual claim can be verified against a specific retrieved chunk."
      />

      <h2>Temperature and Sampling for RAG</h2>

      <p>
        Temperature controls the randomness of the model's sampling. For factual question-
        answering tasks, use a temperature of 0.0 to 0.3. At temperature 0, the model is
        maximally deterministic — the same prompt produces the same answer — which is ideal
        for consistency and easier evaluation. Slightly higher temperatures (0.1–0.3) add
        minor variation while still being factually conservative.
      </p>
      <p>
        Reserve higher temperatures (0.5+) for creative tasks like summarisation in a
        distinctive voice or generating multiple answer variants. For most production RAG
        applications, low temperature is the right default.
      </p>

      <h2>Eliciting Citations</h2>

      <p>
        The most reliable way to get cited responses is to number each context chunk with
        a label ([1], [2], ...) and explicitly instruct the model to cite each factual
        claim. Without this instruction, models sometimes produce uncited prose even when
        they have access to sources.
      </p>
      <p>
        For maximum reliability, combine citation instructions with structured output:
        instruct the model to return JSON with separate <code>answer</code> and
        <code>sources_used</code> fields. This makes citation extraction deterministic and
        eliminates the fragile regex parsing required to extract citations from free-text.
      </p>

      <h2>Hallucination Detection and Mitigation</h2>

      <p>
        Even well-grounded prompts can produce hallucinations. Three practical mitigations:
      </p>
      <ul>
        <li>
          <strong>Faithfulness scoring</strong>: After generation, ask a second LLM call
          to verify each sentence in the answer against the retrieved context. If a sentence
          cannot be verified, flag it. This is the basis of the RAGAS faithfulness metric.
        </li>
        <li>
          <strong>Abstention instruction</strong>: Include an explicit instruction: "If the
          context does not contain enough information to answer, say 'I don't know' rather
          than guessing." Models follow this instruction reliably when it is unambiguous.
        </li>
        <li>
          <strong>Retrieval confidence thresholding</strong>: If no retrieved chunk exceeds
          a minimum similarity score, short-circuit the generation entirely and return a
          "no information found" response without calling the LLM. This is the cheapest and
          most reliable hallucination prevention.
        </li>
      </ul>

      <h2>Streaming Responses</h2>

      <p>
        For user-facing applications, streaming the response token by token dramatically
        improves perceived latency. The Anthropic SDK supports streaming via
        <code>client.messages.stream()</code>. For RAG pipelines that return structured
        JSON, streaming is less useful because you need the complete JSON to parse it.
        Consider streaming for conversational interfaces and batch mode for structured output.
      </p>

      <NoteBlock
        type="tip"
        title="Two-call faithfulness verification"
        children='For high-stakes RAG applications (legal, medical, financial), add a lightweight second LLM call to verify the generated answer against the context. Prompt: "Does the following answer contain only information present in the context? List any claims that are NOT supported." This adds latency and cost but catches the ~3–5% of responses that contain unsupported assertions even with strong grounding instructions.'
      />

      <h2>Handling Multi-Document Synthesis</h2>

      <p>
        When multiple retrieved chunks address different aspects of a question, the model
        must synthesise across them. This is where RAG generation really earns its value —
        the model can reconcile, compare, and integrate information from several sources
        into a coherent answer that no single document contains.
      </p>
      <p>
        Guide synthesis with explicit instructions: "Synthesise information from all relevant
        context sources. If sources contradict each other, acknowledge the discrepancy and
        cite both." This prevents the model from arbitrarily preferring one source over
        another when they disagree.
      </p>

      <BestPracticeBlock title="Log generation inputs and outputs for every production request">
        Store the full prompt (system + context + query) alongside the generated response and
        all retrieved chunk IDs for every production request. This audit trail is essential
        for debugging hallucinations (compare the response against the context that was
        provided), for fine-tuning (use high-quality request-response pairs), and for
        compliance (demonstrate what information the model was given for each answer).
      </BestPracticeBlock>

      <h2>Structured Citation Generation in Practice</h2>

      <SDKExample
        title="RAG Response Generation with Structured Citations"
        tabs={{
          python: responseGenPython,
          typescript: responseGenTS,
        }}
      />

      <p>
        The implementation above returns a structured object containing the answer with
        inline citations, the list of source numbers used, a confidence signal, and the full
        citation metadata. This structure is directly consumable by a frontend to render
        clickable source references. Notice the JSON-parsing step that strips markdown code
        fences — models sometimes wrap JSON in backtick blocks even when instructed not to,
        so defensive parsing is necessary.
      </p>
    </div>
  );
}
