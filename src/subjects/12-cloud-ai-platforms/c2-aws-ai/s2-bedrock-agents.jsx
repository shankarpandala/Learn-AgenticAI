import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function BedrockAgents() {
  return (
    <article className="prose-content">
      <h2>Amazon Bedrock Agents: Fully Managed Agentic AI</h2>
      <p>
        Amazon Bedrock Agents is a fully managed service for building and deploying autonomous
        AI agents. Unlike custom agent loops you build with LangGraph or the Agents SDK, Bedrock
        Agents handles the orchestration loop, memory, action execution, and observability
        infrastructure — you declare tools and knowledge bases, and the service handles the rest.
        Agents use a ReAct-style reasoning loop internally but expose a simple invocation API
        to your application.
      </p>

      <ArchitectureDiagram
        title="Bedrock Agents: Request Flow"
        width={700}
        height={340}
        nodes={[
          { id: 'user', label: 'User / App', type: 'external', x: 70, y: 170 },
          { id: 'agent', label: 'Bedrock Agent\n(Orchestrator)', type: 'agent', x: 240, y: 170 },
          { id: 'llm', label: 'Foundation Model\n(Claude / Nova)', type: 'llm', x: 240, y: 60 },
          { id: 'ag', label: 'Action Groups\n(Lambda + OpenAPI)', type: 'tool', x: 430, y: 90 },
          { id: 'kb', label: 'Knowledge Base\n(RAG)', type: 'store', x: 430, y: 170 },
          { id: 'mem', label: 'Session Memory', type: 'store', x: 430, y: 260 },
          { id: 'lambda', label: 'Lambda\nFunctions', type: 'tool', x: 600, y: 90 },
          { id: 'os', label: 'OpenSearch /\nAurora pgvector', type: 'store', x: 600, y: 200 },
        ]}
        edges={[
          { from: 'user', to: 'agent', label: 'invoke' },
          { from: 'agent', to: 'llm', label: 'reason' },
          { from: 'llm', to: 'agent', label: 'action' },
          { from: 'agent', to: 'ag', label: 'tool call' },
          { from: 'agent', to: 'kb', label: 'retrieve' },
          { from: 'agent', to: 'mem', label: 'read/write' },
          { from: 'ag', to: 'lambda' },
          { from: 'kb', to: 'os' },
          { from: 'agent', to: 'user', label: 'response' },
        ]}
      />

      <h2>Action Groups</h2>

      <ConceptBlock term="Action Groups">
        <p>
          An <strong>action group</strong> is a collection of API operations that an agent
          can call. Each action group is backed by a Lambda function and described by an
          <strong>OpenAPI schema</strong> (JSON or YAML). The agent uses the schema to understand
          what operations are available, what parameters they require, and when to call them.
          When the agent decides to invoke an action, Bedrock calls your Lambda with a structured
          payload including the action name, API path, and extracted parameters.
        </p>
        <p>
          Alternatively, action groups can use <strong>function definitions</strong> (simpler
          than full OpenAPI) — a list of functions with name, description, and parameters.
          For built-in capabilities like code execution, Bedrock provides the
          <code>AMAZON.CodeInterpreter</code> built-in action type.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Creating a Bedrock Agent with Action Groups"
        tabs={{
          python: `import boto3
import json

bedrock_agent = boto3.client("bedrock-agent", region_name="us-east-1")

# ── Step 1: Create the Agent ──────────────────────────────────────────────
create_response = bedrock_agent.create_agent(
    agentName="customer-support-agent",
    agentResourceRoleArn="arn:aws:iam::123456789:role/BedrockAgentRole",
    foundationModel="anthropic.claude-3-5-sonnet-20241022-v2:0",
    description="Handles customer support queries with access to order and ticket systems.",
    instruction="""You are a helpful customer support agent for an e-commerce platform.
You have access to tools to look up orders, check inventory, and create support tickets.
Always verify order details before taking any action. Be concise and professional.""",
    idleSessionTTLInSeconds=1800,
)

agent_id = create_response["agent"]["agentId"]
print("Agent ID:", agent_id)


# ── Step 2: Create an Action Group with OpenAPI Schema ────────────────────
openapi_schema = {
    "openapi": "3.0.0",
    "info": {"title": "Order Management API", "version": "1.0.0"},
    "paths": {
        "/get-order": {
            "get": {
                "operationId": "getOrder",
                "description": "Retrieve order details by order ID",
                "parameters": [
                    {
                        "name": "orderId",
                        "in": "query",
                        "required": True,
                        "schema": {"type": "string"},
                        "description": "The unique order identifier"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Order details",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "orderId": {"type": "string"},
                                        "status": {"type": "string"},
                                        "items": {"type": "array"}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/create-ticket": {
            "post": {
                "operationId": "createSupportTicket",
                "description": "Create a customer support ticket",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["customerId", "issue"],
                                "properties": {
                                    "customerId": {"type": "string"},
                                    "issue": {"type": "string"},
                                    "priority": {
                                        "type": "string",
                                        "enum": ["low", "medium", "high"]
                                    }
                                }
                            }
                        }
                    }
                },
                "responses": {"200": {"description": "Ticket created"}}
            }
        }
    }
}

bedrock_agent.create_agent_action_group(
    agentId=agent_id,
    agentVersion="DRAFT",
    actionGroupName="order-management",
    description="Tools for managing orders and support tickets",
    actionGroupExecutor={
        "lambda": "arn:aws:lambda:us-east-1:123456789:function:order-management-handler"
    },
    apiSchema={
        "payload": json.dumps(openapi_schema)
    },
    actionGroupState="ENABLED"
)

# ── Step 3: Prepare and create an alias ──────────────────────────────────
bedrock_agent.prepare_agent(agentId=agent_id)

# Wait for preparation to complete (in production, poll with get_agent)
import time
time.sleep(10)

alias_response = bedrock_agent.create_agent_alias(
    agentId=agent_id,
    agentAliasName="production-v1",
    description="Production alias for customer support agent"
)

alias_id = alias_response["agentAlias"]["agentAliasId"]
print("Alias ID:", alias_id)`,
        }}
      />

      <h2>Invoking Agents</h2>
      <p>
        Agents are invoked via the <code>bedrock-agent-runtime</code> client (separate from
        the management client). Each invocation requires a <code>sessionId</code> to maintain
        conversational context. The agent response streams back as an event stream containing
        the final answer and optional trace events showing the agent's reasoning.
      </p>

      <CodeBlock language="python" filename="invoke_bedrock_agent.py">
{`import boto3
import uuid

# Runtime client for invoking agents
bedrock_agent_rt = boto3.client("bedrock-agent-runtime", region_name="us-east-1")

agent_id = "ABCDEF1234"
alias_id = "TSTALIASID"
session_id = str(uuid.uuid4())  # Maintain this across turns for multi-turn conversations

response = bedrock_agent_rt.invoke_agent(
    agentId=agent_id,
    agentAliasId=alias_id,
    sessionId=session_id,
    inputText="What is the status of order ORD-98765?",
    enableTrace=True,  # Include reasoning trace in response
    sessionState={
        # Inject session-level context variables accessible in the agent prompt
        "sessionAttributes": {
            "customerId": "CUST-12345",
            "tier": "premium"
        }
    }
)

# The response is an event stream — iterate to get chunks
completion = ""
for event in response["completion"]:
    if "chunk" in event:
        chunk_bytes = event["chunk"]["bytes"]
        completion += chunk_bytes.decode("utf-8")

    elif "trace" in event:
        trace = event["trace"]["trace"]
        # Trace contains orchestrationTrace, preProcessingTrace, postProcessingTrace
        if "orchestrationTrace" in trace:
            orch = trace["orchestrationTrace"]
            if "rationale" in orch:
                print("Reasoning:", orch["rationale"]["text"])
            if "invocationInput" in orch:
                inv = orch["invocationInput"]
                if "actionGroupInvocationInput" in inv:
                    action = inv["actionGroupInvocationInput"]
                    print(f"Calling action: {action['actionGroupName']}/{action['apiPath']}")

print("\\nFinal response:", completion)`}
      </CodeBlock>

      <h2>Knowledge Bases</h2>

      <ConceptBlock term="Bedrock Knowledge Bases">
        <p>
          A <strong>Knowledge Base</strong> is a managed RAG pipeline. You point it at an S3
          bucket containing your documents (PDF, TXT, HTML, Markdown, Word), and Bedrock
          automatically chunks, embeds, and indexes the content. The index is stored in either
          <strong>OpenSearch Serverless</strong> (default), <strong>Aurora PostgreSQL with pgvector</strong>,
          or <strong>Pinecone / MongoDB Atlas</strong>. When an agent queries the knowledge base,
          Bedrock handles the embedding of the query, vector search, and passage retrieval —
          returning grounded context to the agent.
        </p>
      </ConceptBlock>

      <CodeBlock language="python" filename="bedrock_knowledge_base.py">
{`import boto3

bedrock_agent = boto3.client("bedrock-agent", region_name="us-east-1")

# Create a Knowledge Base backed by OpenSearch Serverless
kb_response = bedrock_agent.create_knowledge_base(
    name="product-documentation-kb",
    description="Product manuals and FAQs for customer support",
    roleArn="arn:aws:iam::123456789:role/BedrockKBRole",
    knowledgeBaseConfiguration={
        "type": "VECTOR",
        "vectorKnowledgeBaseConfiguration": {
            "embeddingModelArn": (
                "arn:aws:bedrock:us-east-1::foundation-model/"
                "amazon.titan-embed-text-v2:0"
            )
        }
    },
    storageConfiguration={
        "type": "OPENSEARCH_SERVERLESS",
        "opensearchServerlessConfiguration": {
            "collectionArn": "arn:aws:aoss:us-east-1:123456789:collection/my-kb-collection",
            "vectorIndexName": "bedrock-kb-index",
            "fieldMapping": {
                "vectorField": "bedrock-knowledge-base-default-vector",
                "textField": "AMAZON_BEDROCK_TEXT_CHUNK",
                "metadataField": "AMAZON_BEDROCK_METADATA"
            }
        }
    }
)

kb_id = kb_response["knowledgeBase"]["knowledgeBaseId"]

# Add an S3 data source
bedrock_agent.create_data_source(
    knowledgeBaseId=kb_id,
    name="product-docs-s3",
    dataSourceConfiguration={
        "type": "S3",
        "s3Configuration": {
            "bucketArn": "arn:aws:s3:::my-product-docs-bucket",
            "inclusionPrefixes": ["manuals/", "faqs/"]
        }
    },
    vectorIngestionConfiguration={
        "chunkingConfiguration": {
            "chunkingStrategy": "HIERARCHICAL",
            "hierarchicalChunkingConfiguration": {
                "levelConfigurations": [
                    {"maxTokens": 1500},  # Parent chunk
                    {"maxTokens": 300}    # Child chunk
                ],
                "overlapTokens": 60
            }
        }
    }
)

# Associate KB with an agent
bedrock_agent.associate_agent_knowledge_base(
    agentId="ABCDEF1234",
    agentVersion="DRAFT",
    knowledgeBaseId=kb_id,
    description="Use this to answer questions about product documentation",
    knowledgeBaseState="ENABLED"
)

# Direct KB retrieval (without an agent)
bedrock_agent_rt = boto3.client("bedrock-agent-runtime", region_name="us-east-1")

retrieve_response = bedrock_agent_rt.retrieve(
    knowledgeBaseId=kb_id,
    retrievalQuery={"text": "How do I reset my device to factory settings?"},
    retrievalConfiguration={
        "vectorSearchConfiguration": {
            "numberOfResults": 5,
            "overrideSearchType": "HYBRID"  # Semantic + keyword
        }
    }
)

for result in retrieve_response["retrievalResults"]:
    print(f"Score: {result['score']:.3f}")
    print(f"Content: {result['content']['text'][:200]}")
    print(f"Source: {result['location']['s3Location']['uri']}")
    print()`}
      </CodeBlock>

      <h2>Agent Aliases and Versioning</h2>
      <p>
        Agent <strong>versions</strong> are immutable snapshots of an agent configuration.
        <strong>Aliases</strong> are pointers to specific versions, enabling blue/green
        deployments: you can gradually shift traffic from v1 to v2 by updating the alias,
        with instant rollback by reverting the pointer. Your application always calls the
        alias ID — the underlying version can change without code changes.
      </p>

      <h2>Multi-Agent Collaboration</h2>

      <ConceptBlock term="Supervisor and Sub-Agents">
        <p>
          Bedrock supports <strong>multi-agent collaboration</strong> where a <em>supervisor agent</em>
          orchestrates multiple <em>sub-agents</em>, each specialized for a domain. The supervisor
          receives the user's task, decomposes it, and delegates subtasks to sub-agents via a
          built-in collaboration action group. Sub-agents can themselves have action groups and
          knowledge bases. Results are aggregated by the supervisor into a final response.
          This pattern scales well for complex enterprise workflows (e.g., a supervisor routing
          between a billing agent, a technical support agent, and a returns agent).
        </p>
      </ConceptBlock>

      <PatternBlock
        name="Inline Agents for Dynamic Configurations"
        category="Flexibility"
        whenToUse="When agent configuration (instructions, tools, knowledge bases) must be determined at runtime per-request — e.g., personalizing the agent per tenant or injecting dynamic context."
      >
        <p>
          <strong>Inline agents</strong> are created and invoked in a single API call without
          pre-creating agent resources. You pass the full configuration (model, instructions,
          action groups, knowledge base IDs) directly in the <code>invoke_inline_agent</code>
          call. This is ideal for multi-tenant applications where each customer has different
          permissions or tool sets, or for testing configurations without managing agent versions.
          Inline agents do not support aliases or session memory across calls.
        </p>
      </PatternBlock>

      <CodeBlock language="python" filename="inline_agent.py">
{`import boto3
import uuid

bedrock_agent_rt = boto3.client("bedrock-agent-runtime", region_name="us-east-1")

response = bedrock_agent_rt.invoke_inline_agent(
    sessionId=str(uuid.uuid4()),
    foundationModel="anthropic.claude-3-5-sonnet-20241022-v2:0",
    instruction="You are a data analyst. Answer questions about sales data concisely.",
    inputText="What were the top 3 products by revenue last quarter?",
    actionGroups=[
        {
            "actionGroupName": "database-query",
            "actionGroupExecutor": {
                "lambda": "arn:aws:lambda:us-east-1:123456789:function:query-db"
            },
            "functionSchema": {
                "functions": [
                    {
                        "name": "run_sql_query",
                        "description": "Execute a read-only SQL query against the sales database",
                        "parameters": {
                            "query": {
                                "type": "string",
                                "description": "SQL SELECT query to execute",
                                "required": True
                            }
                        }
                    }
                ]
            }
        }
    ],
    knowledgeBaseConfigurations=[
        {
            "knowledgeBaseId": "KB12345678",
            "retrievalConfiguration": {
                "vectorSearchConfiguration": {"numberOfResults": 3}
            }
        }
    ]
)

for event in response["completion"]:
    if "chunk" in event:
        print(event["chunk"]["bytes"].decode())`}
      </CodeBlock>

      <BestPracticeBlock title="Agent Instructions Are Critical">
        <p>
          The <code>instruction</code> field is the system prompt for your agent — it directly
          determines agent behavior, tool selection accuracy, and response quality. Write
          instructions that define the agent's persona, enumerate its available tools and when
          to use them, specify response format requirements, and describe escalation behavior.
          Include few-shot examples of correct tool selection in the instructions. Instructions
          can be up to 4000 characters. Test with diverse inputs before deploying to production.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="warning" title="Lambda Timeout for Action Groups">
        <p>
          Bedrock Agents has a hard timeout of 60 seconds per agent invocation step. If your
          Lambda action handler takes longer (e.g., complex database queries, external API calls),
          the agent will time out and return an error. For long-running operations, implement
          an async pattern: the Lambda starts a job and returns a job ID; a separate polling
          action checks the job status. Alternatively, pre-compute and cache frequently needed
          data to keep Lambda execution under 30 seconds.
        </p>
      </NoteBlock>

      <NoteBlock type="tip" title="Using enableTrace for Debugging">
        <p>
          Always enable <code>enableTrace=True</code> during development. The trace events
          show the agent's full reasoning chain: pre-processing (input classification),
          orchestration steps (which tools were considered and why), tool invocation inputs
          and outputs, and post-processing (response formatting). This is essential for
          diagnosing why an agent called the wrong tool or produced an unexpected response.
          In production, disable tracing to reduce latency and cost.
        </p>
      </NoteBlock>
    </article>
  )
}
