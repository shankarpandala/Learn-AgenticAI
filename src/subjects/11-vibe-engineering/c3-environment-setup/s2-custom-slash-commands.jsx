import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'

export default function CustomSlashCommands() {
  return (
    <article className="prose-content">
      <h1>Custom Slash Commands</h1>

      <p>
        Slash commands in Claude Code are reusable prompt templates stored as Markdown files in your
        repository. They turn complex, multi-step workflows into single commands that any engineer on
        the team can invoke consistently. Instead of every engineer remembering the right prompt for
        "implement a new API endpoint," the team maintains one authoritative command that encodes
        the correct approach.
      </p>

      <p>
        Custom slash commands are the mechanism by which Vibe Engineering practices spread across a
        team without requiring everyone to individually learn the right prompting patterns. They are
        version-controlled, peer-reviewable, and continuously improvable — exactly like any other
        piece of engineering infrastructure.
      </p>

      <ConceptBlock title="Slash Commands as Team Infrastructure">
        A well-maintained library of slash commands is to prompt engineering what a shared component
        library is to UI development. Instead of every engineer reinventing the same patterns, the
        team's best practices are encoded once, reviewed by seniors, and made available to everyone.
        New engineers immediately have access to production-grade prompting patterns without needing
        to develop them from scratch. Senior engineers improve commands over time as they learn what
        works.
      </ConceptBlock>

      <h2>Slash Command File Structure</h2>

      <p>
        Slash commands live in the <code>.claude/commands/</code> directory at the root of your
        repository. Each command is a <code>.md</code> file. The file name becomes the command name:
        <code>implement-endpoint.md</code> is invoked as <code>/implement-endpoint</code>.
      </p>

      <CodeBlock language="bash" filename="Repository Structure">
{`.claude/
  commands/
    implement-endpoint.md    # /implement-endpoint
    review-security.md       # /review-security
    add-tests.md             # /add-tests
    update-adr.md            # /update-adr
    fix-vulnerability.md     # /fix-vulnerability
    generate-migration.md    # /generate-migration
    pr-description.md        # /pr-description
CLAUDE.md                    # Global constraints (read before all commands)`}
      </CodeBlock>

      <h2>Core Command Examples</h2>

      <h3>/implement-endpoint</h3>

      <CodeBlock language="markdown" filename=".claude/commands/implement-endpoint.md">
{`# Implement API Endpoint

Implement a new API endpoint following our standard patterns.

## Before starting
1. Read CLAUDE.md for security and architectural constraints
2. Read docs/adrs/ for relevant architectural decisions
3. Confirm the endpoint is defined in the OpenAPI spec at openapi/

## What to implement
$ARGUMENTS

## Required steps (in order)
1. Write failing tests in tests/api/ that specify:
   - Happy path (expected 2xx response with correct body)
   - Authentication required (401 if no token)
   - Authorization check (403 if insufficient role)
   - Input validation (422 for each invalid field)
   - Not found case (404)

2. Commit the tests: git add tests/ && git commit -m "test: add tests for [endpoint]"

3. Implement the endpoint handler, service layer, and repository following the
   patterns in src/api/products/ (use as reference)

4. Run the full check sequence:
   
   pytest tests/ -v
   tsc --noEmit
   ruff check src/
   bandit -r src/ -ll
   

5. Report: tests passing, type check clean, linter clean, SAST clean

## Do NOT
- Skip the test commit step
- Use raw SQL (use SQLAlchemy ORM)
- Return password or secret fields in responses
- Catch exceptions silently — log them with the logger in src/lib/logger.py`}
      </CodeBlock>

      <h3>/review-security</h3>

      <CodeBlock language="markdown" filename=".claude/commands/review-security.md">
{`# Security Review

Perform a thorough security review of the specified code.

## Target
$ARGUMENTS

## Review checklist

### Authentication & Authorization
- [ ] All endpoints require authentication (unless explicitly public)
- [ ] Authorization checked at service layer, not just route layer
- [ ] JWT validation uses the library in src/auth/ — no manual JWT parsing

### Input Validation
- [ ] All inputs validated with Pydantic/Zod before processing
- [ ] No any type used to bypass validation
- [ ] File upload endpoints validate MIME type and size

### Data Handling
- [ ] No PII in logs (email, phone, name, address, IP)
- [ ] No credentials or secrets in code (use env vars)
- [ ] Sensitive fields excluded from API responses

### SQL & Injection
- [ ] All queries use ORM or parameterized queries — no string concatenation
- [ ] No eval(), exec(), or shell injection vectors

### Cryptography
- [ ] Passwords hashed with bcrypt (cost >= 12), never MD5/SHA1/SHA256 raw
- [ ] JWTs stored in httpOnly cookies — never localStorage

## Output format
For each finding: SEVERITY (CRITICAL/HIGH/MEDIUM/LOW), file and line number,
description of the vulnerability, and a specific fix recommendation.`}
      </CodeBlock>

      <h3>/add-tests</h3>

      <CodeBlock language="markdown" filename=".claude/commands/add-tests.md">
{`# Add Tests

Generate comprehensive tests for the specified code.

## Target
$ARGUMENTS

## Test requirements

### Unit tests
- Happy path for each public function/method
- Each error path (what does it return/throw when input is invalid?)
- Boundary conditions (empty array, max value, null, undefined)
- Side effects (what external calls does it make? verify with mocks)

### Integration tests (if the target is an API endpoint or service)
- Verify the complete request/response cycle with a real test database
- Verify database state after mutations
- Verify that external service calls are made with correct arguments

### Security tests (if the target handles auth, payments, or user data)
- Unauthenticated access returns 401
- Unauthorized access returns 403 (not 404 — do not leak resource existence)
- SQL injection attempt returns 422, does not execute
- XSS payload in text field is stored safely (not executed)

## Test style
- Follow existing tests in the tests/ directory for style and conventions
- Use descriptive test names: test_[what]_[when]_[expected]
- Group related tests in a class/describe block
- Do NOT write tests that mock the code under test (that proves nothing)

After writing tests, run them: pytest [test_file] -v
Report: number of tests added, all passing.`}
      </CodeBlock>

      <h3>/generate-migration</h3>

      <CodeBlock language="markdown" filename=".claude/commands/generate-migration.md">
{`# Generate Database Migration

Generate a safe database migration for the requested schema change.

## Change requested
$ARGUMENTS

## Requirements

### Safety first
- All migrations must be reversible (include downgrade function)
- Migrations that remove columns: add a two-phase migration plan
  (Phase 1: deprecate/stop writing, Phase 2: remove)
- Large table migrations: generate with CONCURRENTLY where supported
- Index creation: use CREATE INDEX CONCURRENTLY — never block the table

### File to create
- Location: alembic/versions/
- Filename: {TIMESTAMP}_{slug_description}.py
- Include in the docstring: what the migration does and why

### Check before finalising
- Run: alembic check (verify no pending model/migration drift)
- Verify the upgrade() and downgrade() functions are both complete
- For column additions with NOT NULL: provide a default value or split into phases

### Output
1. The migration file
2. A plain-English description of what the migration does
3. The commands to apply it: alembic upgrade head`}
      </CodeBlock>

      <h2>Using $ARGUMENTS in Commands</h2>

      <p>
        The <code>$ARGUMENTS</code> placeholder is replaced with whatever text follows the command
        when invoked. This makes commands flexible without sacrificing the structured workflow they encode.
      </p>

      <CodeBlock language="text" filename="Usage Examples">
{`# Invoke with arguments
/implement-endpoint POST /v1/orders — create a new order, validate the cart, charge payment

/review-security src/auth/jwt.service.ts src/auth/session.service.ts

/add-tests src/billing/invoice.service.ts — focus on edge cases for tax calculation

/generate-migration add user_preferences JSONB column to users table, not null with default '{}'`}
      </CodeBlock>

      <h2>Building a Command Library</h2>

      <p>
        Start with the five or six workflows your team performs most frequently. A good starting set
        for most teams: implement-endpoint, add-tests, review-security, pr-description,
        generate-migration, and fix-vulnerability. Add commands as you notice engineers asking Claude
        the same multi-step questions repeatedly — that repetition is a signal that the workflow
        should be encoded as a command.
      </p>

      <PatternBlock title="Command Lifecycle">
        Treat slash commands like any other piece of code: propose via PR, review by senior engineers,
        merge when approved, improve iteratively based on use. A new command should be used for 2-3
        real tasks before being merged — dogfooding reveals gaps that are not obvious when writing
        the command in the abstract. Commands that are never used should be removed — stale commands
        mislead new engineers about what workflows are standard.
      </PatternBlock>

      <BestPracticeBlock title="Commands Should Encode Quality Gates">
        Every command that produces code should include explicit quality gates in its final step.
        "Run pytest and report results" — not "implement the code." This ensures Claude never silently
        produces code that fails its own tests. The quality gate is part of the command, not an
        optional step the user might forget to run.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Personal vs Shared Commands">
        Commands in <code>.claude/commands/</code> are shared with the whole team via version control.
        Personal commands (individual preferences, experimental workflows) can go in
        <code>~/.claude/commands/</code> on your local machine and won't affect teammates. Use the
        team directory for anything that encodes a shared standard; use the personal directory for
        individual experimentation before proposing it as a team command.
      </NoteBlock>
    </article>
  )
}
