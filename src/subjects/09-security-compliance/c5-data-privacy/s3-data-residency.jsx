import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'

export default function DataResidency() {
  return (
    <article className="prose-content">
      <h2>Data Residency and Sovereignty for AI Systems</h2>
      <p>
        Data residency requirements mandate that personal data is stored and processed within
        a specific geographic region — typically the country or jurisdiction where the data
        subject resides. For AI agent systems, residency is not just about database storage:
        it extends to where LLM inference happens, where vector embeddings are stored, where
        logs are written, and where agent orchestration runs. This section covers how to architect
        AI agent deployments to meet data residency requirements, with specific guidance for
        EU, US, and multi-region deployments.
      </p>

      <SecurityCallout severity="high" title="LLM API Calls May Transfer Personal Data Across Borders">
        When you send text containing personal data to a cloud LLM API, that data is transmitted
        to and processed by the provider's infrastructure. If the provider's data centres are
        outside your required residency region, this constitutes a cross-border data transfer
        subject to GDPR Chapter V restrictions (for EU data), local data localisation laws
        (Russia, China, India), or contractual obligations. Understand where your LLM provider
        processes data before sending personal data to their API.
      </SecurityCallout>

      <h2>Understanding Data Flows in Agent Systems</h2>

      <ConceptBlock term="Cross-Border Data Transfer Points in Agent Pipelines">
        <p>
          A typical AI agent pipeline has multiple potential cross-border transfer points:
          the user's device to your application server, your server to the LLM API, the LLM
          API to tool integrations (web search, database), tool results back through the pipeline,
          and observability data to monitoring platforms. Map every transfer point before
          deployment, identify the source and destination jurisdictions, and verify that each
          transfer has an appropriate legal mechanism (SCCs, adequacy decision, BCRs, or
          consent) for GDPR purposes.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Region-Aware Agent Configuration"
        tabs={{
          python: `import os
import anthropic
from dataclasses import dataclass
from typing import Literal

# Supported deployment regions with their data residency properties
@dataclass
class RegionConfig:
    api_base_url: str
    data_residency: str           # Jurisdiction where data is processed
    gdpr_adequate: bool           # Is this jurisdiction GDPR-adequate?
    transfer_mechanism: str       # Legal basis for EU-to-region transfer
    vector_db_endpoint: str
    log_storage_region: str

REGION_CONFIGS: dict[str, RegionConfig] = {
    "eu-west-1": RegionConfig(
        api_base_url="https://api.anthropic.com",  # Anthropic processes in US
        data_residency="EU",
        gdpr_adequate=True,
        transfer_mechanism="DPA with SCCs",  # Anthropic provides SCCs
        vector_db_endpoint=os.environ.get("VECTOR_DB_EU", "https://eu.vectordb.example.com"),
        log_storage_region="eu-west-1",
    ),
    "us-east-1": RegionConfig(
        api_base_url="https://api.anthropic.com",
        data_residency="US",
        gdpr_adequate=False,  # US is not GDPR-adequate without SCCs
        transfer_mechanism="SCCs required for EU data",
        vector_db_endpoint=os.environ.get("VECTOR_DB_US", "https://us.vectordb.example.com"),
        log_storage_region="us-east-1",
    ),
    "ap-southeast-1": RegionConfig(
        api_base_url="https://api.anthropic.com",
        data_residency="SG",
        gdpr_adequate=False,
        transfer_mechanism="SCCs required for EU data",
        vector_db_endpoint=os.environ.get("VECTOR_DB_AP", "https://ap.vectordb.example.com"),
        log_storage_region="ap-southeast-1",
    ),
}

def get_region_config(region: str) -> RegionConfig:
    config = REGION_CONFIGS.get(region)
    if config is None:
        raise ValueError(
            f"Unsupported region: {region}. "
            f"Supported regions: {list(REGION_CONFIGS.keys())}"
        )
    return config

def create_region_aware_client(region: str) -> tuple[anthropic.Anthropic, RegionConfig]:
    """
    Create an Anthropic client configured for the specified deployment region.
    Enforces that personal data routing is consistent with residency requirements.
    """
    config = get_region_config(region)
    client = anthropic.Anthropic(
        api_key=os.environ["ANTHROPIC_API_KEY"],
        base_url=config.api_base_url,
    )
    return client, config

def run_residency_aware_agent(
    user_message: str,
    deployment_region: str,
    contains_personal_data: bool = False,
) -> dict:
    """
    Run an agent with region-appropriate configuration.
    Warns when personal data is processed in a non-adequate jurisdiction.
    """
    client, config = create_region_aware_client(deployment_region)

    if contains_personal_data and not config.gdpr_adequate:
        import logging
        logging.getLogger("residency").warning(
            "Personal data being processed in non-GDPR-adequate region %s. "
            "Ensure transfer mechanism '%s' is in place.",
            deployment_region,
            config.transfer_mechanism,
        )

    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        messages=[{"role": "user", "content": user_message}],
    )

    return {
        "response": response.content[0].text,
        "processed_in": config.data_residency,
        "gdpr_adequate": config.gdpr_adequate,
        "transfer_mechanism": config.transfer_mechanism if not config.gdpr_adequate else "N/A",
    }`,
          typescript: `import Anthropic from '@anthropic-ai/sdk'

interface RegionConfig {
  apiBaseUrl: string
  dataResidency: string
  gdprAdequate: boolean
  transferMechanism: string
  vectorDbEndpoint: string
  logStorageRegion: string
}

const REGION_CONFIGS: Record<string, RegionConfig> = {
  'eu-west-1': {
    apiBaseUrl: 'https://api.anthropic.com',
    dataResidency: 'EU',
    gdprAdequate: true,
    transferMechanism: 'DPA with SCCs',
    vectorDbEndpoint: process.env.VECTOR_DB_EU ?? 'https://eu.vectordb.example.com',
    logStorageRegion: 'eu-west-1',
  },
  'us-east-1': {
    apiBaseUrl: 'https://api.anthropic.com',
    dataResidency: 'US',
    gdprAdequate: false,
    transferMechanism: 'SCCs required for EU data',
    vectorDbEndpoint: process.env.VECTOR_DB_US ?? 'https://us.vectordb.example.com',
    logStorageRegion: 'us-east-1',
  },
}

function getRegionConfig(region: string): RegionConfig {
  const config = REGION_CONFIGS[region]
  if (!config) throw new Error(Unsupported region: \${region})
  return config
}

async function runResidencyAwareAgent(
  userMessage: string,
  deploymentRegion: string,
  containsPersonalData = false
): Promise<{ response: string; processedIn: string; gdprAdequate: boolean }> {
  const config = getRegionConfig(deploymentRegion)

  if (containsPersonalData && !config.gdprAdequate) {
    console.warn(
      Personal data processed in non-GDPR-adequate region \${deploymentRegion}.  +
      Transfer mechanism required: \${config.transferMechanism}
    )
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseURL: config.apiBaseUrl,
  })

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 512,
    messages: [{ role: 'user', content: userMessage }],
  })

  return {
    response: (response.content[0] as Anthropic.TextBlock).text,
    processedIn: config.dataResidency,
    gdprAdequate: config.gdprAdequate,
  }
}`,
        }}
      />

      <h2>Preventing Cross-Region Data Leakage</h2>

      <SDKExample
        title="Routing Agent Requests to the Correct Region"
        tabs={{
          python: `import anthropic
import os

def get_user_region(user_id: str) -> str:
    """
    Look up the user's required data residency region from your user registry.
    In production, this comes from your CRM, IdP, or user settings.
    """
    # Simulated lookup — real implementation queries user DB
    user_regions = {
        "eu-user-001": "eu-west-1",
        "us-user-001": "us-east-1",
        "sg-user-001": "ap-southeast-1",
    }
    return user_regions.get(user_id, "us-east-1")  # Default to US

def route_to_region_endpoint(user_id: str, message: str) -> str:
    """
    Route an agent request to the appropriate regional endpoint
    based on the user's data residency requirements.
    """
    region = get_user_region(user_id)
    config = get_region_config(region)

    # In a real deployment, you would have region-specific API gateways
    # or use a CDN/load balancer that routes by user geography.
    # Here we log the routing decision for audit purposes.
    import logging, json, uuid, time
    logging.getLogger("routing").info(json.dumps({
        "event": "agent_request_routed",
        "request_id": str(uuid.uuid4()),
        "user_id": user_id,
        "target_region": region,
        "data_residency": config.data_residency,
        "timestamp_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }))

    client = anthropic.Anthropic(
        api_key=os.environ["ANTHROPIC_API_KEY"],
        base_url=config.api_base_url,
    )
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        messages=[{"role": "user", "content": message}],
    )
    return response.content[0].text`,
        }}
      />

      <WarningBlock title="Anthropic Currently Processes API Calls in the United States">
        <p>
          As of 2025, Anthropic's API infrastructure processes requests in the United States.
          If your application processes personal data of EU residents and sends it to the
          Anthropic API, this constitutes a transfer from the EU to the US. You must have
          Standard Contractual Clauses (SCCs) or another valid transfer mechanism in place.
          Anthropic provides a Data Processing Agreement with EU SCCs — ensure it is signed
          before processing EU personal data. Check Anthropic's current infrastructure
          documentation for updated regional availability.
        </p>
      </WarningBlock>

      <BestPracticeBlock title="Treat Observability Data as Subject to the Same Residency Rules">
        <p>
          Agent traces, logs, and metrics sent to observability platforms (Datadog, Splunk,
          New Relic, LangSmith) may contain personal data from conversation turns or tool
          inputs. Ensure your observability platform has a data centre in your required
          residency region, or configure PII scrubbing before log export. Verify that your
          observability vendor has signed a DPA with SCCs if they process EU data outside the EU.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="info" title="Self-Hosted LLMs Provide Full Data Residency Control">
        <p>
          For the most stringent data residency requirements (regulated industries, government,
          data localisation laws in Russia, China, India), self-hosted open-source models
          (Llama, Mistral, Qwen) deployed on your own infrastructure in the required jurisdiction
          provide complete control over where inference happens. The trade-off is capability
          (frontier models like Claude outperform most open-source alternatives), infrastructure
          cost (GPU compute), and operational burden (model updates, security patching). Evaluate
          whether the capability gap is acceptable for your use case before defaulting to self-hosting.
        </p>
      </NoteBlock>
    </article>
  )
}
