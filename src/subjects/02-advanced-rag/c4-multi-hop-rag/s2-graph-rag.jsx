import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

const graphRagPython = `import json
from anthropic import Anthropic
import networkx as nx

client = Anthropic()

# ---- Build a Knowledge Graph from Documents ----

def extract_entities_and_relations(text: str) -> dict:
    """Extract (entity, relation, entity) triples from text using Claude."""
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        system='Extract knowledge graph triples. Return JSON: {"triples": [{"subject": "...", "relation": "...", "object": "..."}]}',
        messages=[{
            "role": "user",
            "content": (
                f"Extract all named entities and their relationships from this text "
                f"as (subject, relation, object) triples.\\n\\nText: {text}"
            )
        }],
    )
    raw = response.content[0].text.strip().strip("json").strip("")
    return json.loads(raw)

def build_knowledge_graph(documents: list[dict]) -> nx.DiGraph:
    """
    Build a directed knowledge graph from a collection of documents
    by extracting entity-relation-entity triples.
    """
    G = nx.DiGraph()

    for doc in documents:
        extracted = extract_entities_and_relations(doc["text"])
        for triple in extracted.get("triples", []):
            subject = triple["subject"].lower().strip()
            relation = triple["relation"].lower().strip()
            obj = triple["object"].lower().strip()

            # Add nodes with document source as metadata
            G.add_node(subject, sources=[doc["source"]])
            if obj in G:
                G.nodes[obj].setdefault("sources", []).append(doc["source"])
            else:
                G.add_node(obj, sources=[doc["source"]])

            # Add directed edge with relation label
            G.add_edge(subject, obj, relation=relation, source=doc["source"])

    return G

# ---- Graph-Enhanced Retrieval ----

def graph_retrieve(
    query: str,
    G: nx.DiGraph,
    seed_entities: list[str],
    max_hops: int = 2,
    max_nodes: int = 20,
) -> list[dict]:
    """
    Retrieve context by traversing the knowledge graph from seed entities.
    Returns a list of (subject, relation, object) triples as context.
    """
    visited = set()
    context_triples = []
    frontier = set(e.lower() for e in seed_entities if e.lower() in G)

    for hop in range(max_hops):
        next_frontier = set()
        for node in frontier:
            if node in visited or len(context_triples) >= max_nodes:
                break
            visited.add(node)

            # Outgoing edges
            for neighbor in G.successors(node):
                edge_data = G[node][neighbor]
                context_triples.append({
                    "subject": node,
                    "relation": edge_data.get("relation", "related_to"),
                    "object": neighbor,
                    "source": edge_data.get("source", ""),
                })
                next_frontier.add(neighbor)

            # Incoming edges (reverse traversal)
            for predecessor in G.predecessors(node):
                edge_data = G[predecessor][node]
                context_triples.append({
                    "subject": predecessor,
                    "relation": edge_data.get("relation", "related_to"),
                    "object": node,
                    "source": edge_data.get("source", ""),
                })
                next_frontier.add(predecessor)

        frontier = next_frontier - visited

    return context_triples

def extract_seed_entities(query: str) -> list[str]:
    """Extract named entities from the query to use as graph traversal seeds."""
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=128,
        system='Extract entities. Return JSON: {"entities": ["entity1", "entity2"]}',
        messages=[{"role": "user", "content": f"Extract all named entities from: {query}"}],
    )
    raw = response.content[0].text.strip().strip("json").strip("")
    return json.loads(raw).get("entities", [])

def graph_rag(query: str, G: nx.DiGraph) -> str:
    """Full GraphRAG pipeline: entity extraction → graph traversal → generation."""
    seeds = extract_seed_entities(query)
    print(f"Seed entities: {seeds}")

    triples = graph_retrieve(query, G, seeds, max_hops=2)
    print(f"Retrieved {len(triples)} graph triples")

    if not triples:
        return "Could not find relevant information in the knowledge graph."

    # Format triples as context
    context = "\\n".join(
        f"- {t['subject']} --[{t['relation']}]--> {t['object']}"
        for t in triples[:20]
    )

    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        system="Answer using the provided knowledge graph triples as context.",
        messages=[{"role": "user", "content": f"Knowledge Graph:\\n{context}\\n\\nQuestion: {query}"}],
    )
    return response.content[0].text

# Example
docs = [
    {"text": "Anthropic was founded by Dario Amodei and Daniela Amodei. Anthropic created Claude.", "source": "wiki"},
    {"text": "Claude is a large language model trained with Constitutional AI. Claude is used in RAG systems.", "source": "anthropic_docs"},
    {"text": "Constitutional AI was developed at Anthropic to make models safer and more helpful.", "source": "paper"},
]
# G = build_knowledge_graph(docs)
# answer = graph_rag("Who created Claude and what method was used to train it?", G)`;

