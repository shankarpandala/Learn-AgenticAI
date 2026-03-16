import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function ToolDesignPrinciples() {
  return (
    <article className="prose-content">
      <p>
        The quality of an agent's tools is the single most controllable factor in its performance.
        A capable model paired with poorly designed tools will underperform a simpler model with
        excellent tools. Tool design is software engineering, and it benefits from the same
        principles that make good APIs: clear contracts, predictable behavior, useful error
        messages, and minimal surface area. The UNIX philosophy — do one thing well — applies
        directly.
      </p>

      <h2>The UNIX Philosophy Applied to Agent Tools</h2>

      <p>
        UNIX tools are small, composable programs that each do exactly one thing and communicate
        through standard interfaces. This philosophy produces systems that are easy to understand,
        test, and combine in novel ways. Agent tools should follow the same principles.
      </p>

      <ConceptBlock term="Single-Responsibility Tool">
        A single-responsibility tool performs exactly one conceptual operation. It does not
        branch based on a mode flag or combine multiple capabilities into one endpoint. A tool
        that both reads and writes files based on an "operation" parameter is two tools pretending
        to be one. Separating them makes the schema clearer, the error surface smaller, and the
        model's decision-making easier — it selects the right tool, not the right mode.
      </ConceptBlock>

      <h3>Composability</h3>
      <p>
        Small, focused tools combine to handle complex tasks. An agent that needs to read a file,
        transform its contents, and write the result uses three tools in sequence. This is more
        debuggable, more testable, and more robust than a single multi-purpose transform tool.
        When an intermediate step fails, you know exactly which operation failed and why.
      </p>

      <h2>Clear Input/Output Schemas</h2>

      <p>
        A tool's schema is its contract with the model. The model decides which tool to call and
        what arguments to pass based entirely on the schema description and the parameter
        descriptions. Vague or incomplete schemas produce incorrect or hallucinated arguments.
        Precise schemas produce correct calls.
      </p>

      <SDKExample
        title="Well-Designed vs. Poorly Designed Tool Schemas"
        tabs={{
          python: `# BAD: Vague schema with poor descriptions
bad_tool = {
    "name": "process_data",
    "description": "Process data",  # What kind? How?
    "input_schema": {
        "type": "object",
        "properties": {
            "data": {"type": "string"},   # What format? What content?
            "mode": {"type": "string"},   # What values are valid?
            "opts": {"type": "object"}    # What options exist?
        }
    }
}

# GOOD: Precise schema with complete descriptions
good_tool_search = {
    "name": "search_documents",
    "description": (
        "Search the document store for text matching a query. "
        "Returns the top matching document excerpts with their source file paths. "
        "Use this when you need to find information across the knowledge base."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Natural language search query. Be specific for better results."
            },
            "max_results": {
                "type": "integer",
                "description": "Maximum number of results to return. Default 5, max 20.",
                "default": 5,
                "minimum": 1,
                "maximum": 20
            },
            "file_type": {
                "type": "string",
                "description": "Filter to a specific file type: 'pdf', 'md', 'txt', or 'all'.",
                "enum": ["pdf", "md", "txt", "all"],
                "default": "all"
            }
        },
        "required": ["query"]
    }
}

good_tool_write = {
    "name": "write_file",
    "description": (
        "Write content to a file, creating it if it does not exist or overwriting if it does. "
        "Returns the number of bytes written. "
        "Do NOT use for appending — use append_file instead."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "path": {
                "type": "string",
                "description": "Absolute or relative file path, e.g. '/tmp/output.txt'"
            },
            "content": {
                "type": "string",
                "description": "The full content to write to the file."
            },
            "encoding": {
                "type": "string",
                "description": "File encoding. Defaults to 'utf-8'.",
                "default": "utf-8"
            }
        },
        "required": ["path", "content"]
    }
}`,
          json: `{
  "name": "search_documents",
  "description": "Search the document store for text matching a query. Returns the top matching document excerpts with their source file paths. Use this when you need to find information across the knowledge base.",
  "input_schema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Natural language search query. Be specific for better results."
      },
      "max_results": {
        "type": "integer",
        "description": "Maximum number of results to return. Default 5, max 20.",
        "default": 5,
        "minimum": 1,
        "maximum": 20
      },
      "file_type": {
        "type": "string",
        "description": "Filter to a specific file type: 'pdf', 'md', 'txt', or 'all'.",
        "enum": ["pdf", "md", "txt", "all"],
        "default": "all"
      }
    },
    "required": ["query"]
  }
}`
        }}
      />

      <h2>Error Handling in Tools</h2>

      <p>
        Tools will fail. Files won't exist, APIs will return 404s, queries will time out. The
        question is not whether to handle errors but how. Tool errors must be expressed in a
        way the LLM can act on — the model reads the tool result and decides what to do next.
        An exception traceback is useless to the model; a structured error message with context
        and a suggested next action is invaluable.
      </p>

      <SDKExample
        title="Actionable Error Messages in Tool Implementations"
        tabs={{
          python: `import json
from pathlib import Path

def read_file(path: str, encoding: str = "utf-8") -> str:
    """
    Tool implementation: read a file with LLM-actionable error messages.
    Returns either the file content or a structured error the LLM can act on.
    """
    file_path = Path(path)

    if not file_path.exists():
        return json.dumps({
            "error": "FILE_NOT_FOUND",
            "message": f"File '{path}' does not exist.",
            "suggestion": "Use list_directory to see what files are available in that location."
        })

    if not file_path.is_file():
        return json.dumps({
            "error": "NOT_A_FILE",
            "message": f"'{path}' is a directory, not a file.",
            "suggestion": "Use list_directory to see the contents of this directory."
        })

    try:
        content = file_path.read_text(encoding=encoding)
        if len(content) > 100_000:
            return json.dumps({
                "error": "FILE_TOO_LARGE",
                "message": f"File is {len(content):,} chars. Limit is 100,000.",
                "suggestion": "Use read_file_range to read specific line ranges.",
                "total_lines": content.count("\\n") + 1
            })
        return content
    except PermissionError:
        return json.dumps({
            "error": "PERMISSION_DENIED",
            "message": f"Cannot read '{path}': permission denied.",
            "suggestion": "Check file permissions or try a different path."
        })
    except UnicodeDecodeError:
        return json.dumps({
            "error": "ENCODING_ERROR",
            "message": f"Cannot decode '{path}' as {encoding}.",
            "suggestion": "Try encoding='latin-1' or encoding='utf-16' for binary files."
        })`
        }}
      />

      <h2>Idempotency</h2>

      <ConceptBlock term="Idempotency">
        An idempotent operation produces the same result whether called once or many times with
        the same arguments. Idempotent tools are safe to retry on failure, making agent systems
        more robust. A tool that creates a record is not idempotent (calling it twice creates
        two records). A tool that upserts a record is idempotent (calling it twice with the
        same data results in one record with that data). Prefer idempotent designs wherever
        the operation semantics allow it.
      </ConceptBlock>

      <h2>Tool Naming Conventions</h2>

      <p>
        Tool names are read by the model, not just programmers. They should be immediately
        clear about what the tool does without reading the description. Follow these conventions:
      </p>

      <ul>
        <li><strong>Use verb_noun format:</strong> <code>search_documents</code>, <code>read_file</code>, <code>create_task</code>, <code>list_users</code></li>
        <li><strong>Be specific, not generic:</strong> <code>search_jira_issues</code> beats <code>search</code></li>
        <li><strong>Distinguish similar tools clearly:</strong> <code>read_file</code> vs <code>read_file_range</code> vs <code>read_url</code></li>
        <li><strong>Avoid abbreviations:</strong> <code>get_customer_record</code> not <code>get_cust_rec</code></li>
        <li><strong>Use consistent verbs:</strong> pick one of (get/read/fetch) and use it everywhere for retrieval</li>
      </ul>

      <PatternBlock
        name="Tool Schema Contract"
        category="Tool Design"
        description="Treat tool schemas as a contract between the tool implementation and the LLM. Every parameter must have a description that answers: what is it, what format does it expect, and what are valid values. Required fields must be truly required. Optional fields must have sensible defaults."
        when={[
          "Defining any new tool for an agent",
          "Reviewing existing tools that produce incorrect LLM calls",
          "Building a tool library that will be reused across multiple agents"
        ]}
        avoid={[
          "Parameter names that only make sense with code context (use descriptions)",
          "Combining multiple operations into one tool with a 'mode' parameter",
          "Returning raw exceptions — always translate to structured error objects"
        ]}
      />

      <BestPracticeBlock title="Write Tool Descriptions from the Model's Perspective">
        When writing a tool description, ask: would the model know exactly when to call this
        tool and exactly what to pass, based only on the description and parameter names?
        Include: what the tool does, when to use it (and when NOT to use it), what the return
        value looks like, and any important constraints like rate limits or size limits. A
        one-sentence description is almost always insufficient.
      </BestPracticeBlock>

      <WarningBlock title="Side effects in tools require special care">
        Tools that modify state (write files, send emails, modify database records, call APIs
        with side effects) should be clearly marked as such in their descriptions. Include the
        phrase "This action cannot be undone." where appropriate. This prompts the model to
        treat the tool with appropriate caution and reduces the chance of unintended side effects
        during exploration or debugging phases. Consider adding a dry_run parameter to
        destructive tools.
      </WarningBlock>

      <NoteBlock title="Test tools independently before putting them in agents">
        Every tool should have unit tests that verify correct behavior, error handling, and
        schema conformance before it is given to an agent. A misbehaving tool that returns
        incorrect results or unhelpful errors will cause the agent to spiral into confused
        retry loops. Isolating tool bugs from agent reasoning bugs requires that you can trust
        your tools work correctly in isolation.
      </NoteBlock>
    </article>
  )
}
