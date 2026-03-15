import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'

const fastapiClaudeMd = `# CLAUDE.md — Python FastAPI Service

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
`;

const reactClaudeMd = `# CLAUDE.md — TypeScript React Frontend

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
`;

const k8sClaudeMd = `# CLAUDE.md — Kubernetes / Helm Infrastructure as Code

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
`;

export default function ClaudemdEnterprisePatterns() {
  return (
    <div className="lesson-content">
      <h2>Enterprise CLAUDE.md Patterns</h2>

      <p>
        A CLAUDE.md file is the primary mechanism for encoding your organisation's engineering
        standards directly into Claude Code's working context. When Claude reads your CLAUDE.md at
        session start, every subsequent code generation, edit, and suggestion operates within those
        constraints — without you having to repeat them in every prompt. For enterprise teams, this
        is not a convenience feature; it is the difference between an AI assistant that reinforces
        your compliance posture and one that silently works against it.
      </p>

      <p>
        The templates below are drawn from three common enterprise contexts: a Python backend with
        SOC 2 requirements, a TypeScript frontend with GDPR obligations, and a Kubernetes
        infrastructure codebase with CIS security benchmarks. Each template is designed to be
        dropped into the root of its repository and extended with project-specific details.
      </p>

      <ConceptBlock term="CLAUDE.md as a Persistent Instruction Layer">
        <p>
          CLAUDE.md is a Markdown file that Claude Code reads at the start of every session in a
          given directory. It functions as a standing system prompt that persists across all
          interactions in that workspace. Unlike a prompt you type, it cannot be forgotten mid-task,
          and it applies consistently to every developer on the team who uses Claude Code in that
          repository. The file can include technology constraints, forbidden patterns, security
          rules, compliance requirements, and coding conventions — effectively encoding your
          engineering standards as machine-readable policy.
        </p>
      </ConceptBlock>

      <h2>Template 1: Python FastAPI Service with SOC 2 Compliance</h2>

      <p>
        FastAPI services that handle user data in regulated environments face a specific set of
        risks: SQL injection through dynamic query construction, credential exposure through logging,
        and audit gaps that fail compliance reviews. This template addresses each directly by naming
        the forbidden pattern alongside the requirement, so Claude understands not just what to do
        but why a deviation would be harmful.
      </p>

      <CodeBlock language="text" filename="CLAUDE.md">
        {fastapiClaudeMd}
      </CodeBlock>

      <NoteBlock type="note" title="Why SQLAlchemy-Only Matters">
        <p>
          The prohibition on raw SQL is not stylistic preference — it is a security control. Raw
          SQL with f-strings or concatenation is the leading cause of SQL injection
          vulnerabilities, which remain in the OWASP Top 10. SQLAlchemy's parameterised queries
          make injection structurally impossible: user-supplied values are never interpreted as SQL
          syntax. When this rule is in CLAUDE.md, Claude will not generate raw SQL even when it
          would be marginally shorter or more convenient.
        </p>
      </NoteBlock>

      <BestPracticeBlock title="SOC 2 Audit Logging: Log the Fact, Not the Value">
        <p>
          SOC 2 Type II requires evidence that all privileged and state-changing operations are
          logged. The critical nuance is that audit logs must capture <em>what changed</em> (action,
          actor, resource) without capturing <em>what the new value is</em> — because the audit log
          itself could expose PII. The CLAUDE.md template above encodes this distinction explicitly:
          log the action type and resource IDs, never the field values. This pattern satisfies audit
          requirements while passing PII-in-logs scanners.
        </p>
      </BestPracticeBlock>

      <h2>Template 2: TypeScript React Frontend with GDPR</h2>

      <p>
        Frontend codebases face a different compliance surface than backends. The browser is a
        hostile environment where user data can leak through localStorage persistence, third-party
        scripts, and improperly scoped cookies. GDPR's consent requirements are particularly
        tricky for AI assistants to respect by default — without explicit instruction, an AI will
        often generate analytics initialisation code that fires unconditionally on page load.
      </p>

      <CodeBlock language="text" filename="CLAUDE.md">
        {reactClaudeMd}
      </CodeBlock>

      <NoteBlock type="note" title="Why localStorage PII Is a GDPR Risk">
        <p>
          localStorage persists data across browser sessions and is readable by any JavaScript
          running on the same origin — including injected third-party scripts. Storing PII there
          means it may persist after a user requests deletion, be exposed through XSS attacks, and
          lack the consent lifecycle controls that GDPR Article 7 requires. The CLAUDE.md
          constraint to use httpOnly cookies (set server-side) for session tokens removes this
          entire class of risk from AI-generated code.
        </p>
      </NoteBlock>

      <BestPracticeBlock title="Accessibility as a CLAUDE.md Constraint">
        <p>
          WCAG 2.1 AA compliance is increasingly a legal requirement in enterprise contexts (EU Web
          Accessibility Directive, US Section 508, UK Public Sector Bodies Accessibility
          Regulations). Encoding it in CLAUDE.md means that Claude generates accessible markup by
          default: semantic HTML, explicit alt text, focus management on modals, and keyboard
          operability for interactive elements. The cost of retrofitting inaccessible code is
          substantially higher than generating accessible code in the first place.
        </p>
      </BestPracticeBlock>

      <h2>Template 3: Kubernetes / Helm IaC with Security Hardening</h2>

      <p>
        Infrastructure as Code is particularly high-stakes for AI-assisted generation because a
        single misconfigured security context, a hardcoded credential, or a missing network policy
        can expose an entire cluster. This template is structured around the CIS Kubernetes
        Benchmark controls most commonly violated by generated code, and it includes the
        exact YAML syntax Claude should use rather than abstract descriptions.
      </p>

      <CodeBlock language="text" filename="CLAUDE.md">
        {k8sClaudeMd}
      </CodeBlock>

      <SecurityCallout
        title="Hardcoded Credentials in IaC Are a Critical Risk"
        severity="critical"
      >
        <p>
          Infrastructure configuration files committed to git with embedded secrets are one of the
          most frequent causes of cloud breaches. Unlike application code where secrets might be
          isolated to a single service, IaC credentials often carry administrative-level permissions
          across entire environments. The CLAUDE.md template above prohibits this pattern entirely
          and requires Vault-based secret injection. This constraint must be enforced at the
          CLAUDE.md level because it is easy for an AI to generate a convenient working example
          with a hardcoded value when not explicitly told otherwise.
        </p>
      </SecurityCallout>

      <BestPracticeBlock title="Non-Root Containers and ReadOnly Filesystems">
        <p>
          Running containers as root is the default in many base images, but it means that a
          container escape vulnerability grants attackers root access on the host node.
          The securityContext block in the template (runAsNonRoot, runAsUser, readOnlyRootFilesystem)
          is the Kubernetes-native way to enforce least privilege at the container level. Including
          the exact YAML in CLAUDE.md means Claude will emit this block on every Deployment it
          generates, even in quick examples, because the template normalises it as boilerplate
          rather than an optional hardening step.
        </p>
      </BestPracticeBlock>

      <h2>Structuring CLAUDE.md for Enterprise Teams</h2>

      <p>
        Real enterprise repositories benefit from a layered approach to CLAUDE.md files. A
        global file in the user's home directory sets organisation-wide defaults, while each
        repository's CLAUDE.md adds project-specific rules. Subdirectory CLAUDE.md files can
        further scope rules to specific service boundaries within a monorepo.
      </p>

      <PatternBlock
        name="Layered CLAUDE.md Strategy"
        category="Configuration"
        whenToUse="Any team with more than one repository, or any monorepo with distinct service boundaries. The global layer prevents repetition of organisation standards; the repository layer adds project context; the subdirectory layer handles domain-specific constraints."
      >
        <p>
          Organise CLAUDE.md files in three layers, each extending the one above:
        </p>
        <p>
          <strong>Layer 1 — Global (~/.claude/CLAUDE.md):</strong> Organisation-wide rules that
          apply everywhere: preferred languages, company-wide security baselines, internal tool
          access patterns, escalation contacts for security findings.
        </p>
        <p>
          <strong>Layer 2 — Repository (./CLAUDE.md):</strong> Project-specific stack, compliance
          requirements, architecture decisions, forbidden patterns specific to this codebase, and
          how to run tests and linting.
        </p>
        <p>
          <strong>Layer 3 — Subdirectory (./src/billing/CLAUDE.md):</strong> Domain-specific
          constraints for high-sensitivity areas — for example, billing code that must follow
          PCI-DSS patterns, or authentication code that has additional review requirements.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Forbidden Patterns Are More Effective Than Positive Instructions">
        <p>
          When writing CLAUDE.md, resist the urge to describe only what you want. Explicitly
          naming forbidden patterns is more effective for two reasons. First, LLMs have strong
          priors toward common patterns from their training data — raw SQL, console.log, and
          hardcoded values are all common in training corpora. Positive instructions alone may not
          override these priors. Second, forbidden patterns create unambiguous failure conditions:
          Claude can recognise that a string matches a forbidden pattern even if it would not have
          thought to apply the positive rule to that specific case.
        </p>
        <p>
          For each forbidden pattern, include the reason. "No raw SQL — SQL injection risk that
          fails SOC 2 pen tests" is more effective than "No raw SQL" because it gives Claude the
          context to generalise the rule to similar-but-not-identical cases.
        </p>
      </BestPracticeBlock>
    </div>
  )
}
