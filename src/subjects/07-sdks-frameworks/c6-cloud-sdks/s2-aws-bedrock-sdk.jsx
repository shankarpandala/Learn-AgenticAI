import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'

export default function AwsBedrockSdk() {
  return (
    <article className="prose-content">
      <h2>AWS SDK for Amazon Bedrock</h2>
      <p>
        Amazon Bedrock is accessed through <strong>boto3</strong> — AWS's Python SDK. Bedrock
        exposes three main service clients: <code>bedrock</code> (management),
        <code>bedrock-runtime</code> (model invocation), and <code>bedrock-agent-runtime</code>
        (agent invocation and knowledge base retrieval). The Converse API in bedrock-runtime
        is the recommended interface for all chat-style interactions.
      </p>

      <ConceptBlock term="Converse API">
        <p>
          The Converse API is Bedrock's unified, model-agnostic chat interface. Unlike the older
          <code>invoke_model</code> API (which requires model-specific JSON payloads), Converse
          uses a consistent request schema across all supported models — Claude, Llama, Mistral,
          Nova, and others. It natively supports tool use, conversation history, streaming,
          and system prompts without per-model format juggling.
        </p>
      </ConceptBlock>

      <h2>Installation and Configuration</h2>

      <CodeBlock language="bash" filename="install.sh">
{`# boto3 is the AWS SDK for Python
pip install boto3

# For async/streaming in async frameworks
pip install aioboto3  # Async boto3

# AWS CLI for credential configuration
pip install awscli
aws configure  # Sets up ~/.aws/credentials and ~/.aws/config`}
      </CodeBlock>

      <CodeBlock language="python" filename="bedrock_client_setup.py">
{`import boto3

# Option 1: Default credentials (uses ~/.aws/credentials, env vars, or EC2 instance role)
bedrock_runtime = boto3.client("bedrock-runtime", region_name="us-east-1")

# Option 2: Explicit profile
session = boto3.Session(profile_name="prod-account")
bedrock_runtime = session.client("bedrock-runtime", region_name="us-west-2")

# Option 3: Assume a role (cross-account access)
sts = boto3.client("sts")
assumed = sts.assume_role(
    RoleArn="arn:aws:iam::123456789:role/BedrockInvokeRole",
    RoleSessionName="my-agent-session"
)
credentials = assumed["Credentials"]
bedrock_runtime = boto3.client(
    "bedrock-runtime",
    region_name="us-east-1",
    aws_access_key_id=credentials["AccessKeyId"],
    aws_secret_access_key=credentials["SecretAccessKey"],
    aws_session_token=credentials["SessionToken"]
)`}
      </CodeBlock>

      <h2>Converse API: Core Usage</h2>

      <SDKExample
        title="Bedrock Converse API — Chat, Streaming, and Tool Use"
        tabs={{
          python: `import boto3
import json

bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")

# Basic chat with Converse API
def chat(message: str, model_id: str = "anthropic.claude-3-5-sonnet-20241022-v2:0") -> str:
    response = bedrock.converse(
        modelId=model_id,
        system=[{"text": "You are a helpful AI assistant."}],
        messages=[
            {"role": "user", "content": [{"text": message}]}
        ],
        inferenceConfig={
            "maxTokens": 1024,
            "temperature": 0.7,
            "topP": 0.9,
        }
    )
    return response["output"]["message"]["content"][0]["text"]

# Multi-turn conversation
def multi_turn_chat(messages: list[dict], model_id: str) -> str:
    """messages format: [{"role": "user"|"assistant", "content": "text"}]"""
    formatted = [
        {"role": m["role"], "content": [{"text": m["content"]}]}
        for m in messages
    ]
    response = bedrock.converse(
        modelId=model_id,
        messages=formatted,
        inferenceConfig={"maxTokens": 2048, "temperature": 0}
    )
    return response["output"]["message"]["content"][0]["text"]

# Streaming
def stream_chat(message: str, model_id: str = "anthropic.claude-3-5-sonnet-20241022-v2:0") -> None:
    response = bedrock.converse_stream(
        modelId=model_id,
        messages=[{"role": "user", "content": [{"text": message}]}],
        inferenceConfig={"maxTokens": 1024}
    )
    for event in response["stream"]:
        if "contentBlockDelta" in event:
            delta = event["contentBlockDelta"]["delta"]
            if "text" in delta:
                print(delta["text"], end="", flush=True)
        elif "messageStop" in event:
            print()  # Final newline
            print(f"Stop reason: {event['messageStop']['stopReason']}")

# Tool use with Converse API
tools = [
    {
        "toolSpec": {
            "name": "query_database",
            "description": "Execute a SQL query against the analytics database",
            "inputSchema": {
                "json": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "SQL SELECT query"
                        },
                        "limit": {
                            "type": "integer",
                            "description": "Max rows to return",
                            "default": 100
                        }
                    },
                    "required": ["query"]
                }
            }
        }
    }
]

def agent_loop(user_message: str, model_id: str = "anthropic.claude-3-5-sonnet-20241022-v2:0") -> str:
    """Simple agentic loop with tool use."""
    messages = [{"role": "user", "content": [{"text": user_message}]}]

    while True:
        response = bedrock.converse(
            modelId=model_id,
            system=[{"text": "You are a data analyst. Use the query_database tool to answer questions."}],
            messages=messages,
            toolConfig={"tools": tools, "toolChoice": {"auto": {}}},
            inferenceConfig={"maxTokens": 2048, "temperature": 0}
        )

        output_msg = response["output"]["message"]
        messages.append(output_msg)
        stop_reason = response["stopReason"]

        if stop_reason == "end_turn":
            # Extract text response
            for block in output_msg["content"]:
                if "text" in block:
                    return block["text"]
            return "Done"

        elif stop_reason == "tool_use":
            tool_results = []
            for block in output_msg["content"]:
                if "toolUse" in block:
                    tool = block["toolUse"]
                    # Execute the tool
                    result = execute_tool(tool["name"], tool["input"])
                    tool_results.append({
                        "toolResult": {
                            "toolUseId": tool["toolUseId"],
                            "content": [{"json": result}],
                            "status": "success"
                        }
                    })

            messages.append({"role": "user", "content": tool_results})
        else:
            break

    return "Unexpected stop reason"

def execute_tool(name: str, inputs: dict) -> dict:
    """Mock tool execution."""
    if name == "query_database":
        return {"rows": [{"date": "2025-01", "revenue": 1234567}], "count": 1}
    return {"error": "Unknown tool"}`,
        }}
      />

      <h2>Bedrock Agent Runtime: Invoking Agents</h2>

      <SDKExample
        title="Invoking Bedrock Agents and Knowledge Bases"
        tabs={{
          python: `import boto3

bedrock_agent = boto3.client("bedrock-agent-runtime", region_name="us-east-1")

AGENT_ID = "ABCDEF1234"
AGENT_ALIAS_ID = "TSTALIASID"  # Use versioned alias in production
KNOWLEDGE_BASE_ID = "KBXYZ5678"

# Invoke a Bedrock Agent (synchronous)
def invoke_agent(user_message: str, session_id: str) -> str:
    """Invoke a Bedrock Agent and collect the full response."""
    response = bedrock_agent.invoke_agent(
        agentId=AGENT_ID,
        agentAliasId=AGENT_ALIAS_ID,
        sessionId=session_id,  # Same session_id continues a conversation
        inputText=user_message,
        enableTrace=True  # Get reasoning traces
    )

    completion = ""
    traces = []

    for event in response["completion"]:
        if "chunk" in event:
            completion += event["chunk"]["bytes"].decode("utf-8")
        elif "trace" in event:
            trace = event["trace"]["trace"]
            if "orchestrationTrace" in trace:
                traces.append(trace["orchestrationTrace"])

    return completion, traces

# Retrieve from Knowledge Base
def retrieve(query: str) -> list[dict]:
    response = bedrock_agent.retrieve(
        knowledgeBaseId=KNOWLEDGE_BASE_ID,
        retrievalQuery={"text": query},
        retrievalConfiguration={
            "vectorSearchConfiguration": {
                "numberOfResults": 5,
                "overrideSearchType": "HYBRID",
                "filter": {
                    "andAll": [
                        {"equals": {"key": "doc_type", "value": "policy"}},
                        {"greaterThan": {"key": "last_updated", "value": "2024-01-01"}}
                    ]
                }
            }
        }
    )
    return [
        {
            "content": r["content"]["text"],
            "score": r["score"],
            "uri": r["location"].get("s3Location", {}).get("uri", ""),
            "metadata": r.get("metadata", {})
        }
        for r in response["retrievalResults"]
    ]

# RetrieveAndGenerate — full managed RAG
def rag_generate(query: str, session_id: str = None) -> dict:
    request = {
        "input": {"text": query},
        "retrieveAndGenerateConfiguration": {
            "type": "KNOWLEDGE_BASE",
            "knowledgeBaseConfiguration": {
                "knowledgeBaseId": KNOWLEDGE_BASE_ID,
                "modelArn": "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0",
                "retrievalConfiguration": {
                    "vectorSearchConfiguration": {"numberOfResults": 5}
                },
                "generationConfiguration": {
                    "inferenceConfig": {
                        "textInferenceConfig": {
                            "maxTokens": 2048,
                            "temperature": 0
                        }
                    }
                }
            }
        }
    }
    if session_id:
        request["sessionId"] = session_id  # Maintains conversation context

    response = bedrock_agent.retrieve_and_generate(**request)
    return {
        "answer": response["output"]["text"],
        "citations": response.get("citations", []),
        "session_id": response.get("sessionId")
    }`,
        }}
      />

      <h2>Working with Model Responses and Token Usage</h2>

      <CodeBlock language="python" filename="bedrock_usage_tracking.py">
{`import boto3
from dataclasses import dataclass
from typing import Optional

bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")

@dataclass
class BedrockResponse:
    content: str
    input_tokens: int
    output_tokens: int
    stop_reason: str
    latency_ms: Optional[float] = None

def converse_with_usage(
    message: str,
    model_id: str = "anthropic.claude-3-5-sonnet-20241022-v2:0",
    system: str = None
) -> BedrockResponse:
    """Converse with full usage tracking."""
    import time

    kwargs = {
        "modelId": model_id,
        "messages": [{"role": "user", "content": [{"text": message}]}],
        "inferenceConfig": {"maxTokens": 2048, "temperature": 0}
    }
    if system:
        kwargs["system"] = [{"text": system}]

    start = time.perf_counter()
    response = bedrock.converse(**kwargs)
    latency = (time.perf_counter() - start) * 1000

    usage = response.get("usage", {})
    content_blocks = response["output"]["message"]["content"]
    content = "".join(b.get("text", "") for b in content_blocks)

    return BedrockResponse(
        content=content,
        input_tokens=usage.get("inputTokens", 0),
        output_tokens=usage.get("outputTokens", 0),
        stop_reason=response.get("stopReason", ""),
        latency_ms=latency
    )

# Cross-region inference using inference profiles
def converse_cross_region(message: str) -> str:
    """Use cross-region inference profile for higher availability."""
    # Inference profiles automatically route to available regions
    cross_region_model_id = (
        "us.anthropic.claude-3-5-sonnet-20241022-v2:0"  # US cross-region
        # or "eu.anthropic.claude-3-5-sonnet-20241022-v2:0" for EU
    )
    response = bedrock.converse(
        modelId=cross_region_model_id,
        messages=[{"role": "user", "content": [{"text": message}]}],
        inferenceConfig={"maxTokens": 1024}
    )
    return response["output"]["message"]["content"][0]["text"]`}
      </CodeBlock>

      <BestPracticeBlock title="Use IAM Roles, Not Access Keys">
        <p>
          Never hardcode AWS access keys. In AWS (EC2, ECS, Lambda, EKS), use IAM roles with
          the principle of least privilege: grant only <code>bedrock:InvokeModel</code> on
          specific model ARNs. Locally, use <code>aws sso login</code> or named profiles.
          Enable CloudTrail to audit every model invocation — you'll get the model ID, input
          token count, and requester identity for compliance and cost allocation.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Converse vs. invoke_model">
        <p>
          Prefer the Converse API for all new development — it handles tool use, multi-turn
          conversation, and streaming with a single consistent API across all models.
          Use <code>invoke_model</code> only for models not yet supported by Converse
          (check AWS docs for current support list) or when you need model-specific features
          not exposed via Converse.
        </p>
      </NoteBlock>
    </article>
  )
}
