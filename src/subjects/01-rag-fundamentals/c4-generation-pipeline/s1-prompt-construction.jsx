import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

const promptConstructionPython = `from anthropic import Anthropic

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

print(response.content[0].text)`;

const promptConstructionTS = `import Anthropic from "@anthropic-ai/sdk";

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
  });`;

export default function PromptConstruction() {
  return (
    <div className="lesson-content">
      <h2>Prompt Construction</h2>

      <p>
        Retrieval gives you the relevant context; prompt construction determines whether the
        LLM can use it effectively. A poorly constructed RAG prompt can cause the model to
        ignore retrieved context, hallucinate facts not in the documents, or produce answers
        that are technically grounded but misleadingly incomplete. Getting prompt construction
        right is one of the highest-leverage improvements you can make to a RAG pipeline.
      </p>

      <ConceptBlock
        term="RAG Prompt"
        definition="A RAG prompt is a structured message pair (system + user) that presents retrieved context documents alongside the user's question in a way that instructs the LLM to base its answer on the provided text. Effective RAG prompts separate context from query, assign numbered source citations to each chunk, and include explicit grounding instructions that prevent the model from supplementing retrieved knowledge with parametric memory."
      />

      <h2>The Three Components of a RAG Prompt</h2>

      <h3>1. System Prompt — Grounding and Role</h3>
      <p>
        The system prompt establishes the model's role and, critically, its grounding
        constraints. The most important instruction is to answer only from the provided
        context and to acknowledge when the context is insufficient. Without this, models
        may silently blend retrieved facts with training knowledge, making it impossible to
        verify the source of any claim.
      </p>
      <p>
        Additional instructions to include: cite source numbers for each factual claim,
        use a specific response format if required (JSON, bullet points, executive summary),
        and describe the intended audience and tone.
      </p>

      <h3>2. Context Block — Retrieved Chunks</h3>
      <p>
        The context block is where retrieved chunks are assembled. Each chunk should be:
      </p>
      <ul>
        <li>
          <strong>Numbered</strong> with a citation label like [1], [2] so the model can
          reference specific sources.
        </li>
        <li>
          <strong>Annotated with source metadata</strong> (document title, URL, date) so
          the model can include attributable citations in its response.
        </li>
        <li>
          <strong>Separated</strong> from other chunks with a clear delimiter (dashes or
          blank lines) to prevent the model from conflating adjacent chunks.
        </li>
      </ul>
      <p>
        The placement of the context block matters for long contexts. For Claude, placing
        context before the question (as shown in the example) leverages the model's strong
        performance on tasks where background material precedes the query. Avoid burying
        the question inside the context block.
      </p>

      <h3>3. User Query — Clear and Unambiguous</h3>
      <p>
        The question should be presented on its own, clearly separated from the context by a
        visual delimiter. Label it explicitly (<code>QUESTION:</code>) so the model does not
        confuse it with a context document. If the original user query is ambiguous, consider
        a rewriting step before assembly (covered in the Advanced RAG section).
      </p>

      <h2>Citation Formats</h2>

      <p>
        There are three common citation patterns for RAG outputs:
      </p>
      <ul>
        <li>
          <strong>Inline bracketed citations</strong> [1] [2] — closest to academic style,
          easy to parse programmatically, allows post-processing to replace with hyperlinks.
        </li>
        <li>
          <strong>Footnotes</strong> — cleaner prose but harder to parse; useful for
          long-form reports.
        </li>
        <li>
          <strong>Structured JSON with sources array</strong> — best for programmatic
          downstream use; instruct the model to return
          <code>{"{"} "answer": "...", "sources": [1, 3] {"}"}</code> and extract the array.
        </li>
      </ul>

      <NoteBlock
        type="tip"
        title="Request structured citation output for APIs"
        children='When building a RAG API that returns structured data to a frontend, instruct the model to return JSON with separate "answer" and "sources" fields. Parse the source indices, then look up the corresponding chunk metadata to return rich citation objects (URL, title, page, excerpt). This enables your UI to render clickable citations without fragile regex parsing of free-text answers.'
      />

      <h2>Handling No-Retrieval Cases</h2>

      <p>
        Not every query will find relevant context. When retrieval returns nothing above
        the relevance threshold, you have three options:
      </p>
      <ol>
        <li>
          Send an empty context and rely on the system prompt's grounding instruction to
          produce a "I don't have information about this" response.
        </li>
        <li>
          Detect the empty retrieval case before calling the LLM and return a canned
          "no information found" response, saving the API call.
        </li>
        <li>
          Fall back to a web search tool for live information, then construct the prompt
          with the search results (covered in Corrective RAG).
        </li>
      </ol>

      <BestPracticeBlock title="Never pass raw retrieved text without formatting">
        Pasting unformatted chunks into a prompt confuses model and degradates citation quality.
        Always: (1) assign a numbered label to each chunk, (2) include the source metadata on
        the same line as the label, (3) trim leading/trailing whitespace and duplicate newlines,
        and (4) separate chunks with a horizontal delimiter. These four steps take under 10 lines
        of code and measurably improve answer quality.
      </BestPracticeBlock>

      <h2>Building a RAG Prompt in Practice</h2>

      <SDKExample
        title="RAG Prompt Construction with Citation"
        tabs={{
          python: promptConstructionPython,
          typescript: promptConstructionTS,
        }}
      />

      <p>
        The <code>build_rag_prompt</code> function above returns a reusable (system, messages)
        pair that can be passed directly to any Anthropic API call. Notice that the context
        block uses numbered citation labels and source annotations, the system prompt contains
        explicit grounding and citation instructions, and the user's question is cleanly
        separated from the context by a delimiter. This structure is the foundation of
        reliable, attributable RAG responses.
      </p>
    </div>
  );
}
