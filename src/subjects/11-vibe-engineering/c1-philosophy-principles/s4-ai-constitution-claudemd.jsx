import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'

export default function AIConstitutionClaudeMd() {
  return (
    <div className="section-content">
      <h1>The AI Constitution: CLAUDE.md</h1>

      <p>
        Every time you start a Claude Code session, Claude reads the project context and begins working. Without
        any configuration, it makes decisions based on its training — which reflects general best practices from
        the internet, not your organization's specific requirements. It doesn't know that you're in a PCI-DSS
        scope. It doesn't know your team banned a certain library after a security incident. It doesn't know
        that the API layer must use async patterns because the team decided that two years ago. It will make
        reasonable-sounding decisions, and they may be completely wrong for your context.
      </p>

      <p>
        CLAUDE.md solves this by giving every session a starting point that reflects your actual requirements.
        It is the persistent institutional memory of your project, committed to version control, reviewed like
        code, and loaded automatically whenever Claude Code starts.
      </p>

      <ConceptBlock title="CLAUDE.md — The AI Constitution">
        CLAUDE.md is the configuration file that Claude Code reads automatically at startup, from the current
        working directory and all parent directories up to the user's home. It functions as <strong>persistent
        context</strong>: every piece of information in it is available to Claude throughout the session without
        you re-stating it in prompts.
        <br /><br />
        A well-written CLAUDE.md encodes:
        <ul>
          <li><strong>Project identity</strong> — what this service does, who owns it, what compliance scope it's in</li>
          <li><strong>Tech stack</strong> — language versions, framework versions, approved libraries</li>
          <li><strong>Coding standards</strong> — naming conventions, file structure, layering rules</li>
          <li><strong>Forbidden patterns</strong> — anti-patterns that must never be generated</li>
          <li><strong>Security rules</strong> — specific controls required by the environment</li>
          <li><strong>Architectural boundaries</strong> — what calls what, what doesn't call what</li>
          <li><strong>Custom commands</strong> — project-specific slash commands available in the session</li>
        </ul>
        Think of CLAUDE.md as the brief you give to a new contractor on day one — except it's always up to date,
        always present, and never has to be repeated.
      </ConceptBlock>

      <h2>The CLAUDE.md Hierarchy</h2>

      <p>
        CLAUDE.md is not a single file. It's a hierarchy of files, each scoped to the level where its constraints
        apply. Claude reads all applicable files in the hierarchy, with more specific (deeper) files taking
        precedence over more general (shallower) ones when there is a conflict.
      </p>

      <CodeBlock language="text" filename="CLAUDE.md file hierarchy">
{`~/.claude/CLAUDE.md              # User-level: personal preferences, common tools,
                                 #   API key references (not actual keys), editor config

/repo/CLAUDE.md                  # Repo-level: project tech stack, global architectural
                                 #   rules, compliance scope, team conventions

/repo/src/CLAUDE.md              # Module-level: frontend-specific rules (component
                                 #   patterns, accessibility requirements, state management
                                 #   conventions, CSS methodology)

/repo/src/api/CLAUDE.md          # Service-level: API layer specifics (auth requirements,
                                 #   rate limiting rules, error response format, OpenAPI
                                 #   spec compliance requirements)

/repo/src/api/payments/CLAUDE.md # Feature-level: PCI-DSS controls specific to the
                                 #   payments domain (card data handling rules, logging
                                 #   restrictions, tokenization requirements)`}
      </CodeBlock>

      <p>
        When you're working in <code>/repo/src/api/payments/</code>, Claude reads all five files. The payments
        CLAUDE.md adds constraints on top of the API CLAUDE.md, which adds constraints on top of the src
        CLAUDE.md, and so on up. This means you write each constraint once, at the right level, and it applies
        everywhere it should without duplication.
      </p>

      <h2>A Production CLAUDE.md: Python FastAPI + SOC 2</h2>

      <p>
        Here is a complete, enterprise-grade CLAUDE.md for a Python FastAPI service operating in a SOC 2 Type II
        environment. Read every section and note why each constraint is present — each one exists because someone,
        somewhere, had to deal with the consequence of not having it.
      </p>

      <CodeBlock language="markdown" filename="CLAUDE.md">
{`# AI Constitution: payments-service

## Project Identity
- Service: Payments Processing API (PCI-DSS scope, SOC 2 Type II)
- Team: Platform Engineering
- Repo: github.com/org/payments-service
- Language: Python 3.11
- Framework: FastAPI 0.110+
- Database: PostgreSQL 15 via SQLAlchemy 2.0 (async)
- Auth: JWT (httpOnly cookies, RS256 signing, no symmetric HS256)
- Deployment: AWS ECS Fargate, us-east-1 and eu-west-1

## Architecture Rules
- Strict layered architecture: Router → Service → Repository → Model
- No business logic in routers; routers validate input and delegate to services only
- All database access through Repository classes only (no ORM calls in services)
- Services must be stateless — no instance variables, no module-level mutable state
- Inter-service communication: async httpx only, with circuit breaker via tenacity
- Background tasks: Celery only (no asyncio.create_task for work that must survive restart)

## Mandatory Security Controls (SOC 2 CC6.1, CC6.6, CC6.7)
- ALL SQL: parameterized queries only via SQLAlchemy ORM or text() with bindparams
- ALL external input: validated with a Pydantic model BEFORE use — no dict access on raw input
- ALL API endpoints: require authentication via get_current_user() except /health and /docs
- ALL external HTTP calls: use httpx with verify=True — no SSL verification bypass
- Sensitive fields (card numbers, SSNs, CVVs): masked in logs using mask_sensitive()
- PAN data (Primary Account Numbers): tokenize via Vault before any storage or logging
- No secrets in code — use os.environ for local dev, AWS Secrets Manager for production
- Audit log required for: login, logout, payment initiation, payment failure, admin actions

## Forbidden Patterns — NEVER generate these
# SQL
- f-strings or .format() in any SQL expression (SQL injection)
- Raw psycopg2 queries that bypass SQLAlchemy (escapes ORM protection)

# Execution
- subprocess with shell=True (command injection)
- eval() or exec() for any purpose
- __import__() at runtime (dynamic import abuse)
- pickle.loads() on untrusted data (arbitrary code execution)

# Cryptography
- MD5 or SHA1 for passwords or security-sensitive hashing (use bcrypt or argon2)
- Symmetric JWT signing (HS256) — we use RS256 with rotating key pairs
- Random number generation with random module for tokens (use secrets module)
- Hardcoded cryptographic keys or salts

# PCI-DSS specific
- Storing raw card numbers, CVVs, or expiry dates in application memory beyond request lifecycle
- Logging any field that may contain PAN data without masking
- HTTP (not HTTPS) for any external API call
- Writing card data to any file, queue, or cache (must tokenize first)

# Logging
- logging.info() or print() on raw request bodies (may contain PAN data)
- Logging authentication credentials even in debug mode
- Structured log fields that include user passwords or tokens

## Testing Requirements
- Write failing tests FIRST, then implementation (AI-TDD workflow)
- Every new function: unit test in tests/unit/ with same module path
- Every new endpoint: integration test in tests/integration/
- Every security control: explicit test asserting the control (e.g., test_jwt_in_cookie_not_header)
- Minimum coverage: 80% lines, enforced in CI via pytest-cov --fail-under=80
- Use pytest-asyncio for all async tests (asyncio_mode = "auto" in pytest.ini)
- Mock external services with respx (not unittest.mock for httpx calls)

## Approved Libraries
fastapi, sqlalchemy, pydantic, pydantic-settings, httpx, pytest, pytest-asyncio,
pytest-cov, boto3, structlog, tenacity, alembic, passlib[bcrypt], python-jose[cryptography],
respx, factory-boy, freezegun

## Forbidden Libraries
- flask, django (wrong framework)
- requests (use httpx — requests is sync-only)
- print() for logging (use structlog — all logs must be structured JSON)
- urllib (use httpx)
- pymysql, sqlite3 (wrong database)
- jwt (use python-jose — jwt package has known vulnerabilities)

## Custom Commands Available
- /security-scan: Run Semgrep (--config auto) + Bandit (-r src/), surface critical/high findings
- /generate-tests: Generate unit + integration tests for all files changed since last commit
- /write-adr: Scaffold an Architecture Decision Record in docs/adr/ with next sequence number
- /compliance-check: Verify SOC 2 CC6 controls are implemented for changed files
- /mask-check: Scan changed files for potential PAN/sensitive data logging

## Code Review Checklist (run before any PR)
- [ ] All new endpoints have authentication (or explicit exception documented)
- [ ] All Pydantic models have appropriate field validators
- [ ] No f-strings in SQL
- [ ] Sensitive fields masked before any log statement
- [ ] Tests exist for security behaviors, not just happy path
- [ ] semgrep output is clean (0 critical, 0 high findings)`}
      </CodeBlock>

      <h2>A Production CLAUDE.md: TypeScript React + GDPR</h2>

      <p>
        The same structure applies to frontend codebases with entirely different constraints. Here is a CLAUDE.md
        for a React application operating under GDPR with accessibility requirements. Notice how the forbidden
        patterns shift entirely to reflect the different risk surface:
      </p>

      <CodeBlock language="markdown" filename="CLAUDE.md (TypeScript/React with GDPR)">
{`# AI Constitution: customer-portal-frontend

## Project Identity
- Application: Customer Self-Service Portal (GDPR Article 15/17 data subject rights)
- Team: Frontend Platform
- Language: TypeScript 5.3 (strict mode — no exceptions)
- Framework: React 18 (functional components, hooks only — no class components)
- Styling: Tailwind CSS 3 + shadcn/ui component library
- State: Zustand for global state, React Query v5 for server state
- Build: Vite 5, tested with Vitest + React Testing Library
- Accessibility target: WCAG 2.1 Level AA (legal requirement in EU markets)

## Architecture Rules
- File structure: feature-based, not type-based (/features/payments/ not /components/ + /hooks/ + /utils/)
- Components: single responsibility — one component does one thing
- Data fetching: React Query only (no useEffect + fetch, no axios in components)
- Forms: React Hook Form + Zod for validation (no controlled components with useState for forms)
- Navigation: React Router v6 — no direct window.location manipulation
- No prop drilling beyond 2 levels — use Zustand store or React Query cache instead

## GDPR Constraints (Articles 5, 25, 32)
- Consent gate: NEVER load third-party scripts (analytics, tracking) before consent is confirmed
- PII in state: Customer name, email, address — never log, never include in error reports
- Error reporting (Sentry): use beforeSend to scrub PII fields before submission
- Local storage: no PII, no session tokens — use httpOnly cookies via API
- Data minimization: request only the fields your component actually displays
- Right to erasure: deletion confirmation flows must include explicit "this is irreversible" UI

## Accessibility Requirements (WCAG 2.1 AA)
- All interactive elements: keyboard accessible (Tab, Enter, Space, Escape)
- All images: meaningful alt text (empty alt="" for decorative images only)
- All form inputs: associated label (htmlFor + id, or aria-label if label not visible)
- All error messages: announced via aria-live="polite" or role="alert"
- Color contrast: minimum 4.5:1 for body text, 3:1 for large text (>18pt or >14pt bold)
- Focus management: when modals open, focus moves to modal; when closed, returns to trigger
- Never: outline: none without a custom focus style replacement

## Forbidden Patterns — NEVER generate these
# TypeScript
- any type (use unknown or proper generics)
- @ts-ignore or @ts-expect-error without a comment explaining why
- as Type casting without a type guard function

# React
- useEffect for data fetching (use React Query)
- Class components (use functional components + hooks)
- Index as key in lists where items can be reordered or filtered
- dangerouslySetInnerHTML without explicit sanitization via DOMPurify

# Security / GDPR
- Rendering user-provided content as HTML without sanitization
- Storing auth tokens in localStorage or sessionStorage
- Including PII in console.log() calls
- Loading scripts from CDNs not in our CSP allowlist
- Passing email/name as URL query parameters (appears in logs and browser history)

# Accessibility
- onClick on non-interactive elements (div, span, p) without role + keyboard handler
- Placeholder as the only label for an input
- Hiding elements with visibility: hidden from screen readers when they should be accessible
- Auto-playing video or audio without user interaction

## Testing Requirements
- Every new component: render test + behavior test (not just snapshot)
- Every user interaction: test with userEvent (not fireEvent)
- Every accessibility requirement: axe-core assertion via jest-axe
- Forms: test validation error states, not just happy path submission
- Coverage target: 75% (Vitest --coverage --reporter=text)

## Approved Libraries
react, react-dom, react-router-dom, @tanstack/react-query, zustand,
react-hook-form, zod, tailwindcss, shadcn/ui, vitest, @testing-library/react,
@testing-library/user-event, jest-axe, DOMPurify, date-fns

## Forbidden Libraries
- axios (use fetch via React Query queryFn)
- moment.js (use date-fns — moment is deprecated and 300KB)
- lodash (use native JS or specific lodash-es imports)
- styled-components, emotion (we use Tailwind — no CSS-in-JS)

## Custom Commands Available
- /a11y-audit: Run axe-core on changed components, report WCAG violations with fix guidance
- /generate-tests: Generate Vitest + RTL tests for changed components
- /gdpr-check: Scan changed files for PII handling issues and consent gate violations
- /storybook-story: Generate a Storybook story with all variant states for a new component`}
      </CodeBlock>

      <PatternBlock title="The Forbidden Patterns Section">
        Of all the sections in a CLAUDE.md, the <strong>Forbidden Patterns</strong> section is the most important.
        This is counterintuitive — most engineers instinctively document what to do, not what to avoid. But
        explicit negative constraints are more reliable guides for AI behavior than positive ones.
        <br /><br />
        When you write "use bcrypt for passwords," Claude knows to use bcrypt when the topic of password hashing
        comes up. But Claude also knows many other password hashing patterns, and if context is ambiguous, any
        of them might appear. When you write "NEVER use MD5 or SHA1 for passwords," you've eliminated an entire
        class of wrong answers before they can be generated.
        <br /><br />
        The most effective Forbidden Patterns sections are:
        <ul>
          <li><strong>Specific</strong> — "f-strings in SQL expressions" not "unsafe SQL"</li>
          <li><strong>Annotated</strong> — include the risk in a comment ("SQL injection", "command injection")</li>
          <li>
            <strong>Exhaustive for known risks</strong> — if your team has had a security incident involving
            a pattern, that pattern is in Forbidden Patterns, always, and stays there forever
          </li>
          <li>
            <strong>Domain-aware</strong> — a PCI-DSS scope has different forbidden patterns than a HIPAA
            scope or a GDPR scope; write the ones that apply to your specific environment
          </li>
        </ul>
        Every item in your Forbidden Patterns section should exist because someone either encountered that
        anti-pattern in production, observed AI generate it unprompted, or identified it as a regulatory risk
        specific to your context. Generic lists copied from the internet are less valuable than short, specific
        lists from your team's actual experience.
      </PatternBlock>

      <SecurityCallout severity="high" title="CLAUDE.md Must Not Contain Secrets or Internal Infrastructure Details">
        CLAUDE.md is committed to version control and may be readable by anyone with repository access — including
        contractors, open source contributors, or anyone who gains unauthorized access to your source repository.
        <br /><br />
        <strong>Never include in CLAUDE.md:</strong>
        <ul>
          <li>Actual API keys, tokens, or credentials of any kind</li>
          <li>Internal IP addresses, VPC CIDR ranges, or private hostnames</li>
          <li>Production database connection strings</li>
          <li>Internal tool URLs (Jira instances, Confluence, internal wikis)</li>
          <li>Employee names associated with sensitive systems</li>
          <li>Security control implementation details that would aid an attacker in bypassing them</li>
        </ul>
        <strong>Reference by name instead:</strong> Write <code>PAYMENTS_API_KEY</code>, not the actual key.
        Write <code>use the JIRA_URL environment variable</code>, not the actual Jira URL. Write
        <code>see AWS Secrets Manager path /prod/payments/db-credentials</code>, not the actual connection
        string. The path to a secret is not itself a secret, but the secret value is.
        <br /><br />
        The rule is simple: if the information would help an attacker understand, map, or compromise your
        production system, it doesn't belong in a file that lives in your source repository.
      </SecurityCallout>

      <BestPracticeBlock title="Version CLAUDE.md Like Production Code">
        CLAUDE.md is not a scratch pad. It is a governing document that shapes the behavior of AI across every
        engineering session that touches your codebase. Treat it with the same discipline you apply to your
        most critical configuration files.
        <br /><br />
        <strong>In practice, this means:</strong>
        <ul>
          <li>
            <strong>Changes go through PR review</strong> — a proposed change to CLAUDE.md should be reviewed
            by at least one other engineer, the same as a change to your CI pipeline or Terraform configuration
          </li>
          <li>
            <strong>Maintain a changelog</strong> — when you add a new security constraint, add an entry noting
            why it was added and when. "Added: no f-strings in SQL (2024-11 security audit finding)" is
            invaluable context when someone questions the rule years later
          </li>
          <li>
            <strong>Use org-level templates</strong> — create a base CLAUDE.md template for each tech stack
            your org uses (Python/FastAPI, TypeScript/React, Go/gRPC). Teams fork from the template and add
            their project-specific constraints. This ensures minimum standards across all projects without
            requiring every team to rediscover the same lessons
          </li>
          <li>
            <strong>Audit existing code when rules change</strong> — when a new security requirement is added
            to CLAUDE.md, immediately run a search for violations of that requirement in the existing codebase.
            Adding a rule going forward is not enough if the problem already exists in 40 files. The CLAUDE.md
            update and the remediation audit are one task, not two
          </li>
        </ul>
        The question to ask before every CLAUDE.md PR merge: "If a new engineer joined the team tomorrow and
        their only context for AI-assisted development was this file, would they produce code that meets our
        standards?" If the answer is no, the file is incomplete.
      </BestPracticeBlock>

      <h2>The ADR as CLAUDE.md Input Pattern</h2>

      <p>
        Architecture Decision Records (ADRs) are one of the most valuable — and underused — engineering practices.
        An ADR documents a significant architectural decision: the context, the options considered, the decision
        made, and the consequences. They prevent the same debate from happening twice and give future engineers
        the reasoning behind decisions that might otherwise seem arbitrary.
      </p>

      <p>
        ADRs and CLAUDE.md have a natural relationship that most teams don't exploit. Every ADR contains
        implicit constraints: if you decided to use async patterns throughout the API layer, that's a constraint
        future code must follow. If you decided to ban a certain library after a security incident, that's a
        constraint. If you decided on a specific error handling pattern, that's a constraint.
      </p>

      <p>
        The pattern is straightforward: when you make an architectural decision and write the ADR, extract the
        constraints from the ADR and add them to CLAUDE.md in the same PR. The ADR becomes the "why"; CLAUDE.md
        becomes the "what"; together they ensure the decision is enforced in all future AI-assisted development
        sessions automatically.
      </p>

      <CodeBlock language="markdown" filename="docs/adr/ADR-012-jwt-storage-strategy.md (excerpt)">
{`## Status
Accepted (2024-09-15)

## Context
Previous implementation stored JWT access tokens in localStorage. Security audit
(SA-2024-31) identified XSS vulnerability: any injected script could read
localStorage and exfiltrate tokens. We need a more resilient storage strategy.

## Decision
Store JWT access tokens in httpOnly, Secure, SameSite=Strict cookies set by the
server. The client application never reads or stores the token directly. Refresh
tokens use a separate httpOnly cookie with a longer TTL and rotation on use.

## Consequences
- Server must set cookies via Set-Cookie header with HttpOnly, Secure, SameSite=Strict
- Client must never attempt to read or write the auth token
- All state-mutating requests require X-CSRF-Token header (CSRF protection)
- Access token: 15min TTL. Refresh token: 7 days, rotated on every use
- Logout must call POST /auth/logout to clear cookies server-side

## Constraints Added to CLAUDE.md (ADR-012)
See: /repo/CLAUDE.md — "Auth Implementation (ADR-012)" section`}
      </CodeBlock>

      <CodeBlock language="markdown" filename="CLAUDE.md (section added after ADR-012)">
{`## Auth Implementation (ADR-012, 2024-09-15)
See docs/adr/ADR-012-jwt-storage-strategy.md for full context.

- JWT storage: httpOnly cookie set by server ONLY — NEVER localStorage or sessionStorage
- Cookie attributes: HttpOnly=true, Secure=true, SameSite=Strict
- CSRF: X-CSRF-Token header required on ALL POST, PUT, PATCH, DELETE endpoints
- Token lifecycle: 15min access token, 7-day refresh token with rotation on every use
- Logout: must call POST /auth/logout — client-side state clear alone is insufficient

## Forbidden (from ADR-012)
- document.cookie access for auth tokens (httpOnly means JS can't read them — never try)
- localStorage.setItem('token', ...) — this was the vulnerability, never recreate it
- HS256 JWT signing — we use RS256 to allow token verification without sharing secret`}
      </CodeBlock>

      <p>
        Six months after ADR-012, a new engineer starts a Claude Code session and asks Claude to implement
        a "remember me" feature. Without the CLAUDE.md constraint, Claude might reasonably store a long-lived
        token in localStorage — a pattern it has seen many times in its training data. With the CLAUDE.md
        constraint referencing the ADR, Claude knows this specific project made a deliberate decision against
        that pattern, understands the security reasoning, and implements the correct cookie-based approach
        instead. The ADR → CLAUDE.md pipeline converts a one-time decision into a permanent constraint.
      </p>

      <NoteBlock type="tip" title="Scope Your CLAUDE.md at the Right Level">
        One of the most common CLAUDE.md mistakes is writing everything at the repo root level — a single massive
        file with hundreds of rules that applies equally to your backend API, your frontend, your data pipeline,
        and your infrastructure tooling. This creates two problems: the file becomes so long that important rules
        get lost in the noise, and rules that only apply to one part of the codebase create irrelevant noise when
        working in another area.
        <br /><br />
        The right approach is to write each constraint at the level where it applies:
        <ul>
          <li>API authentication requirements belong in <code>/src/api/CLAUDE.md</code>, not the root</li>
          <li>Frontend accessibility rules belong in <code>/src/components/CLAUDE.md</code></li>
          <li>PCI-DSS payment controls belong in <code>/src/api/payments/CLAUDE.md</code></li>
          <li>Python-wide style conventions belong in <code>/src/CLAUDE.md</code></li>
          <li>Compliance scope, team identity, and cross-cutting architecture belong in the root <code>/CLAUDE.md</code></li>
        </ul>
        When working in <code>/src/api/payments/</code>, the engineer gets all applicable constraints
        automatically from every level of the hierarchy. When working in <code>/src/components/</code>,
        they get only the constraints relevant to that context. A focused, 40-line CLAUDE.md that engineers
        actually read and maintain is worth more than a 400-line omnibus file that gradually becomes invisible
        through familiarity — or worse, that nobody ever reads because it's too long to parse.
      </NoteBlock>
    </div>
  )
}
