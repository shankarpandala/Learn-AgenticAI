import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

const loadersPython = `from langchain_community.document_loaders import (
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
print(f"Total chunks ready for embedding: {len(all_chunks)}")`;

const loadersTS = `import { PDFLoader } from "langchain/document_loaders/fs/pdf";
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

loadAndChunkDocuments();`;

export default function DocumentLoaders() {
  return (
    <div className="lesson-content">
      <h2>Document Loaders</h2>

      <p>
        Before a document can be chunked, embedded, and indexed, it must be loaded from its
        source format — a PDF file, an HTML page, a database row, a Markdown file, or a live
        API — and converted to plain text. Document loaders handle this conversion, extracting
        text and attaching source metadata so that chunks remain traceable back to their
        origin.
      </p>

      <ConceptBlock
        term="Document Loader"
        definition="A document loader is a component that reads documents from a source (filesystem, URL, database, API) and returns a list of Document objects, each containing a page_content string and a metadata dictionary. Loaders abstract over format-specific parsing so that the rest of your pipeline (splitters, embedders, vector stores) can work with a uniform interface regardless of source format."
      />

      <h2>PDF Loaders</h2>

      <p>
        PDFs are one of the most common enterprise document formats, and loading them
        correctly is non-trivial. PDFs encode visual layout rather than semantic structure,
        so extracting text requires heuristics to handle multi-column layouts, headers,
        footers, tables, and embedded images.
      </p>
      <p>
        <strong>PyPDF</strong> is the lightest option — pure Python, fast, and adequate for
        text-heavy PDFs without complex layouts. It extracts text page by page and attaches
        the page number as metadata, which is invaluable for generating source citations.
      </p>
      <p>
        <strong>Unstructured</strong> is the most capable open-source PDF parser. It uses
        document intelligence models to classify page elements (title, narrative text, table,
        header) and can reconstruct table data as structured text. It handles scanned PDFs
        via OCR when configured with Tesseract. For high-stakes enterprise documents,
        Unstructured's document-element-aware chunking produces significantly better results
        than page-level splitting.
      </p>
      <p>
        <strong>AWS Textract, Google Document AI, Azure Form Recognizer</strong> are managed
        cloud services for PDF extraction. They provide state-of-the-art table and form
        extraction at the cost of per-page pricing and external data transmission.
      </p>

      <h2>HTML and Web Loaders</h2>

      <p>
        For web content, HTML loaders strip tags and extract the visible text. The key
        challenge is noise: navigation menus, cookie banners, advertisements, and footers
        should not pollute your chunks. Good HTML loaders target the main content element
        (<code>&lt;main&gt;</code>, <code>&lt;article&gt;</code>) and ignore boilerplate.
      </p>
      <p>
        LangChain's <strong>CheerioWebBaseLoader</strong> fetches a URL and parses it with
        the server-side jQuery-compatible Cheerio library. For JavaScript-heavy single-page
        applications that require browser rendering, use <strong>PlaywrightURLLoader</strong>
        or <strong>SeleniumURLLoader</strong>, which render the page in a headless browser
        before extracting text.
      </p>

      <h2>Markdown Loaders</h2>

      <p>
        Markdown is the native format of most developer documentation, wikis, and README
        files. A structure-aware Markdown loader reads heading levels and creates chunks
        bounded by headers, attaching the full header path as metadata. This is the
        recommended approach for documentation corpora because it produces the most
        semantically coherent chunks.
      </p>

      <h2>Database and Structured Data Loaders</h2>

      <p>
        Not all knowledge lives in documents. Product catalogs, customer records, and
        transactional data live in relational databases. Loaders for structured data need
        to convert rows into prose representations that embed meaningfully.
      </p>
      <p>
        For CSVs and spreadsheets, each row can be serialised as "Field: Value, Field: Value"
        text. For SQL databases, <strong>SQLDatabase</strong> loaders execute queries and
        convert result sets to text. For the best retrieval quality, consider generating
        natural language summaries of complex rows using an LLM during the indexing phase —
        this is more expensive but produces dramatically better embeddings for tabular data.
      </p>

      <h2>Other Common Loaders</h2>

      <ul>
        <li>
          <strong>DOCX / Office formats</strong> — <code>Docx2txtLoader</code> and
          <code>UnstructuredWordDocumentLoader</code> handle Microsoft Word files.
        </li>
        <li>
          <strong>Notion, Confluence, Google Docs</strong> — API-based loaders that authenticate
          and fetch pages from knowledge management systems. Typically rate-limited; build
          incremental sync rather than full re-index on each run.
        </li>
        <li>
          <strong>Email (EML/MBOX)</strong> — <code>UnstructuredEmailLoader</code> parses email
          headers and bodies. Useful for support ticket knowledge bases.
        </li>
        <li>
          <strong>YouTube transcripts</strong> — <code>YoutubeLoader</code> fetches auto-generated
          or human captions. Effective for indexing training video content.
        </li>
        <li>
          <strong>Git repositories</strong> — <code>GitLoader</code> walks a repo and loads
          source files, docstrings, and README files. Feeds code-search RAG pipelines.
        </li>
      </ul>

      <NoteBlock
        type="note"
        title="Metadata is as important as content"
        children="Every loader should attach at minimum: source (file path or URL), file_type, and ingested_at (timestamp). PDF loaders should add page number; web loaders should add url and title. This metadata powers filtering and citation — without it, you cannot tell users where a retrieved chunk came from."
      />

      <BestPracticeBlock title="Build an incremental ingestion pipeline">
        Track a content hash or last-modified timestamp for each source document. On each
        pipeline run, skip documents that have not changed. Only re-chunk and re-embed
        modified or new documents. This reduces indexing cost by 80–95% for mature corpora
        where most documents are stable, and it keeps your index fresh without full rebuilds.
      </BestPracticeBlock>

      <h2>Loading Documents in Practice</h2>

      <SDKExample
        title="Document Loaders with LangChain"
        tabs={{
          python: loadersPython,
          typescript: loadersTS,
        }}
      />

      <p>
        The example demonstrates loading from four different source types — PDF, HTML, CSV,
        and a directory of Markdown files — and then splitting all loaded documents into
        chunks ready for embedding. The <code>metadata</code> dict on each chunk carries
        the source path through the pipeline, ensuring that every vector in the store can
        be traced back to its origin document.
      </p>
    </div>
  );
}
