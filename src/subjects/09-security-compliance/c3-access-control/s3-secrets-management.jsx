import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'

export default function SecretsManagement() {
  return (
    <article className="prose-content">
      <h2>Secrets Management for AI Agents</h2>
      <p>
        AI agents often need access to sensitive credentials: LLM API keys, database passwords,
        third-party service tokens, and encryption keys. Mishandling these secrets is one of the
        most common and costly security failures in production systems. Agents add unique risk
        vectors: secrets could be echoed into context windows, logged in traces, or exfiltrated
        by prompt injection attacks. This section covers secure secret storage, retrieval, and
        the critical rule that secrets must never appear in prompts.
      </p>

      <SecurityCallout severity="critical" title="Never Put Secrets in Prompts or Agent Context">
        API keys, passwords, and tokens placed in system prompts, tool descriptions, or conversation
        history are visible to the LLM and will appear in logs, traces, and potentially in model
        outputs. Even if you trust your current LLM provider, future model updates, log ingestion
        pipelines, or observability tools may expose them. Keep secrets in environment variables
        or secrets managers and inject them only into code, never into text.
      </SecurityCallout>

      <h2>Environment Variables and .env Files</h2>

      <ConceptBlock term="Environment Variable Injection">
        <p>
          Environment variables are the baseline for secret injection in containerised deployments.
          They keep secrets out of code and are supported by every deployment platform. For local
          development, use <code>.env</code> files loaded by <code>python-dotenv</code> or
          <code>dotenv</code> for Node.js — but ensure <code>.env</code> is in <code>.gitignore</code>
          and is never committed to version control. In production, inject environment variables
          via Kubernetes Secrets, AWS ECS task definitions, or Cloud Run service configurations.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Correct Pattern: Load Secrets from Environment"
        tabs={{
          python: `import os
import anthropic
from dotenv import load_dotenv  # pip install python-dotenv

# Load .env file for local development only
load_dotenv()

def get_required_env(key: str) -> str:
    """Get an environment variable or raise a clear error at startup."""
    value = os.environ.get(key)
    if not value:
        raise EnvironmentError(
            f"Required environment variable '{key}' is not set. "
            "Set it in your .env file (local) or deployment configuration (production)."
        )
    return value

# Secrets loaded from environment — never hardcoded or in prompts
ANTHROPIC_API_KEY = get_required_env("ANTHROPIC_API_KEY")
DATABASE_URL = get_required_env("DATABASE_URL")
THIRD_PARTY_API_KEY = get_required_env("THIRD_PARTY_API_KEY")

# Client uses the key but never exposes it to the LLM
client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

def call_third_party_api(endpoint: str, params: dict) -> dict:
    """
    Use the third-party API key in the HTTP header — never pass it to the LLM.
    The LLM receives only the result, not the credential.
    """
    import requests
    response = requests.get(
        f"https://api.thirdparty.com/{endpoint}",
        headers={"Authorization": f"Bearer {THIRD_PARTY_API_KEY}"},
        params=params,
        timeout=10,
    )
    response.raise_for_status()
    return response.json()

# --- WRONG: Never do this ---
# system_prompt = f"Use API key {THIRD_PARTY_API_KEY} to call the service"
# messages = [{"role": "user", "content": f"DB password is {DATABASE_URL}"}]`,
          typescript: `import Anthropic from '@anthropic-ai/sdk'
import * as dotenv from 'dotenv'

dotenv.config()  // Load .env for local dev

function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(
      Required environment variable '\${key}' is not set.  +
      'Set it in .env (local) or deployment config (production).'
    )
  }
  return value
}

const ANTHROPIC_API_KEY = getRequiredEnv('ANTHROPIC_API_KEY')
const THIRD_PARTY_API_KEY = getRequiredEnv('THIRD_PARTY_API_KEY')

// Client initialised with secret — not passed to LLM
const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

async function callThirdPartyApi(endpoint: string, params: Record<string, string>) {
  const url = new URL(https://api.thirdparty.com/\${endpoint})
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const response = await fetch(url.toString(), {
    headers: { Authorization: Bearer \${THIRD_PARTY_API_KEY} },
  })
  if (!response.ok) throw new Error(API error: \${response.status})
  return response.json()
}`,
        }}
      />

      <h2>AWS Secrets Manager</h2>

      <SDKExample
        title="Retrieving Secrets from AWS Secrets Manager"
        tabs={{
          python: `import boto3
import json
import os
from functools import lru_cache
import anthropic

@lru_cache(maxsize=32)
def get_secret(secret_name: str, region: str = "us-east-1") -> dict:
    """
    Retrieve a secret from AWS Secrets Manager.
    Cached per process lifetime — rotate secrets via AWS rotation + process restart.
    """
    client = boto3.client("secretsmanager", region_name=region)
    response = client.get_secret_value(SecretId=secret_name)
    return json.loads(response["SecretString"])

# At startup, fetch secrets bundle
secrets = get_secret("prod/myapp/llm-credentials")

anthropic_client = anthropic.Anthropic(api_key=secrets["anthropic_api_key"])
db_password = secrets["database_password"]

# Secrets never appear in prompts, logs, or LLM context
def run_agent(user_message: str) -> str:
    response = anthropic_client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        # System prompt contains zero secrets
        system="You are a helpful assistant.",
        messages=[{"role": "user", "content": user_message}],
    )
    return response.content[0].text`,
        }}
      />

      <h2>HashiCorp Vault</h2>

      <SDKExample
        title="Dynamic Secret Retrieval from HashiCorp Vault"
        tabs={{
          python: `import hvac  # pip install hvac
import os

def get_vault_client() -> hvac.Client:
    """Authenticate to Vault using the agent's pod service account token (Kubernetes)."""
    client = hvac.Client(url=os.environ["VAULT_ADDR"])
    # Kubernetes auth: pod's service account JWT is mounted at this path
    with open("/var/run/secrets/kubernetes.io/serviceaccount/token") as f:
        jwt = f.read()
    client.auth.kubernetes.login(
        role=os.environ["VAULT_ROLE"],  # e.g. "research-agent"
        jwt=jwt,
    )
    return client

def fetch_agent_secrets(vault: hvac.Client) -> dict:
    """Fetch secrets scoped to this agent's Vault role."""
    secret = vault.secrets.kv.v2.read_secret_version(
        path="agents/research-agent",
        mount_point="kv",
    )
    return secret["data"]["data"]

# Dynamic secrets: each agent pod gets short-lived credentials
vault_client = get_vault_client()
secrets = fetch_agent_secrets(vault_client)
db_password = secrets["db_password"]
api_key = secrets["anthropic_api_key"]`,
        }}
      />

      <WarningBlock title="Rotate Secrets Regularly and on Suspected Compromise">
        <p>
          Secrets used by agents should be rotated on a regular schedule (90 days for long-lived
          API keys, shorter for sensitive credentials) and immediately on any suspected compromise.
          Use AWS Secrets Manager automatic rotation, Vault dynamic secrets, or Kubernetes secret
          rotation operators to automate this. When a secret is rotated, ensure agents pick up
          the new value — either via process restart, a cache TTL, or a secrets manager SDK that
          handles refresh automatically.
        </p>
      </WarningBlock>

      <BestPracticeBlock title="Scan Code and Commits for Secret Leaks">
        <p>
          Integrate a secret scanning tool (GitHub Secret Scanning, GitGuardian, Gitleaks, or
          truffleHog) into your CI/CD pipeline to catch secrets committed to version control.
          Run pre-commit hooks locally to block commits containing API key patterns before they
          reach the remote repository. Treat any key found in version control as immediately
          compromised and rotate it, even if the commit was in a private repository.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Use Short-Lived Credentials Where Possible">
        <p>
          Prefer short-lived credentials (OAuth tokens, AWS STS temporary credentials, Vault
          dynamic secrets) over long-lived API keys. Short-lived credentials limit the window of
          exposure if a secret is compromised — an attacker with a token that expires in one hour
          has far less time to cause damage than one with a permanent API key. On AWS, use IAM
          roles for ECS/EKS pods instead of IAM user access keys.
        </p>
      </NoteBlock>
    </article>
  )
}
