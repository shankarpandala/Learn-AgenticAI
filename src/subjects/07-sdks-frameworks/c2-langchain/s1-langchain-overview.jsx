import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function LangChainOverview() {
  return (
    <article className="prose-content">
      <h2>LangChain Overview</h2>
      <p>
        LangChain is the most widely adopted framework for building LLM-powered applications.
        It provides a composable set of abstractions — LLMs, prompts, chains, retrievers, memory,
        and agents — plus the LangChain Expression Language (LCEL) for wiring them together
        declaratively.
      </p>

      <ConceptBlock term="LangChain Expression Language (LCEL)">
        <p>
          LCEL is LangChain's pipe-based composition system. Components implement a common
          <strong>Runnable</strong> interface (<code>invoke</code>, <code>stream</code>,
          <code>batch</code>, <code>ainvoke</code>), and the <code>|</code> operator chains
          them together. This enables lazy evaluation, automatic parallelism, streaming, and
          transparent tracing throughout the pipeline.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram
        title="LangChain Component Ecosystem"
        width={700}
        height={280}
        nodes={[
          { id: 'prompt', label: 'Prompt Template', type: 'agent', x: 80, y: 80 },
          { id: 'llm', label: 'LLM / ChatModel', type: 'llm', x: 260, y: 80 },
          { id: 'parser', label: 'Output Parser', type: 'agent', x: 440, y: 80 },
          { id: 'retriever', label: 'Retriever', type: 'tool', x: 80, y: 200 },
          { id: 'memory', label: 'Memory', type: 'agent', x: 260, y: 200 },
          { id: 'chain', label: 'Chain / LCEL', type: 'external', x: 440, y: 200 },
          { id: 'agent', label: 'Agent / LangGraph', type: 'llm', x: 620, y: 140 },
        ]}
        edges={[
          { from: 'prompt', to: 'llm' },
          { from: 'llm', to: 'parser' },
          { from: 'retriever', to: 'chain' },
          { from: 'memory', to: 'chain' },
          { from: 'parser', to: 'chain' },
          { from: 'chain', to: 'agent' },
        ]}
      />

      <h2>Core Abstractions</h2>

      <h3>Chat Models</h3>
      <p>
        LangChain wraps LLM provider APIs into a unified <code>BaseChatModel</code> interface.
        Swap providers by changing a single import — the rest of your chain stays the same.
      </p>

      <SDKExample
        title="Chat Models: Provider-Agnostic Interface"
        tabs={{
          python: `from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

# Anthropic Claude
claude = ChatAnthropic(model="claude-opus-4-6", temperature=0)

# OpenAI GPT-4o (same interface!)
gpt = ChatOpenAI(model="gpt-4o", temperature=0)

messages = [
    SystemMessage(content="You are a concise technical writer."),
    HumanMessage(content="Explain embeddings in two sentences."),
]

# Both use the same invoke() call
claude_response = claude.invoke(messages)
gpt_response = gpt.invoke(messages)

print(claude_response.content)
print(gpt_response.content)

# Async and streaming work identically
async for chunk in claude.astream(messages):
    print(chunk.content, end="", flush=True)`,
          typescript: `import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

const claude = new ChatAnthropic({ model: 'claude-opus-4-6', temperature: 0 });
const gpt = new ChatOpenAI({ model: 'gpt-4o', temperature: 0 });

const messages = [
  new SystemMessage('You are a concise technical writer.'),
  new HumanMessage('Explain embeddings in two sentences.'),
];

// Same interface across providers
const claudeResponse = await claude.invoke(messages);
const gptResponse = await gpt.invoke(messages);

console.log(claudeResponse.content);

// Streaming
for await (const chunk of await claude.stream(messages)) {
  process.stdout.write(chunk.content as string);
}`,
        }}
      />

      <h3>Prompt Templates</h3>
      <p>
        Prompt templates separate the prompt structure from its variables, enabling reuse,
        versioning, and testing.
      </p>

      <SDKExample
        title="Prompt Templates"
        tabs={{
          python: `from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# Simple template with variables
summarize_prompt = ChatPromptTemplate.from_messages([
    ("system", "Summarise the following {document_type} in {num_sentences} sentences."),
    ("human", "{document}"),
])

# Format for inspection
formatted = summarize_prompt.format_messages(
    document_type="research paper",
    num_sentences=3,
    document="LLMs have revolutionised NLP by...",
)

# Template with chat history placeholder
chat_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant."),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}"),
])`,
          typescript: `import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';

const summarizePrompt = ChatPromptTemplate.fromMessages([
  ['system', 'Summarise the following {document_type} in {num_sentences} sentences.'],
  ['human', '{document}'],
]);

const chatPrompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a helpful assistant.'],
  new MessagesPlaceholder('history'),
  ['human', '{input}'],
]);`,
        }}
      />

      <h3>LCEL Chains</h3>
      <p>
        The <code>|</code> operator composes Runnables into pipelines. Each component's output
        becomes the next component's input.
      </p>

      <SDKExample
        title="Building Chains with LCEL"
        tabs={{
          python: `from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field

# Basic text chain: prompt | model | parser
llm = ChatAnthropic(model="claude-opus-4-6")

text_chain = (
    ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant."),
        ("human", "{question}"),
    ])
    | llm
    | StrOutputParser()
)

result = text_chain.invoke({"question": "What is RAG?"})
print(result)  # Plain string

# Structured output chain with Pydantic
class Summary(BaseModel):
    headline: str = Field(description="One-sentence headline")
    key_points: list[str] = Field(description="3-5 bullet points")
    sentiment: str = Field(description="positive, neutral, or negative")

json_chain = (
    ChatPromptTemplate.from_messages([
        ("system", "Analyse the text and return JSON matching the schema."),
        ("human", "{text}"),
    ])
    | llm.with_structured_output(Summary)
)

summary = json_chain.invoke({"text": "LangChain has grown rapidly..."})
print(summary.headline)
print(summary.key_points)

# Parallel chains with RunnableParallel
from langchain_core.runnables import RunnableParallel

parallel_chain = RunnableParallel(
    summary=text_chain,
    translation=ChatPromptTemplate.from_template("Translate to French: {question}") | llm | StrOutputParser(),
)
results = parallel_chain.invoke({"question": "Explain embeddings."})
print(results["summary"])
print(results["translation"])`,
          typescript: `import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableParallel } from '@langchain/core/runnables';

const llm = new ChatAnthropic({ model: 'claude-opus-4-6' });

// Basic LCEL chain
const textChain = ChatPromptTemplate.fromMessages([
  ['system', 'You are a helpful assistant.'],
  ['human', '{question}'],
])
  .pipe(llm)
  .pipe(new StringOutputParser());

const result = await textChain.invoke({ question: 'What is RAG?' });
console.log(result);

// Structured output
const structuredChain = ChatPromptTemplate.fromMessages([
  ['system', 'Extract key information as JSON.'],
  ['human', '{text}'],
]).pipe(llm.withStructuredOutput({
  name: 'summary',
  description: 'Structured summary',
  parameters: {
    type: 'object',
    properties: {
      headline: { type: 'string' },
      key_points: { type: 'array', items: { type: 'string' } },
    },
    required: ['headline', 'key_points'],
  },
}));

const summary = await structuredChain.invoke({ text: 'LangChain is a framework...' });
console.log(summary);`,
        }}
      />

      <h2>Output Parsers</h2>
      <p>
        Output parsers transform raw LLM text into structured Python/TypeScript objects.
        LangChain provides parsers for strings, JSON, Pydantic models, lists, and more.
      </p>

      <SDKExample
        title="Output Parsers"
        tabs={{
          python: `from langchain_core.output_parsers import (
    StrOutputParser,
    JsonOutputParser,
    CommaSeparatedListOutputParser,
    PydanticOutputParser,
)
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import PromptTemplate

llm = ChatAnthropic(model="claude-opus-4-6")

# Comma-separated list
list_parser = CommaSeparatedListOutputParser()
list_chain = (
    PromptTemplate.from_template(
        "List the top 5 Python web frameworks.\\n{format_instructions}",
        partial_variables={"format_instructions": list_parser.get_format_instructions()},
    )
    | llm
    | list_parser
)
frameworks = list_chain.invoke({})
print(frameworks)  # ['Django', 'Flask', 'FastAPI', 'Tornado', 'Starlette']

# Pydantic parser for complex structured output
class Product(BaseModel):
    name: str = Field(description="Product name")
    price: float = Field(description="Price in USD")
    features: list[str] = Field(description="Key features")

pydantic_parser = PydanticOutputParser(pydantic_object=Product)
product_chain = (
    PromptTemplate.from_template(
        "Describe a fictional AI coding assistant product.\\n{format_instructions}",
        partial_variables={"format_instructions": pydantic_parser.get_format_instructions()},
    )
    | llm
    | pydantic_parser
)
product = product_chain.invoke({})
print(f"{product.name}: \$\{product.price\}")`,
        }}
      />

      <h2>Runnables and the Runnable Interface</h2>
      <p>
        Every LCEL component implements the Runnable interface, which provides consistent
        methods for synchronous, asynchronous, streaming, and batch execution.
      </p>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Method</th>
              <th className="px-4 py-3 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['invoke(input)', 'Single synchronous call'],
              ['ainvoke(input)', 'Single async call (awaitable)'],
              ['stream(input)', 'Synchronous streaming generator'],
              ['astream(input)', 'Async streaming generator'],
              ['batch(inputs)', 'Process multiple inputs in parallel'],
              ['abatch(inputs)', 'Async batch processing'],
            ].map(([method, desc]) => (
              <tr key={method}>
                <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">{method}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BestPracticeBlock title="Prefer LCEL Over Legacy Chains">
        <p>LangChain's older <code>LLMChain</code>, <code>SequentialChain</code>, and similar
        classes are deprecated in favour of LCEL. LCEL chains are more composable, support
        streaming natively, work with LangSmith tracing automatically, and have better async
        support. When starting new projects, always use the LCEL pipe syntax.</p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Use .with_config() for Metadata">
        <p>Add tags, metadata, and run names to any Runnable with
        <code>.with_config(tags=["rag", "v2"], run_name="summarise-step")</code>. These
        appear in LangSmith traces and make debugging production pipelines much easier.</p>
      </NoteBlock>
    </article>
  )
}
