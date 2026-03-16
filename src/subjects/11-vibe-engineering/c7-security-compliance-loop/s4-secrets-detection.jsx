import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function SecretsDetection() {
  return (
    <article className="prose-content">
      <h1>Secrets Detection</h1>

      <p>
        Accidentally committing secrets to source code is one of the most common and most
        costly security incidents in software development. An API key committed to a public
        GitHub repository is typically found and exploited within minutes by automated bots
        scanning for credentials. Even private repositories are not safe — secrets in commit
        history persist forever, surviving branch deletions, reverts, and rebase operations.
      </p>

      <p>
        AI coding assistants introduce a new vector: Claude might generate code that includes
        example secrets that look real, or it might move a configuration value into code
        without recognizing it should be an environment variable. Vibe Engineering treats
        secrets detection as a pre-commit and CI enforcement gate, not a post-incident
        cleanup activity.
      </p>

      <ConceptBlock title="Defense in Depth for Secrets">
        No single tool catches all secrets. The defense-in-depth strategy uses three layers:
        (1) pre-commit hooks that scan staged files before they are committed,
        (2) CI pipeline scans that scan the full PR diff including historical commits,
        (3) periodic repository-wide scans that catch secrets that slipped through.
        Each layer catches what the previous one might miss.
      </ConceptBlock>

      <SDKExample
        title="Pre-commit Secrets Scanning with Gitleaks"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'secrets-setup.sh',
            code: `# Install Gitleaks
brew install gitleaks  # macOS
# or: wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_linux_x64.tar.gz

# Install pre-commit framework
pip install pre-commit

# Test Gitleaks on current repo
gitleaks detect --source . --verbose

# Scan a specific branch for secrets in all commits
gitleaks detect --source . --log-opts="origin/main..HEAD"

# Generate a report
gitleaks detect --source . --report-format json --report-path /tmp/secrets-report.json

# Ask Claude to review findings and remediate
claude "Gitleaks found potential secrets in the repository.

Report: /tmp/secrets-report.json

For each finding:
1. Confirm whether it is a real secret or a false positive
2. If real: the secret is already compromised — it must be rotated immediately
   - Identify the service the credential belongs to
   - Rotate the credential in that service NOW (before any other step)
   - Remove from code and replace with environment variable reference
3. If false positive: add to .gitleaks.toml allow list with comment explaining why

After remediation:
- Run: gitleaks detect --source . --log-opts='origin/main..HEAD'
- Expected: 0 real secrets remaining
- Note: rotating credentials in git history requires git-filter-repo (different process)"`,
          },
          {
            label: 'yaml',
            language: 'yaml',
            filename: '.pre-commit-config.yaml',
            code: `repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.2
    hooks:
      - id: gitleaks
        name: Detect secrets with Gitleaks
        description: Detect hardcoded secrets before commit
        entry: gitleaks protect --staged --redact --config .gitleaks.toml
        language: golang
        pass_filenames: false

  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        name: Detect secrets with detect-secrets
        args: ['--baseline', '.secrets.baseline']
        exclude: package-lock.json`,
          },
        ]}
      />

      <SDKExample
        title="Gitleaks Configuration with Custom Rules"
        tabs={[
          {
            label: 'yaml',
            language: 'yaml',
            filename: '.gitleaks.toml',
            code: `title = "Gitleaks Configuration"

[extend]
# Extend built-in rules
useDefault = true

[[rules]]
id = "internal-api-key"
description = "Internal API key format (ACME_xxx)"
regex = '''ACME_[a-zA-Z0-9]{32,}'''
tags = ["internal", "api-key"]

[[rules]]
id = "database-connection-string"
description = "Database connection strings with credentials"
regex = '''(postgresql|mysql|mongodb)://[^:]+:[^@]+@'''
tags = ["database", "connection-string"]

[[rules]]
id = "jwt-secret"
description = "JWT signing secrets in configuration"
regex = '''(jwt[_-]?secret|JWT[_-]?SECRET)\s*[=:]\s*["\']?[A-Za-z0-9+/]{20,}'''
tags = ["jwt", "secret"]

[allowlist]
description = "Allowed patterns (false positives)"
regexTarget = "line"
regexes = [
  # Example/placeholder values in documentation
  '''your-secret-key-here''',
  '''example-api-key-replace-this''',
  # Test fixtures with obviously fake values
  '''FAKE_KEY_FOR_TESTING_ONLY''',
]
paths = [
  # Baseline file
  '''.secrets.baseline''',
  # Test fixtures directory
  '''tests/fixtures/''',
  # Documentation
  '''docs/''',
]`,
          },
        ]}
      />

      <h2>CI Pipeline Secret Scanning</h2>

      <SDKExample
        title="GitHub Actions Secret Scanning"
        tabs={[
          {
            label: 'yaml',
            language: 'yaml',
            filename: '.github/workflows/secrets-scan.yml',
            code: `name: Secrets Detection

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for complete scan

      - name: Gitleaks — scan PR commits
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${'$'}{{ secrets.GITHUB_TOKEN }}
          GITLEAKS_LICENSE: ${'$'}{{ secrets.GITLEAKS_LICENSE }}  # For organizations
        with:
          config-path: .gitleaks.toml

      - name: TruffleHog — verify no secrets in history
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${'$'}{{ github.event.repository.default_branch }}
          head: HEAD
          extra_args: --debug --only-verified

      - name: Upload secrets report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: secrets-scan-report
          path: results.sarif`,
          },
        ]}
      />

      <h2>Vault Integration for Secrets Management</h2>

      <SDKExample
        title="Replacing Hardcoded Secrets with Vault"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'vault-integration.sh',
            code: `# Ask Claude to migrate hardcoded secrets to Vault/AWS Secrets Manager
claude "Audit our codebase for secrets that should be in AWS Secrets Manager.

Find patterns that look like hardcoded secrets (not environment variable references):
grep -rn 'api_key\|apiKey\|API_KEY\|secret\|password\|token' src/ --include='*.ts' \
  | grep -v 'process.env' | grep -v '// ' | grep -v 'getSecret' | grep -v 'secretName'

For each finding that is a hardcoded credential:
1. Identify the service it belongs to
2. Generate the AWS CLI command to store it in Secrets Manager:
   aws secretsmanager create-secret \
     --name '/myapp/production/service-name/credential-name' \
     --secret-string 'ROTATE_THIS_FIRST' \
     --region eu-west-1

3. Replace the hardcoded value with:
   import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
   
   const client = new SecretsManagerClient({ region: 'eu-west-1' })
   const response = await client.send(new GetSecretValueCommand({
     SecretId: '/myapp/production/service-name/credential-name'
   }))
   const apiKey = response.SecretString

4. Add the secret name (not value) to docs/secrets-inventory.md

After migration:
- Run: npm test to verify application still works with Secrets Manager lookup
- Run: gitleaks detect to verify no secrets remain in code"`,
          },
        ]}
      />

      <WarningBlock title="Rotating Credentials After Exposure Is Not Optional">
        If Gitleaks or TruffleHog finds a real secret — even in a private repository, even
        if the commit was made 5 minutes ago — that credential must be rotated immediately.
        The sequence is: (1) rotate the credential in the issuing service NOW, (2) then
        remove it from the code, (3) then clean git history. Do not reverse this order.
        Cleaning git history before rotating means the credential is still valid while
        you work on the cleanup. And git history rewriting takes time — during that time,
        anyone who already cloned the repository has the old history with the secret.
      </WarningBlock>

      <BestPracticeBlock title="Secrets Baseline for Existing Repositories">
        When introducing detect-secrets to an existing repository for the first time, there
        may be existing false positives that should be acknowledged. Run
        <code>detect-secrets scan &gt; .secrets.baseline</code> to create a baseline of
        known (reviewed) "secrets" that are actually false positives. Commit the baseline.
        From that point forward, detect-secrets will only alert on new findings not in the
        baseline. Review the baseline carefully before committing — anything in the baseline
        is being suppressed, so it needs human review to confirm it is truly a false positive.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="GitHub Secret Scanning for Public Repositories">
        GitHub's built-in secret scanning automatically detects common credential patterns
        (AWS keys, Stripe keys, GitHub tokens, etc.) in public repositories and notifies
        both the repository owner and the credential issuer. For private repositories, enable
        this feature in Settings &gt; Security &gt; Secret Scanning. GitHub partners with
        service providers who will automatically revoke credentials when found. This is
        a useful backstop, but it is not a replacement for pre-commit scanning — GitHub
        secret scanning runs after the push, when the damage is already done.
      </NoteBlock>
    </article>
  )
}
