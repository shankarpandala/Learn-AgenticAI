import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function BedrockGuardrails() {
  return (
    <article className="prose-content">
      <h2>Amazon Bedrock Guardrails: Responsible AI Moderation</h2>
      <p>
        Amazon Bedrock Guardrails is a configurable content moderation and safety layer that
        sits between your application and any foundation model. Unlike model-specific safety
        features (which vary across providers), Guardrails provides a <strong>consistent,
        auditable, and configurable</strong> safety policy that applies uniformly across all
        models — Claude, Llama, Nova, Mistral, and others. Guardrails can be applied to input
        (what users send), output (what the model returns), or both simultaneously.
      </p>

      <ArchitectureDiagram
        title="Bedrock Guardrails in the Inference Pipeline"
        width={700}
        height={280}
        nodes={[
          { id: 'user', label: 'User Input', type: 'external', x: 70, y: 140 },
          { id: 'input_guard', label: 'Input\nGuardrail', type: 'tool', x: 210, y: 140 },
          { id: 'model', label: 'Foundation\nModel', type: 'llm', x: 380, y: 140 },
          { id: 'output_guard', label: 'Output\nGuardrail', type: 'tool', x: 540, y: 140 },
          { id: 'app', label: 'Application', type: 'external', x: 650, y: 140 },
          { id: 'blocked', label: 'Blocked\nResponse', type: 'store', x: 210, y: 60 },
          { id: 'redacted', label: 'PII\nRedacted', type: 'store', x: 540, y: 60 },
          { id: 'audit', label: 'CloudWatch\nAudit Log', type: 'store', x: 380, y: 240 },
        ]}
        edges={[
          { from: 'user', to: 'input_guard', label: 'raw input' },
          { from: 'input_guard', to: 'blocked', label: 'if violation' },
          { from: 'input_guard', to: 'model', label: 'pass / redact' },
          { from: 'model', to: 'output_guard', label: 'raw output' },
          { from: 'output_guard', to: 'redacted', label: 'if PII found' },
          { from: 'output_guard', to: 'app', label: 'safe output' },
          { from: 'input_guard', to: 'audit' },
          { from: 'output_guard', to: 'audit' },
        ]}
      />

      <h2>Guardrail Policy Types</h2>

      <ConceptBlock term="Content Filters">
        <p>
          Content filters evaluate text for six harmful categories, each with an independently
          configurable threshold (<strong>NONE, LOW, MEDIUM, HIGH</strong>). Higher thresholds
          are more permissive (less likely to block); lower thresholds are stricter. Categories:
        </p>
        <ul>
          <li><strong>HATE</strong> — Content denigrating people based on protected characteristics</li>
          <li><strong>INSULTS</strong> — Bullying, demeaning, or derogatory language</li>
          <li><strong>SEXUAL</strong> — Explicit sexual content</li>
          <li><strong>VIOLENCE</strong> — Graphic violence, threats, or glorification of harm</li>
          <li><strong>MISCONDUCT</strong> — Criminal activity instructions, fraud, cyberattacks</li>
          <li><strong>PROMPT_ATTACK</strong> — Jailbreak attempts and prompt injection</li>
        </ul>
        <p>
          Each category has separate <code>inputStrength</code> (for user input) and
          <code>outputStrength</code> (for model output) settings, allowing asymmetric policies
          — for example, aggressively blocking prompt attacks on input but being more permissive
          on output for a creative writing application.
        </p>
      </ConceptBlock>

      <ConceptBlock term="Denied Topics">
        <p>
          Denied topics let you block discussion of specific subjects regardless of how they are
          phrased. You define each topic with a natural language <strong>definition</strong> (up
          to 200 characters) that describes what to block. Bedrock uses semantic matching —
          not keyword matching — so paraphrased requests are still caught. Examples: blocking
          competitors' product comparisons, preventing legal advice, restricting discussion of
          internal pricing strategies.
        </p>
      </ConceptBlock>

      <ConceptBlock term="PII Redaction">
        <p>
          Guardrails can detect and either <strong>BLOCK</strong> (reject the request) or
          <strong>ANONYMIZE</strong> (replace with a placeholder like <code>[NAME]</code>)
          13 types of personally identifiable information:
        </p>
        <ul>
          <li><code>NAME</code>, <code>EMAIL</code>, <code>PHONE</code>, <code>US_SSN</code></li>
          <li><code>ADDRESS</code>, <code>AGE</code>, <code>USERNAME</code>, <code>PASSWORD</code></li>
          <li><code>DRIVER_ID</code>, <code>CREDIT_DEBIT_NUMBER</code>, <code>CREDIT_DEBIT_CVV</code></li>
          <li><code>US_PASSPORT_NUMBER</code>, <code>IP_ADDRESS</code>, <code>URL</code></li>
        </ul>
        <p>
          PII detection can be applied to input (preventing users from leaking credentials to
          the model), output (ensuring the model doesn't regurgitate PII from its training data),
          or both.
        </p>
      </ConceptBlock>

      <ConceptBlock term="Grounding Check (Hallucination Detection)">
        <p>
          The <strong>grounding check</strong> compares model output against a provided
          <em>grounding source</em> (retrieved documents, a knowledge base, or reference text).
          It computes a grounding score from 0 to 1 and blocks responses below a configurable
          threshold. This is the primary mechanism for detecting RAG hallucinations — cases
          where the model generates claims not supported by the retrieved context. A typical
          threshold is 0.7; scores below that trigger a block action.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Creating and Configuring a Bedrock Guardrail"
        tabs={{
          python: `import boto3

bedrock = boto3.client("bedrock", region_name="us-east-1")

# Create a comprehensive guardrail
response = bedrock.create_guardrail(
    name="production-safety-guardrail",
    description="Content moderation for customer-facing AI assistant",

    # Content filters with asymmetric thresholds
    contentPolicyConfig={
        "filtersConfig": [
            {"type": "HATE",          "inputStrength": "HIGH",   "outputStrength": "HIGH"},
            {"type": "INSULTS",       "inputStrength": "MEDIUM", "outputStrength": "MEDIUM"},
            {"type": "SEXUAL",        "inputStrength": "HIGH",   "outputStrength": "HIGH"},
            {"type": "VIOLENCE",      "inputStrength": "MEDIUM", "outputStrength": "MEDIUM"},
            {"type": "MISCONDUCT",    "inputStrength": "HIGH",   "outputStrength": "HIGH"},
            {"type": "PROMPT_ATTACK", "inputStrength": "HIGH",   "outputStrength": "NONE"},
        ]
    },

    # Block specific topics
    topicPolicyConfig={
        "topicsConfig": [
            {
                "name": "competitor-comparison",
                "definition": "Questions asking to compare our products with competitors or recommend competitor products",
                "examples": [
                    "Is your product better than CompetitorX?",
                    "Why should I choose you over CompetitorY?"
                ],
                "type": "DENY"
            },
            {
                "name": "legal-advice",
                "definition": "Requests for specific legal advice, legal opinions, or interpretation of laws",
                "examples": ["Am I liable if...", "Is this contract enforceable?"],
                "type": "DENY"
            }
        ]
    },

    # PII redaction on both input and output
    sensitiveInformationPolicyConfig={
        "piiEntitiesConfig": [
            {"type": "NAME",                 "action": "ANONYMIZE"},
            {"type": "EMAIL",                "action": "ANONYMIZE"},
            {"type": "PHONE",                "action": "ANONYMIZE"},
            {"type": "US_SSN",               "action": "BLOCK"},
            {"type": "CREDIT_DEBIT_NUMBER",  "action": "BLOCK"},
            {"type": "PASSWORD",             "action": "BLOCK"},
            {"type": "USERNAME",             "action": "ANONYMIZE"},
            {"type": "ADDRESS",              "action": "ANONYMIZE"},
            {"type": "AGE",                  "action": "ANONYMIZE"},
            {"type": "IP_ADDRESS",           "action": "ANONYMIZE"},
        ],
        # Custom regex patterns (e.g., internal employee IDs)
        "regexesConfig": [
            {
                "name": "employee-id",
                "description": "Internal employee ID format EMP-XXXXXX",
                "pattern": "EMP-[0-9]{6}",
                "action": "ANONYMIZE"
            }
        ]
    },

    # Word-level filters
    wordPolicyConfig={
        "wordsConfig": [
            {"text": "competitor_product_name"},
            {"text": "internal_codename"},
        ],
        # Managed lists: AWS provides a profanity word list
        "managedWordListsConfig": [
            {"type": "PROFANITY"}
        ]
    },

    # Grounding check for RAG hallucination detection
    contextualGroundingPolicyConfig={
        "filtersConfig": [
            {
                "type": "GROUNDING",
                "threshold": 0.7  # Block if grounding score < 0.7
            },
            {
                "type": "RELEVANCE",
                "threshold": 0.5  # Block if response is off-topic
            }
        ]
    },

    # Messages shown when guardrail blocks
    blockedInputMessaging="I'm sorry, I can't process that request. Please rephrase your question.",
    blockedOutputsMessaging="I'm unable to provide that information. Please contact support for assistance.",

    # KMS encryption for guardrail config
    kmsKeyId="arn:aws:kms:us-east-1:123456789:key/mrk-abc123"
)

guardrail_id = response["guardrailId"]
guardrail_version = response["version"]
print(f"Guardrail created: {guardrail_id} v{guardrail_version}")

# Create an immutable published version
version_response = bedrock.create_guardrail_version(
    guardrailIdentifier=guardrail_id,
    description="Production release 2024-01"
)
print("Published version:", version_response["version"])`,
        }}
      />

      <h2>Applying Guardrails to Model Calls</h2>
      <p>
        Guardrails integrate directly into the Converse and InvokeModel APIs by adding
        <code>guardrailConfig</code> to the request. For the grounding check, you additionally
        pass a <code>grounding source</code> as a special content block in the conversation.
      </p>

      <CodeBlock language="python" filename="apply_guardrail_converse.py">
{`import boto3

bedrock_rt = boto3.client("bedrock-runtime", region_name="us-east-1")

GUARDRAIL_ID = "abcdef123456"
GUARDRAIL_VERSION = "1"  # Use "DRAFT" for testing

# ── Basic guardrail application via Converse ──────────────────────────────
response = bedrock_rt.converse(
    modelId="anthropic.claude-3-5-sonnet-20241022-v2:0",
    messages=[
        {"role": "user", "content": [{"text": "How do I pick a lock?"}]}
    ],
    guardrailConfig={
        "guardrailIdentifier": GUARDRAIL_ID,
        "guardrailVersion": GUARDRAIL_VERSION,
        "trace": "enabled"  # Include guardrail assessment in response
    },
    inferenceConfig={"maxTokens": 1024}
)

# Check if guardrail intervened
if response.get("stopReason") == "guardrail_intervened":
    assessments = response.get("trace", {}).get("guardrail", {})
    input_assessment = assessments.get("inputAssessment", {})
    output_assessments = assessments.get("outputAssessments", {})
    print("Guardrail blocked the request")
    print("Assessment:", input_assessment)
else:
    print(response["output"]["message"]["content"][0]["text"])


# ── Grounding check with RAG context ─────────────────────────────────────
retrieved_context = """
Product warranty covers manufacturing defects for 2 years from purchase date.
Physical damage, water damage, and unauthorized modifications are not covered.
To file a warranty claim, contact support@company.com with your proof of purchase.
"""

response = bedrock_rt.converse(
    modelId="anthropic.claude-3-5-sonnet-20241022-v2:0",
    messages=[
        {
            "role": "user",
            "content": [
                # Grounding source: the retrieved context
                {
                    "guardContent": {
                        "text": {
                            "text": retrieved_context,
                            "qualifiers": ["grounding_source"]
                        }
                    }
                },
                # The actual user question
                {"text": "Does my warranty cover water damage?"}
            ]
        }
    ],
    guardrailConfig={
        "guardrailIdentifier": GUARDRAIL_ID,
        "guardrailVersion": GUARDRAIL_VERSION,
        "trace": "enabled"
    },
    inferenceConfig={"maxTokens": 512}
)

# If the model says "yes, water damage is covered" (hallucination),
# the grounding check will block it since the context says otherwise.
print(response["output"]["message"]["content"][0]["text"])`}
      </CodeBlock>

      <h2>Standalone ApplyGuardrail API</h2>
      <p>
        The <code>apply_guardrail</code> API lets you check text against a guardrail
        <em>without invoking a model</em>. This is useful for pre-screening user input in
        pipelines where the model call happens elsewhere (e.g., a non-Bedrock model, a RAG
        retrieval step, or validating agent tool outputs).
      </p>

      <CodeBlock language="python" filename="apply_guardrail_standalone.py">
{`import boto3

bedrock_rt = boto3.client("bedrock-runtime", region_name="us-east-1")

# Screen text without calling a model
response = bedrock_rt.apply_guardrail(
    guardrailIdentifier="abcdef123456",
    guardrailVersion="1",
    source="INPUT",  # or "OUTPUT"
    content=[
        {
            "text": {
                "text": "My SSN is 123-45-6789 and my email is john@example.com",
                "qualifiers": []
            }
        }
    ]
)

print("Action:", response["action"])  # GUARDRAIL_INTERVENED or NONE

if response["action"] == "GUARDRAIL_INTERVENED":
    # Get the outputs (PII redacted version)
    for output in response["outputs"]:
        print("Redacted text:", output["text"])

    # Inspect which assessments triggered
    for assessment in response["assessments"]:
        if "sensitiveInformationPolicy" in assessment:
            pii_groups = assessment["sensitiveInformationPolicy"].get("piiEntities", [])
            for entity in pii_groups:
                print(f"PII found: {entity['type']} (action: {entity['action']})")`}
      </CodeBlock>

      <PatternBlock
        name="Defense-in-Depth with Guardrails"
        category="Security"
        whenToUse="For any customer-facing AI application where content safety, regulatory compliance, or data privacy are requirements."
      >
        <p>
          Layer guardrails with model-level safety features: use Claude's built-in safety as
          the first line of defense, then add a Bedrock Guardrail for consistent cross-model
          policy enforcement. Apply guardrails on <em>both</em> input and output — input guards
          catch prompt injection and jailbreaks before they reach the model; output guards catch
          model-generated PII, hallucinations, or policy violations. Log all guardrail assessments
          to CloudWatch for compliance audit trails.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Versioning Guardrails Like Code">
        <p>
          Always work in <code>DRAFT</code> mode during development, then publish a numbered
          version for production deployment. Your Converse calls should reference the published
          version number (e.g., <code>"1"</code>), not <code>"DRAFT"</code>. This ensures
          guardrail policy changes don't silently affect production. Maintain guardrail
          configuration as Infrastructure as Code (CloudFormation or Terraform) alongside
          your application code so policy changes go through the same review process as code changes.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="warning" title="Grounding Threshold Calibration">
        <p>
          Setting the grounding threshold too high (e.g., 0.9) causes excessive false positives —
          legitimate correct answers get blocked because they naturally paraphrase the source.
          Start at 0.5 during development and increase gradually while measuring false positive
          rates. Evaluate against a test set of known-correct and known-hallucinated responses
          before setting the production threshold. The grounding score is sensitive to response
          length — short factual answers tend to score lower than longer explanations.
        </p>
      </NoteBlock>

      <NoteBlock type="info" title="Guardrails Cost Model">
        <p>
          Guardrails are billed per-policy-unit processed. Each text unit is 1000 characters.
          Content filters, denied topics, and word filters are charged per text unit on input
          and output. PII detection has a separate per-text-unit rate. The grounding check
          (which runs a semantic similarity model) is more expensive. For high-volume
          applications, benchmark guardrail costs alongside model inference costs — on some
          workloads, guardrail processing can add 15-30% to inference cost.
        </p>
      </NoteBlock>
    </article>
  )
}
