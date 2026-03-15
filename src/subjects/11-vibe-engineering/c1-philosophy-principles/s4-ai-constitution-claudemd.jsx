import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'

export default function AIConstitutionClaudeMd() {
  return (
    <article className="prose-content">
      <h2>CLAUDE.md: The AI Constitution</h2>
      <p>
        Every Claude Code session starts fresh — no memory of previous sessions, no knowledge of
        your codebase beyond what it reads, no awareness of your team's standards. CLAUDE.md
        changes this. It is the configuration file Claude Code reads at startup, loaded from the
        current directory and all parent directories. It becomes the institutional memory that
        governs every AI action in your project.
      </p>

      <ConceptBlock term="CLAUDE.md">
        <p>
          A Markdown file read by Claude Code at session startup. Acts as persistent context:
          tech stack declarations, coding standards, forbidden patterns, security constraints,
          approved libraries, architectural boundaries, and compliance rules. Every Claude Code
          session in your project starts with this institutional knowledge pre-loaded — no need
          to re-explain your standards in every prompt.
        </p>
      </ConceptBlock>

      <h2>The Multi-File Hierarchy</h2>
      <p>
        CLAUDE.md files cascade from global to local. Claude reads all applicable files,
        with more specific files taking precedence over broader ones.
      </p>

      <CodeBlock language="text" filename="CLAUDE.md hierarchy">
{`~/.claude/CLAUDE.md              # User-level: personal preferences, tool configs
/repo/CLAUDE.md                  # Repo-level: tech stack, global rules, org standards
/repo/src/CLAUDE.md              # Module-level: frontend-specific rules
/repo/src/api/CLAUDE.md          # Service-level: API layer constraints
/repo/src/api/payments/CLAUDE.md # Feature-level: PCI-DSS specific rules`}
      </CodeBlock>

      <h2>Enterprise CLAUDE.md Template: Python FastAPI + SOC 2</h2>

      <CodeBlock language="markdown" filename="CLAUDE.md">
{`# AI Constitution: payments-service

## Project Identity
- Service: Payments Processing API (PCI-DSS scope)
- Team: Platform Engineering
- Language: Python 3.11
- Framework: FastAPI 0.110+
- Database: PostgreSQL 15 via SQLAlchemy 2.0 (async)
- Auth: JWT (httpOnly cookies, RS256, 15min expiry)
- Infra: AWS ECS, Terraform, GitHub Actions CI/CD

## Architecture Rules
- Layered architecture: Router → Service → Repository → Model
- No business logic in routers; routers only validate input and delegate
- All DB access through Repository classes only — no raw queries in services
- Services must be stateless; no mutable instance variables
- All external HTTP calls via httpx.AsyncClient with explicit timeout

## Mandatory Security Controls (SOC 2 CC6.1, CC6.6)
- ALL SQL: parameterized queries only (SQLAlchemy ORM preferred; text() with bindparams if needed)
- ALL external input: validated with Pydantic models BEFORE any use
- ALL API endpoints: require @require_auth except /health and /docs
- Sensitive fields (card_number, ssn, cvv): masked with mask_pci() before logging
- No secrets in code — use os.environ or aws_secretsmanager_secret

## Forbidden Patterns — NEVER generate these
- f-strings containing SQL (SQL injection)
- subprocess(shell=True) (command injection)
- eval() or exec() (arbitrary code execution)
- Storing card data in memory beyond single request lifecycle
- logging.info() on raw request bodies (may contain PAN data)
- HTTP (not HTTPS) for any external API call
- MD5 or SHA1 for passwords (use bcrypt cost>=12 or argon2)
- JWT stored in localStorage (use httpOnly cookies)
- Broad except Exception clauses without re-raise

## Testing Requirements
- Every new function: unit test in tests/unit/
- Every new endpoint: integration test in tests/integration/
- Minimum coverage: 80% lines (enforced in CI — build fails below threshold)
- Use pytest-asyncio for async tests
- Use factory_boy for test data creation

## Approved Libraries
fastapi, sqlalchemy, pydantic, httpx, pytest, boto3, structlog,
bcrypt, python-jose, factory_boy, alembic, tenacity

## Forbidden Libraries
flask, django, requests (use httpx), print() (use structlog),
md5 (use hashlib.sha256 or bcrypt), pickle (security risk)

## Custom Commands Available
- /security-scan: Run Semgrep + Bandit, fix all critical/high findings
- /generate-tests: Generate unit + integration tests for changed files
- /write-adr: Scaffold an Architecture Decision Record
- /compliance-check: Verify SOC 2 control implementation in changed code
- /update-docs: Sync OpenAPI spec and README with code changes`}
      </CodeBlock>

      <h2>CLAUDE.md Template: TypeScript React + GDPR</h2>

      <CodeBlock language="markdown" filename="src/CLAUDE.md">
{`# AI Constitution: customer-portal (Frontend)

## Stack
- React 19, TypeScript 5.4, Vite 6
- State: Zustand 5 (no Redux)
- Styling: Tailwind CSS v4
- Testing: Vitest + Testing Library + Playwright

## GDPR Compliance Constraints
- Never store PII (email, name, address) in localStorage or sessionStorage
- Consent must be checked before any analytics event: checkConsent('analytics')
- User data fetched from API must be cleared from state on logout: clearUserStore()
- Cookie banner required before any non-essential cookies are set
- Data export endpoint must include all user data: GET /api/user/export

## Component Rules
- All interactive elements must have aria-label or aria-labelledby
- Color contrast must meet WCAG AA (4.5:1 for normal text)
- No inline styles — use Tailwind classes only
- Form inputs must have associated <label> elements

## Forbidden Patterns
- document.cookie for anything except session token (httpOnly set by server)
- window.localStorage for user PII
- console.log in production code (use logger utility)
- any (TypeScript) — use unknown or proper types
- Hardcoded user IDs or test emails in source code`}
      </CodeBlock>

      <h2>The Forbidden Patterns Section</h2>

      <PatternBlock
        name="Negative Constraint Pattern"
        category="CLAUDE.md Design"
        whenToUse="Always. The forbidden patterns section is the most important part of any CLAUDE.md."
      >
        <p>
          Explicitly listing what NOT to generate is more reliable than listing what to generate.
          Claude follows negative constraints (never use f-strings in SQL) more consistently
          than positive ones (always use parameterized queries). Write your forbidden patterns
          by examining your last 6 months of security findings and code review comments —
          those are the exact patterns your AI will regenerate without constraints.
        </p>
      </PatternBlock>

      <SecurityCallout title="What NOT to Put in CLAUDE.md" severity="high">
        <p>
          CLAUDE.md is committed to version control and readable by anyone with repo access.
          Never include: actual API keys or tokens, production database URLs, internal IP
          addresses or hostnames, employee names, or any data that violates your data
          classification policy. Reference secrets by environment variable name only
          (<code>JIRA_API_TOKEN</code>, not the token value).
        </p>
      </SecurityCallout>

      <h2>ADR as CLAUDE.md Input</h2>
      <p>
        When you make an architectural decision, extract the constraints from the ADR and
        add them to CLAUDE.md. This ensures future AI sessions automatically respect
        the decision without being re-briefed.
      </p>

      <CodeBlock language="markdown" filename="ADR-007-auth-strategy.md (excerpt)">
{`## Decision
Use RS256 JWT stored in httpOnly cookies, not HS256 in localStorage.

## Consequences
- Server must set cookies via Set-Cookie header with HttpOnly, Secure, SameSite=Strict
- Client must never read or store the token
- All state mutations require CSRF token in X-CSRF-Token header`}
      </CodeBlock>

      <CodeBlock language="markdown" filename="CLAUDE.md (after ADR-007)">
{`## Auth Implementation (ADR-007)
- JWT: RS256 algorithm, httpOnly cookie set by server — NEVER localStorage
- Cookie flags: HttpOnly=true, Secure=true, SameSite=Strict
- CSRF: X-CSRF-Token header required on all POST/PUT/DELETE endpoints
- Token expiry: 15 minutes access, 7 days refresh with rotation`}
      </CodeBlock>

      <BestPracticeBlock title="Version CLAUDE.md Like Code">
        <p>
          Treat CLAUDE.md changes as production changes: review them in PRs, maintain a
          CHANGELOG section, and tag major changes. When a new security vulnerability type
          emerges in your stack, update CLAUDE.md that day — then audit existing code for
          the pattern. The CLAUDE.md is your most leveraged security control: one line
          prevents the pattern from being generated in every future session.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Keep Each CLAUDE.md Focused">
        <p>
          Write constraints at the level where they apply. API security rules belong in
          <code>/src/api/CLAUDE.md</code>, not in the root. Frontend accessibility rules
          belong in <code>/src/components/CLAUDE.md</code>. A focused, 40-line CLAUDE.md
          that engineers actually read is worth more than a 400-line omnibus file that
          becomes invisible through familiarity.
        </p>
      </NoteBlock>
    </article>
  )
}
