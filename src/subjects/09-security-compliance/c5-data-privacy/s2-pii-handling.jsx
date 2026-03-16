import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'

export default function PiiHandling() {
  return (
    <article className="prose-content">
      <h2>PII Detection and Handling in AI Pipelines</h2>
      <p>
        Personally Identifiable Information (PII) flowing through AI agent pipelines creates
        regulatory obligations and security risks at every stage: input collection, context
        construction, LLM API transmission, output generation, logging, and storage. A principled
        PII handling strategy combines detection (finding PII), classification (labelling its
        sensitivity), and treatment (anonymisation, pseudonymisation, redaction, or access
        restriction). This section covers each stage with production-ready patterns.
      </p>

      <h2>PII Detection with Microsoft Presidio</h2>

      <ConceptBlock term="Named Entity Recognition for PII">
        <p>
          Rule-based regex detects structured PII (SSNs, credit cards, email addresses) reliably
          but misses unstructured PII like full names, organisations, and freeform addresses.
          Microsoft Presidio combines regex recognisers with spaCy NER models to detect both
          structured and unstructured PII across many languages and entity types. It supports
          custom recognisers, is open-source, and can be deployed as a local service with no
          data leaving your environment.
        </p>
      </ConceptBlock>

      <SDKExample
        title="PII Detection with Presidio Before LLM Processing"
        tabs={{
          python: `from presidio_analyzer import AnalyzerEngine, RecognizerResult
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig
import anthropic

# pip install presidio-analyzer presidio-anonymizer
# python -m spacy download en_core_web_lg  (for NER)

analyzer = AnalyzerEngine()
anonymizer = AnonymizerEngine()
client = anthropic.Anthropic()

PII_ENTITIES = [
    "PERSON", "EMAIL_ADDRESS", "PHONE_NUMBER", "CREDIT_CARD",
    "US_SSN", "IP_ADDRESS", "LOCATION", "DATE_TIME",
    "MEDICAL_LICENSE", "US_PASSPORT", "IBAN_CODE",
]

def detect_pii(text: str, language: str = "en") -> list[RecognizerResult]:
    """Detect PII entities in text using Presidio."""
    return analyzer.analyze(text=text, entities=PII_ENTITIES, language=language)

def anonymise_text(text: str, language: str = "en") -> tuple[str, list[dict]]:
    """
    Replace PII with entity-type placeholders.
    Returns (anonymised_text, list_of_detected_entities).
    """
    results = detect_pii(text, language)
    if not results:
        return text, []

    anonymised = anonymizer.anonymize(
        text=text,
        analyzer_results=results,
        operators={
            "DEFAULT": OperatorConfig("replace", {"new_value": "<{entity_type}>"}),
            "PERSON": OperatorConfig("replace", {"new_value": "<PERSON>"}),
            "EMAIL_ADDRESS": OperatorConfig("replace", {"new_value": "<EMAIL>"}),
            "PHONE_NUMBER": OperatorConfig("replace", {"new_value": "<PHONE>"}),
            "CREDIT_CARD": OperatorConfig("replace", {"new_value": "<CREDIT_CARD>"}),
        },
    )

    detected = [
        {"entity_type": r.entity_type, "score": r.score, "start": r.start, "end": r.end}
        for r in results
    ]
    return anonymised.text, detected

def pseudonymise_text(text: str, key: str = "secret-key") -> tuple[str, dict]:
    """
    Replace PII with consistent pseudonyms (same value → same pseudonym).
    Allows de-pseudonymisation if needed, unlike anonymisation.
    """
    import hashlib
    results = detect_pii(text)
    entity_map: dict[str, str] = {}
    result_text = text

    # Sort by position (reverse) to replace without shifting offsets
    for r in sorted(results, key=lambda x: x.start, reverse=True):
        original = text[r.start:r.end]
        # HMAC-based pseudonym: consistent, keyed, reversible with key
        pseudonym = "PSEUDO_" + hashlib.hmac_sha256_hex(key.encode(), original.encode())[:8].upper() \
            if hasattr(hashlib, "hmac_sha256_hex") else \
            "PSEUDO_" + hashlib.sha256(f"{key}:{original}".encode()).hexdigest()[:8].upper()
        entity_map[pseudonym] = original
        result_text = result_text[:r.start] + pseudonym + result_text[r.end:]

    return result_text, entity_map

def process_document_with_pii_handling(document: str, task: str) -> str:
    """
    Process a document through an LLM after anonymising PII.
    Suitable for tasks where PII identity is irrelevant to the output.
    """
    anonymised, detected = anonymise_text(document)

    if detected:
        import logging
        logging.getLogger("pii").info(
            "Anonymised %d PII entities before LLM call: %s",
            len(detected),
            [d["entity_type"] for d in detected],
        )

    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": f"Task: {task}\\n\\nDocument:\\n{anonymised}"}],
    )
    return response.content[0].text`,
          typescript: `// Note: Presidio is Python-native.
// For TypeScript, use AWS Comprehend or a Presidio microservice.

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

// Simple regex-based PII detection for TypeScript environments
const PII_REGEXES: Record<string, RegExp> = {
  EMAIL: /[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}/g,
  PHONE: /\\b(\\+1[\\s\\-]?)?\\(?[0-9]{3}\\)?[\\s\\-]?[0-9]{3}[\\s\\-]?[0-9]{4}\\b/g,
  SSN: /\\b[0-9]{3}[\\-]?[0-9]{2}[\\-]?[0-9]{4}\\b/g,
  CREDIT_CARD: /\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})\\b/g,
}

function anonymiseText(text: string): { anonymised: string; detectedTypes: string[] } {
  let result = text
  const detectedTypes: string[] = []

  for (const [entityType, regex] of Object.entries(PII_REGEXES)) {
    const freshRegex = new RegExp(regex.source, 'g')
    if (freshRegex.test(result)) {
      detectedTypes.push(entityType)
      result = result.replace(new RegExp(regex.source, 'g'), <\${entityType}>)
    }
  }
  return { anonymised: result, detectedTypes }
}

async function processWithPiiHandling(document: string, task: string): Promise<string> {
  const { anonymised, detectedTypes } = anonymiseText(document)

  if (detectedTypes.length > 0) {
    console.info('Anonymised PII before LLM call:', detectedTypes)
  }

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: Task: \${task}\\n\\nDocument:\\n\${anonymised} }],
  })
  return (response.content[0] as Anthropic.TextBlock).text
}`,
        }}
      />

      <h2>Anonymisation vs. Pseudonymisation</h2>

      <ConceptBlock term="Anonymisation vs. Pseudonymisation">
        <p>
          <strong>Anonymisation</strong> irreversibly removes the link between data and an
          individual — once anonymised, GDPR no longer applies. True anonymisation is hard
          to achieve: even "anonymised" datasets can often be re-identified by combining fields.
          <strong>Pseudonymisation</strong> replaces identifying data with a reversible token
          (e.g., a keyed hash) — re-identification is possible with the key. Pseudonymised data
          is still personal data under GDPR but attracts reduced obligations. Choose the right
          technique based on whether downstream processes need to re-link the data.
        </p>
      </ConceptBlock>

      <WarningBlock title="LLM Outputs Can Reconstruct PII from Partial Information">
        <p>
          If an agent's context contains partial PII (first name + city + employer), a sufficiently
          capable LLM may reconstruct or infer a full identity in its output. Anonymising individual
          fields is not sufficient if the combination remains re-identifying. Apply a combination
          review: even after field-level redaction, does the remaining context still uniquely
          identify an individual? If so, additional fields must be removed or generalised.
        </p>
      </WarningBlock>

      <SecurityCallout severity="high" title="PII in Logs and Traces Is a Silent GDPR Risk">
        Agent frameworks that log full prompt and completion text (LangSmith, Langfuse, custom
        observability) will capture all PII present in the conversation. This PII in logs becomes
        subject to GDPR retention and deletion obligations. Configure logging to either strip PII
        before writing to logs, or ensure log storage has appropriate retention policies and access
        controls. Treat observability data stores as personal data stores.
      </SecurityCallout>

      <BestPracticeBlock title="Test PII Handling with Synthetic Data">
        <p>
          Do not test your PII detection and anonymisation pipeline with real customer data.
          Use synthetic PII generators (Faker, Mimesis) to create realistic but fictional test
          records. Synthetic PII lets you validate regex patterns, NER model accuracy, and
          anonymisation coverage without creating compliance obligations. Build a synthetic PII
          test suite that covers all entity types you expect to encounter, including edge cases
          (hyphenated names, international phone formats, non-US SSN equivalents).
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Use Presidio Analyzer as a Microservice">
        <p>
          For polyglot environments (TypeScript frontend, Python ML services), deploy the
          Presidio Analyzer as a REST microservice using the official Docker image
          (<code>mcr.microsoft.com/presidio-analyzer</code>). All services call the shared
          analyser API, ensuring consistent PII detection across languages without duplicating
          detection logic. The analyser returns entity spans that any service can use for
          redaction, tokenisation, or routing decisions.
        </p>
      </NoteBlock>
    </article>
  )
}
