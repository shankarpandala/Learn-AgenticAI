import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function PipelineAsCode() {
  return (
    <article className="prose-content">
      <h1>Pipeline as Code</h1>

      <p>
        CI/CD pipelines are software. They have bugs, they need maintenance, they accumulate
        technical debt, and they benefit from the same engineering discipline as production code.
        Yet most organizations treat pipelines as an afterthought — copied from a Stack Overflow
        answer, patched over time, never refactored, and understood only by the one DevOps
        engineer who originally wrote them. When that engineer leaves, the pipeline becomes
        a black box that everyone is afraid to touch.
      </p>

      <p>
        Claude Code can generate, maintain, and improve CI/CD pipeline definitions with the same
        discipline it brings to application code. This means pipelines that have clear structure,
        documented steps, security best practices (least-privilege permissions, no secrets in YAML),
        efficient caching, and matrix builds that minimize CI time. It also means self-healing
        pipelines that can diagnose their own failures.
      </p>

      <ConceptBlock title="The Ideal Pipeline Properties">
        A well-engineered CI/CD pipeline is: (1) fast — under 10 minutes for full test suite
        via parallelization and caching, (2) reliable — failures are real failures, not
        intermittent flakiness, (3) secure — minimum permissions, no secrets in YAML,
        (4) transparent — failures link to actionable information, and (5) self-documenting —
        step names describe what they do and why.
      </ConceptBlock>

      <SDKExample
        title="Generating a GitHub Actions Pipeline"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'generate-pipeline.sh',
            code: `# Generate a complete CI/CD pipeline
claude "Generate a GitHub Actions CI/CD pipeline for our Node.js TypeScript application.

Application details:
- Runtime: Node.js 20
- Test framework: Jest (unit + integration)
- E2E tests: Playwright
- Linting: ESLint + Prettier
- Type checking: TypeScript
- Build: npm run build (outputs to dist/)
- Database: PostgreSQL (integration tests need a real DB)
- Deployment: AWS ECS via CDK

Pipeline requirements:

On pull_request:
1. Install dependencies (with cache)
2. Type check (tsc --noEmit)
3. Lint (eslint + prettier --check)
4. Unit tests (npm test -- --testPathPattern='unit')
5. Integration tests (npm test -- --testPathPattern='integration', with postgres service)
6. Build (npm run build)
7. Security scan (npm audit, gitleaks)
Total target time: < 8 minutes

On push to main:
1. All PR checks above
2. E2E tests (playwright, against staging environment)
3. Docker build and push to ECR
4. Deploy to staging environment
5. Run smoke tests against staging
6. Manual approval gate (required for production)
7. Deploy to production
8. Run production smoke tests

Security requirements:
- No hardcoded secrets — use GitHub Secrets
- Minimal permissions (contents: read, packages: write only where needed)
- Pin action versions to SHAs, not tags
- Enable OIDC for AWS authentication (no long-lived credentials)

Generate: .github/workflows/ci.yml and .github/workflows/deploy.yml"`,
          },
          {
            label: 'yaml',
            language: 'yaml',
            filename: '.github/workflows/ci.yml (generated)',
            code: `name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

permissions:
  contents: read
  checks: write
  pull-requests: write

jobs:
  quality:
    name: Type Check & Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1

      - uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8  # v4.0.2
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint
        run: |
          npx eslint src/ --format github
          npx prettier --check src/

  test:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: testdb
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    env:
      DATABASE_URL: postgresql://testuser:testpass@localhost:5432/testdb
      NODE_ENV: test

    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11

      - uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Run migrations
        run: npx prisma migrate deploy

      - name: Unit tests
        run: npx jest --testPathPattern='unit' --coverage --coverageReporters=text-summary

      - name: Integration tests
        run: npx jest --testPathPattern='integration' --runInBand

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11
        with:
          fetch-depth: 0

      - uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Dependency audit
        run: npm audit --audit-level=high

      - name: Secret scanning
        uses: gitleaks/gitleaks-action@cb7149a9b57195b609c63e8518d2c6ef8e492f67  # v2.3.4
        env:
          GITHUB_TOKEN: ${'$'}{{ secrets.GITHUB_TOKEN }}`,
          },
        ]}
      />

      <h2>Matrix Builds for Efficiency</h2>

      <SDKExample
        title="Matrix Strategy for Parallel Testing"
        tabs={[
          {
            label: 'yaml',
            language: 'yaml',
            filename: '.github/workflows/matrix-tests.yml',
            code: `name: Parallel Test Matrix

jobs:
  test:
    name: Tests (${'$'}{{ matrix.shard }}/${'$'}{{ matrix.total-shards }})
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2, 3, 4]
        total-shards: [4]

    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11

      - uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Run test shard ${'$'}{{ matrix.shard }} of ${'$'}{{ matrix.total-shards }}
        run: |
          npx jest \
            --shard=${'$'}{{ matrix.shard }}/${'$'}{{ matrix.total-shards }} \
            --coverage \
            --coverageDirectory=coverage-${'$'}{{ matrix.shard }}

      - name: Upload coverage shard
        uses: actions/upload-artifact@5d5d22a31266ced268874388b861e4b58bb5c2f3  # v4.3.1
        with:
          name: coverage-${'$'}{{ matrix.shard }}
          path: coverage-${'$'}{{ matrix.shard }}

  merge-coverage:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@c850b930e6ba138125429b7e5c93fc707a7f8427  # v4.1.4
        with:
          pattern: coverage-*
          merge-multiple: true

      - name: Merge coverage reports
        run: npx nyc merge coverage-* coverage/coverage-final.json`,
          },
        ]}
      />

      <h2>Self-Healing Pipeline Diagnostics</h2>

      <SDKExample
        title="Diagnosing Pipeline Failures with Claude"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'diagnose-pipeline.sh',
            code: `# Ask Claude to diagnose a CI failure
claude "CI pipeline failed on PR #$(gh pr view --json number --jq .number).

Failed job output:
$(gh run view --log-failed 2>/dev/null | tail -100)

Failed workflow file:
$(cat .github/workflows/ci.yml)

Diagnose the failure:
1. What is the exact error message?
2. Which step failed?
3. Is this a flaky test (transient) or a real failure?
4. What change in the PR likely caused this failure?
5. What is the fix?

If it is a configuration issue in the pipeline YAML:
- Show me the corrected YAML
- Explain what was wrong

If it is a test failure:
- Identify the failing test
- Show the failing assertion
- Identify the root cause in the PR diff"`,
          },
        ]}
      />

      <WarningBlock title="Pin Action Versions to SHA Hashes">
        GitHub Actions from the marketplace are not immutable when referenced by tag.
        The tag <code>actions/checkout@v4</code> can be changed by the action author
        to point to different code. Referencing actions by their full commit SHA
        (<code>actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11</code>)
        ensures you always run the exact version you tested with. Ask Claude to pin
        all action references: "Update .github/workflows/*.yml to pin all action
        references to their full commit SHA instead of version tags. Use the GitHub
        API to resolve the current SHA for each tagged version."
      </WarningBlock>

      <BestPracticeBlock title="OIDC Instead of Long-Lived AWS Credentials">
        Never store long-lived AWS access keys as GitHub Secrets. Use GitHub's OIDC
        (OpenID Connect) integration with AWS to generate short-lived credentials
        for each pipeline run. Ask Claude: "Update our deploy pipeline to use AWS OIDC
        instead of AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY. Generate the Terraform
        for the IAM OIDC provider and the GitHub Actions role, and update the workflow
        to use the aws-actions/configure-aws-credentials action with role-to-assume."
        This eliminates the credential rotation burden and the risk of long-lived secret exposure.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Cache Aggressively for Speed">
        The fastest way to improve CI time is aggressive caching. Cache: node_modules
        (keyed on package-lock.json hash), Playwright browser binaries, Docker layer cache,
        and TypeScript incremental build output. Ask Claude: "Analyze our current CI workflow
        and add caching for all cacheable artifacts. Use the GitHub Actions cache action
        with appropriate cache keys. Estimate the time savings for each cache added."
        A typical Node.js pipeline can go from 8 minutes to under 4 minutes with proper caching.
      </NoteBlock>
    </article>
  )
}