export default function GraphRAG() {
  return (
    <div className="lesson-content">
      <h2>GraphRAG</h2>

      <p>
        Standard vector retrieval treats documents as independent bags of text and returns
        the most similar chunks. It cannot traverse relationships between entities across
        documents. If you need to answer "What are all the products made by the company that
        acquired CompanyX?" you need to follow a chain of relationships: CompanyX →
        acquired_by → AcquirerY → makes → [products]. Knowledge graphs make these
        relational paths explicit and traversable.
      </p>

      <ConceptBlock
        term="GraphRAG"
        definition="GraphRAG is a retrieval approach that combines knowledge graph construction with vector search. Documents are processed to extract entities and their relationships, forming a structured knowledge graph. At query time, entities mentioned in the query serve as starting nodes for graph traversal, retrieving both the directly relevant facts and their connected context through multi-hop graph walks. This enables relational and associative retrieval that flat vector search cannot achieve."
      />

      <h2>Knowledge Graph Construction</h2>

      <p>
        Building a knowledge graph from unstructured documents requires entity and relation
        extraction — also called information extraction or triple extraction. Each sentence
        in a document is parsed to produce (Subject, Relation, Object) triples:
      </p>
      <ul>
        <li>"Anthropic was founded by Dario Amodei" → (Anthropic, founded_by, Dario Amodei)</li>
        <li>"Claude uses Constitutional AI" → (Claude, uses, Constitutional AI)</li>
        <li>"Constitutional AI was developed at Anthropic" → (Constitutional AI, developed_at, Anthropic)</li>
      </ul>
      <p>
        These triples form the edges of a directed graph. LLMs are highly capable at
        triple extraction — a simple prompt asking for (subject, relation, object) tuples
        produces usable output for most document types.
      </p>

      <h2>Graph Traversal for Retrieval</h2>

      <p>
        At query time, named entities in the query are identified and used as starting
        nodes (seeds) for graph traversal. A breadth-first walk from each seed node
        collects neighbouring nodes and their edge labels within k hops. The collected
        triples are formatted as context for the LLM generation step.
      </p>
      <p>
        Graph traversal naturally surfaces multi-hop relational context. Starting from
        "Anthropic" and traversing 2 hops retrieves both "Anthropic → founded_by → Dario
        Amodei" and "Anthropic → created → Claude → uses → Constitutional AI" — connecting
        entities across documents in a way that vector search cannot.
      </p>

      <h2>Microsoft GraphRAG</h2>

      <p>
        Microsoft's GraphRAG paper and open-source implementation extends the basic approach
        with community detection and hierarchical summarisation. After building the entity
        graph, it applies graph community detection (Leiden algorithm) to identify clusters
        of closely related entities, then generates natural language summaries for each
        community. At query time, the system can retrieve at multiple granularities: specific
        entities, community summaries, or global corpus summaries. This makes it particularly
        powerful for large corpora where understanding themes and structure is as important
        as finding specific facts.
      </p>

      <h2>When to Use GraphRAG</h2>

      <p>
        GraphRAG adds significant complexity compared to standard vector RAG:
      </p>
      <ul>
        <li>Graph construction requires an LLM call per document chunk (expensive at scale).</li>
        <li>The graph must be rebuilt or updated when documents change.</li>
        <li>Graph traversal logic is more complex than a vector similarity query.</li>
      </ul>
      <p>
        Use GraphRAG when your queries are inherently relational — they traverse entity
        relationships rather than seeking textually similar passages. Typical use cases:
        knowledge bases about organisations and their relationships, scientific literature
        where paper-cites-paper graphs matter, product catalogs with hierarchical category
        and relationship structures.
      </p>

      <NoteBlock
        type="tip"
        title="Combine vector and graph retrieval"
        children="GraphRAG and vector RAG are complementary. Vector retrieval finds relevant text passages; graph traversal finds relevant entity relationships. A hybrid approach uses vector search to find the seed entities (the most relevant chunks) and then expands the context with graph traversal from those entities. This is often more effective than either approach alone."
      />

      <BestPracticeBlock title="Store source provenance on every graph edge">
        Every edge in your knowledge graph should record which document it came from.
        This enables two things: (1) you can return source citations for graph-retrieved
        facts, just as you do for vector-retrieved chunks; and (2) you can selectively
        update or remove edges when a source document changes, without rebuilding the
        entire graph. Source provenance is essential for both trust and maintainability.
      </BestPracticeBlock>

      <h2>GraphRAG with NetworkX</h2>

      <SDKExample
        title="Knowledge Graph Construction and GraphRAG"
        tabs={{ python: graphRagPython }}
      />

      <p>
        The implementation builds a knowledge graph using Claude to extract entity-relation
        triples from documents, stores the graph with NetworkX, and implements graph
        traversal from query-extracted seed entities. For production scale, replace NetworkX
        with a dedicated graph database (Neo4j, Amazon Neptune, or Weaviate's Knowledge
        Graph module) that can handle millions of nodes and edges with efficient traversal.
      </p>
    </div>
  );
}
