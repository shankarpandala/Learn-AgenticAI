import{j as e}from"./vendor-1_4fyI-O.js";import{C as n,a as t,B as i,N as s,S as c}from"./subject-01-rag-fundamentals-DGDd0J9G.js";import{W as l,P as r}from"./subject-03-agent-foundations-BlYtBlBv.js";import{S as o}from"./subject-06-coding-agents-CiiSsf01.js";function h(){return e.jsxs("div",{className:"section-content",children:[e.jsx("h1",{children:"Vibe Engineering vs. Vibe Coding"}),e.jsxs("p",{children:["In early 2025, Andrej Karpathy coined the term ",e.jsx("strong",{children:'"vibe coding"'})," to describe a new way people were interacting with AI coding assistants: you describe what you want, the AI writes the code, you glance at it, it looks plausible, you hit accept, and you move on. You're not really reading it. You're not really understanding it. You're just... vibing. The code works, or it seems to, and that's enough."]}),e.jsx("p",{children:"For personal projects, weekend hacks, and throwaway prototypes, vibe coding is genuinely liberating. You can build things you never could have built before. You can explore ideas at the speed of thought. The joy is real and the productivity gains are real."}),e.jsx("p",{children:"Then organizations started doing it with production systems. And that's where it goes wrong."}),e.jsx("p",{children:"Vibe coding in a professional context means shipping code you don't understand, authored by a model that hallucinates, into systems that handle real users, real money, and real data. It means vulnerabilities you didn't know you introduced, architectural decisions you didn't consciously make, and technical debt that accumulates at AI speed. When something breaks — and it will break — nobody can explain why, because nobody actually read the code that was written."}),e.jsxs("p",{children:[e.jsx("strong",{children:"Vibe Engineering"})," is the answer to this problem. It's not about removing AI from the development process. It's about bringing discipline to how AI is used — the same discipline that separates a production-grade codebase from a prototype, the same discipline that enables teams of 100+ engineers to ship safely at scale."]}),e.jsx("h2",{children:"Side-by-Side: Vibe Coding vs. Vibe Engineering"}),e.jsx("div",{className:"table-wrapper",style:{overflowX:"auto",marginBottom:"2rem"},children:e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:"0.95rem"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{backgroundColor:"var(--color-surface-raised, #1e1e2e)"},children:[e.jsx("th",{style:{padding:"0.75rem 1rem",textAlign:"left",borderBottom:"2px solid var(--color-border, #333)",width:"20%"},children:"Dimension"}),e.jsx("th",{style:{padding:"0.75rem 1rem",textAlign:"left",borderBottom:"2px solid var(--color-border, #333)",width:"40%",color:"var(--color-warning, #f59e0b)"},children:"Vibe Coding"}),e.jsx("th",{style:{padding:"0.75rem 1rem",textAlign:"left",borderBottom:"2px solid var(--color-border, #333)",width:"40%",color:"var(--color-success, #10b981)"},children:"Vibe Engineering"})]})}),e.jsx("tbody",{children:[{dimension:"Standards Adherence",vibe:"Ignores them — AI has no knowledge of your org's standards",engineering:"Enforces via CLAUDE.md — standards are embedded before the first prompt"},{dimension:"Security",vibe:"Ships vulnerabilities the engineer never saw because they never read the code",engineering:"SAST / security gates run in the loop; Claude remediates findings before PR"},{dimension:"Code Review",vibe:'Accept AI output directly — "it compiled, looks fine"',engineering:"AI reviews first (automated checks), human reviews second (every diff)"},{dimension:"Accountability",vibe:'"Who wrote this bug?" — diffuse, deniable, unresolvable',engineering:"The engineer who approved the PR owns it, unconditionally"},{dimension:"Testing",vibe:"Hope it works — maybe manual smoke test",engineering:"Tests written first (AI-TDD); implementation must pass before acceptance"},{dimension:"Documentation",vibe:"Never — there's no time, the AI writes fast",engineering:"Generated and kept fresh automatically as part of the session workflow"},{dimension:"Compliance",vibe:`Never considered — compliance is "the security team's problem"`,engineering:"Embedded in CLAUDE.md as hard constraints (SOC 2, PCI-DSS, GDPR, etc.)"},{dimension:"Scale",vibe:"Solo projects, throwaway prototypes, or codebases nobody has to maintain",engineering:"Enterprise teams of 100+ engineers shipping to production daily"}].map((a,d)=>e.jsxs("tr",{style:{backgroundColor:d%2===0?"transparent":"var(--color-surface-subtle, #161622)"},children:[e.jsx("td",{style:{padding:"0.75rem 1rem",fontWeight:"600",borderBottom:"1px solid var(--color-border-subtle, #2a2a3a)",verticalAlign:"top"},children:a.dimension}),e.jsx("td",{style:{padding:"0.75rem 1rem",borderBottom:"1px solid var(--color-border-subtle, #2a2a3a)",verticalAlign:"top",color:"var(--color-text-muted, #aaa)"},children:a.vibe}),e.jsx("td",{style:{padding:"0.75rem 1rem",borderBottom:"1px solid var(--color-border-subtle, #2a2a3a)",verticalAlign:"top"},children:a.engineering})]},a.dimension))})]})}),e.jsxs(n,{title:"Vibe Engineering",children:["Vibe Engineering is the disciplined methodology of using AI coding assistants (Claude Code, Cursor, Copilot, and their successors) as ",e.jsx("strong",{children:"accelerators"})," while the engineer retains architectural authority, sets organizational constraints, validates all AI output, and holds accountability for the production system.",e.jsx("br",{}),e.jsx("br",{}),'The word "vibe" is intentional: flow state, developer momentum, and intuition remain valuable. The word "engineering" is equally intentional: discipline, rigor, accountability, and reproducibility are non-negotiable. Vibe Engineering is what happens when you refuse to choose between the two.']}),e.jsx("h2",{children:"The Engineer's Role Shift"}),e.jsx("p",{children:`The most important cognitive shift in Vibe Engineering is understanding what your job actually is when an AI is writing most of the code. Many engineers initially feel deskilled — "I'm just reviewing AI output now" — but this fundamentally misreads what's happening. The role has changed, but it hasn't diminished. In many ways it has expanded.`}),e.jsxs("p",{children:[e.jsx("strong",{children:"Before AI assistance:"})," The engineer was primarily an ",e.jsx("em",{children:"implementer"}),". The job was to translate requirements into working code, line by line. The bottleneck was typing speed and the ability to hold the entire solution in working memory simultaneously."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"With AI assistance:"})," The engineer is primarily a ",e.jsx("em",{children:"governor"}),". The job is to specify what to build with enough precision that AI can implement it correctly, to establish what rules apply to the implementation, to validate that the output meets those rules, and to make the architectural decisions that no AI can make for you — because architectural decisions require understanding the organization's constraints, history, team capability, and strategic direction."]}),e.jsx("p",{children:"The specific shifts are:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"From"})," writing every line of code ",e.jsx("strong",{children:"→ To"})," specifying what to build with precision (requirements, acceptance criteria, test cases)"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"From"})," knowing the implementation details ",e.jsx("strong",{children:"→ To"})," knowing why each architectural decision was made and being able to defend it"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"From"})," debugging your own mistakes ",e.jsx("strong",{children:"→ To"})," validating AI output against known constraints and catching its characteristic failure modes"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"From"})," writing documentation after the fact ",e.jsx("strong",{children:"→ To"})," writing constraints before the fact (CLAUDE.md) that shape what gets generated"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"From"})," personal accountability for code you wrote ",e.jsx("strong",{children:"→ To"})," institutional accountability for code you approved"]})]}),e.jsx("p",{children:`That last point is the one that matters most for enterprise adoption, and the one that vibe coders most consistently evade. When you accept a diff — when you click "Accept" or merge the PR — you are making a professional declaration that this code is correct, secure, and meets your organization's standards. It doesn't matter that Claude wrote it. You reviewed it. You own it.`}),e.jsx("blockquote",{style:{borderLeft:"4px solid var(--color-accent, #6366f1)",paddingLeft:"1rem",marginLeft:"0",fontStyle:"italic",color:"var(--color-text-muted, #aaa)"},children:'"I am responsible for everything Claude writes in my session. Claude is a tool I wield, not a co-author I share blame with."'}),e.jsx("h2",{children:"What Goes Wrong: The Vibe Coding Failure Mode"}),e.jsx("p",{children:"Here's what a toxic vibe coding interaction looks like in practice. Read it carefully, because if you've been using AI coding assistants without a CLAUDE.md, you may have shipped exactly this:"}),e.jsx(t,{language:"markdown",filename:"vibe-coding-example.md",children:`# Vibe Coding: User Auth (What NOT to Do)

User: "build me a user auth system"

Claude: [generates 500 lines of code with the following characteristics]
  - JWT stored in localStorage (XSS-accessible, trivially stealable)
  - Passwords hashed with MD5 (broken since 1996, rainbow-table-crackable)
  - No CSRF protection (state-changing endpoints vulnerable to CSRF attacks)
  - No rate limiting on /login (brute-force trivially possible)
  - Session tokens never expire (stolen token valid indefinitely)
  - User IDs exposed in JWT payload without validation (IDOR risk)
  - SQL query built with string concatenation (SQL injection possible)
  - Error messages include stack traces (information disclosure)

User: "looks good, ship it"

[Two weeks later]
Security researcher: "Your users' passwords are exposed. Here's 50,000 of them."
Engineer: "But Claude said it looked right..."
`}),e.jsx("p",{children:'None of these vulnerabilities are exotic. Every one of them is in OWASP Top 10. Claude generated them not because it was malicious, but because the prompt contained zero constraints. "Build me a user auth system" is a specification that could be satisfied by an infinite variety of implementations, including deeply insecure ones. Claude picked one. You shipped it.'}),e.jsx("p",{children:"Now look at the same task done with Vibe Engineering discipline:"}),e.jsx(t,{language:"markdown",filename:"vibe-engineering-example.md",children:`# Vibe Engineering: User Auth (The Right Way)

# ── Step 1: CLAUDE.md established BEFORE any coding ────────────────────────

## Security Constraints (from CLAUDE.md)
- JWT: httpOnly cookies ONLY — never localStorage, never sessionStorage
- Passwords: bcrypt with cost factor >= 12 (never MD5, SHA1, SHA256 raw)
- CSRF: SameSite=Strict cookie attribute + CSRF token for all state-changing ops
- Session: 15min access token TTL, 7-day refresh token with rotation on use
- Rate limiting: max 5 login attempts per IP per 15 minutes (return 429)
- Input validation: Zod schema validation on ALL inputs before any processing
- Error responses: generic messages only ("Invalid credentials") — no stack traces
- SQL: parameterized queries ONLY via ORM (no string concatenation)

# ── Step 2: The Vibe Engineering prompt ─────────────────────────────────────

User: "Implement the user authentication system per CLAUDE.md security
       constraints. Write failing tests first that assert the security
       behaviors, then implement code that passes them. After implementation,
       run 'semgrep --config auto src/auth/' and report any findings."

# ── Step 3: What Claude actually does ───────────────────────────────────────

Claude:
  1. Writes failing tests:
     - test_jwt_not_in_localStorage() → asserts cookie-based storage
     - test_password_bcrypt_cost_12() → asserts bcrypt with correct cost
     - test_csrf_token_required() → asserts CSRF validation on POST /login
     - test_rate_limit_after_5_attempts() → asserts 429 on 6th attempt
     - test_refresh_token_rotates() → asserts old token invalid after use
  2. Implements auth module that passes all tests
  3. Runs semgrep: reports 0 critical findings, 1 informational note
  4. Reports: "Implementation complete. All 12 tests pass. Semgrep clean."

# ── Step 4: Engineer review ──────────────────────────────────────────────────

Engineer:
  - Reads every diff (not just the summary)
  - Verifies tests actually test what they claim
  - Confirms semgrep output matches what Claude reported
  - Checks bcrypt cost factor in the actual code (not just trusts Claude's claim)
  - Merges PR: now personally accountable for this code
`}),e.jsx("p",{children:"The difference is not that one uses AI and one doesn't. Both use AI. The difference is that the second approach treats the engineer's job as governing the AI's output, not hoping the AI happened to make the right choices."}),e.jsxs(l,{title:"The Confidence Trap",children:[`AI models generate text with uniform fluency regardless of whether the underlying content is correct. A correct implementation and a subtly broken one are written in the same confident tone, with the same clean formatting, and the same authoritative comments. There is no signal in the prose that tells you "this part is hallucinated" or "I'm not sure about this security pattern."`,e.jsx("br",{}),e.jsx("br",{}),"This is categorically different from human code review, where a junior engineer's uncertainty is often visible in their code, their comments, or their PR description. AI does not express uncertainty at the code level. It expresses it only when you ask it to, and only sometimes.",e.jsx("br",{}),e.jsx("br",{}),"The engineer must never mistake confidence for correctness. The mechanism for not making that mistake is: tests, SAST, linting, and your own careful reading of every diff."]}),e.jsxs(o,{severity:"critical",title:'The "Accept All" Button Is a Security Incident Waiting to Happen',children:['Every major AI coding assistant has some version of an "Accept All" button — a way to accept every suggested change at once without reviewing individual diffs. In personal projects, this is a convenience feature. In production codebases, it is a security control bypass.',e.jsx("br",{}),e.jsx("br",{}),"Accepting AI-generated code without review is not a development velocity optimization. It is a transfer of authorship without transfer of understanding. You are putting your name on code you cannot explain, cannot defend, and may not be able to fix when it breaks.",e.jsx("br",{}),e.jsx("br",{}),"Organizational policy for Vibe Engineering: ",e.jsx("strong",{children:"every line of AI-generated code must be reviewed by the engineer who approves the PR"}),'. "The AI generated it" is not a defense when the security audit asks why you shipped MD5 password hashing. "I reviewed it and approved it" is. The second answer is only possible if you actually reviewed it.']}),e.jsxs(r,{title:"The Governor Pattern",children:["The engineer's role in Vibe Engineering is that of a governor — someone who sets the rules of the system, validates that those rules are being followed, and is accountable for the system's behavior. The five responsibilities of the governor are:",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"1. Set Constraints (CLAUDE.md)"}),e.jsx("br",{}),"Before any coding begins, the governor defines what is and isn't acceptable. Security rules, architectural patterns, forbidden libraries, compliance requirements. These are not suggestions to the AI — they are constraints that must be satisfied before any output is accepted.",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"2. Specify Requirements (Clear and Testable)"}),e.jsx("br",{}),'The governor writes requirements that are specific enough to be verified. Not "build auth" but "implement login with these security properties, expressed as passing tests." Vague requirements produce vague implementations that may or may not be correct.',e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"3. Review Output (Every Diff)"}),e.jsx("br",{}),"The governor reads every change before accepting it. Not skimming — reading. Line by line for security-critical paths, at a higher level for boilerplate. The goal is to be able to explain, in a code review, why every line is there and why it is correct.",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"4. Run Validation Gates (Tests, SAST, Linting)"}),e.jsx("br",{}),"The governor runs the automated checks that catch what human eyes miss. Tests verify behavior. SAST catches security anti-patterns. Linting enforces style. These are not optional — they are the governor's instruments for detecting when the AI deviated from constraints.",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"5. Own the Result (Accountability)"}),e.jsx("br",{}),"The governor signs their name to the output. This is what makes all of the above non-negotiable: you cannot hold accountability for code you didn't review, can't explain code you didn't understand, and can't fix code you didn't write with intention. Accountability creates the incentive structure that makes the first four steps happen."]}),e.jsxs(i,{title:"Write CLAUDE.md Before the First Prompt",children:["Start every AI coding session by reading your CLAUDE.md in your head. Not skimming — reading. Ask yourself: does this still reflect the actual constraints of this project? Has anything changed since the last time I updated it?",e.jsx("br",{}),e.jsx("br",{}),"If you don't have a CLAUDE.md for this project, stop. Write it before typing a single prompt. This is not bureaucratic overhead. A 30-minute investment in writing a thorough CLAUDE.md saves 30 hours of security remediation, architectural refactoring, and compliance scrambling downstream.",e.jsx("br",{}),e.jsx("br",{}),"Every constraint you don't put in CLAUDE.md is a decision you're leaving to the AI's training data defaults — which may have been appropriate for a tutorial on the internet in 2021, but are not appropriate for your regulated, production, customer-facing system in the present day."]}),e.jsxs(s,{type:"tip",title:'Why "Vibes" Still Matter',children:["Vibe Engineering is not a campaign against developer joy. Flow state is real. The feeling of momentum when ideas manifest in working code almost instantly is a genuine productivity multiplier, and it reduces cognitive fatigue in a way that grinds through implementation line by line never did.",e.jsx("br",{}),e.jsx("br",{}),"The goal of Vibe Engineering is not to eliminate vibes. It's to build the scaffolding that makes vibing safe. When your CLAUDE.md is thorough, your tests are in place, and your SAST is in the loop, you can move fast with confidence instead of moving fast with anxiety. You can enter flow state and stay there because you're not constantly second-guessing whether you just shipped a vulnerability.",e.jsx("br",{}),e.jsx("br",{}),"The discipline doesn't kill the joy. The discipline is what makes the joy sustainable at production scale."]})]})}const C=Object.freeze(Object.defineProperty({__proto__:null,default:h},Symbol.toStringTag,{value:"Module"}));function u(){return e.jsxs("div",{className:"section-content",children:[e.jsx("h1",{children:"The AI Constitution: CLAUDE.md"}),e.jsx("p",{children:"Every time you start a Claude Code session, Claude reads the project context and begins working. Without any configuration, it makes decisions based on its training — which reflects general best practices from the internet, not your organization's specific requirements. It doesn't know that you're in a PCI-DSS scope. It doesn't know your team banned a certain library after a security incident. It doesn't know that the API layer must use async patterns because the team decided that two years ago. It will make reasonable-sounding decisions, and they may be completely wrong for your context."}),e.jsx("p",{children:"CLAUDE.md solves this by giving every session a starting point that reflects your actual requirements. It is the persistent institutional memory of your project, committed to version control, reviewed like code, and loaded automatically whenever Claude Code starts."}),e.jsxs(n,{title:"CLAUDE.md — The AI Constitution",children:["CLAUDE.md is the configuration file that Claude Code reads automatically at startup, from the current working directory and all parent directories up to the user's home. It functions as ",e.jsx("strong",{children:"persistent context"}),": every piece of information in it is available to Claude throughout the session without you re-stating it in prompts.",e.jsx("br",{}),e.jsx("br",{}),"A well-written CLAUDE.md encodes:",e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Project identity"})," — what this service does, who owns it, what compliance scope it's in"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Tech stack"})," — language versions, framework versions, approved libraries"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Coding standards"})," — naming conventions, file structure, layering rules"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Forbidden patterns"})," — anti-patterns that must never be generated"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Security rules"})," — specific controls required by the environment"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Architectural boundaries"})," — what calls what, what doesn't call what"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Custom commands"})," — project-specific slash commands available in the session"]})]}),"Think of CLAUDE.md as the brief you give to a new contractor on day one — except it's always up to date, always present, and never has to be repeated."]}),e.jsx("h2",{children:"The CLAUDE.md Hierarchy"}),e.jsx("p",{children:"CLAUDE.md is not a single file. It's a hierarchy of files, each scoped to the level where its constraints apply. Claude reads all applicable files in the hierarchy, with more specific (deeper) files taking precedence over more general (shallower) ones when there is a conflict."}),e.jsx(t,{language:"text",filename:"CLAUDE.md file hierarchy",children:`~/.claude/CLAUDE.md              # User-level: personal preferences, common tools,
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
                                 #   restrictions, tokenization requirements)`}),e.jsxs("p",{children:["When you're working in ",e.jsx("code",{children:"/repo/src/api/payments/"}),", Claude reads all five files. The payments CLAUDE.md adds constraints on top of the API CLAUDE.md, which adds constraints on top of the src CLAUDE.md, and so on up. This means you write each constraint once, at the right level, and it applies everywhere it should without duplication."]}),e.jsx("h2",{children:"A Production CLAUDE.md: Python FastAPI + SOC 2"}),e.jsx("p",{children:"Here is a complete, enterprise-grade CLAUDE.md for a Python FastAPI service operating in a SOC 2 Type II environment. Read every section and note why each constraint is present — each one exists because someone, somewhere, had to deal with the consequence of not having it."}),e.jsx(t,{language:"markdown",filename:"CLAUDE.md",children:`# AI Constitution: payments-service

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
- [ ] semgrep output is clean (0 critical, 0 high findings)`}),e.jsx("h2",{children:"A Production CLAUDE.md: TypeScript React + GDPR"}),e.jsx("p",{children:"The same structure applies to frontend codebases with entirely different constraints. Here is a CLAUDE.md for a React application operating under GDPR with accessibility requirements. Notice how the forbidden patterns shift entirely to reflect the different risk surface:"}),e.jsx(t,{language:"markdown",filename:"CLAUDE.md (TypeScript/React with GDPR)",children:`# AI Constitution: customer-portal-frontend

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
- /storybook-story: Generate a Storybook story with all variant states for a new component`}),e.jsxs(r,{title:"The Forbidden Patterns Section",children:["Of all the sections in a CLAUDE.md, the ",e.jsx("strong",{children:"Forbidden Patterns"})," section is the most important. This is counterintuitive — most engineers instinctively document what to do, not what to avoid. But explicit negative constraints are more reliable guides for AI behavior than positive ones.",e.jsx("br",{}),e.jsx("br",{}),`When you write "use bcrypt for passwords," Claude knows to use bcrypt when the topic of password hashing comes up. But Claude also knows many other password hashing patterns, and if context is ambiguous, any of them might appear. When you write "NEVER use MD5 or SHA1 for passwords," you've eliminated an entire class of wrong answers before they can be generated.`,e.jsx("br",{}),e.jsx("br",{}),"The most effective Forbidden Patterns sections are:",e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Specific"}),' — "f-strings in SQL expressions" not "unsafe SQL"']}),e.jsxs("li",{children:[e.jsx("strong",{children:"Annotated"}),' — include the risk in a comment ("SQL injection", "command injection")']}),e.jsxs("li",{children:[e.jsx("strong",{children:"Exhaustive for known risks"})," — if your team has had a security incident involving a pattern, that pattern is in Forbidden Patterns, always, and stays there forever"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Domain-aware"})," — a PCI-DSS scope has different forbidden patterns than a HIPAA scope or a GDPR scope; write the ones that apply to your specific environment"]})]}),"Every item in your Forbidden Patterns section should exist because someone either encountered that anti-pattern in production, observed AI generate it unprompted, or identified it as a regulatory risk specific to your context. Generic lists copied from the internet are less valuable than short, specific lists from your team's actual experience."]}),e.jsxs(o,{severity:"high",title:"CLAUDE.md Must Not Contain Secrets or Internal Infrastructure Details",children:["CLAUDE.md is committed to version control and may be readable by anyone with repository access — including contractors, open source contributors, or anyone who gains unauthorized access to your source repository.",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"Never include in CLAUDE.md:"}),e.jsxs("ul",{children:[e.jsx("li",{children:"Actual API keys, tokens, or credentials of any kind"}),e.jsx("li",{children:"Internal IP addresses, VPC CIDR ranges, or private hostnames"}),e.jsx("li",{children:"Production database connection strings"}),e.jsx("li",{children:"Internal tool URLs (Jira instances, Confluence, internal wikis)"}),e.jsx("li",{children:"Employee names associated with sensitive systems"}),e.jsx("li",{children:"Security control implementation details that would aid an attacker in bypassing them"})]}),e.jsx("strong",{children:"Reference by name instead:"})," Write ",e.jsx("code",{children:"PAYMENTS_API_KEY"}),", not the actual key. Write ",e.jsx("code",{children:"use the JIRA_URL environment variable"}),", not the actual Jira URL. Write",e.jsx("code",{children:"see AWS Secrets Manager path /prod/payments/db-credentials"}),", not the actual connection string. The path to a secret is not itself a secret, but the secret value is.",e.jsx("br",{}),e.jsx("br",{}),"The rule is simple: if the information would help an attacker understand, map, or compromise your production system, it doesn't belong in a file that lives in your source repository."]}),e.jsxs(i,{title:"Version CLAUDE.md Like Production Code",children:["CLAUDE.md is not a scratch pad. It is a governing document that shapes the behavior of AI across every engineering session that touches your codebase. Treat it with the same discipline you apply to your most critical configuration files.",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"In practice, this means:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Changes go through PR review"})," — a proposed change to CLAUDE.md should be reviewed by at least one other engineer, the same as a change to your CI pipeline or Terraform configuration"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Maintain a changelog"}),' — when you add a new security constraint, add an entry noting why it was added and when. "Added: no f-strings in SQL (2024-11 security audit finding)" is invaluable context when someone questions the rule years later']}),e.jsxs("li",{children:[e.jsx("strong",{children:"Use org-level templates"})," — create a base CLAUDE.md template for each tech stack your org uses (Python/FastAPI, TypeScript/React, Go/gRPC). Teams fork from the template and add their project-specific constraints. This ensures minimum standards across all projects without requiring every team to rediscover the same lessons"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Audit existing code when rules change"})," — when a new security requirement is added to CLAUDE.md, immediately run a search for violations of that requirement in the existing codebase. Adding a rule going forward is not enough if the problem already exists in 40 files. The CLAUDE.md update and the remediation audit are one task, not two"]})]}),'The question to ask before every CLAUDE.md PR merge: "If a new engineer joined the team tomorrow and their only context for AI-assisted development was this file, would they produce code that meets our standards?" If the answer is no, the file is incomplete.']}),e.jsx("h2",{children:"The ADR as CLAUDE.md Input Pattern"}),e.jsx("p",{children:"Architecture Decision Records (ADRs) are one of the most valuable — and underused — engineering practices. An ADR documents a significant architectural decision: the context, the options considered, the decision made, and the consequences. They prevent the same debate from happening twice and give future engineers the reasoning behind decisions that might otherwise seem arbitrary."}),e.jsx("p",{children:"ADRs and CLAUDE.md have a natural relationship that most teams don't exploit. Every ADR contains implicit constraints: if you decided to use async patterns throughout the API layer, that's a constraint future code must follow. If you decided to ban a certain library after a security incident, that's a constraint. If you decided on a specific error handling pattern, that's a constraint."}),e.jsx("p",{children:'The pattern is straightforward: when you make an architectural decision and write the ADR, extract the constraints from the ADR and add them to CLAUDE.md in the same PR. The ADR becomes the "why"; CLAUDE.md becomes the "what"; together they ensure the decision is enforced in all future AI-assisted development sessions automatically.'}),e.jsx(t,{language:"markdown",filename:"docs/adr/ADR-012-jwt-storage-strategy.md (excerpt)",children:`## Status
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
See: /repo/CLAUDE.md — "Auth Implementation (ADR-012)" section`}),e.jsx(t,{language:"markdown",filename:"CLAUDE.md (section added after ADR-012)",children:`## Auth Implementation (ADR-012, 2024-09-15)
See docs/adr/ADR-012-jwt-storage-strategy.md for full context.

- JWT storage: httpOnly cookie set by server ONLY — NEVER localStorage or sessionStorage
- Cookie attributes: HttpOnly=true, Secure=true, SameSite=Strict
- CSRF: X-CSRF-Token header required on ALL POST, PUT, PATCH, DELETE endpoints
- Token lifecycle: 15min access token, 7-day refresh token with rotation on every use
- Logout: must call POST /auth/logout — client-side state clear alone is insufficient

## Forbidden (from ADR-012)
- document.cookie access for auth tokens (httpOnly means JS can't read them — never try)
- localStorage.setItem('token', ...) — this was the vulnerability, never recreate it
- HS256 JWT signing — we use RS256 to allow token verification without sharing secret`}),e.jsx("p",{children:'Six months after ADR-012, a new engineer starts a Claude Code session and asks Claude to implement a "remember me" feature. Without the CLAUDE.md constraint, Claude might reasonably store a long-lived token in localStorage — a pattern it has seen many times in its training data. With the CLAUDE.md constraint referencing the ADR, Claude knows this specific project made a deliberate decision against that pattern, understands the security reasoning, and implements the correct cookie-based approach instead. The ADR → CLAUDE.md pipeline converts a one-time decision into a permanent constraint.'}),e.jsxs(s,{type:"tip",title:"Scope Your CLAUDE.md at the Right Level",children:["One of the most common CLAUDE.md mistakes is writing everything at the repo root level — a single massive file with hundreds of rules that applies equally to your backend API, your frontend, your data pipeline, and your infrastructure tooling. This creates two problems: the file becomes so long that important rules get lost in the noise, and rules that only apply to one part of the codebase create irrelevant noise when working in another area.",e.jsx("br",{}),e.jsx("br",{}),"The right approach is to write each constraint at the level where it applies:",e.jsxs("ul",{children:[e.jsxs("li",{children:["API authentication requirements belong in ",e.jsx("code",{children:"/src/api/CLAUDE.md"}),", not the root"]}),e.jsxs("li",{children:["Frontend accessibility rules belong in ",e.jsx("code",{children:"/src/components/CLAUDE.md"})]}),e.jsxs("li",{children:["PCI-DSS payment controls belong in ",e.jsx("code",{children:"/src/api/payments/CLAUDE.md"})]}),e.jsxs("li",{children:["Python-wide style conventions belong in ",e.jsx("code",{children:"/src/CLAUDE.md"})]}),e.jsxs("li",{children:["Compliance scope, team identity, and cross-cutting architecture belong in the root ",e.jsx("code",{children:"/CLAUDE.md"})]})]}),"When working in ",e.jsx("code",{children:"/src/api/payments/"}),", the engineer gets all applicable constraints automatically from every level of the hierarchy. When working in ",e.jsx("code",{children:"/src/components/"}),", they get only the constraints relevant to that context. A focused, 40-line CLAUDE.md that engineers actually read and maintain is worth more than a 400-line omnibus file that gradually becomes invisible through familiarity — or worse, that nobody ever reads because it's too long to parse."]})]})}const A=Object.freeze(Object.defineProperty({__proto__:null,default:u},Symbol.toStringTag,{value:"Module"})),p=`# CLAUDE.md — Python FastAPI Service

## Project Overview
This is a Python FastAPI microservice. All code generated or modified must comply with the
standards below. These constraints are not optional — they exist because this service handles
sensitive user data and must maintain SOC 2 Type II compliance.

## Technology Stack
- Python 3.11+
- FastAPI 0.110+
- SQLAlchemy 2.x (ORM only — see Database Rules)
- Pydantic v2 for all request/response models
- Alembic for migrations
- Pytest + pytest-asyncio for tests
- bcrypt for password hashing (never use hashlib.md5/sha1 for secrets)

## Database Rules
ALWAYS use SQLAlchemy ORM or Core expression language.
NEVER write raw SQL strings. Raw SQL bypasses our query parameter sanitization
and creates SQL injection risk that would fail our SOC 2 penetration tests.

Correct:
    result = await db.execute(select(User).where(User.id == user_id))

Forbidden:
    cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
    cursor.execute("SELECT * FROM users WHERE id = " + str(user_id))

## Input Validation
Every endpoint parameter must be validated through a Pydantic model.
- Use Field(...) with explicit constraints (min_length, max_length, pattern, ge, le)
- Email fields must use EmailStr type
- UUIDs must use uuid.UUID type
- Never accept raw dict or Any as a request body type

## Security Constraints
1. All endpoints must require authentication via the get_current_user dependency,
   unless explicitly decorated with @public_endpoint.
2. Use bcrypt for all password hashing. Minimum 12 rounds.
3. Never log PII: no email addresses, names, phone numbers, SSNs, or auth tokens in logs.
   Log user_id (UUID) only when a user reference is needed.
4. JWT tokens: HS256 minimum, RS256 preferred. Always validate exp and iss claims.
5. Rate limiting: apply @rate_limit(requests=100, window=60) to all public endpoints.

## SOC 2 Audit Logging
Every state-changing operation (POST, PUT, PATCH, DELETE) must emit an audit log entry.
Use the audit_log() helper:

    await audit_log(
        action="user.password_changed",
        actor_id=current_user.id,
        resource_type="user",
        resource_id=target_user.id,
        # Never include the actual values — log the fact of the change only
    )

Audit logs are shipped to our SIEM. Missing audit events will be flagged in compliance reviews.

## Forbidden Patterns
- global state: no module-level mutable variables; use dependency injection
- print() statements: use structlog logger only
- hardcoded values: no hardcoded ports, URLs, secrets, or environment-specific strings;
  use settings from app/config.py (Pydantic BaseSettings)
- bare except: always catch specific exception types
- TODO comments in committed code: resolve before merging

## Testing Requirements
- Every new endpoint needs at minimum: happy path, auth failure, and validation failure tests
- Use pytest fixtures, not setUp/tearDown
- Mock external HTTP calls with respx
- Test database operations against a real test database (use pytest-asyncio + async fixtures)
- Minimum 85% line coverage enforced in CI
`,m=`# CLAUDE.md — TypeScript React Frontend

## Project Overview
This is the customer-facing web application. All code must comply with GDPR requirements,
meet WCAG 2.1 AA accessibility standards, and pass our automated Lighthouse CI budget.

## Technology Stack
- React 18 with concurrent features (Suspense, useTransition)
- TypeScript 5.x in strict mode — tsconfig "strict": true is non-negotiable
- Tailwind CSS 3.x for styling
- React Query (TanStack Query v5) for server state
- Zustand for client state
- Vitest + React Testing Library for unit/component tests
- Playwright for end-to-end tests
- react-i18next for internationalisation

## TypeScript Rules
- Strict mode is enabled. Never use @ts-ignore or @ts-nocheck.
- Never use the any type. Use unknown for truly unknown shapes, then narrow with type guards.
- All props interfaces must be explicitly typed — no inferred object literals as prop types.
- Use discriminated unions for state machines (loading | success | error variants).
- Prefer type over interface for unions and intersections; use interface for object shapes.

## Styling Rules
- Use Tailwind utility classes exclusively.
- No inline styles: the style prop is forbidden except for CSS custom properties.
- No CSS-in-JS libraries. No styled-components, no emotion.
- Component variants must use cva() (class-variance-authority), not conditional string concatenation.
- All interactive elements need focus-visible styles (Tailwind: focus-visible:ring-2).

## GDPR Constraints
These rules exist because violations carry fines up to 4% of global annual revenue.

1. Never store PII in localStorage or sessionStorage.
   PII includes: name, email, phone, address, IP address, device fingerprint.
   Session tokens are acceptable in httpOnly cookies only (set by the server).

2. Analytics and tracking scripts must not load until the user has given explicit consent.
   Check consentStore.hasAnalyticsConsent() before initialising any tracking.
   Use the <ConsentGate category="analytics"> wrapper component for analytics code.

3. Cookie policy compliance: all cookies must be declared in public/cookie-manifest.json
   before deployment. Undeclared cookies will be flagged by our compliance scanner.

4. Data minimisation: forms must only collect fields that are strictly necessary.
   Add a comment justifying each field if it is not self-evidently required.

## Accessibility Requirements (WCAG 2.1 AA)
- All images need meaningful alt text. Decorative images use alt="".
- Interactive elements must be keyboard operable. No click-only handlers without keydown.
- Focus management: after modal open/close, programmatically return focus to the trigger.
- Colour contrast: minimum 4.5:1 for normal text, 3:1 for large text.
  Use the useContrastChecker() hook when adding new colour combinations.
- ARIA: use semantic HTML first. Only add ARIA attributes when semantic HTML is insufficient.
- Screen reader announcements for async state changes: use the <LiveRegion> component.

## Forbidden Patterns
- console.log / console.error in committed code: use the logger service
- any type: see TypeScript Rules above
- inline styles (style prop): see Styling Rules above
- Direct DOM manipulation (document.querySelector etc.) outside of custom hooks
- useEffect with missing dependencies: always satisfy the exhaustive-deps lint rule
- Mutating props or state directly

## Testing Requirements
- Each component needs: render test, interaction test, accessibility test (axe-core via jest-axe)
- Use userEvent from @testing-library/user-event, not fireEvent
- Vitest coverage threshold: 80% lines, 75% branches
- New user-facing flows need a Playwright test covering the happy path
`,g=`# CLAUDE.md — Kubernetes / Helm Infrastructure as Code

## Project Overview
This repository manages our production AWS EKS infrastructure via Terraform and Helm.
Mistakes here affect production uptime and can expose customer data. Read all constraints
before generating any configuration.

## Technology Stack
- Terraform 1.6+ (use tofu-compatible syntax where possible)
- Helm 3.x charts (in charts/ directory)
- AWS EKS 1.29+
- AWS provider 5.x
- Kubernetes provider 2.x
- Terragrunt for environment promotion (dev → staging → prod)

## Terraform Rules
- Pin all provider versions in versions.tf with exact version constraints (~> X.Y.Z).
- Use terraform workspaces only for feature branches. Environments are separate state files.
- All resources must have a tags block including: env, team, cost-centre, managed-by="terraform".
- Remote state in S3 with DynamoDB locking — never use local state for anything pushed to git.
- terraform plan output must be reviewed and approved before terraform apply in staging/prod.

## Helm Chart Rules
- Never use latest as an image tag. Always pin to a specific digest or semver tag.
  Forbidden: image: myapp:latest
  Required:   image: myapp:1.4.2 (or @sha256:abc123...)
- Chart version and appVersion must be bumped on every change (semantic versioning).
- Use Helm secrets (helm-secrets plugin + SOPS) for any value that is not safe to commit.
- All configurable values must have entries in values.yaml with comments explaining each field.

## Security Constraints
These constraints exist to pass our CIS Kubernetes Benchmark and AWS Security Hub checks.

1. All secrets must be stored in HashiCorp Vault. Use the vault-agent sidecar injector pattern.
   Never put secrets in ConfigMaps, environment variables, or Helm values files.
   Forbidden: env: - name: DB_PASSWORD value: "hunter2"
   Required:   vault.hashicorp.com/agent-inject-secret-db: "secret/prod/db"

2. Containers must run as non-root.
   Every Deployment/StatefulSet must include:
     securityContext:
       runAsNonRoot: true
       runAsUser: 10001
       allowPrivilegeEscalation: false
       readOnlyRootFilesystem: true

3. Privileged containers are forbidden. No container may have privileged: true.

4. Network policies are required for every namespace.
   Default-deny ingress and egress must be the first policy applied to any new namespace.
   Explicit allow rules must be added for each required communication path.

5. Services must use ClusterIP or LoadBalancer (via AWS NLB). NodePort is forbidden —
   it exposes ports on every node and bypasses our security group rules.

6. Resource requests and limits are mandatory on every container:
     resources:
       requests:
         cpu: "100m"
         memory: "128Mi"
       limits:
         cpu: "500m"
         memory: "512Mi"
   Containers without limits can consume unbounded resources and cause node pressure.

## Forbidden Patterns
- Hardcoded credentials: any string matching password, secret, token, key in plain text
- latest image tag: see Helm Chart Rules
- privileged: true: see Security Constraints
- NodePort services: see Security Constraints
- Empty resource requests/limits: see Security Constraints
- taint tolerations that apply to master/control-plane nodes without explicit approval
- Disabling admission controllers via flags

## Change Management
- All changes to prod/ must go through a pull request with at least 2 approvals.
- Terraform changes to networking or IAM require a security team review label.
- Run checkov . and tfsec . locally before pushing — CI will fail on HIGH/CRITICAL findings.
`;function y(){return e.jsxs("div",{className:"lesson-content",children:[e.jsx("h2",{children:"Enterprise CLAUDE.md Patterns"}),e.jsx("p",{children:"A CLAUDE.md file is the primary mechanism for encoding your organisation's engineering standards directly into Claude Code's working context. When Claude reads your CLAUDE.md at session start, every subsequent code generation, edit, and suggestion operates within those constraints — without you having to repeat them in every prompt. For enterprise teams, this is not a convenience feature; it is the difference between an AI assistant that reinforces your compliance posture and one that silently works against it."}),e.jsx("p",{children:"The templates below are drawn from three common enterprise contexts: a Python backend with SOC 2 requirements, a TypeScript frontend with GDPR obligations, and a Kubernetes infrastructure codebase with CIS security benchmarks. Each template is designed to be dropped into the root of its repository and extended with project-specific details."}),e.jsx(n,{term:"CLAUDE.md as a Persistent Instruction Layer",children:e.jsx("p",{children:"CLAUDE.md is a Markdown file that Claude Code reads at the start of every session in a given directory. It functions as a standing system prompt that persists across all interactions in that workspace. Unlike a prompt you type, it cannot be forgotten mid-task, and it applies consistently to every developer on the team who uses Claude Code in that repository. The file can include technology constraints, forbidden patterns, security rules, compliance requirements, and coding conventions — effectively encoding your engineering standards as machine-readable policy."})}),e.jsx("h2",{children:"Template 1: Python FastAPI Service with SOC 2 Compliance"}),e.jsx("p",{children:"FastAPI services that handle user data in regulated environments face a specific set of risks: SQL injection through dynamic query construction, credential exposure through logging, and audit gaps that fail compliance reviews. This template addresses each directly by naming the forbidden pattern alongside the requirement, so Claude understands not just what to do but why a deviation would be harmful."}),e.jsx(t,{language:"text",filename:"CLAUDE.md",children:p}),e.jsx(s,{type:"note",title:"Why SQLAlchemy-Only Matters",children:e.jsx("p",{children:"The prohibition on raw SQL is not stylistic preference — it is a security control. Raw SQL with f-strings or concatenation is the leading cause of SQL injection vulnerabilities, which remain in the OWASP Top 10. SQLAlchemy's parameterised queries make injection structurally impossible: user-supplied values are never interpreted as SQL syntax. When this rule is in CLAUDE.md, Claude will not generate raw SQL even when it would be marginally shorter or more convenient."})}),e.jsx(i,{title:"SOC 2 Audit Logging: Log the Fact, Not the Value",children:e.jsxs("p",{children:["SOC 2 Type II requires evidence that all privileged and state-changing operations are logged. The critical nuance is that audit logs must capture ",e.jsx("em",{children:"what changed"})," (action, actor, resource) without capturing ",e.jsx("em",{children:"what the new value is"})," — because the audit log itself could expose PII. The CLAUDE.md template above encodes this distinction explicitly: log the action type and resource IDs, never the field values. This pattern satisfies audit requirements while passing PII-in-logs scanners."]})}),e.jsx("h2",{children:"Template 2: TypeScript React Frontend with GDPR"}),e.jsx("p",{children:"Frontend codebases face a different compliance surface than backends. The browser is a hostile environment where user data can leak through localStorage persistence, third-party scripts, and improperly scoped cookies. GDPR's consent requirements are particularly tricky for AI assistants to respect by default — without explicit instruction, an AI will often generate analytics initialisation code that fires unconditionally on page load."}),e.jsx(t,{language:"text",filename:"CLAUDE.md",children:m}),e.jsx(s,{type:"note",title:"Why localStorage PII Is a GDPR Risk",children:e.jsx("p",{children:"localStorage persists data across browser sessions and is readable by any JavaScript running on the same origin — including injected third-party scripts. Storing PII there means it may persist after a user requests deletion, be exposed through XSS attacks, and lack the consent lifecycle controls that GDPR Article 7 requires. The CLAUDE.md constraint to use httpOnly cookies (set server-side) for session tokens removes this entire class of risk from AI-generated code."})}),e.jsx(i,{title:"Accessibility as a CLAUDE.md Constraint",children:e.jsx("p",{children:"WCAG 2.1 AA compliance is increasingly a legal requirement in enterprise contexts (EU Web Accessibility Directive, US Section 508, UK Public Sector Bodies Accessibility Regulations). Encoding it in CLAUDE.md means that Claude generates accessible markup by default: semantic HTML, explicit alt text, focus management on modals, and keyboard operability for interactive elements. The cost of retrofitting inaccessible code is substantially higher than generating accessible code in the first place."})}),e.jsx("h2",{children:"Template 3: Kubernetes / Helm IaC with Security Hardening"}),e.jsx("p",{children:"Infrastructure as Code is particularly high-stakes for AI-assisted generation because a single misconfigured security context, a hardcoded credential, or a missing network policy can expose an entire cluster. This template is structured around the CIS Kubernetes Benchmark controls most commonly violated by generated code, and it includes the exact YAML syntax Claude should use rather than abstract descriptions."}),e.jsx(t,{language:"text",filename:"CLAUDE.md",children:g}),e.jsx(o,{title:"Hardcoded Credentials in IaC Are a Critical Risk",severity:"critical",children:e.jsx("p",{children:"Infrastructure configuration files committed to git with embedded secrets are one of the most frequent causes of cloud breaches. Unlike application code where secrets might be isolated to a single service, IaC credentials often carry administrative-level permissions across entire environments. The CLAUDE.md template above prohibits this pattern entirely and requires Vault-based secret injection. This constraint must be enforced at the CLAUDE.md level because it is easy for an AI to generate a convenient working example with a hardcoded value when not explicitly told otherwise."})}),e.jsx(i,{title:"Non-Root Containers and ReadOnly Filesystems",children:e.jsx("p",{children:"Running containers as root is the default in many base images, but it means that a container escape vulnerability grants attackers root access on the host node. The securityContext block in the template (runAsNonRoot, runAsUser, readOnlyRootFilesystem) is the Kubernetes-native way to enforce least privilege at the container level. Including the exact YAML in CLAUDE.md means Claude will emit this block on every Deployment it generates, even in quick examples, because the template normalises it as boilerplate rather than an optional hardening step."})}),e.jsx("h2",{children:"Structuring CLAUDE.md for Enterprise Teams"}),e.jsx("p",{children:"Real enterprise repositories benefit from a layered approach to CLAUDE.md files. A global file in the user's home directory sets organisation-wide defaults, while each repository's CLAUDE.md adds project-specific rules. Subdirectory CLAUDE.md files can further scope rules to specific service boundaries within a monorepo."}),e.jsxs(r,{name:"Layered CLAUDE.md Strategy",category:"Configuration",whenToUse:"Any team with more than one repository, or any monorepo with distinct service boundaries. The global layer prevents repetition of organisation standards; the repository layer adds project context; the subdirectory layer handles domain-specific constraints.",children:[e.jsx("p",{children:"Organise CLAUDE.md files in three layers, each extending the one above:"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Layer 1 — Global (~/.claude/CLAUDE.md):"})," Organisation-wide rules that apply everywhere: preferred languages, company-wide security baselines, internal tool access patterns, escalation contacts for security findings."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Layer 2 — Repository (./CLAUDE.md):"})," Project-specific stack, compliance requirements, architecture decisions, forbidden patterns specific to this codebase, and how to run tests and linting."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Layer 3 — Subdirectory (./src/billing/CLAUDE.md):"})," Domain-specific constraints for high-sensitivity areas — for example, billing code that must follow PCI-DSS patterns, or authentication code that has additional review requirements."]})]}),e.jsxs(i,{title:"Forbidden Patterns Are More Effective Than Positive Instructions",children:[e.jsx("p",{children:"When writing CLAUDE.md, resist the urge to describe only what you want. Explicitly naming forbidden patterns is more effective for two reasons. First, LLMs have strong priors toward common patterns from their training data — raw SQL, console.log, and hardcoded values are all common in training corpora. Positive instructions alone may not override these priors. Second, forbidden patterns create unambiguous failure conditions: Claude can recognise that a string matches a forbidden pattern even if it would not have thought to apply the positive rule to that specific case."}),e.jsx("p",{children:'For each forbidden pattern, include the reason. "No raw SQL — SQL injection risk that fails SOC 2 pen tests" is more effective than "No raw SQL" because it gives Claude the context to generalise the rule to similar-but-not-identical cases.'})]})]})}const S=Object.freeze(Object.defineProperty({__proto__:null,default:y},Symbol.toStringTag,{value:"Module"}));function f(){return e.jsxs("div",{children:[e.jsxs(n,{title:"AI-TDD Loop",children:[e.jsx("p",{children:"AI-First Test-Driven Development reframes the classic TDD cycle around what AI agents are actually good at: running code in a loop until an objective criterion is satisfied. Tests are that criterion. When you write tests before implementation, you give Claude Code a machine-verifiable specification it can execute, evaluate, and iterate against without human supervision."}),e.jsx("p",{children:"The five-step AI-TDD cycle:"}),e.jsxs("ol",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Write failing tests that specify behavior."})," You, the human, write tests that encode exactly what the code must do. These tests fail today because the implementation does not exist yet. That failure is intentional — it proves the tests are real."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Commit tests to git."})," Commit the test files before touching any implementation code. This creates an immutable, timestamped specification. The git history proves you defined the contract before the implementation, and it prevents scope creep during the Claude session."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Give Claude Code the tests and requirements."})," Open Claude Code and provide the test files alongside relevant context: your CLAUDE.md constraints, the data models involved, any external API contracts. Claude now has everything it needs to work autonomously."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Claude implements until all tests pass."})," Claude writes the implementation, runs the test suite, reads failures, adjusts the code, and repeats. This loop continues until every test passes. You do not need to be present during this phase — Claude is working against an objective target."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Human reviews implementation for correctness and security."})," When Claude reports all tests green, you review the implementation. You are not checking whether it works — the tests already verified that. You are checking whether the approach is sound, whether there are security concerns the tests did not capture, and whether the code is maintainable."]})]}),e.jsx("p",{children:`The critical insight is that tests transform a vague instruction ("build a user registration endpoint") into a precise, executable contract. Claude cannot argue with a failing test. It either passes or it does not. This eliminates the ambiguity that makes AI-generated code unreliable, and it means you can verify Claude's output without reading every line.`})]}),e.jsx(c,{title:"Test-First: FastAPI User Service",tabs:[{label:"python",language:"python",filename:"tests/test_user_service.py",code:`# tests/test_user_service.py - Written BEFORE implementation
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_create_user_returns_201():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/users", json={
            "email": "alice@example.com",
            "password": "SecureP@ss123",
            "name": "Alice"
        })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "alice@example.com"
    assert "password" not in data  # Never return passwords
    assert "id" in data

@pytest.mark.asyncio
async def test_create_user_rejects_weak_password():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/users", json={
            "email": "bob@example.com",
            "password": "weak",
            "name": "Bob"
        })
    assert response.status_code == 422
    assert "password" in response.json()["detail"][0]["loc"]

@pytest.mark.asyncio
async def test_create_user_duplicate_email_returns_409():
    async with AsyncClient(app=app, base_url="http://test") as client:
        payload = {"email": "charlie@example.com", "password": "SecureP@ss123", "name": "Charlie"}
        await client.post("/users", json=payload)
        response = await client.post("/users", json=payload)
    assert response.status_code == 409

@pytest.mark.asyncio
async def test_password_is_hashed_in_database(db_session):
    # Verify we're not storing plaintext passwords
    user = await db_session.get(User, 1)
    assert not user.password_hash.startswith("SecureP@ss123")
    assert user.password_hash.startswith("$2b$")  # bcrypt prefix`},{label:"prompt",language:"text",filename:"Claude Code prompt",code:`Implement the /users POST endpoint to make all tests in tests/test_user_service.py pass.

Requirements from CLAUDE.md:
- Passwords: bcrypt with cost factor >= 12
- Never return password fields in response
- Email uniqueness enforced at DB level
- Input validation via Pydantic

Run pytest after implementing. All 4 tests must pass before you stop.`}]}),e.jsxs("p",{children:["Notice what these tests specify without saying so explicitly. The 201/422/409 status codes define the entire HTTP contract. The ",e.jsx("code",{children:'assert "password" not in data'})," assertion encodes a security requirement. The bcrypt prefix check verifies a cryptographic implementation detail. You have written the security policy as code. Claude cannot comply with the security requirements without satisfying the tests, and it cannot fake compliance — the tests run against real behavior."]}),e.jsxs(r,{title:"Red-Green-Refactor with AI",children:[e.jsx("p",{children:"The classic Red-Green-Refactor cycle maps cleanly onto the human/AI collaboration model, with each phase assigned to whoever is best suited for it."}),e.jsxs("dl",{children:[e.jsx("dt",{children:e.jsx("strong",{children:"RED — Write failing tests (human writes these)"})}),e.jsx("dd",{children:"You write the tests. This is not a step you can or should delegate to Claude. Writing tests requires understanding the business requirements, the security constraints, the edge cases that matter for your domain. This is where your expertise is irreplaceable. The tests you write in this phase become the specification Claude will work against. Invest time here — a shallow test suite produces shallow implementations."}),e.jsx("dt",{children:e.jsx("strong",{children:"GREEN — Claude implements code to pass tests (AI does this)"})}),e.jsxs("dd",{children:["Claude takes the failing tests and implements code to make them pass. This is mechanical, iterative work — exactly what Claude is fast at. Claude runs"," ",e.jsx("code",{children:"pytest"}),", reads the failure output, adjusts the code, runs again. It continues until the suite is green. You do not supervise this loop. You gave Claude an objective success criterion; let it work."]}),e.jsx("dt",{children:e.jsx("strong",{children:"REFACTOR — Human reviews and Claude assists cleanup (collaborative)"})}),e.jsx("dd",{children:"Once tests are green, you review the implementation for code quality, security issues the tests did not cover, and architectural concerns. Claude assists by explaining its choices, suggesting cleanup, and implementing refactors you direct. This phase is a conversation — you bring judgment, Claude brings execution speed."})]}),e.jsx("p",{children:'The power of this division is that the phases are cleanly separated by verifiability. Red phase produces something verifiable. Green phase is verified by running tests. Refactor phase preserves test-verified behavior while improving structure. At no point does "it seems to work" substitute for a passing test suite.'})]}),e.jsx("h3",{children:"Property-Based Testing with AI"}),e.jsx("p",{children:"Example-based tests verify specific inputs. Property-based tests verify invariants across thousands of generated inputs. When you combine property-based testing with Claude Code, you can specify the mathematical properties a function must satisfy and let hypothesis find the edge cases that break your implementation."}),e.jsx("p",{children:'Ask Claude: "Using hypothesis, generate property-based tests for the Payment model that verify the invariant that amount is always positive and never exceeds the account balance." Claude will write the hypothesis strategies, run them, and if a counterexample is found, it will fix the implementation until the property holds universally.'}),e.jsx(t,{language:"python",filename:"test_payment_processor.py",children:`from hypothesis import given, strategies as st
import pytest

@given(
    amount=st.decimals(min_value=0.01, max_value=999999.99, places=2),
    currency=st.sampled_from(["USD", "EUR", "GBP"])
)
def test_payment_amount_always_rounds_to_cents(amount, currency):
    """Property: any valid payment amount should round correctly."""
    payment = Payment(amount=amount, currency=currency)
    assert len(str(payment.amount).split(".")[-1]) <= 2`}),e.jsx("p",{children:"This test will run hundreds of times with different decimal values. If any combination produces a Payment where the amount has more than two decimal places — a rounding bug that could cause accounting discrepancies — hypothesis finds it and reports the minimal failing example. Claude can then fix the rounding logic and re-run until the property holds for all inputs."}),e.jsx("h3",{children:"Contract Testing Between Microservices"}),e.jsx("p",{children:"In a microservices architecture, teams write code against each other's APIs. Contract tests let the consumer team define what they expect from a provider before the provider implements it. This is the AI-TDD model applied at the service boundary level: write the contract first, then let the provider team (or Claude) implement to satisfy it."}),e.jsx(t,{language:"python",filename:"test_consumer_contract.py",children:`# Consumer-driven contract test — written by the consumer team
# before the provider even implements the endpoint
from pact import Consumer, Provider

pact = Consumer("OrderService").has_pact_with(Provider("InventoryService"))

def test_get_product_availability():
    expected = {"product_id": "SKU-123", "available": True, "quantity": 50}
    (pact
        .given("product SKU-123 is in stock")
        .upon_receiving("a request for product availability")
        .with_request("GET", "/inventory/SKU-123")
        .will_respond_with(200, body=expected))

    with pact:
        result = inventory_client.get_availability("SKU-123")
        assert result["available"] is True`}),e.jsxs("p",{children:['When you give this contract test to Claude along with the instruction "implement the InventoryService ',e.jsx("code",{children:"/inventory/{product_id}"}),' endpoint to satisfy this Pact contract", Claude has a precise, machine-verifiable target. The Pact framework will run the contract against the real implementation. If it does not match, Claude gets a structured failure message and can adjust. The consumer team never needs to coordinate synchronously with the provider team — the contract does it.']}),e.jsxs(l,{children:["Never skip the test review step. Claude can write tests that pass vacuously — for example, ",e.jsx("code",{children:"assert True"}),', or a test that only exercises the happy path and ignores the behavior the test name claims to verify. Before committing any Claude-written tests to your repository, review each one for: Does it actually test the behavior described? Would it catch a real regression if someone removed the relevant code? If the answer to either question is no, the test is not a test — it is a false sense of security. This applies especially to tests Claude writes during the Green phase when you ask it to "add more test coverage."']}),e.jsx(i,{title:"Tests Are the Sacred Spec",children:`Commit your tests before asking Claude to implement. This creates an immutable specification anchored in git history. If during implementation Claude suggests changing a test to make it pass — for example, weakening an assertion or removing a case that "seems unnecessary" — reject it. You gave Claude the spec; the spec is sacred. Claude's job is to make the existing tests pass, not to redefine what passing means. The one exception: if a test is genuinely wrong (it encodes a requirement you misunderstood), you can change it — but do that consciously, with a separate commit and a clear comment explaining why the requirement changed. Never let Claude quietly weaken a test as a shortcut to green.`}),e.jsx(s,{type:"tip",children:"The best AI-TDD sessions start with boundary conditions first: empty input, maximum values, invalid types, concurrent writes, missing required fields. These edge cases constrain the implementation more tightly than happy-path tests and reveal assumptions Claude might otherwise make silently. A happy-path test for user creation tells Claude what to build. A test for duplicate email, a test for a 10,000-character name, and a test for a null password together tell Claude how to build it safely. Write the hard cases first, commit them, then let Claude implement."})]})}const k=Object.freeze(Object.defineProperty({__proto__:null,default:f},Symbol.toStringTag,{value:"Module"}));function b(){return e.jsxs("div",{children:[e.jsxs(n,{title:"SAST in the Agent Loop",children:[e.jsx("p",{children:"Most engineering teams run security scanners in CI — a pipeline that executes after code is pushed to a remote branch. For human-paced development, this is adequate: the feedback loop is measured in hours, which is fast enough for daily work. For AI-assisted development, where an agent can generate and commit dozens of files in minutes, CI-only scanning is not a safety net — it is a post-mortem."}),e.jsx("p",{children:"The solution is to integrate Static Application Security Testing (SAST) tools — Semgrep, Bandit, CodeQL, Snyk — directly into the Claude Code agent loop. Instead of running security scans after code is written and hoping engineers fix findings, Claude runs the scanner itself, reads the findings, and fixes issues before the engineer ever sees the code. Security shifts all the way left: into the generation step itself."}),e.jsx("p",{children:"When Claude writes code, it immediately runs the scanner, reads structured JSON output, fixes every critical and high finding, re-runs to confirm zero findings, and only then presents the code to the engineer. The engineer receives code that has already passed a security scan — not code that needs one."})]}),e.jsxs(r,{title:"Scan-Fix-Verify Loop",children:[e.jsx("p",{children:'The security loop runs inside every Claude Code generation session. It is not a separate step that happens afterward — it is part of what "writing code" means when Claude is doing it.'}),e.jsxs("ol",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Claude writes code."})," Claude generates the implementation based on requirements and CLAUDE.md constraints."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Claude runs Semgrep/Bandit."})," Immediately after writing files, Claude runs the configured scanners against the changed files. Output is captured as structured JSON — not displayed to the user, consumed by Claude itself."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Claude reads findings."})," Claude parses the JSON output, categorises findings by severity, and identifies which are auto-fixable versus which require human judgment."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Claude fixes each finding."})," For each critical and high finding, Claude reads the flagged file and line number, understands the root cause, and applies a fix that eliminates the vulnerability — not a suppression comment, not a threshold adjustment, an actual fix."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Claude re-runs the scanner to verify zero findings."})," After fixing, Claude runs the scanner again on the same files. If new findings appear or old ones remain, the fix-verify loop repeats. Claude does not stop until the scanner reports clean."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Only then does Claude present code to the engineer."})," The engineer receives code that has already cleared the security bar. Code review focuses on architecture and correctness, not on catching SQL injections."]})]})]}),e.jsx("h3",{children:"The /security-scan Custom Command"}),e.jsxs("p",{children:["The ",e.jsx("code",{children:"/security-scan"})," command is a Claude Code custom command defined in",e.jsx("code",{children:".claude/commands/security-scan.md"}),". It encodes the full scanning workflow as a reusable instruction set. Claude invokes it as a named command rather than reconstructing the scanning steps from memory each time."]}),e.jsx(t,{language:"yaml",filename:".claude/commands/security-scan.md",children:`# /security-scan

Run the following security scanners on changed files and fix all critical/high findings:

## Steps
1. Run Semgrep with org ruleset:
   \`semgrep --config=p/owasp-top-ten --config=.semgrep/custom-rules.yml --json src/\`

2. Run Bandit for Python:
   \`bandit -r src/ -f json -ll\`

3. Run Snyk for dependencies:
   \`snyk test --json\`

4. For each CRITICAL or HIGH finding:
   - Read the file and line number
   - Understand why it's a finding
   - Apply a fix that eliminates the root cause (not just suppresses)
   - Re-run the specific scanner to confirm fixed

5. For MEDIUM findings: report them with explanation, do not auto-fix

6. Produce a security scan report: findings found, findings fixed, findings remaining

## Rules
- Never suppress findings with nosec/noqa comments unless you explain why it's a false positive
- Never change logic to avoid the scan; fix the actual vulnerability
- If you can't fix a finding safely, escalate to the engineer`}),e.jsx(c,{title:"Security Scanner MCP Server",tabs:[{label:"python",language:"python",filename:"mcp_servers/security_scanner.py",code:`# mcp_servers/security_scanner.py
import subprocess
import json
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp import types

server = Server("security-scanner")

@server.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="run_semgrep",
            description="Run Semgrep SAST scan on a directory and return findings as JSON",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Directory or file to scan"},
                    "config": {"type": "string", "default": "p/owasp-top-ten", "description": "Semgrep ruleset"}
                },
                "required": ["path"]
            }
        ),
        types.Tool(
            name="run_bandit",
            description="Run Bandit Python security scanner",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Python file or directory to scan"},
                    "severity": {"type": "string", "enum": ["LOW", "MEDIUM", "HIGH"], "default": "MEDIUM"}
                },
                "required": ["path"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    if name == "run_semgrep":
        result = subprocess.run(
            ["semgrep", "--config", arguments.get("config", "p/owasp-top-ten"),
             "--json", arguments["path"]],
            capture_output=True, text=True, timeout=120
        )
        findings = json.loads(result.stdout) if result.stdout else {"results": []}
        critical = [f for f in findings.get("results", []) if f.get("extra", {}).get("severity") in ("ERROR", "WARNING")]
        return [types.TextContent(type="text", text=json.dumps({
            "total_findings": len(findings.get("results", [])),
            "critical_high": len(critical),
            "findings": critical[:20]  # Top 20 to stay within context
        }, indent=2))]

    elif name == "run_bandit":
        result = subprocess.run(
            ["bandit", "-r", arguments["path"], "-f", "json",
             f"-l{'l' if arguments.get('severity') == 'LOW' else ''}"],
            capture_output=True, text=True, timeout=60
        )
        return [types.TextContent(type="text", text=result.stdout or result.stderr)]

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())`}]}),e.jsxs("p",{children:["By exposing the scanners as MCP tools, Claude gains structured access to security findings without needing to parse shell output from scratch each time. The",e.jsx("code",{children:"run_semgrep"})," tool returns only the top 20 critical/high findings to stay within context window limits — enough for a fix loop, without flooding the conversation. Claude can call these tools in sequence, fix findings between calls, and call again to confirm resolution."]}),e.jsx("h3",{children:"Custom Semgrep Rules for Organization-Specific Patterns"}),e.jsx("p",{children:"Generic rulesets (p/owasp-top-ten, p/python) catch well-known vulnerability classes. The highest-leverage security investment for a mature team is writing custom rules for patterns specific to their codebase: internal SDK misuse, proprietary data handling requirements, compliance rules unique to the industry. Each custom rule encodes a lesson learned from a code review and permanently prevents the same mistake in all future AI-generated code."}),e.jsx(t,{language:"yaml",filename:".semgrep/custom-rules.yml",children:`rules:
  - id: no-raw-sql-fstrings
    pattern: |
      db.execute(f"...")
    message: "SQL injection risk: never use f-strings in SQL. Use parameterized queries."
    severity: ERROR
    languages: [python]

  - id: no-pii-in-logs
    patterns:
      - pattern: logging.$FUNC(..., user.email, ...)
      - pattern: logger.$FUNC(..., request.json(), ...)
    message: "Potential PII in logs. Use mask_sensitive() before logging user data."
    severity: WARNING
    languages: [python]

  - id: jwt-not-in-localstorage
    pattern: localStorage.setItem("token", ...)
    message: "JWT in localStorage is vulnerable to XSS. Use httpOnly cookies."
    severity: ERROR
    languages: [javascript, typescript]

  - id: no-md5-for-passwords
    pattern: hashlib.md5(...)
    message: "MD5 is cryptographically broken. Use bcrypt or argon2 for passwords."
    severity: ERROR
    languages: [python]`}),e.jsx("p",{children:'Notice that each rule encodes not just what is forbidden but why. The message field is what Claude reads when the scanner fires. A message that says "SQL injection risk: never use f-strings in SQL. Use parameterized queries." gives Claude enough context to apply the correct fix without additional prompting. Write messages for Claude to act on, not just for humans to read.'}),e.jsxs(o,{severity:"critical",children:["The ",e.jsx("code",{children:"nosec"})," comment is a security debt marker, not a fix. Every"," ",e.jsx("code",{children:"# nosec"})," in your codebase is a finding that was suppressed instead of fixed. When Claude encounters a finding it cannot fix cleanly, the correct behavior is to escalate to the engineer — not to add a suppression comment and move on. Require PR comments explaining every nosec, tied to a specific rule ID and a justification. Audit them in quarterly security reviews. A codebase where nosec comments accumulate unchecked is one where the security scanning is producing theater rather than protection."]}),e.jsx("h3",{children:"Integrating SAST into CI as a Gate"}),e.jsx("p",{children:"The in-loop scanning catches issues before commit. The CI gate is a second, independent verification: even if the pre-commit scanning is bypassed or misconfigured, the CI pipeline catches it before the code reaches main. Both layers are required. The in-loop scan catches issues fast and cheaply. The CI gate is the enforcement mechanism that cannot be bypassed."}),e.jsx(t,{language:"yaml",filename:".github/workflows/security.yml",children:`name: Security Scan
on: [pull_request]

jobs:
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Semgrep
        uses: semgrep/semgrep-action@v1
        with:
          config: >-
            p/owasp-top-ten
            p/python
            .semgrep/custom-rules.yml
          auditOn: push
          generateSarif: "1"
      - name: Run Bandit
        run: |
          pip install bandit
          bandit -r src/ -ll --exit-zero -f json -o bandit-report.json
          python scripts/check_bandit_results.py bandit-report.json
      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: semgrep.sarif`}),e.jsx("p",{children:"The SARIF upload integrates findings directly into the GitHub PR interface: each finding appears as an inline annotation on the diff, at the exact line where the issue was detected. Reviewers see security issues in context without switching to a separate dashboard. When Claude's in-loop scanning is working correctly, this CI step should produce zero findings — it is verifying that the in-loop scan did its job."}),e.jsx(i,{title:"Make SAST a Required Check, Not an Advisory One",children:"Run SAST on every PR, not just on main. The cost of fixing a SQL injection after merge is 10x the cost of fixing it before. Make the SAST CI job a required status check — not optional, not advisory. If it is advisory, it will be ignored. Engineers under deadline pressure will merge with failing advisory checks and tell themselves they will fix it later. Later never comes. Required checks cannot be ignored; they must be addressed or explicitly overridden with documented justification. The friction is intentional: security findings should require effort to bypass."}),e.jsxs(s,{type:"tip",children:["Start with ",e.jsx("code",{children:"p/owasp-top-ten"})," as your Semgrep baseline. Add custom rules one at a time as you discover organization-specific patterns — when a code review catches something the baseline missed, that becomes a rule. A focused ruleset with zero false positives is worth more than a comprehensive ruleset that engineers learn to ignore. Every false positive erodes trust in the scanner and trains Claude to suppress findings rather than fix them. Precision matters more than recall when the scanner is running in an automated loop."]})]})}const T=Object.freeze(Object.defineProperty({__proto__:null,default:b},Symbol.toStringTag,{value:"Module"}));export{A as a,S as b,k as c,T as d,C as s};
