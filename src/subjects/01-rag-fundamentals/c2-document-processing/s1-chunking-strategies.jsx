import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

const chunkingPython = `from langchain.text_splitter import (
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
    print(f"Section: {chunk.metadata} | Length: {len(chunk.page_content)}")`;

const chunkingTS = `import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
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

demonstrateChunking();`;

export default function ChunkingStrategies() {
  return (
    <div className="lesson-content">
      <h2>Chunking Strategies</h2>

      <p>
        Chunking is the process of splitting source documents into smaller, retrievable units
        before embedding them into a vector store. The way you chunk has a larger effect on
        retrieval quality than almost any other pipeline decision — a well-tuned chunking
        strategy can improve retrieval recall by 20–40% over a naive fixed-size split.
      </p>

      <ConceptBlock
        term="Document Chunk"
        definition="A chunk is a contiguous segment of source text that is embedded as a single vector and stored as one retrievable unit. At query time, the top-k most similar chunks are fetched and assembled into the LLM's context window. The goal is to make each chunk self-contained enough to be informative in isolation, while small enough for the embedding to capture its specific meaning precisely."
      />

      <h2>Fixed-Size Chunking</h2>

      <p>
        The simplest strategy splits text into chunks of exactly n tokens (or characters),
        optionally with an overlap between adjacent chunks. Fixed-size chunking requires no
        understanding of the document's structure and is fast to implement.
      </p>
      <p>
        The main weakness is that it ignores natural boundaries. A 512-token window that
        starts mid-sentence or cuts a table in half produces chunks that are hard to
        understand in isolation. The embedding of a poorly bounded chunk may not capture its
        full meaning, degrading retrieval quality.
      </p>
      <p>
        Fixed-size chunking is best used as a quick baseline or for highly uniform documents
        like database exports or structured logs where semantic boundaries are less important.
      </p>

      <h2>Recursive Character Splitting</h2>

      <p>
        Recursive splitting is the recommended default for unstructured text. It works by
        trying a hierarchy of separators in order — double newlines first, then single
        newlines, then sentences, then words, then individual characters — and splits only
        when the current chunk exceeds the target size. The result is chunks that respect
        paragraph and sentence boundaries whenever possible.
      </p>
      <p>
        LangChain's <code>RecursiveCharacterTextSplitter</code> is the most widely used
        implementation. The default separator list works well for English prose. For code,
        use language-specific separators (function boundaries, class definitions) to keep
        logical units intact.
      </p>

      <h2>Semantic Chunking</h2>

      <p>
        Semantic chunking embeds sentences or paragraphs individually, then groups adjacent
        sentences together as long as their embeddings remain similar. When the similarity
        between successive sentences drops below a threshold, a chunk boundary is placed.
        This produces chunks that are topically coherent rather than mechanically uniform.
      </p>
      <p>
        The trade-off is cost and latency: semantic chunking requires embedding every sentence
        during the indexing phase, which multiplies embedding API calls. For large corpora this
        can be expensive. It pays off when documents cover multiple unrelated topics within a
        single file, such as a research paper that transitions between methods and results and
        discussion sections.
      </p>

      <h2>Document-Aware (Structure-Aware) Chunking</h2>

      <p>
        Document-aware chunking uses the inherent structure of the document format — headings
        in Markdown or HTML, section breaks in PDFs, table boundaries in spreadsheets — as
        natural chunk boundaries. A Markdown document splits at <code>##</code> headers;
        an HTML page splits at <code>&lt;section&gt;</code> or <code>&lt;article&gt;</code>
        tags; a PDF splits at detected section titles.
      </p>
      <p>
        This approach produces the most semantically coherent chunks because each chunk
        corresponds to a human-authored unit of content. The chunks also carry rich metadata:
        the section title, depth in the document hierarchy, and parent heading context. This
        metadata can be used later for metadata filtering, which dramatically improves
        retrieval precision.
      </p>

      <h2>Chunk Overlap</h2>

      <p>
        All strategies benefit from overlapping adjacent chunks by 10–20% of the chunk size.
        Overlap ensures that a concept that straddles a chunk boundary appears in at least one
        chunk in its full context. A chunk split in the middle of a multi-step process will
        appear in both the preceding and following chunks, so retrieval of either chunk gives
        the LLM enough context to understand the step.
      </p>

      <NoteBlock
        type="tip"
        title="Recommended starting parameters"
        children="For general prose, start with RecursiveCharacterTextSplitter at chunk_size=512 tokens (roughly 400 words) and chunk_overlap=50 tokens. For technical documentation, use 256–384 tokens to keep chunks tightly focused. Always measure retrieval recall on a held-out query set before committing to a chunk size — the right size depends heavily on your specific corpus and query distribution."
      />

      <h2>The Parent-Child Chunk Pattern</h2>

      <p>
        An advanced technique is to index small child chunks for retrieval (256 tokens, high
        precision) but return their larger parent chunks (1024 tokens, rich context) to the
        LLM. The child embedding captures specific meaning precisely; the parent chunk gives
        the model enough surrounding context to reason about it. This decouples retrieval
        precision from generation context richness.
      </p>

      <BestPracticeBlock title="Preserve heading context in chunk metadata">
        When splitting structured documents, store the section path (e.g., "Installation &gt;
        Configuration &gt; Environment Variables") as metadata on every child chunk. This
        enables metadata filtering and also allows you to prepend the section title to the
        chunk text before embedding — significantly improving retrieval accuracy for
        questions about specific sections.
      </BestPracticeBlock>

      <h2>Chunking in Practice</h2>

      <SDKExample
        title="Chunking Strategies with LangChain"
        tabs={{
          python: chunkingPython,
          typescript: chunkingTS,
        }}
      />

      <p>
        The example above shows three strategies: fixed-size, recursive, and Markdown-aware
        splitting. In a real pipeline you would feed the resulting chunks directly to an
        embedding API and then upsert them into a vector store. The metadata attached by
        document-aware splitters (section titles, header hierarchy) flows through to the
        vector store and is available for filtering at query time.
      </p>
    </div>
  );
}
