import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import FlowDiagram from '../../../components/viz/FlowDiagram.jsx';

const ragCode = `from anthropic import Anthropic
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
    return response.content[0].text`;

export default function WhatIsRAG() {
  return (
    <div className="lesson-content">
      <h2>What is RAG?</h2>

      <p>
        Large language models are trained on vast corpora of text — but that training has a hard
        cutoff date, and it never includes your private documents, internal wikis, or live data
        feeds. Ask a model about something that happened last month, and it will either confess
        ignorance or, worse, confidently fabricate an answer. Retrieval-Augmented Generation, known
        as RAG, is the standard engineering pattern for solving this problem.
      </p>

      <ConceptBlock
        title="Retrieval-Augmented Generation (RAG)"
        definition="RAG is an architecture that enhances a language model's responses by first retrieving relevant documents or passages from an external knowledge source, then injecting those retrieved pieces as context into the prompt before generation. The model's answer is therefore grounded in real, verifiable content rather than solely in what was baked into its weights during training."
      />

      <h2>Why RAG Exists: The Three Core Problems</h2>

      <p>
        To understand RAG's value, it helps to be precise about the problems it solves.
      </p>

      <h3>1. Training Cutoff</h3>
      <p>
        Every model has a knowledge cutoff — a date beyond which it has no training data. A model
        trained through early 2024 cannot answer questions about events, releases, or research
        published afterward. Rather than retraining the model (enormously expensive) or fine-tuning
        it frequently, RAG lets you push fresh information into the prompt at inference time.
      </p>

      <h3>2. Hallucination</h3>
      <p>
        Language models generate statistically plausible text. When they lack knowledge of a
        specific fact, they sometimes produce fluent-sounding fabrications. Grounding the model with
        retrieved source documents dramatically reduces this risk: the model can quote or paraphrase
        the provided text rather than inventing details. It also makes attribution possible — you
        can show users exactly which document each claim came from.
      </p>

      <h3>3. Private and Proprietary Data</h3>
      <p>
        Your company's internal documentation, customer support history, legal contracts, and
        product manuals were never part of any public training corpus. RAG is the practical way to
        give a language model access to that institutional knowledge without exposing it through
        fine-tuning or retraining.
      </p>

      <h2>The Core RAG Loop</h2>

      <p>
        Every RAG system, regardless of sophistication, follows the same fundamental loop. A user's
        question is transformed into a vector, that vector is used to retrieve semantically similar
        content from a knowledge base, and the retrieved content is combined with the original
        question before being handed to the language model.
      </p>

      <FlowDiagram
        steps={["Query", "Embed Query", "Vector Search", "Retrieve Chunks", "Augment Prompt", "Generate Answer"]}
        description="The six-step RAG pipeline: the user's question is embedded, searched against a vector store, retrieved as context, injected into the prompt, and finally answered by the LLM."
      />

      <p>
        Let's walk through each step in detail.
      </p>

      <h3>Step 1 — Query</h3>
      <p>
        The process begins with a natural language question or instruction from the user. At this
        stage it is just a string. The goal of the entire pipeline is to answer it accurately.
      </p>

      <h3>Step 2 — Embed Query</h3>
      <p>
        The query is converted into a dense numerical vector using an embedding model. This vector
        captures the semantic meaning of the question — not just the keywords. Two questions phrased
        differently but asking the same thing will produce similar vectors, enabling true semantic
        search rather than simple keyword matching.
      </p>

      <h3>Step 3 — Vector Search</h3>
      <p>
        The query vector is compared against a database of pre-computed document vectors using a
        similarity metric such as cosine similarity. The vector database returns the top-k most
        similar document chunks — typically the closest 3 to 10 results depending on context window
        budget and precision requirements.
      </p>

      <h3>Step 4 — Retrieve Chunks</h3>
      <p>
        The matched document chunks are fetched from storage. These are the actual text passages —
        paragraphs, sections, or fixed-size windows of your source documents — that were indexed
        ahead of time. Good chunking strategy has a large effect on final answer quality.
      </p>

      <h3>Step 5 — Augment Prompt</h3>
      <p>
        The retrieved chunks are assembled into a context block and injected into the prompt
        alongside the original question. A typical system prompt for this step instructs the model
        to answer based only on the provided context and to acknowledge when the context is
        insufficient. This instruction is what prevents the model from falling back on hallucinated
        training knowledge.
      </p>

      <h3>Step 6 — Generate Answer</h3>
      <p>
        The augmented prompt is sent to the language model, which reads both the retrieved context
        and the question, and generates a grounded response. Because the relevant information is
        directly in the context window, the model's answer reflects your actual data rather than
        parametric memory.
      </p>

      <h2>RAG vs. Fine-Tuning vs. Pure Prompting</h2>

      <p>
        RAG is not the only way to adapt a language model to a specific domain. It is worth
        understanding when each approach makes sense.
      </p>

      <h3>Pure Prompting</h3>
      <p>
        If the information you need is small enough to fit in the context window and changes
        infrequently, you can simply include it in every prompt. This is the simplest approach and
        works well for concise reference material — a pricing table, a list of valid product codes, a
        short FAQ. It does not scale to thousands of documents.
      </p>

      <h3>Fine-Tuning</h3>
      <p>
        Fine-tuning adapts the model's weights to a specific task or style, not to inject factual
        knowledge. It is best used when you need consistent output formatting, a particular tone, or
        strong performance on a narrow task type. Fine-tuning does not reliably implant new factual
        knowledge, and the resulting model becomes stale as your data changes. It is also more
        expensive and slower to iterate on than RAG.
      </p>

      <h3>RAG</h3>
      <p>
        RAG is the right choice when your knowledge base is large, changes over time, or needs to
        support attributable answers. It scales independently from the model — you can update your
        document index without touching the model at all. It is also cheaper to iterate on: changing
        your chunking strategy or adding new documents requires only re-indexing, not retraining.
      </p>

      <NoteBlock
        title="When is RAG the right choice?"
        content="Reach for RAG when your use case involves any of the following: a knowledge base larger than roughly 50–100 pages of text, documents that update more frequently than monthly, a requirement for source attribution, or private data that must not be exposed to model providers during training. For very small and stable reference material, consider whether a carefully crafted system prompt with the content inline is simpler and sufficient."
      />

      <h2>Key Benefits of RAG</h2>

      <h3>Freshness</h3>
      <p>
        Because retrieval happens at inference time, your answers reflect the current state of your
        document store. Re-index a document and the next query immediately benefits from the update.
        There is no model deployment cycle.
      </p>

      <h3>Grounding</h3>
      <p>
        The model's answer is tethered to real source material. This substantially reduces
        hallucination, particularly for factual questions where the model might otherwise rely on
        imprecise parametric memory.
      </p>

      <h3>Attribution</h3>
      <p>
        Because you know exactly which chunks were retrieved, you can display source citations
        alongside the answer. This is essential for enterprise applications where users need to
        verify claims, for regulated industries where auditability matters, and for any use case
        where trust depends on transparency.
      </p>

      <h3>Cost Efficiency</h3>
      <p>
        Retrieving the right 3–5 paragraphs and sending them with the query is vastly cheaper than
        sending an entire document library in every prompt. And updating your knowledge base is far
        cheaper than retraining or fine-tuning.
      </p>

      <h2>A Minimal RAG Implementation</h2>

      <p>
        The example below shows the core RAG pattern stripped to its essentials using the Anthropic
        SDK. In a production system you would replace the simplified retrieval with a real vector
        database and embedding model — the generation step shown here remains the same.
      </p>

      <SDKExample
        title="Minimal RAG with Anthropic SDK"
        language="python"
        code={ragCode}
        description="A minimal RAG pipeline: retrieve relevant documents, build a context string, inject it into the prompt, and generate a grounded answer using Claude."
      />

      <p>
        Notice the three clearly separated phases: retrieve, augment, generate. This separation is
        not just organizational — it means you can swap out or improve each phase independently.
        Better retrieval improves accuracy without touching the generation code. Prompt engineering
        improvements in the augmentation step affect quality without changing the retrieval logic.
        This modularity is one of RAG's practical engineering strengths.
      </p>
    </div>
  );
}
