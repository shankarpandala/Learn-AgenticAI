import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'

export default function NFRAutomation() {
  return (
    <article className="prose-content">
      <h1>NFR Automation</h1>

      <p>
        Non-functional requirements (NFRs) — performance, security, accessibility, reliability, and
        compliance — are the requirements that most often get skipped in AI-assisted development.
        They are not features you can demo. They are constraints that determine whether the feature
        is actually production-ready. And because they are invisible when satisfied, it is tempting
        to let AI generate code without ever specifying them.
      </p>

      <p>
        Vibe Engineering treats NFR compliance as an automated gate in the agent loop — not as a
        manual checklist someone remembers to run at the end of the sprint. This section covers
        how to embed NFR checks into Claude sessions and CI pipelines so that code which violates
        them never makes it into a PR.
      </p>

      <ConceptBlock title="NFRs as Agent Loop Gates">
        An NFR gate is a check that runs automatically after every Claude-generated change, before
        the engineer reviews the output. If the check fails, Claude is responsible for fixing the
        issue before reporting completion. The engineer's job is not to run NFR checks manually —
        it is to configure the agent loop so that NFR compliance is a precondition for task completion.
        Automation is the only way to enforce NFRs reliably at AI generation speed.
      </ConceptBlock>

      <h2>Performance NFR Automation</h2>

      <p>
        Performance requirements that are not expressed as failing tests are not requirements — they
        are wishes. The most effective approach is to write performance assertions into the test suite
        itself, so that Claude cannot implement a feature without satisfying the performance contract.
      </p>

      <CodeBlock language="python" filename="tests/performance/test_api_latency.py">
{`import time
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_product_list_p95_under_200ms():
    """NFR: Product list endpoint must respond in under 200ms at p95."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Warm up
        await client.get("/v1/products?limit=20")

        latencies = []
        for _ in range(50):
            start = time.perf_counter()
            response = await client.get("/v1/products?limit=20")
            latencies.append((time.perf_counter() - start) * 1000)
            assert response.status_code == 200

    latencies.sort()
    p95 = latencies[int(len(latencies) * 0.95)]
    assert p95 < 200, f"P95 latency {p95:.1f}ms exceeds 200ms NFR"

@pytest.mark.asyncio
async def test_product_search_uses_index(db_session):
    """NFR: Product search must use the category index, not a full table scan."""
    # Run EXPLAIN ANALYZE and verify the query plan
    result = await db_session.execute(
        "EXPLAIN (FORMAT JSON) SELECT * FROM products WHERE category = 'electronics'"
    )
    plan = result.scalar()
    # Verify index scan, not sequential scan
    assert "Index Scan" in str(plan) or "Bitmap Index Scan" in str(plan), \
        "Product category query is doing a full table scan — missing index"
`}
      </CodeBlock>

      <CodeBlock language="markdown" filename="CLAUDE.md (Performance NFRs)">
{`## Performance Requirements

All API endpoints must meet these NFRs (enforced by tests/performance/):
- List endpoints: p95 < 200ms, p99 < 500ms
- Get-by-ID endpoints: p95 < 50ms
- Write endpoints (POST/PUT/PATCH): p95 < 300ms
- Batch operations: < 2s for batches up to 100 items

Database query constraints:
- No query may do a full table scan on tables > 10,000 rows
- All foreign key columns must have an index
- N+1 query patterns are forbidden — use joins or DataLoader pattern

After implementing any endpoint, run: pytest tests/performance/ -v
All performance tests must pass before reporting completion.`}
      </CodeBlock>

      <h2>Accessibility NFR Automation</h2>

      <p>
        Accessibility (a11y) compliance is a legal requirement in many jurisdictions (ADA, EN 301 549,
        WCAG 2.1 AA) and is consistently one of the most commonly skipped NFRs in AI-generated frontend
        code. Axe-core and Pa11y can run accessibility checks automatically in the CI pipeline.
      </p>

      <CodeBlock language="javascript" filename="tests/a11y/accessibility.test.js">
{`import { test, expect } from '@playwright/test'
import { checkA11y, injectAxe } from 'axe-playwright'

test.describe('Accessibility: Product Pages', () => {
  test('product list page meets WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/products')
    await injectAxe(page)
    await checkA11y(page, null, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
      // Violations that cause the test to fail (not just warnings)
      includedImpacts: ['critical', 'serious'],
    })
  })

  test('product form is keyboard navigable', async ({ page }) => {
    await page.goto('/products/new')
    // Tab through all form fields
    const focusableElements = page.locator('input, select, textarea, button, [tabindex]')
    const count = await focusableElements.count()
    for (let i = 0; i < count; i++) {
      await page.keyboard.press('Tab')
    }
    // Verify focus indicator is visible (not outline: none)
    const focusedElement = page.locator(':focus')
    const outline = await focusedElement.evaluate(el =>
      window.getComputedStyle(el).getPropertyValue('outline')
    )
    expect(outline).not.toBe('none')
    expect(outline).not.toBe('0px none rgb(0, 0, 0)')
  })
})`}
      </CodeBlock>

      <CodeBlock language="markdown" filename="CLAUDE.md (Accessibility NFRs)">
{`## Accessibility Requirements (WCAG 2.1 AA)

All React components must:
- Use semantic HTML elements (button, nav, main, aside, article, section)
- Include aria-label on all interactive elements without visible text
- Maintain logical tab order (no tabindex > 0)
- Provide alt text for all images (empty alt="" for decorative images)
- Ensure color contrast ratio >= 4.5:1 for normal text, >= 3:1 for large text
- Never use color alone to convey information

After implementing any UI component, run: npx playwright test tests/a11y/
Zero critical or serious violations permitted.`}
      </CodeBlock>

      <h2>Security NFR Automation in the Agent Loop</h2>

      <SecurityCallout severity="high" title="Security NFRs Must Run Before PR Submission">
        Security NFR automation must run inside the Claude session, before the engineer ever sees the
        output. If SAST runs only in CI after the PR is opened, the engineer has already reviewed
        code that may have vulnerabilities. Running security checks in-loop means Claude fixes the
        issues before you review — reducing cognitive load and ensuring the diff you review is already
        security-clean.
      </SecurityCallout>

      <CodeBlock language="markdown" filename="CLAUDE.md (Security NFRs in Loop)">
{`## Security NFR Gates (run after every code change)

### Python/FastAPI projects

bandit -r src/ -ll              # No HIGH severity findings
semgrep --config auto src/     # No CRITICAL/HIGH findings
safety check                   # No known CVEs in dependencies


### TypeScript/Node projects

npm audit --audit-level=high   # No HIGH/CRITICAL vulnerabilities
npx eslint src/ --rule '{no-eval: error, no-implied-eval: error}'
semgrep --config auto src/     # No CRITICAL/HIGH findings


Report all findings before marking any security-adjacent task complete.
Do not suppress findings without explicit instruction.`}
      </CodeBlock>

      <h2>Reliability NFR Automation</h2>

      <p>
        Reliability requirements — retry logic, circuit breakers, timeout handling, graceful degradation
        — are among the most commonly omitted behaviors in AI-generated code. Claude will generate the
        happy path correctly; it will omit the failure paths unless they are explicitly required.
      </p>

      <PatternBlock title="Failure Mode Requirements in CLAUDE.md">
        For every external dependency your service calls (databases, HTTP APIs, message queues), add
        an explicit failure mode requirement to CLAUDE.md. "When the inventory service returns 5xx,
        the product display must fall back to showing 'Availability unknown' — do not propagate the
        error to the user." "All HTTP client calls must have a 5-second timeout. Never use indefinite
        waits." These requirements prevent the most common class of reliability bugs in AI-generated
        code.
      </PatternBlock>

      <CodeBlock language="markdown" filename="CLAUDE.md (Reliability NFRs)">
{`## Reliability Requirements

### External Service Calls
- All HTTP client calls: 5s connect timeout, 30s read timeout (never omit)
- Retry policy: exponential backoff, max 3 attempts, jitter ±20%
- Circuit breaker: open after 5 consecutive failures, half-open after 30s

### Database
- All queries: explicit timeout of 10s
- Connection pool: max 20 connections, acquire timeout 5s
- Transactions: never hold open during external HTTP calls

### Error Handling
- All 5xx errors from upstream: log with correlation ID, return degraded response
- Never let external failures surface as unhandled exceptions to the user
- All background jobs: dead-letter queue on 3 consecutive failures

Verify failure paths have tests. A function with only happy-path tests is incomplete.`}
      </CodeBlock>

      <BestPracticeBlock title="Encode NFRs as Tests, Not Comments">
        An NFR written as a comment in the code ("// TODO: add retry logic") is not an NFR — it is
        a wish. An NFR written as a failing test is a requirement. Before asking Claude to implement
        any feature with non-trivial NFRs, write the NFR test cases first (the AI-TDD approach). For
        performance: write a test that measures latency and asserts it is below threshold. For
        accessibility: write an axe-core test. For security: write a test that verifies the security
        behavior (e.g., unauthenticated requests return 401). Claude cannot implement the feature
        without satisfying the tests — and the tests will catch any regression.
      </BestPracticeBlock>

      <NoteBlock type="info" title="NFR Automation Pays Compound Interest">
        The initial investment in NFR automation — writing the performance tests, setting up axe,
        configuring SAST in the agent loop — is front-loaded. Once in place, every subsequent
        AI-generated feature is automatically verified against these requirements. Over a project
        lifetime, this means hundreds of features that would otherwise have needed manual NFR review
        instead get it automatically. The teams that skip NFR automation spend that time on production
        incidents instead.
      </NoteBlock>
    </article>
  )
}
