import{$ as C,a0 as T,j as e,r as y,a1 as v,a2 as j,a3 as w}from"./vendor-Cs56uELc.js";import{A as I}from"./subject-06-coding-agents-CkPlWyTH.js";const k=C(T((n,o)=>({theme:"dark",completedSections:[],bookmarks:[],setTheme:r=>n({theme:r}),toggleTheme:()=>n(r=>({theme:r.theme==="dark"?"light":"dark"})),markSectionComplete:(r,t,a)=>{const s=`${r}::${t}::${a}`;n(i=>i.completedSections.includes(s)?i:{completedSections:[...i.completedSections,s]})},isComplete:(r,t,a)=>{const s=`${r}::${t}::${a}`;return o().completedSections.includes(s)},bookmarkSection:(r,t,a,s)=>{n(i=>i.bookmarks.some(l=>l.subjectId===r&&l.chapterId===t&&l.sectionId===a)?i:{bookmarks:[...i.bookmarks,{subjectId:r,chapterId:t,sectionId:a,title:s}]})},removeBookmark:(r,t,a)=>{n(s=>({bookmarks:s.bookmarks.filter(i=>!(i.subjectId===r&&i.chapterId===t&&i.sectionId===a))}))},getSubjectProgress:(r,t)=>{if(!t||t===0)return 0;const a=o().completedSections.filter(s=>s.startsWith(`${r}::`)).length;return Math.round(a/t*100)}}),{name:"learn-agenticai-app-store",partialize:n=>({theme:n.theme,completedSections:n.completedSections,bookmarks:n.bookmarks})}));function h({term:n,children:o,tag:r}){return e.jsxs("div",{className:"my-6 rounded-xl border border-cyan-200 bg-gradient-to-br from-cyan-50/80 to-blue-50/40 px-5 py-4 dark:border-cyan-800/50 dark:from-cyan-950/30 dark:to-blue-950/20",children:[e.jsxs("div",{className:"mb-2 flex items-start justify-between gap-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:"text-cyan-500 dark:text-cyan-400 shrink-0 mt-0.5","aria-hidden":"true",children:[e.jsx("path",{d:"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"}),e.jsx("path",{d:"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"})]}),e.jsx("span",{className:"text-xs font-semibold uppercase tracking-widest text-cyan-600 dark:text-cyan-400",children:"Concept"})]}),r&&e.jsx("span",{className:"rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",children:r})]}),n&&e.jsx("h3",{className:"mb-2 text-base font-bold text-gray-900 dark:text-gray-100",children:n}),e.jsx("div",{className:"text-sm text-gray-700 dark:text-gray-300 leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0",children:o})]})}const f={note:{border:"border-blue-200 dark:border-blue-800/50",bg:"bg-blue-50/60 dark:bg-blue-950/30",icon:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("line",{x1:"12",y1:"8",x2:"12",y2:"12"}),e.jsx("line",{x1:"12",y1:"16",x2:"12.01",y2:"16"})]}),iconColor:"text-blue-500 dark:text-blue-400",labelColor:"text-blue-700 dark:text-blue-300",label:"Note"},tip:{border:"border-emerald-200 dark:border-emerald-800/50",bg:"bg-emerald-50/60 dark:bg-emerald-950/30",icon:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("path",{d:"M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"}),e.jsx("line",{x1:"9",y1:"21",x2:"15",y2:"21"}),e.jsx("line",{x1:"10",y1:"17",x2:"14",y2:"17"})]}),iconColor:"text-emerald-500 dark:text-emerald-400",labelColor:"text-emerald-700 dark:text-emerald-300",label:"Tip"},intuition:{border:"border-violet-200 dark:border-violet-800/50",bg:"bg-violet-50/60 dark:bg-violet-950/30",icon:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:e.jsx("polygon",{points:"13 2 3 14 12 14 11 22 21 10 12 10 13 2"})}),iconColor:"text-violet-500 dark:text-violet-400",labelColor:"text-violet-700 dark:text-violet-300",label:"Intuition"},historical:{border:"border-amber-200 dark:border-amber-800/50",bg:"bg-amber-50/60 dark:bg-amber-950/30",icon:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polyline",{points:"12 6 12 12 16 14"})]}),iconColor:"text-amber-500 dark:text-amber-400",labelColor:"text-amber-700 dark:text-amber-300",label:"Context"}};function g({type:n="note",title:o,children:r}){const t=f[n]??f.note,a=o??t.label;return e.jsxs("aside",{className:`my-6 rounded-xl border ${t.border} ${t.bg} px-5 py-4`,role:"note",children:[e.jsxs("div",{className:`mb-2 flex items-center gap-2 text-sm font-semibold ${t.iconColor}`,children:[t.icon,e.jsx("span",{className:t.labelColor,children:a})]}),e.jsx("div",{className:"text-sm text-gray-700 dark:text-gray-300 leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0",children:r})]})}function R(){return e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("rect",{x:"9",y:"9",width:"13",height:"13",rx:"2",ry:"2"}),e.jsx("path",{d:"M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"})]})}function q(){return e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:e.jsx("polyline",{points:"20 6 9 17 4 12"})})}const x={python:{label:"Python",lang:"python"},typescript:{label:"TypeScript",lang:"typescript"},javascript:{label:"JavaScript",lang:"javascript"},yaml:{label:"YAML",lang:"yaml"},json:{label:"JSON",lang:"json"},bash:{label:"Bash",lang:"bash"},dockerfile:{label:"Dockerfile",lang:"dockerfile"}};function p({title:n,tabs:o={}}){const r=k(c=>c.theme),t=Object.keys(o).filter(c=>c in x&&o[c]),[a,s]=y.useState(t[0]??""),[i,d]=y.useState(!1);if(!t.length)return null;const l=x[a],m=(o[a]??"").trim(),S=async()=>{try{await navigator.clipboard.writeText(m),d(!0),setTimeout(()=>d(!1),2e3)}catch{}};return e.jsxs("div",{className:"my-6 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700/60",children:[n&&e.jsx("div",{className:"border-b border-gray-200 bg-gray-50/80 px-4 py-2.5 dark:border-gray-700/60 dark:bg-gray-800/40",children:e.jsx("span",{className:"text-xs font-semibold text-gray-600 dark:text-gray-300",children:n})}),e.jsxs("div",{className:"flex items-center justify-between border-b border-gray-200 bg-gray-50 dark:border-gray-700/60 dark:bg-gray-800/60",children:[e.jsx("div",{className:"flex items-end gap-0 px-3 pt-1.5",children:t.map(c=>{const _=x[c],b=c===a;return e.jsx("button",{type:"button",onClick:()=>s(c),className:`rounded-t-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${b?"bg-white text-gray-900 border border-b-white border-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700/60 dark:border-b-gray-900":"text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`,"aria-selected":b,role:"tab",children:_.label},c)})}),e.jsxs("button",{type:"button",onClick:S,className:"mr-3 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500","aria-label":i?"Copied":"Copy code",children:[i?e.jsx(q,{}):e.jsx(R,{}),e.jsx("span",{children:i?"Copied!":"Copy"})]})]}),e.jsx("div",{className:"overflow-x-auto text-sm [&>pre]:!m-0 [&>pre]:!rounded-none [&>pre]:!border-0",children:e.jsx(v,{language:l?.lang??"text",style:r==="dark"?j:w,customStyle:{margin:0,borderRadius:0,fontSize:"0.8125rem",lineHeight:"1.6",background:r==="dark"?"#1a1d23":"#ffffff"},showLineNumbers:m.split(`
`).length>5,wrapLines:!0,children:m})})]})}function N({steps:n=[],direction:o="horizontal",title:r}){const t=o==="horizontal",a=[{bg:"bg-cyan-50 dark:bg-cyan-950/40",border:"border-cyan-200 dark:border-cyan-800/50",text:"text-cyan-700 dark:text-cyan-300",num:"bg-cyan-500"},{bg:"bg-violet-50 dark:bg-violet-950/40",border:"border-violet-200 dark:border-violet-800/50",text:"text-violet-700 dark:text-violet-300",num:"bg-violet-500"},{bg:"bg-emerald-50 dark:bg-emerald-950/40",border:"border-emerald-200 dark:border-emerald-800/50",text:"text-emerald-700 dark:text-emerald-300",num:"bg-emerald-500"},{bg:"bg-amber-50 dark:bg-amber-950/40",border:"border-amber-200 dark:border-amber-800/50",text:"text-amber-700 dark:text-amber-300",num:"bg-amber-500"},{bg:"bg-blue-50 dark:bg-blue-950/40",border:"border-blue-200 dark:border-blue-800/50",text:"text-blue-700 dark:text-blue-300",num:"bg-blue-500"},{bg:"bg-pink-50 dark:bg-pink-950/40",border:"border-pink-200 dark:border-pink-800/50",text:"text-pink-700 dark:text-pink-300",num:"bg-pink-500"}];return e.jsxs("figure",{className:"my-6 rounded-xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-700/60 dark:bg-gray-900/30",children:[r&&e.jsx("figcaption",{className:"mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300",children:r}),e.jsx("div",{className:`flex ${t?"flex-row flex-wrap":"flex-col"} items-start gap-2`,children:n.map((s,i)=>{const d=a[i%a.length],l=i===n.length-1;return e.jsxs("div",{className:`flex ${t?"flex-row":"flex-col"} items-center gap-2`,children:[e.jsxs("div",{className:`rounded-lg border ${d.border} ${d.bg} px-3.5 py-2.5 min-w-[100px]`,children:[e.jsxs("div",{className:"flex items-center gap-2 mb-0.5",children:[e.jsx("span",{className:`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${d.num} text-[10px] font-bold text-white`,children:i+1}),e.jsx("span",{className:`text-xs font-semibold ${d.text}`,children:s.label})]}),s.description&&e.jsx("p",{className:"text-xs text-gray-500 dark:text-gray-400 leading-snug mt-1",children:s.description})]}),!l&&e.jsx("span",{className:`text-gray-400 dark:text-gray-600 ${t?"rotate-0":"rotate-90"} text-base select-none`,"aria-hidden":"true",children:"→"})]},i)})})]})}const L=`from anthropic import Anthropic
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
    return response.content[0].text`;function B(){return e.jsxs("div",{className:"lesson-content",children:[e.jsx("h2",{children:"What is RAG?"}),e.jsx("p",{children:"Large language models are trained on vast corpora of text — but that training has a hard cutoff date, and it never includes your private documents, internal wikis, or live data feeds. Ask a model about something that happened last month, and it will either confess ignorance or, worse, confidently fabricate an answer. Retrieval-Augmented Generation, known as RAG, is the standard engineering pattern for solving this problem."}),e.jsx(h,{title:"Retrieval-Augmented Generation (RAG)",definition:"RAG is an architecture that enhances a language model's responses by first retrieving relevant documents or passages from an external knowledge source, then injecting those retrieved pieces as context into the prompt before generation. The model's answer is therefore grounded in real, verifiable content rather than solely in what was baked into its weights during training."}),e.jsx("h2",{children:"Why RAG Exists: The Three Core Problems"}),e.jsx("p",{children:"To understand RAG's value, it helps to be precise about the problems it solves."}),e.jsx("h3",{children:"1. Training Cutoff"}),e.jsx("p",{children:"Every model has a knowledge cutoff — a date beyond which it has no training data. A model trained through early 2024 cannot answer questions about events, releases, or research published afterward. Rather than retraining the model (enormously expensive) or fine-tuning it frequently, RAG lets you push fresh information into the prompt at inference time."}),e.jsx("h3",{children:"2. Hallucination"}),e.jsx("p",{children:"Language models generate statistically plausible text. When they lack knowledge of a specific fact, they sometimes produce fluent-sounding fabrications. Grounding the model with retrieved source documents dramatically reduces this risk: the model can quote or paraphrase the provided text rather than inventing details. It also makes attribution possible — you can show users exactly which document each claim came from."}),e.jsx("h3",{children:"3. Private and Proprietary Data"}),e.jsx("p",{children:"Your company's internal documentation, customer support history, legal contracts, and product manuals were never part of any public training corpus. RAG is the practical way to give a language model access to that institutional knowledge without exposing it through fine-tuning or retraining."}),e.jsx("h2",{children:"The Core RAG Loop"}),e.jsx("p",{children:"Every RAG system, regardless of sophistication, follows the same fundamental loop. A user's question is transformed into a vector, that vector is used to retrieve semantically similar content from a knowledge base, and the retrieved content is combined with the original question before being handed to the language model."}),e.jsx(N,{steps:["Query","Embed Query","Vector Search","Retrieve Chunks","Augment Prompt","Generate Answer"],description:"The six-step RAG pipeline: the user's question is embedded, searched against a vector store, retrieved as context, injected into the prompt, and finally answered by the LLM."}),e.jsx("p",{children:"Let's walk through each step in detail."}),e.jsx("h3",{children:"Step 1 — Query"}),e.jsx("p",{children:"The process begins with a natural language question or instruction from the user. At this stage it is just a string. The goal of the entire pipeline is to answer it accurately."}),e.jsx("h3",{children:"Step 2 — Embed Query"}),e.jsx("p",{children:"The query is converted into a dense numerical vector using an embedding model. This vector captures the semantic meaning of the question — not just the keywords. Two questions phrased differently but asking the same thing will produce similar vectors, enabling true semantic search rather than simple keyword matching."}),e.jsx("h3",{children:"Step 3 — Vector Search"}),e.jsx("p",{children:"The query vector is compared against a database of pre-computed document vectors using a similarity metric such as cosine similarity. The vector database returns the top-k most similar document chunks — typically the closest 3 to 10 results depending on context window budget and precision requirements."}),e.jsx("h3",{children:"Step 4 — Retrieve Chunks"}),e.jsx("p",{children:"The matched document chunks are fetched from storage. These are the actual text passages — paragraphs, sections, or fixed-size windows of your source documents — that were indexed ahead of time. Good chunking strategy has a large effect on final answer quality."}),e.jsx("h3",{children:"Step 5 — Augment Prompt"}),e.jsx("p",{children:"The retrieved chunks are assembled into a context block and injected into the prompt alongside the original question. A typical system prompt for this step instructs the model to answer based only on the provided context and to acknowledge when the context is insufficient. This instruction is what prevents the model from falling back on hallucinated training knowledge."}),e.jsx("h3",{children:"Step 6 — Generate Answer"}),e.jsx("p",{children:"The augmented prompt is sent to the language model, which reads both the retrieved context and the question, and generates a grounded response. Because the relevant information is directly in the context window, the model's answer reflects your actual data rather than parametric memory."}),e.jsx("h2",{children:"RAG vs. Fine-Tuning vs. Pure Prompting"}),e.jsx("p",{children:"RAG is not the only way to adapt a language model to a specific domain. It is worth understanding when each approach makes sense."}),e.jsx("h3",{children:"Pure Prompting"}),e.jsx("p",{children:"If the information you need is small enough to fit in the context window and changes infrequently, you can simply include it in every prompt. This is the simplest approach and works well for concise reference material — a pricing table, a list of valid product codes, a short FAQ. It does not scale to thousands of documents."}),e.jsx("h3",{children:"Fine-Tuning"}),e.jsx("p",{children:"Fine-tuning adapts the model's weights to a specific task or style, not to inject factual knowledge. It is best used when you need consistent output formatting, a particular tone, or strong performance on a narrow task type. Fine-tuning does not reliably implant new factual knowledge, and the resulting model becomes stale as your data changes. It is also more expensive and slower to iterate on than RAG."}),e.jsx("h3",{children:"RAG"}),e.jsx("p",{children:"RAG is the right choice when your knowledge base is large, changes over time, or needs to support attributable answers. It scales independently from the model — you can update your document index without touching the model at all. It is also cheaper to iterate on: changing your chunking strategy or adding new documents requires only re-indexing, not retraining."}),e.jsx(g,{title:"When is RAG the right choice?",content:"Reach for RAG when your use case involves any of the following: a knowledge base larger than roughly 50–100 pages of text, documents that update more frequently than monthly, a requirement for source attribution, or private data that must not be exposed to model providers during training. For very small and stable reference material, consider whether a carefully crafted system prompt with the content inline is simpler and sufficient."}),e.jsx("h2",{children:"Key Benefits of RAG"}),e.jsx("h3",{children:"Freshness"}),e.jsx("p",{children:"Because retrieval happens at inference time, your answers reflect the current state of your document store. Re-index a document and the next query immediately benefits from the update. There is no model deployment cycle."}),e.jsx("h3",{children:"Grounding"}),e.jsx("p",{children:"The model's answer is tethered to real source material. This substantially reduces hallucination, particularly for factual questions where the model might otherwise rely on imprecise parametric memory."}),e.jsx("h3",{children:"Attribution"}),e.jsx("p",{children:"Because you know exactly which chunks were retrieved, you can display source citations alongside the answer. This is essential for enterprise applications where users need to verify claims, for regulated industries where auditability matters, and for any use case where trust depends on transparency."}),e.jsx("h3",{children:"Cost Efficiency"}),e.jsx("p",{children:"Retrieving the right 3–5 paragraphs and sending them with the query is vastly cheaper than sending an entire document library in every prompt. And updating your knowledge base is far cheaper than retraining or fine-tuning."}),e.jsx("h2",{children:"A Minimal RAG Implementation"}),e.jsx("p",{children:"The example below shows the core RAG pattern stripped to its essentials using the Anthropic SDK. In a production system you would replace the simplified retrieval with a real vector database and embedding model — the generation step shown here remains the same."}),e.jsx(p,{title:"Minimal RAG with Anthropic SDK",language:"python",code:L,description:"A minimal RAG pipeline: retrieve relevant documents, build a context string, inject it into the prompt, and generate a grounded answer using Claude."}),e.jsx("p",{children:"Notice the three clearly separated phases: retrieve, augment, generate. This separation is not just organizational — it means you can swap out or improve each phase independently. Better retrieval improves accuracy without touching the generation code. Prompt engineering improvements in the augmentation step affect quality without changing the retrieval logic. This modularity is one of RAG's practical engineering strengths."})]})}const W=Object.freeze(Object.defineProperty({__proto__:null,default:B},Symbol.toStringTag,{value:"Module"})),G=`import voyageai
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
print(f"Similarity between text 1 and 2: {similarity:.3f}")`;function E(){return e.jsxs("div",{className:"lesson-content",children:[e.jsx("h2",{children:"Vector Embeddings for RAG"}),e.jsx("p",{children:"The retrieval step in any RAG pipeline depends on a mechanism for finding relevant documents given a user's question. Keyword search can work for exact matches, but it breaks down when the user phrases their question differently from how the document was written. Vector embeddings solve this by representing both queries and documents as points in a mathematical space where proximity means semantic similarity, not textual overlap."}),e.jsx(h,{title:"Vector Embeddings",definition:"An embedding is a dense numerical vector — an ordered list of floating-point numbers — that encodes the semantic meaning of a piece of text. Embedding models are trained to map text into a high-dimensional space such that texts with similar meanings land near each other, regardless of the specific words used. The distance between two vectors in this space is a proxy for semantic similarity."}),e.jsx("h2",{children:"How Embedding Models Work"}),e.jsx("p",{children:"Modern embedding models are built on the same transformer architecture that powers generative language models, but with a different training objective. Rather than predicting the next token, an embedding model is trained to produce vector representations where semantically related inputs are pulled closer together and unrelated inputs are pushed apart."}),e.jsx("p",{children:"This training often uses contrastive learning: the model sees pairs of related texts (treated as positive pairs) and unrelated texts (negative pairs), and it is rewarded for assigning high similarity to positive pairs and low similarity to negative ones. After training on massive amounts of this data, the model develops a compressed geometric representation of language where meaning is encoded in direction and distance."}),e.jsx("p",{children:"When you call an embedding model with a sentence, it processes the tokens through its transformer layers and outputs a single fixed-length vector — the embedding. This vector has no inherent human-readable meaning, but its relationship to other vectors is rich with semantic structure."}),e.jsx("h2",{children:"Key Properties of Embeddings"}),e.jsx("h3",{children:"Semantic Similarity"}),e.jsx("p",{children:'The most important property of a good embedding model is that it clusters semantically similar text together. "The car broke down on the highway" and "My vehicle stalled on the freeway" should produce vectors that are very close in the embedding space, even though they share almost no vocabulary. This is what makes embeddings so powerful for retrieval: a question like "How do I reset my password?" will find a document that says "Account credential recovery steps" even though the words do not overlap.'}),e.jsx("h3",{children:"Distance Metrics"}),e.jsx("p",{children:"Two distance metrics dominate in RAG applications."}),e.jsxs("p",{children:[e.jsx("strong",{children:"Cosine similarity"})," measures the angle between two vectors, ranging from -1 (opposite directions) to 1 (same direction). It is invariant to the magnitude of the vectors, which means it compares meaning rather than length. This makes it robust to variations in text length and is the most common metric in RAG systems."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Dot product"})," is the sum of element-wise products. When vectors are normalized to unit length — a common practice — dot product and cosine similarity become equivalent. Many vector databases use dot product internally for performance reasons because it maps naturally to hardware-optimized matrix operations."]}),e.jsx("p",{children:"Euclidean distance (straight-line distance in high-dimensional space) is used less frequently for text because it is sensitive to vector magnitude, which can conflate length effects with semantic ones."}),e.jsx("h2",{children:"Choosing an Embedding Model"}),e.jsx("p",{children:"Not all embedding models are equivalent, and the choice has a direct impact on retrieval quality. The main trade-offs are between dimensionality, speed, cost, and task-specific performance."}),e.jsx("h3",{children:"Voyage AI (voyage-3, voyage-3-lite)"}),e.jsxs("p",{children:["Voyage AI's models consistently rank at the top of retrieval benchmarks and are purpose- built for RAG. The ",e.jsx("code",{children:"voyage-3"})," model produces 1024-dimensional vectors and provides strong performance across a wide range of domains. ",e.jsx("code",{children:"voyage-3-lite"}),"is a smaller, faster, and cheaper variant that trades a modest amount of quality for significantly lower latency — a good choice for high-throughput applications."]}),e.jsx("h3",{children:"OpenAI (text-embedding-3-small, text-embedding-3-large)"}),e.jsxs("p",{children:["OpenAI's third-generation embedding models are widely used and well-integrated into the broader ecosystem. ",e.jsx("code",{children:"text-embedding-3-small"})," produces 1536-dimensional vectors by default and is cost-effective for large-scale indexing. ",e.jsx("code",{children:"text-embedding-3-large"}),"produces 3072-dimensional vectors and achieves higher accuracy at greater cost and latency. Both support dimensionality reduction — you can truncate vectors to fewer dimensions and trade off quality for speed and storage."]}),e.jsx("h3",{children:"Nomic (nomic-embed-text)"}),e.jsx("p",{children:"Nomic's open-source embedding model produces 768-dimensional vectors and can be run locally, making it attractive for privacy-sensitive deployments or offline use cases. Its retrieval quality is competitive with commercial models in many benchmarks, and it supports longer input sequences than some alternatives."}),e.jsx("h2",{children:"Dimensions and Trade-offs"}),e.jsx("p",{children:"The dimensionality of an embedding vector determines how much information it can encode. Higher dimensionality generally allows finer semantic distinctions but comes with costs: larger storage requirements, slower similarity computation, and higher memory pressure in the vector database."}),e.jsx("p",{children:"A 768-dimensional vector from a local model might be entirely sufficient for a focused domain like customer support FAQs, where the vocabulary and concepts are narrow. A 3072-dimensional vector from a large commercial model is more likely to capture subtle distinctions across a broad, mixed-topic knowledge base like a company's entire internal wiki."}),e.jsx("p",{children:"In practice, the quality difference between 768 and 1536 dimensions is often smaller than the quality difference between a mediocre and a well-maintained document corpus. Clean, well-chunked documents will outperform a perfectly dimensioned embedding model applied to noisy, poorly structured text."}),e.jsx("h2",{children:"Chunked vs. Whole-Document Embeddings"}),e.jsx("p",{children:"A critical implementation decision is what unit of text to embed. Embedding an entire document as a single vector compresses all of its information into one point, which means a long document covering multiple topics may not match well against queries about any specific topic. The individual topics dilute each other."}),e.jsx("p",{children:"The standard approach is to split documents into smaller chunks — typically 256 to 1024 tokens each, often with overlap between adjacent chunks to preserve context across boundaries. Each chunk gets its own embedding vector. When a user queries, the retrieved unit is a chunk rather than an entire document."}),e.jsx("p",{children:"Choosing chunk size is a real engineering decision. Smaller chunks produce more precise retrieval but may lack surrounding context when sent to the model. Larger chunks preserve context but may include irrelevant content that dilutes the signal. A common starting point is 512 tokens with 50–100 tokens of overlap, adjusted based on empirical evaluation of your specific corpus and query distribution."}),e.jsx(g,{title:"Choosing an embedding model in practice",content:"Start with Voyage AI's voyage-3 or OpenAI's text-embedding-3-small for most RAG applications — both have strong general-purpose performance and straightforward APIs. Run a small offline evaluation: take 20–50 representative queries, manually identify the correct source documents, and measure how often your chosen model retrieves them in the top-5 results. This retrieval recall metric is a much better guide to model selection than benchmark leaderboards alone. Match your embedding model to your vector database's supported distance metric, and normalize vectors before storing them to avoid magnitude effects."}),e.jsx("h2",{children:"Generating Embeddings in Practice"}),e.jsx("p",{children:"The example below demonstrates generating embeddings with Voyage AI and computing cosine similarity between them. This is the fundamental operation that powers all RAG retrieval."}),e.jsx(p,{title:"Generating and Comparing Embeddings",language:"python",code:G,description:"Generate dense vector embeddings using Voyage AI's voyage-3 model, then compute cosine similarity to measure semantic relatedness between text passages."}),e.jsx("p",{children:"In a production RAG pipeline, you would run this embedding step twice: once offline when building your index (embedding all your documents), and once at query time (embedding the user's question). The vectors produced by both passes need to come from the same model — mixing models produces incomparable vectors and will return garbage results."}),e.jsx("p",{children:"Most vector databases accept the raw embedding vectors returned by embedding APIs and handle the similarity search internally. The embedding model call shown here is all you need to feed a Pinecone, Weaviate, Chroma, or Qdrant index. The vector store handles efficient approximate nearest-neighbor search at scale so you do not need to compute pairwise cosine similarities across your entire corpus on every query."})]})}const H=Object.freeze(Object.defineProperty({__proto__:null,default:E},Symbol.toStringTag,{value:"Module"}));function A({title:n="Best Practice",children:o}){return e.jsxs("aside",{className:"my-6 rounded-xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 dark:border-emerald-800/50 dark:bg-emerald-950/25",children:[e.jsxs("div",{className:"mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300",children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",className:"text-emerald-500 dark:text-emerald-400","aria-hidden":"true",children:[e.jsx("path",{d:"M22 11.08V12a10 10 0 1 1-5.93-9.14"}),e.jsx("polyline",{points:"22 4 12 14.01 9 11.01"})]}),n]}),e.jsx("div",{className:"text-sm text-gray-700 dark:text-gray-300 leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-4 [&>ul>li]:mb-1",children:o})]})}function P(){return e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("rect",{x:"9",y:"9",width:"13",height:"13",rx:"2",ry:"2"}),e.jsx("path",{d:"M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"})]})}function M(){return e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:e.jsx("polyline",{points:"20 6 9 17 4 12"})})}const O={python:"Python",javascript:"JavaScript",typescript:"TypeScript",tsx:"TSX",jsx:"JSX",bash:"Bash",shell:"Shell",yaml:"YAML",json:"JSON",toml:"TOML",dockerfile:"Dockerfile",sql:"SQL",text:"Text"};function u({language:n="python",filename:o,children:r}){const[t,a]=y.useState(!1),s=k(m=>m.theme),i=typeof r=="string"?r.trim():"",d=async()=>{try{await navigator.clipboard.writeText(i),a(!0),setTimeout(()=>a(!1),2e3)}catch{}},l=O[n]??n;return e.jsxs("div",{className:"my-5 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700/60",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700/60 dark:bg-gray-800/60",children:[e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("span",{className:"text-xs font-medium text-gray-500 dark:text-gray-400",children:l}),o&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"text-gray-300 dark:text-gray-600",children:"·"}),e.jsx("span",{className:"text-xs font-mono text-gray-500 dark:text-gray-400",children:o})]})]}),e.jsxs("button",{type:"button",onClick:d,className:"flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500","aria-label":t?"Copied":"Copy code",children:[t?e.jsx(M,{}):e.jsx(P,{}),e.jsx("span",{children:t?"Copied!":"Copy"})]})]}),e.jsx("div",{className:"overflow-x-auto text-sm [&>pre]:!m-0 [&>pre]:!rounded-none [&>pre]:!border-0",children:e.jsx(v,{language:n,style:s==="dark"?j:w,customStyle:{margin:0,borderRadius:0,fontSize:"0.8125rem",lineHeight:"1.6",background:s==="dark"?"#1a1d23":"#f9fafb"},showLineNumbers:i.split(`
`).length>5,wrapLines:!0,children:i})})]})}function D(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Popular Vector Databases"}),e.jsx("p",{children:"The vector database ecosystem has exploded since 2022. Choosing the right database depends on your scale requirements, deployment constraints, query patterns, and team expertise. This section provides a practical comparison of the leading solutions."}),e.jsx(h,{term:"Vector Database",children:e.jsx("p",{children:"A vector database is a database optimized for storing high-dimensional vectors and performing approximate nearest neighbor (ANN) search at scale. Unlike relational databases that organize data in tables, vector DBs organize data by semantic similarity — enabling you to find the most relevant documents to a query embedding in milliseconds."})}),e.jsx("h2",{children:"Hosted / Cloud Solutions"}),e.jsx("h3",{children:"Pinecone"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Best for:"})," Teams that want zero operational overhead and a fully managed, production-grade service. Pinecone handles infrastructure, scaling, and replication."]}),e.jsxs("ul",{children:[e.jsx("li",{children:"Serverless and pod-based deployment modes"}),e.jsx("li",{children:"Metadata filtering with rich query language"}),e.jsx("li",{children:"Namespace isolation for multi-tenant applications"}),e.jsx("li",{children:"Hybrid search (sparse + dense) with integrated BM25"}),e.jsxs("li",{children:[e.jsx("strong",{children:"Pricing:"})," Pay per query/storage; serverless mode minimizes idle costs"]})]}),e.jsx(u,{language:"python",filename:"pinecone_example.py",children:`from pinecone import Pinecone, ServerlessSpec
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
    print(f"Score: {match.score:.3f} | {match.metadata['source']} p.{match.metadata['page']}")`}),e.jsx("h3",{children:"Weaviate Cloud"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Best for:"})," Teams wanting advanced hybrid search, GraphQL querying, and tight integration with multiple embedding providers."]}),e.jsxs("ul",{children:[e.jsx("li",{children:"Native vector + BM25 hybrid search with configurable alpha weighting"}),e.jsx("li",{children:"Multi-tenancy built-in"}),e.jsx("li",{children:"Generative search modules (RAG built into the query)"}),e.jsx("li",{children:"Rich GraphQL and gRPC query interface"}),e.jsx("li",{children:"Self-hostable (open-source core)"})]}),e.jsx("h2",{children:"Self-Hosted Open Source"}),e.jsx("h3",{children:"Qdrant"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Best for:"})," High-performance self-hosted deployments where you need full control. Written in Rust for exceptional speed and memory efficiency."]}),e.jsxs("ul",{children:[e.jsx("li",{children:"HNSW indexing with excellent recall/speed trade-off"}),e.jsx("li",{children:"Payload filtering with complex conditions"}),e.jsx("li",{children:"Named vectors: store multiple vector types per document"}),e.jsx("li",{children:"Scalar and product quantization for memory reduction"}),e.jsx("li",{children:"gRPC API for production throughput"})]}),e.jsx(u,{language:"python",filename:"qdrant_example.py",children:`from qdrant_client import QdrantClient
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
    print(f"Score: {hit.score:.3f} | {hit.payload['source']}")`}),e.jsx("h3",{children:"Chroma"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Best for:"})," Local development, prototyping, and small-scale deployments. The simplest API for getting started with vector search."]}),e.jsx(u,{language:"python",filename:"chroma_example.py",children:`import chromadb
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
print(results["documents"])`}),e.jsx("h3",{children:"pgvector (PostgreSQL Extension)"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Best for:"})," Teams already running PostgreSQL who want vector search without adding a new infrastructure component."]}),e.jsxs("ul",{children:[e.jsx("li",{children:"Vectors stored in PostgreSQL columns alongside relational data"}),e.jsx("li",{children:"Full SQL query language for complex joins and filters"}),e.jsx("li",{children:"HNSW and IVFFlat indexing support"}),e.jsx("li",{children:"Transactions, ACID guarantees, and familiar operational model"}),e.jsxs("li",{children:[e.jsx("strong",{children:"Trade-off:"})," Not as fast as dedicated vector DBs at very high scale"]})]}),e.jsx(u,{language:"sql",filename:"pgvector_schema.sql",children:`-- Enable the extension
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
LIMIT 5;`}),e.jsx("h2",{children:"FAISS (Facebook AI Similarity Search)"}),e.jsx("p",{children:"FAISS is a C++ library with Python bindings for extremely fast in-memory vector search. It's not a database (no persistence, no metadata, no server) — it's a search index library. Use it when you need maximum throughput for in-memory search."}),e.jsx("h2",{children:"Selection Guide"}),e.jsx("div",{className:"my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{className:"bg-gray-50 dark:bg-gray-800",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300",children:"Database"}),e.jsx("th",{className:"px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300",children:"Best For"}),e.jsx("th",{className:"px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300",children:"Hosting"}),e.jsx("th",{className:"px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300",children:"Scale"})]})}),e.jsx("tbody",{className:"divide-y divide-gray-100 dark:divide-gray-800",children:[["Pinecone","Zero ops, production SaaS","Fully managed","Billion+ vectors"],["Weaviate","Hybrid search, GraphQL","Managed or self-hosted","Large scale"],["Qdrant","High perf, self-hosted","Self-hosted / cloud","Large scale"],["Chroma","Prototyping, local dev","Local / server","Small-medium"],["pgvector","Already use PostgreSQL","Self-hosted","Medium scale"],["FAISS","Max throughput, in-memory","In-process library","Millions"]].map(([n,o,r,t])=>e.jsxs("tr",{className:"hover:bg-gray-50 dark:hover:bg-gray-800/40",children:[e.jsx("td",{className:"px-4 py-3 font-medium text-gray-800 dark:text-gray-200",children:n}),e.jsx("td",{className:"px-4 py-3 text-gray-600 dark:text-gray-400",children:o}),e.jsx("td",{className:"px-4 py-3 text-gray-600 dark:text-gray-400",children:r}),e.jsx("td",{className:"px-4 py-3 text-gray-600 dark:text-gray-400",children:t})]},n))})]})}),e.jsx(A,{title:"Start with Chroma, Graduate to Production DB",children:e.jsx("p",{children:"For new projects: start with Chroma for rapid prototyping. Once you understand your data volume, query patterns, and latency requirements, migrate to Pinecone (if you want zero ops) or Qdrant (if you want self-hosted performance). The embedding model and chunking strategy matter far more than the vector DB choice at early stages."})}),e.jsx(g,{type:"tip",title:"Metadata Filtering Strategy",children:e.jsx("p",{children:"Design your metadata schema before writing your first document. Metadata filters are the primary way to scope retrieval (e.g., filter by date, category, user, or tenant). It's much harder to add metadata after ingestion than to plan for it upfront."})})]})}const Q=Object.freeze(Object.defineProperty({__proto__:null,default:D},Symbol.toStringTag,{value:"Module"}));function z(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Cloud-Native Retrieval Services"}),e.jsx("p",{children:"Each major cloud provider offers a fully managed retrieval service optimized for RAG workloads. These differ from self-hosted vector databases by integrating directly with cloud storage, identity services, and the provider's LLM APIs — eliminating infrastructure management while adding enterprise features like ACL-aware search and compliance certifications."}),e.jsx(I,{title:"Cloud Retrieval Services Comparison",width:700,height:260,nodes:[{id:"docs",label:"Documents / Data",type:"external",x:80,y:130},{id:"azure",label:"Azure AI Search",type:"store",x:280,y:60},{id:"bedrock",label:"Bedrock KBs",type:"store",x:280,y:130},{id:"vertex",label:"Vertex AI Search",type:"store",x:280,y:200},{id:"rag",label:"RAG Pipeline",type:"agent",x:480,y:130},{id:"llm",label:"LLM Response",type:"llm",x:620,y:130}],edges:[{from:"docs",to:"azure"},{from:"docs",to:"bedrock"},{from:"docs",to:"vertex"},{from:"azure",to:"rag",label:"hybrid search"},{from:"bedrock",to:"rag",label:"managed RAG"},{from:"vertex",to:"rag",label:"grounding"},{from:"rag",to:"llm"}]}),e.jsx("h2",{children:"Azure AI Search"}),e.jsx(h,{term:"Azure AI Search",children:e.jsxs("p",{children:["Azure AI Search (formerly Azure Cognitive Search) is Microsoft's enterprise search service with native vector search, hybrid BM25+vector ranking, semantic reranking, and",e.jsx("strong",{children:" integrated vectorization"})," — automatic embedding generation during indexing using Azure OpenAI embeddings without writing any embedding code."]})}),e.jsx("h3",{children:"Key Features"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Integrated vectorization:"})," Define a skill in the indexer to call Azure OpenAI embeddings automatically during document ingestion"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Hybrid search:"})," BM25 keyword + HNSW vector search combined via Reciprocal Rank Fusion (RRF)"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Semantic ranking:"})," ML-powered re-ranking of top-50 results for relevance — not just keyword/vector similarity"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Faceted navigation, filters:"})," Metadata filtering with OData syntax for pre-filtering before vector search"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Security:"})," AAD integration, field-level security trimming, private endpoints"]})]}),e.jsx(p,{title:"Azure AI Search — Hybrid Search with Vector + BM25",tabs:{python:`from azure.search.documents import SearchClient
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
    print(f"[{r['reranker_score']:.2f}] {r['title']}: {r['content'][:150]}...")`}}),e.jsx("h2",{children:"Amazon Bedrock Knowledge Bases"}),e.jsx(h,{term:"Bedrock Knowledge Bases",children:e.jsx("p",{children:"Amazon Bedrock Knowledge Bases is a fully managed RAG service that handles the entire retrieval pipeline: ingesting documents from S3, chunking, embedding with Titan or Cohere embeddings, storing in a vector store (OpenSearch Serverless, Aurora pgvector, or Pinecone), and retrieval — all without managing infrastructure. Agents can attach knowledge bases as tools."})}),e.jsx("h3",{children:"Supported Data Sources"}),e.jsxs("ul",{children:[e.jsx("li",{children:"Amazon S3 (primary — PDF, DOCX, TXT, HTML, CSV, XLSX)"}),e.jsx("li",{children:"Web crawler (public websites)"}),e.jsx("li",{children:"Confluence, SharePoint, Salesforce (connector library)"}),e.jsx("li",{children:"Custom connectors via Lambda"})]}),e.jsx(p,{title:"Amazon Bedrock Knowledge Bases — Retrieval and RetrieveAndGenerate",tabs:{python:`import boto3
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
    return response["retrievalResults"]`}}),e.jsx("h2",{children:"Vertex AI Search"}),e.jsx(h,{term:"Vertex AI Search",children:e.jsxs("p",{children:["Vertex AI Search (part of Vertex AI Agent Builder) is Google Cloud's enterprise search service. It provides ",e.jsx("strong",{children:"grounding"})," for Gemini models — letting them search over your private data or the public web before generating responses. Unlike traditional search, it understands natural language queries and returns semantically relevant results."]})}),e.jsx("h3",{children:"Data Store Types"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Unstructured:"})," Cloud Storage files (PDF, HTML, TXT) — parsed and chunked automatically"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Structured:"})," BigQuery tables or JSON/CSV for tabular search"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Website:"})," Index public websites via sitemap crawl"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Healthcare FHIR:"})," Specialized medical record search"]})]}),e.jsx(p,{title:"Vertex AI Search — Enterprise Data Store Query",tabs:{python:`from google.cloud import discoveryengine_v1 as discoveryengine
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
    return response.text`}}),e.jsx("h2",{children:"Comparison: Managed RAG Trade-offs"}),e.jsx(u,{language:"text",filename:"cloud-rag-comparison.txt",children:`┌─────────────────────┬──────────────────────┬──────────────────────┬──────────────────────┐
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
└─────────────────────┴──────────────────────┴──────────────────────┴──────────────────────┘`}),e.jsxs(A,{title:"Choosing a Managed Retrieval Service",children:[e.jsxs("p",{children:["Choose ",e.jsx("strong",{children:"Azure AI Search"})," when: you're Azure-native, need hybrid BM25+vector+semantic reranking in one service, require fine-grained document-level security trimming (ACLs), or need complex OData filter expressions for metadata pre-filtering."]}),e.jsxs("p",{children:["Choose ",e.jsx("strong",{children:"Bedrock Knowledge Bases"})," when: your data is in S3, you want zero-infrastructure RAG that integrates directly with Bedrock Agents, or you need quick prototyping without vector DB management."]}),e.jsxs("p",{children:["Choose ",e.jsx("strong",{children:"Vertex AI Search"})," when: you're GCP-native, want Gemini grounded on private data, need BigQuery table search, or are building on top of Vertex AI Agent Builder."]})]}),e.jsx(g,{type:"tip",title:"Egress Costs and Data Locality",children:e.jsx("p",{children:"Managed retrieval services avoid cross-region data transfer fees when your LLM and retrieval service are in the same region. Always co-locate your retrieval service with your LLM deployment to minimize latency and eliminate egress charges. For GDPR/data residency requirements, verify that the service offers deployment in your required geographic region."})})]})}const $=Object.freeze(Object.defineProperty({__proto__:null,default:z},Symbol.toStringTag,{value:"Module"}));export{A as B,h as C,N as F,g as N,p as S,u as a,H as b,Q as c,$ as d,W as s,k as u};
