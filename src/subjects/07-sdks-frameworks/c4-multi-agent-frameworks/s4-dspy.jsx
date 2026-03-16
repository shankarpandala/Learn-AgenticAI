import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'

export default function DSPy() {
  return (
    <article className="prose-content">
      <h2>DSPy</h2>
      <p>
        DSPy (Declarative Self-improving Python) is a framework for <em>programming</em>
        — not prompting — LLMs. Instead of manually crafting prompts, you define the
        <strong>signatures</strong> (inputs and outputs) and <strong>modules</strong>
        (reasoning strategies), then use <strong>optimizers</strong> to automatically
        discover effective prompts or fine-tune weights for your task.
      </p>

      <ConceptBlock term="Signature">
        <p>
          A <strong>Signature</strong> defines the input/output contract for an LLM call.
          It specifies field names with type annotations and docstrings that DSPy uses to
          construct prompts. Signatures decouple <em>what you want</em> from <em>how the
          LLM is instructed to do it</em> — the optimizer fills in the latter.
        </p>
      </ConceptBlock>

      <ConceptBlock term="Module">
        <p>
          A <strong>Module</strong> is a composable building block that implements a reasoning
          strategy. <code>Predict</code> does a direct LLM call. <code>ChainOfThought</code>
          elicits step-by-step reasoning. <code>ReAct</code> implements tool-augmented reasoning.
          Modules are composable — you build complex programs by combining them.
        </p>
      </ConceptBlock>

      <ConceptBlock term="Optimizer (Teleprompter)">
        <p>
          An <strong>Optimizer</strong> automatically improves your DSPy program by searching
          for better prompts or few-shot examples. <code>BootstrapFewShot</code> generates
          training demonstrations from your examples. <code>MIPRO</code> (Multi-prompt
          Instruction PRoposal Optimizer) uses Bayesian optimization to find optimal
          instructions across all modules in your program.
        </p>
      </ConceptBlock>

      <h2>Installation and Setup</h2>

      <SDKExample
        title="Installing DSPy"
        tabs={{
          python: `pip install dspy

# Configure the LLM
import dspy

# Use Claude via LiteLLM integration
lm = dspy.LM("anthropic/claude-opus-4-6", api_key="your-key", max_tokens=4096)
dspy.configure(lm=lm)

# Or use OpenAI
lm = dspy.LM("openai/gpt-4o", api_key="your-openai-key")
dspy.configure(lm=lm)`,
        }}
      />

      <h2>Signatures and Predict</h2>

      <SDKExample
        title="Defining Signatures and Using Predict"
        tabs={{
          python: `import dspy

dspy.configure(lm=dspy.LM("anthropic/claude-opus-4-6", api_key="..."))

# Inline signature: "input_field -> output_field"
classify = dspy.Predict("text -> sentiment: str, confidence: float")
result = classify(text="This product is absolutely fantastic!")
print(result.sentiment)   # "positive"
print(result.confidence)  # 0.98

# Class-based signature with field descriptions
class SummarizeWithKeypoints(dspy.Signature):
    """Summarize the document and extract the most important points."""

    document: str = dspy.InputField(desc="The document to summarize")
    audience: str = dspy.InputField(desc="Target audience: technical or general")
    summary: str = dspy.OutputField(desc="A 2-3 sentence summary")
    key_points: list[str] = dspy.OutputField(desc="3-5 bullet points of key takeaways")

summarize = dspy.Predict(SummarizeWithKeypoints)

result = summarize(
    document="Large language models have transformed NLP...",
    audience="technical"
)
print(result.summary)
print(result.key_points)`,
        }}
      />

      <h2>ChainOfThought and ReAct Modules</h2>

      <SDKExample
        title="ChainOfThought and Tool-Augmented ReAct"
        tabs={{
          python: `import dspy

# ChainOfThought: adds "Let's think step by step" reasoning
class MathReasoner(dspy.Signature):
    """Solve the math problem step by step."""
    problem: str = dspy.InputField()
    answer: float = dspy.OutputField()

cot = dspy.ChainOfThought(MathReasoner)
result = cot(problem="If a train travels at 60 mph for 2.5 hours, how far does it go?")
print(result.reasoning)  # Chain of thought
print(result.answer)     # 150.0

# ReAct: tool-augmented reasoning
def search_web(query: str) -> str:
    """Search the web for information about the query."""
    # In production, call a real search API
    return f"Search results for: {query}"

def calculator(expression: str) -> str:
    """Evaluate a mathematical expression."""
    import ast
    result = eval(compile(ast.parse(expression, mode='eval'), '<str>', 'eval'))
    return str(result)

class ResearchQuestion(dspy.Signature):
    """Answer the question using available tools to find and compute information."""
    question: str = dspy.InputField()
    answer: str = dspy.OutputField(desc="Comprehensive answer with sources")

react_agent = dspy.ReAct(
    ResearchQuestion,
    tools=[search_web, calculator],
    max_iters=5,
)

result = react_agent(
    question="What is the GDP of France divided by the population of Germany?"
)
print(result.answer)`,
        }}
      />

      <h2>Building a RAG Module</h2>

      <SDKExample
        title="DSPy RAG Program"
        tabs={{
          python: `import dspy
from dspy.retrieve import ChromadbRM  # or any retriever

# Configure LLM and retriever
lm = dspy.LM("anthropic/claude-opus-4-6", api_key="...")
retriever = ChromadbRM(
    collection_name="my_docs",
    persist_directory="./chroma_db",
    k=5,
)
dspy.configure(lm=lm, rm=retriever)

# Define the RAG signature
class GenerateAnswer(dspy.Signature):
    """Answer the question based on the retrieved context. Be factual and cite sources."""
    context: list[str] = dspy.InputField(desc="Relevant passages from the knowledge base")
    question: str = dspy.InputField()
    answer: str = dspy.OutputField(desc="Detailed answer grounded in the context")

# Build the RAG module
class RAG(dspy.Module):
    def __init__(self, num_passages: int = 5):
        super().__init__()
        self.retrieve = dspy.Retrieve(k=num_passages)
        self.generate = dspy.ChainOfThought(GenerateAnswer)

    def forward(self, question: str) -> dspy.Prediction:
        passages = self.retrieve(question).passages
        prediction = self.generate(context=passages, question=question)
        return dspy.Prediction(answer=prediction.answer, context=passages)

rag = RAG(num_passages=5)
result = rag(question="What are the trade-offs between BM25 and dense retrieval?")
print(result.answer)`,
        }}
      />

      <h2>Optimizing with BootstrapFewShot</h2>

      <SDKExample
        title="Automatic Prompt Optimization"
        tabs={{
          python: `import dspy
from dspy.evaluate import Evaluate
from dspy.teleprompt import BootstrapFewShot, MIPROv2

# Prepare training and validation examples
trainset = [
    dspy.Example(question="What is RAG?", answer="RAG combines retrieval with generation...").with_inputs("question"),
    dspy.Example(question="How does BM25 work?", answer="BM25 is a probabilistic ranking function...").with_inputs("question"),
    # ... more examples
]

devset = [
    dspy.Example(question="Compare RAG and fine-tuning.", answer="...").with_inputs("question"),
    # ... more examples
]

# Define evaluation metric
def answer_quality(example, prediction, trace=None) -> bool:
    """Returns True if the predicted answer is correct/relevant."""
    # Use an LLM judge or exact match depending on your task
    judge = dspy.Predict("question, predicted_answer, gold_answer -> is_correct: bool")
    result = judge(
        question=example.question,
        predicted_answer=prediction.answer,
        gold_answer=example.answer,
    )
    return result.is_correct

# Optimize with BootstrapFewShot (fast, good baseline)
optimizer = BootstrapFewShot(
    metric=answer_quality,
    max_bootstrapped_demos=4,  # Few-shot examples to add to prompt
    max_labeled_demos=4,
    max_rounds=2,
)

rag = RAG(num_passages=5)
optimized_rag = optimizer.compile(rag, trainset=trainset)

# Evaluate on dev set
evaluator = Evaluate(devset=devset, num_threads=4, display_progress=True)
score = evaluator(optimized_rag, metric=answer_quality)
print(f"Optimized RAG accuracy: {score:.1%}")

# Save and reload optimized program
optimized_rag.save("optimized_rag.json")
loaded_rag = RAG().load("optimized_rag.json")

# Advanced: MIPRO optimizer (better results, slower)
mipro_optimizer = MIPROv2(
    metric=answer_quality,
    auto="medium",  # "light", "medium", or "heavy" optimization budget
)
mipro_rag = mipro_optimizer.compile(
    rag,
    trainset=trainset,
    eval_kwargs={"num_threads": 4, "display_progress": True},
)`,
        }}
      />

      <PatternBlock
        name="Compiled DSPy Programs for Production"
        category="Prompt Engineering"
        whenToUse="When you have labeled examples and want to systematically improve prompt quality without manual prompt engineering. DSPy optimization typically improves accuracy by 10-40% over hand-written prompts."
      >
        <p>
          Train your DSPy program on a small labeled set (20-100 examples), optimize with
          <code>BootstrapFewShot</code> as a baseline, then evaluate on a held-out test set.
          Save the compiled program JSON and load it in production. Re-optimize when you
          update the underlying model or add new task examples.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Start with Signatures, Add Optimization Later">
        <p>Build your DSPy program with simple <code>Predict</code> modules first and verify
        the structure works. Only then run optimizers — they require labeled examples and
        compute time. Use <code>ChainOfThought</code> as a drop-in upgrade for
        <code>Predict</code> on reasoning-heavy steps. Reserve <code>MIPROv2</code> for
        your most critical modules where the optimization cost is justified.</p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="DSPy vs. Manual Prompt Engineering">
        <p>DSPy is most valuable when: (1) you have evaluation metrics and labeled examples,
        (2) you switch models frequently (compiled programs adapt automatically), or (3) your
        prompt is complex with multiple steps. For simple, stable one-shot tasks, manual
        prompting is often faster. DSPy shines for agentic pipelines with many modules where
        manual optimization of each prompt is impractical.</p>
      </NoteBlock>
    </article>
  )
}
