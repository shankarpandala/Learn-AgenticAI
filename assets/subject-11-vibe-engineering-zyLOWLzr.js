import{j as e}from"./vendor-Cs56uELc.js";import{C as s,a as i,W as r,b as l,P as o,B as a,N as n,S as t}from"./content-components-CDXEIxVK.js";function h(){return e.jsxs("div",{className:"section-content",children:[e.jsx("h1",{children:"Vibe Engineering vs. Vibe Coding"}),e.jsxs("p",{children:["In early 2025, Andrej Karpathy coined the term ",e.jsx("strong",{children:'"vibe coding"'})," to describe a new way people were interacting with AI coding assistants: you describe what you want, the AI writes the code, you glance at it, it looks plausible, you hit accept, and you move on. You're not really reading it. You're not really understanding it. You're just... vibing. The code works, or it seems to, and that's enough."]}),e.jsx("p",{children:"For personal projects, weekend hacks, and throwaway prototypes, vibe coding is genuinely liberating. You can build things you never could have built before. You can explore ideas at the speed of thought. The joy is real and the productivity gains are real."}),e.jsx("p",{children:"Then organizations started doing it with production systems. And that's where it goes wrong."}),e.jsx("p",{children:"Vibe coding in a professional context means shipping code you don't understand, authored by a model that hallucinates, into systems that handle real users, real money, and real data. It means vulnerabilities you didn't know you introduced, architectural decisions you didn't consciously make, and technical debt that accumulates at AI speed. When something breaks — and it will break — nobody can explain why, because nobody actually read the code that was written."}),e.jsxs("p",{children:[e.jsx("strong",{children:"Vibe Engineering"})," is the answer to this problem. It's not about removing AI from the development process. It's about bringing discipline to how AI is used — the same discipline that separates a production-grade codebase from a prototype, the same discipline that enables teams of 100+ engineers to ship safely at scale."]}),e.jsx("h2",{children:"Side-by-Side: Vibe Coding vs. Vibe Engineering"}),e.jsx("div",{className:"table-wrapper",style:{overflowX:"auto",marginBottom:"2rem"},children:e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:"0.95rem"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{backgroundColor:"var(--color-surface-raised, #1e1e2e)"},children:[e.jsx("th",{style:{padding:"0.75rem 1rem",textAlign:"left",borderBottom:"2px solid var(--color-border, #333)",width:"20%"},children:"Dimension"}),e.jsx("th",{style:{padding:"0.75rem 1rem",textAlign:"left",borderBottom:"2px solid var(--color-border, #333)",width:"40%",color:"var(--color-warning, #f59e0b)"},children:"Vibe Coding"}),e.jsx("th",{style:{padding:"0.75rem 1rem",textAlign:"left",borderBottom:"2px solid var(--color-border, #333)",width:"40%",color:"var(--color-success, #10b981)"},children:"Vibe Engineering"})]})}),e.jsx("tbody",{children:[{dimension:"Standards Adherence",vibe:"Ignores them — AI has no knowledge of your org's standards",engineering:"Enforces via CLAUDE.md — standards are embedded before the first prompt"},{dimension:"Security",vibe:"Ships vulnerabilities the engineer never saw because they never read the code",engineering:"SAST / security gates run in the loop; Claude remediates findings before PR"},{dimension:"Code Review",vibe:'Accept AI output directly — "it compiled, looks fine"',engineering:"AI reviews first (automated checks), human reviews second (every diff)"},{dimension:"Accountability",vibe:'"Who wrote this bug?" — diffuse, deniable, unresolvable',engineering:"The engineer who approved the PR owns it, unconditionally"},{dimension:"Testing",vibe:"Hope it works — maybe manual smoke test",engineering:"Tests written first (AI-TDD); implementation must pass before acceptance"},{dimension:"Documentation",vibe:"Never — there's no time, the AI writes fast",engineering:"Generated and kept fresh automatically as part of the session workflow"},{dimension:"Compliance",vibe:`Never considered — compliance is "the security team's problem"`,engineering:"Embedded in CLAUDE.md as hard constraints (SOC 2, PCI-DSS, GDPR, etc.)"},{dimension:"Scale",vibe:"Solo projects, throwaway prototypes, or codebases nobody has to maintain",engineering:"Enterprise teams of 100+ engineers shipping to production daily"}].map((c,d)=>e.jsxs("tr",{style:{backgroundColor:d%2===0?"transparent":"var(--color-surface-subtle, #161622)"},children:[e.jsx("td",{style:{padding:"0.75rem 1rem",fontWeight:"600",borderBottom:"1px solid var(--color-border-subtle, #2a2a3a)",verticalAlign:"top"},children:c.dimension}),e.jsx("td",{style:{padding:"0.75rem 1rem",borderBottom:"1px solid var(--color-border-subtle, #2a2a3a)",verticalAlign:"top",color:"var(--color-text-muted, #aaa)"},children:c.vibe}),e.jsx("td",{style:{padding:"0.75rem 1rem",borderBottom:"1px solid var(--color-border-subtle, #2a2a3a)",verticalAlign:"top"},children:c.engineering})]},c.dimension))})]})}),e.jsxs(s,{title:"Vibe Engineering",children:["Vibe Engineering is the disciplined methodology of using AI coding assistants (Claude Code, Cursor, Copilot, and their successors) as ",e.jsx("strong",{children:"accelerators"})," while the engineer retains architectural authority, sets organizational constraints, validates all AI output, and holds accountability for the production system.",e.jsx("br",{}),e.jsx("br",{}),'The word "vibe" is intentional: flow state, developer momentum, and intuition remain valuable. The word "engineering" is equally intentional: discipline, rigor, accountability, and reproducibility are non-negotiable. Vibe Engineering is what happens when you refuse to choose between the two.']}),e.jsx("h2",{children:"The Engineer's Role Shift"}),e.jsx("p",{children:`The most important cognitive shift in Vibe Engineering is understanding what your job actually is when an AI is writing most of the code. Many engineers initially feel deskilled — "I'm just reviewing AI output now" — but this fundamentally misreads what's happening. The role has changed, but it hasn't diminished. In many ways it has expanded.`}),e.jsxs("p",{children:[e.jsx("strong",{children:"Before AI assistance:"})," The engineer was primarily an ",e.jsx("em",{children:"implementer"}),". The job was to translate requirements into working code, line by line. The bottleneck was typing speed and the ability to hold the entire solution in working memory simultaneously."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"With AI assistance:"})," The engineer is primarily a ",e.jsx("em",{children:"governor"}),". The job is to specify what to build with enough precision that AI can implement it correctly, to establish what rules apply to the implementation, to validate that the output meets those rules, and to make the architectural decisions that no AI can make for you — because architectural decisions require understanding the organization's constraints, history, team capability, and strategic direction."]}),e.jsx("p",{children:"The specific shifts are:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"From"})," writing every line of code ",e.jsx("strong",{children:"→ To"})," specifying what to build with precision (requirements, acceptance criteria, test cases)"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"From"})," knowing the implementation details ",e.jsx("strong",{children:"→ To"})," knowing why each architectural decision was made and being able to defend it"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"From"})," debugging your own mistakes ",e.jsx("strong",{children:"→ To"})," validating AI output against known constraints and catching its characteristic failure modes"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"From"})," writing documentation after the fact ",e.jsx("strong",{children:"→ To"})," writing constraints before the fact (CLAUDE.md) that shape what gets generated"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"From"})," personal accountability for code you wrote ",e.jsx("strong",{children:"→ To"})," institutional accountability for code you approved"]})]}),e.jsx("p",{children:`That last point is the one that matters most for enterprise adoption, and the one that vibe coders most consistently evade. When you accept a diff — when you click "Accept" or merge the PR — you are making a professional declaration that this code is correct, secure, and meets your organization's standards. It doesn't matter that Claude wrote it. You reviewed it. You own it.`}),e.jsx("blockquote",{style:{borderLeft:"4px solid var(--color-accent, #6366f1)",paddingLeft:"1rem",marginLeft:"0",fontStyle:"italic",color:"var(--color-text-muted, #aaa)"},children:'"I am responsible for everything Claude writes in my session. Claude is a tool I wield, not a co-author I share blame with."'}),e.jsx("h2",{children:"What Goes Wrong: The Vibe Coding Failure Mode"}),e.jsx("p",{children:"Here's what a toxic vibe coding interaction looks like in practice. Read it carefully, because if you've been using AI coding assistants without a CLAUDE.md, you may have shipped exactly this:"}),e.jsx(i,{language:"markdown",filename:"vibe-coding-example.md",children:`# Vibe Coding: User Auth (What NOT to Do)

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
`}),e.jsx("p",{children:'None of these vulnerabilities are exotic. Every one of them is in OWASP Top 10. Claude generated them not because it was malicious, but because the prompt contained zero constraints. "Build me a user auth system" is a specification that could be satisfied by an infinite variety of implementations, including deeply insecure ones. Claude picked one. You shipped it.'}),e.jsx("p",{children:"Now look at the same task done with Vibe Engineering discipline:"}),e.jsx(i,{language:"markdown",filename:"vibe-engineering-example.md",children:`# Vibe Engineering: User Auth (The Right Way)

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
`}),e.jsx("p",{children:"The difference is not that one uses AI and one doesn't. Both use AI. The difference is that the second approach treats the engineer's job as governing the AI's output, not hoping the AI happened to make the right choices."}),e.jsxs(r,{title:"The Confidence Trap",children:[`AI models generate text with uniform fluency regardless of whether the underlying content is correct. A correct implementation and a subtly broken one are written in the same confident tone, with the same clean formatting, and the same authoritative comments. There is no signal in the prose that tells you "this part is hallucinated" or "I'm not sure about this security pattern."`,e.jsx("br",{}),e.jsx("br",{}),"This is categorically different from human code review, where a junior engineer's uncertainty is often visible in their code, their comments, or their PR description. AI does not express uncertainty at the code level. It expresses it only when you ask it to, and only sometimes.",e.jsx("br",{}),e.jsx("br",{}),"The engineer must never mistake confidence for correctness. The mechanism for not making that mistake is: tests, SAST, linting, and your own careful reading of every diff."]}),e.jsxs(l,{severity:"critical",title:'The "Accept All" Button Is a Security Incident Waiting to Happen',children:['Every major AI coding assistant has some version of an "Accept All" button — a way to accept every suggested change at once without reviewing individual diffs. In personal projects, this is a convenience feature. In production codebases, it is a security control bypass.',e.jsx("br",{}),e.jsx("br",{}),"Accepting AI-generated code without review is not a development velocity optimization. It is a transfer of authorship without transfer of understanding. You are putting your name on code you cannot explain, cannot defend, and may not be able to fix when it breaks.",e.jsx("br",{}),e.jsx("br",{}),"Organizational policy for Vibe Engineering: ",e.jsx("strong",{children:"every line of AI-generated code must be reviewed by the engineer who approves the PR"}),'. "The AI generated it" is not a defense when the security audit asks why you shipped MD5 password hashing. "I reviewed it and approved it" is. The second answer is only possible if you actually reviewed it.']}),e.jsxs(o,{title:"The Governor Pattern",children:["The engineer's role in Vibe Engineering is that of a governor — someone who sets the rules of the system, validates that those rules are being followed, and is accountable for the system's behavior. The five responsibilities of the governor are:",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"1. Set Constraints (CLAUDE.md)"}),e.jsx("br",{}),"Before any coding begins, the governor defines what is and isn't acceptable. Security rules, architectural patterns, forbidden libraries, compliance requirements. These are not suggestions to the AI — they are constraints that must be satisfied before any output is accepted.",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"2. Specify Requirements (Clear and Testable)"}),e.jsx("br",{}),'The governor writes requirements that are specific enough to be verified. Not "build auth" but "implement login with these security properties, expressed as passing tests." Vague requirements produce vague implementations that may or may not be correct.',e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"3. Review Output (Every Diff)"}),e.jsx("br",{}),"The governor reads every change before accepting it. Not skimming — reading. Line by line for security-critical paths, at a higher level for boilerplate. The goal is to be able to explain, in a code review, why every line is there and why it is correct.",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"4. Run Validation Gates (Tests, SAST, Linting)"}),e.jsx("br",{}),"The governor runs the automated checks that catch what human eyes miss. Tests verify behavior. SAST catches security anti-patterns. Linting enforces style. These are not optional — they are the governor's instruments for detecting when the AI deviated from constraints.",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"5. Own the Result (Accountability)"}),e.jsx("br",{}),"The governor signs their name to the output. This is what makes all of the above non-negotiable: you cannot hold accountability for code you didn't review, can't explain code you didn't understand, and can't fix code you didn't write with intention. Accountability creates the incentive structure that makes the first four steps happen."]}),e.jsxs(a,{title:"Write CLAUDE.md Before the First Prompt",children:["Start every AI coding session by reading your CLAUDE.md in your head. Not skimming — reading. Ask yourself: does this still reflect the actual constraints of this project? Has anything changed since the last time I updated it?",e.jsx("br",{}),e.jsx("br",{}),"If you don't have a CLAUDE.md for this project, stop. Write it before typing a single prompt. This is not bureaucratic overhead. A 30-minute investment in writing a thorough CLAUDE.md saves 30 hours of security remediation, architectural refactoring, and compliance scrambling downstream.",e.jsx("br",{}),e.jsx("br",{}),"Every constraint you don't put in CLAUDE.md is a decision you're leaving to the AI's training data defaults — which may have been appropriate for a tutorial on the internet in 2021, but are not appropriate for your regulated, production, customer-facing system in the present day."]}),e.jsxs(n,{type:"tip",title:'Why "Vibes" Still Matter',children:["Vibe Engineering is not a campaign against developer joy. Flow state is real. The feeling of momentum when ideas manifest in working code almost instantly is a genuine productivity multiplier, and it reduces cognitive fatigue in a way that grinds through implementation line by line never did.",e.jsx("br",{}),e.jsx("br",{}),"The goal of Vibe Engineering is not to eliminate vibes. It's to build the scaffolding that makes vibing safe. When your CLAUDE.md is thorough, your tests are in place, and your SAST is in the loop, you can move fast with confidence instead of moving fast with anxiety. You can enter flow state and stay there because you're not constantly second-guessing whether you just shipped a vulnerability.",e.jsx("br",{}),e.jsx("br",{}),"The discipline doesn't kill the joy. The discipline is what makes the joy sustainable at production scale."]})]})}const re=Object.freeze(Object.defineProperty({__proto__:null,default:h},Symbol.toStringTag,{value:"Module"}));function u(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Core Principles"}),e.jsx("p",{children:"Vibe Engineering is not a loose collection of tips for getting better results from AI assistants. It is a methodology built on five interlocking principles that together define the difference between professional AI-augmented engineering and ad-hoc AI experimentation. These principles apply regardless of which AI model you are using, which language you are writing in, or how large your team is."}),e.jsx("p",{children:"Each principle addresses a specific failure mode of naive AI-assisted development. Understanding why each principle exists makes it easier to apply correctly — and makes it obvious when a workflow is violating one."}),e.jsx("h2",{children:"Principle 1: Trust — Verify Everything, Trust the System"}),e.jsxs(s,{title:"Calibrated Trust",children:[`AI models are not reliable narrators. They produce correct output most of the time, plausible-sounding output almost all of the time, and dangerously wrong output occasionally — with no reliable signal distinguishing the three cases in the prose itself. The principle of Trust in Vibe Engineering is not "trust the AI" or "don't trust the AI." It is: `,e.jsx("strong",{children:"trust the system of verification you have built, not the individual output."})]}),e.jsx("p",{children:`In practice, this means the question after every AI output is not "does this look right?" but "what would have to be true for this to be wrong, and have I checked that?" Your tests, your SAST tools, your type checker, your linter — these are the trust infrastructure. When they pass, you can have confidence in the output. When they aren't in place, you have nothing but vibes.`}),e.jsx(i,{language:"markdown",filename:"CLAUDE.md (Trust Infrastructure)",children:`## Verification Requirements

Before reporting any task complete, you MUST:
1. Run the full test suite: npm test — all tests must pass
2. Run the type checker: tsc --noEmit — zero errors
3. Run the linter: eslint src/ --max-warnings 0 — zero warnings
4. Run SAST: semgrep --config auto src/ — no HIGH/CRITICAL findings

If any check fails, fix the issue before reporting completion.
Do NOT report "tests pass" without actually running them.`}),e.jsx("h2",{children:"Principle 2: Iteration — Small, Verifiable Steps"}),e.jsx("p",{children:'Vibe coding tends toward large, sweeping prompts: "build me the entire authentication system." Vibe Engineering uses tight iteration loops: one small, well-defined task at a time, each producing output that can be completely verified before proceeding.'}),e.jsxs(o,{title:"The Tight Loop Pattern",children:["The unit of work in Vibe Engineering is ",e.jsx("strong",{children:"one task that produces verifiable output"}),". A task is too large if you cannot fully verify its output before moving to the next one. Decompose until each step is verifiable. This is not bureaucratic overhead — it is the mechanism that keeps errors from compounding.",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"Large prompt (vibe coding):"}),' "Implement user authentication with registration, login, password reset, email verification, and session management."',e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"Tight iteration (vibe engineering):"}),e.jsx("br",{}),'Step 1: "Implement the User model with the schema defined in user.schema.ts. Tests in tests/user.model.test.ts must pass."',e.jsx("br",{}),'Step 2: "Implement POST /auth/register. Tests in tests/auth.register.test.ts must pass."',e.jsx("br",{}),'Step 3: "Implement POST /auth/login. Tests in tests/auth.login.test.ts must pass."',e.jsx("br",{}),"Each step is a separate Claude session or a clearly delimited task. Each is fully verified before the next begins."]}),e.jsx("h2",{children:"Principle 3: Context — Front-Load What Matters"}),e.jsxs("p",{children:["AI models work with the context they are given. When context is absent, they fill in gaps with training data defaults — which reflect internet averages, not your organization's standards. The principle of Context in Vibe Engineering is: ",e.jsx("strong",{children:"every constraint, pattern, and decision that matters to this codebase must be in CLAUDE.md before the first prompt."})]}),e.jsx("p",{children:'Context is not just about what to build. It is about what not to build, what libraries to use, what security requirements apply, what naming conventions the team follows, what the existing architecture looks like, and what architectural decisions have already been made and why. Each of these pieces of context narrows the space of valid AI output from "everything" to "exactly what we need."'}),e.jsx(i,{language:"markdown",filename:"CLAUDE.md (Context Sections)",children:`# Project Context

## Architecture
- Monorepo: packages/api (FastAPI), packages/web (React/Vite), packages/shared (types)
- Database: PostgreSQL 15 with SQLAlchemy 2.0 ORM — no raw SQL
- Auth: JWT in httpOnly cookies, 15min TTL, refresh token rotation
- Message queue: Redis Streams (not Celery, not RabbitMQ)

## Decisions Already Made (ADRs in docs/adrs/)
- ADR-001: PostgreSQL over MongoDB — do not suggest NoSQL alternatives
- ADR-003: REST over GraphQL for external APIs — do not suggest GraphQL
- ADR-007: No class-based components in React — hooks only

## Forbidden
- No console.log() in production code — use the logger in src/lib/logger.ts
- No any type in TypeScript — use unknown and narrow
- No new dependencies without a comment explaining why
- No setTimeout/setInterval — use the job scheduler in src/jobs/`}),e.jsx("h2",{children:"Principle 4: Feedback — Close the Loop Automatically"}),e.jsx("p",{children:"Human review is a feedback mechanism, but it is slow and expensive. Vibe Engineering invests in automated feedback that runs inside the Claude session itself — tests, linters, type checkers, security scanners — so that the loop closes before you ever see the output. The human review then focuses on what automation cannot check: architectural judgment, security intent, and business correctness."}),e.jsx(a,{title:"In-Loop Feedback",children:"Structure every Claude session so that feedback tools run automatically after each code change. This means telling Claude explicitly which commands to run, in which order, and what constitutes a passing result. Claude should not consider a task done until all automated feedback is clean. The human review is the final gate, not the only gate."}),e.jsx(i,{language:"markdown",filename:"Claude Session Feedback Loop",children:`After implementing each change, run in this order:
1. npm run build              → must exit 0
2. npm test -- --coverage    → must pass, coverage must not decrease
3. npm run lint              → zero warnings
4. npx tsc --noEmit         → zero errors
5. docker build -t app:test . → must succeed

If any step fails, fix the issue and re-run from step 1.
Only report completion when all five steps pass consecutively.`}),e.jsx("h2",{children:"Principle 5: Governance — Every Output Has an Owner"}),e.jsxs("p",{children:["The governance principle is the one that makes Vibe Engineering viable at enterprise scale. Without it, the other four principles can be followed sporadically but will not hold under production pressure. Governance means: ",e.jsx("strong",{children:"every piece of AI-generated code has a named human who reviewed it, approved it, and is accountable for it."})]}),e.jsx("p",{children:"This is not a bureaucratic requirement. It is an incentive structure. When engineers know they are personally accountable for code they approve — regardless of whether an AI generated it — they review it carefully. They run the tests. They read the diff. They ask questions. They push back on outputs that don't meet standards. Accountability is the force that makes all the other principles actually happen."}),e.jsx(r,{title:"The Accountability Gap",children:'"But Claude generated it" is not a defense that works in a post-incident review, a security audit, a compliance examination, or a customer breach notification. The engineer who approved the PR owns the code. The organization that deployed it owns the vulnerability. This was true before AI, and it remains true with AI. The only change is the speed at which code can be generated — and therefore the speed at which accountability must be exercised.'}),e.jsx("h2",{children:"How the Five Principles Interlock"}),e.jsx("p",{children:"The principles are not independent. They are mutually reinforcing, and they fail together if any one is missing:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Context without Feedback"})," means you set good rules but have no way to verify they were followed."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Feedback without Governance"})," means automated checks run but nobody is accountable for acting on them."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Governance without Iteration"})," means reviews are so large and infrequent that accountability becomes nominal."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Iteration without Trust Infrastructure"})," means you iterate fast but never know if any step was actually correct."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Trust without Context"})," means your verification tools pass code that violates your org's specific requirements."]})]}),e.jsx(n,{type:"tip",title:"The Principle Priority Order",children:'When you are adopting Vibe Engineering incrementally, implement the principles in this order: Context first (write CLAUDE.md), then Feedback (set up automated checks), then Iteration (break work into verifiable units), then Trust (establish what "verified" means for your team), then Governance (formalize accountability in your process). Each layer makes the next one effective. Governance without Context is just bureaucracy. Context with Governance and automated Feedback is an engineering system that scales.'})]})}const oe=Object.freeze(Object.defineProperty({__proto__:null,default:u},Symbol.toStringTag,{value:"Module"}));function m(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Enterprise Engineering Mindset"}),e.jsx("p",{children:"Most engineers first encounter AI coding assistants in a personal context: a side project, a coding challenge, a weekend experiment. In that context, prompt-tinkering works. You try a prompt, see what you get, tweak it, try again. The feedback loop is tight, the stakes are low, and the only person who suffers if the code is wrong is you."}),e.jsx("p",{children:"Enterprise software engineering is categorically different. The codebase is maintained by dozens or hundreds of engineers across years or decades. Decisions made today constrain options for teams that don't exist yet. Security vulnerabilities affect real customers. Compliance failures carry legal and financial consequences. In this environment, prompt-tinkering is not a methodology — it is a liability."}),e.jsx("p",{children:"The enterprise engineering mindset for AI-augmented development requires a different mental model entirely: systematic, reproducible, governed, and auditable."}),e.jsx("h2",{children:"From Prompt-Tinkering to Systematic Engineering"}),e.jsx("div",{className:"table-wrapper",style:{overflowX:"auto",marginBottom:"2rem"},children:e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:"0.95rem"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{backgroundColor:"var(--color-surface-raised, #1e1e2e)"},children:[e.jsx("th",{style:{padding:"0.75rem 1rem",textAlign:"left",borderBottom:"2px solid var(--color-border, #333)",width:"25%"},children:"Dimension"}),e.jsx("th",{style:{padding:"0.75rem 1rem",textAlign:"left",borderBottom:"2px solid var(--color-border, #333)",width:"37%",color:"var(--color-warning, #f59e0b)"},children:"Prompt-Tinkering"}),e.jsx("th",{style:{padding:"0.75rem 1rem",textAlign:"left",borderBottom:"2px solid var(--color-border, #333)",width:"38%",color:"var(--color-success, #10b981)"},children:"Systematic Engineering"})]})}),e.jsx("tbody",{children:[{d:"Standards",p:"Each engineer uses whatever prompt style worked last time",e:"Shared CLAUDE.md in the repo that encodes org standards once for all engineers"},{d:"Reproducibility",p:"Results vary by who ran the session and what mood they were in",e:"Deterministic: same CLAUDE.md + same tests = same acceptable output bounds"},{d:"Knowledge capture",p:"Tribal: the prompt-tinkerer knows what works; nobody else does",e:"Documented in CLAUDE.md, slash commands, and ADRs — survives team turnover"},{d:"Audit trail",p:"No record of what was asked, what was generated, what was changed",e:"Git history shows tests committed before implementation; PR records the review"},{d:"Onboarding",p:"New engineers must rediscover which prompts work for this project",e:"New engineers read CLAUDE.md and immediately have all constraints and patterns"},{d:"Scale",p:"Breaks down past 1-2 engineers — inconsistent output quality",e:"Scales to 100+ engineers: constraints enforced by tooling, not by memory"}].map((c,d)=>e.jsxs("tr",{style:{backgroundColor:d%2===0?"transparent":"var(--color-surface-subtle, #161622)"},children:[e.jsx("td",{style:{padding:"0.75rem 1rem",fontWeight:"600",borderBottom:"1px solid var(--color-border-subtle, #2a2a3a)",verticalAlign:"top"},children:c.d}),e.jsx("td",{style:{padding:"0.75rem 1rem",borderBottom:"1px solid var(--color-border-subtle, #2a2a3a)",verticalAlign:"top",color:"var(--color-text-muted, #aaa)"},children:c.p}),e.jsx("td",{style:{padding:"0.75rem 1rem",borderBottom:"1px solid var(--color-border-subtle, #2a2a3a)",verticalAlign:"top"},children:c.e})]},c.d))})]})}),e.jsx("h2",{children:"The Three Shifts in Enterprise Mindset"}),e.jsx("h3",{children:"Shift 1: From Personal to Institutional Knowledge"}),e.jsx("p",{children:"In prompt-tinkering, the knowledge of how to get good results from AI lives in one person's head. When that person leaves, the knowledge leaves with them. In enterprise Vibe Engineering, all AI-guidance knowledge is institutionalised in artefacts that live in the repository: CLAUDE.md, custom slash commands, shared prompt templates, documented ADRs, and this documentation itself."}),e.jsx(i,{language:"bash",filename:"Repository AI Knowledge Artefacts",children:`# Knowledge that lives in the repo, not in anyone's head
/CLAUDE.md                          # Primary AI constitution
/.claude/commands/                  # Shared slash commands
/docs/adrs/                         # Architectural decisions
/docs/ai-workflows/                 # Documented session patterns
/.github/workflows/ai-quality.yml   # Automated quality gates`}),e.jsx("h3",{children:"Shift 2: From Reactive to Proactive Quality"}),e.jsx("p",{children:"Prompt-tinkering is reactive: you generate code, notice a problem, fix it, generate more code. Quality is enforced after the fact by whoever happens to notice the issue. Enterprise engineering is proactive: quality is enforced before the AI generates the code, by the constraints in CLAUDE.md, and during generation, by the automated gates in the agent loop."}),e.jsx(s,{title:"Quality Injected, Not Inspected",children:"The enterprise engineering mindset treats quality as a property of the process, not the output. If your process correctly encodes security requirements, architectural patterns, and test-first discipline, then the output will be high-quality by construction. If your process is ad-hoc prompting and eyeballing, then quality depends on luck. The goal of Vibe Engineering is to build a process where high-quality output is the default, not the exception."}),e.jsx("h3",{children:"Shift 3: From Individual to Collective Accountability"}),e.jsx("p",{children:"In personal AI use, accountability is informal: if your side project breaks, you fix it. In an enterprise team, accountability must be explicit and systemic. Every AI-generated change needs a named reviewer. Every deviation from standards needs a recorded justification. The accountability system must function even when the team is under delivery pressure — which is exactly when the temptation to skip review is highest."}),e.jsxs(o,{title:"The Accountability Stack",children:["Enterprise AI accountability operates at three levels simultaneously:",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"Individual level:"})," The engineer who approves a PR is accountable for that diff, regardless of who or what generated it. This accountability is enforced by the code review process and the org's engineering standards.",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"Team level:"})," The team is accountable for maintaining a CLAUDE.md that reflects current standards, for running quality gates on every PR, and for escalating when AI output consistently fails to meet those standards.",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"Organisational level:"})," The organisation is accountable for defining the AI usage policy, establishing the approved toolset, setting the data handling constraints, and measuring whether AI-augmented engineering is actually improving quality and velocity."]}),e.jsx("h2",{children:"What Scale Changes"}),e.jsx("p",{children:"Practices that work fine for a solo engineer or a 3-person team fail at enterprise scale for predictable reasons. Understanding these failure modes in advance lets you design the right process from the start."}),e.jsx("h3",{children:"Context Divergence"}),e.jsx("p",{children:`When 50 engineers each maintain their own mental model of "how we use AI here," those models diverge. One engineer's CLAUDE.md (or lack of one) lets Claude use any ORM it wants. Another's requires SQLAlchemy. The result is a codebase with inconsistent patterns, maintenance nightmares, and security properties that vary by who wrote which module. The solution is a single authoritative CLAUDE.md committed to the root of the repository, treated with the same governance as any other engineering standard.`}),e.jsx("h3",{children:"Review Bottlenecks"}),e.jsx("p",{children:"If AI dramatically increases code generation velocity but review capacity stays constant, the review process becomes the bottleneck — and under pressure, engineers start shortcutting it. The enterprise solution is to automate the mechanical parts of review (tests, linting, SAST, type checking) so that human reviewers focus only on the parts that require judgment. This keeps review fast without reducing thoroughness."}),e.jsx("h3",{children:"Compliance at Velocity"}),e.jsx("p",{children:"Compliance requirements (GDPR, PCI-DSS, SOC 2, HIPAA) don't become less stringent because you are using AI. If anything, the velocity of AI-generated code means compliance violations can accumulate faster than a quarterly audit can catch them. The enterprise solution is to embed compliance constraints in CLAUDE.md as hard rules, and to run compliance checks automatically in the CI pipeline."}),e.jsx(a,{title:"Compliance Rules in CLAUDE.md",children:'Write compliance constraints as specific, actionable rules in CLAUDE.md — not as vague intentions. "Follow GDPR" is not actionable. "Never log email addresses, phone numbers, or any field marked PII in the data model" is actionable. "Do not store payment card data anywhere in this service — use the payment-service client in src/clients/payment.ts which handles tokenisation" is actionable. The more specific the constraint, the more reliably Claude will follow it and the easier it is to verify compliance in code review.'}),e.jsx("h2",{children:"Introducing Vibe Engineering to an Existing Team"}),e.jsx("p",{children:"Most teams adopting Vibe Engineering are not greenfield. They have existing codebases, existing processes, and engineers at various levels of AI familiarity. The transition works best when introduced incrementally, starting with the highest-leverage changes."}),e.jsxs("ol",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Week 1-2: Write the CLAUDE.md."})," Gather the senior engineers and spend one focused session writing the CLAUDE.md for your primary repository. Cover architecture, security constraints, forbidden patterns, and naming conventions. This single artefact delivers more value than any amount of individual prompt coaching."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Week 3-4: Establish the quality gate."})," Add automated checks to your CI pipeline that run tests, linting, type checking, and SAST. These are the feedback infrastructure that makes verification systematic."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Week 5-6: Define the review standard."}),' Write a one-page document stating explicitly what "reviewing AI-generated code" means for your team. What must every reviewer check? What automation can they rely on? What constitutes an approval?']}),e.jsxs("li",{children:[e.jsx("strong",{children:"Month 2+: Build slash commands and workflows."}),' Identify the most common patterns — "implement this feature," "add tests for this module," "update this API" — and build reusable slash commands that encode the right approach for each.']})]}),e.jsx(r,{title:"Do Not Reorganise Around AI Before You Understand It",children:"Some organisations see AI productivity gains and immediately restructure teams, eliminate roles, or dramatically increase delivery expectations. This is premature. AI-augmented engineering requires new skills (specification writing, output review, constraint design) that take time to develop. Teams that are restructured before those skills are established will produce more AI-generated code that nobody properly reviewed, more quickly. That is strictly worse than the status quo. Invest in capability first. Restructure second, and only based on measured outcomes."}),e.jsx(n,{type:"tip",title:"The Biggest Leverage Point",children:"If you can do only one thing to shift your team toward systematic AI-augmented engineering, write a thorough CLAUDE.md and commit it to your primary repository. It takes 2-4 hours. Every engineer on the team immediately gets those hours' worth of institutional knowledge injected into every Claude session they run. It compounds with every engineer and every session. No other single investment has a higher return."})]})}const ce=Object.freeze(Object.defineProperty({__proto__:null,default:m},Symbol.toStringTag,{value:"Module"}));function p(){return e.jsxs("div",{className:"section-content",children:[e.jsx("h1",{children:"The AI Constitution: CLAUDE.md"}),e.jsx("p",{children:"Every time you start a Claude Code session, Claude reads the project context and begins working. Without any configuration, it makes decisions based on its training — which reflects general best practices from the internet, not your organization's specific requirements. It doesn't know that you're in a PCI-DSS scope. It doesn't know your team banned a certain library after a security incident. It doesn't know that the API layer must use async patterns because the team decided that two years ago. It will make reasonable-sounding decisions, and they may be completely wrong for your context."}),e.jsx("p",{children:"CLAUDE.md solves this by giving every session a starting point that reflects your actual requirements. It is the persistent institutional memory of your project, committed to version control, reviewed like code, and loaded automatically whenever Claude Code starts."}),e.jsxs(s,{title:"CLAUDE.md — The AI Constitution",children:["CLAUDE.md is the configuration file that Claude Code reads automatically at startup, from the current working directory and all parent directories up to the user's home. It functions as ",e.jsx("strong",{children:"persistent context"}),": every piece of information in it is available to Claude throughout the session without you re-stating it in prompts.",e.jsx("br",{}),e.jsx("br",{}),"A well-written CLAUDE.md encodes:",e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Project identity"})," — what this service does, who owns it, what compliance scope it's in"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Tech stack"})," — language versions, framework versions, approved libraries"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Coding standards"})," — naming conventions, file structure, layering rules"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Forbidden patterns"})," — anti-patterns that must never be generated"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Security rules"})," — specific controls required by the environment"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Architectural boundaries"})," — what calls what, what doesn't call what"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Custom commands"})," — project-specific slash commands available in the session"]})]}),"Think of CLAUDE.md as the brief you give to a new contractor on day one — except it's always up to date, always present, and never has to be repeated."]}),e.jsx("h2",{children:"The CLAUDE.md Hierarchy"}),e.jsx("p",{children:"CLAUDE.md is not a single file. It's a hierarchy of files, each scoped to the level where its constraints apply. Claude reads all applicable files in the hierarchy, with more specific (deeper) files taking precedence over more general (shallower) ones when there is a conflict."}),e.jsx(i,{language:"text",filename:"CLAUDE.md file hierarchy",children:`~/.claude/CLAUDE.md              # User-level: personal preferences, common tools,
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
                                 #   restrictions, tokenization requirements)`}),e.jsxs("p",{children:["When you're working in ",e.jsx("code",{children:"/repo/src/api/payments/"}),", Claude reads all five files. The payments CLAUDE.md adds constraints on top of the API CLAUDE.md, which adds constraints on top of the src CLAUDE.md, and so on up. This means you write each constraint once, at the right level, and it applies everywhere it should without duplication."]}),e.jsx("h2",{children:"A Production CLAUDE.md: Python FastAPI + SOC 2"}),e.jsx("p",{children:"Here is a complete, enterprise-grade CLAUDE.md for a Python FastAPI service operating in a SOC 2 Type II environment. Read every section and note why each constraint is present — each one exists because someone, somewhere, had to deal with the consequence of not having it."}),e.jsx(i,{language:"markdown",filename:"CLAUDE.md",children:`# AI Constitution: payments-service

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
- [ ] semgrep output is clean (0 critical, 0 high findings)`}),e.jsx("h2",{children:"A Production CLAUDE.md: TypeScript React + GDPR"}),e.jsx("p",{children:"The same structure applies to frontend codebases with entirely different constraints. Here is a CLAUDE.md for a React application operating under GDPR with accessibility requirements. Notice how the forbidden patterns shift entirely to reflect the different risk surface:"}),e.jsx(i,{language:"markdown",filename:"CLAUDE.md (TypeScript/React with GDPR)",children:`# AI Constitution: customer-portal-frontend

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
- /storybook-story: Generate a Storybook story with all variant states for a new component`}),e.jsxs(o,{title:"The Forbidden Patterns Section",children:["Of all the sections in a CLAUDE.md, the ",e.jsx("strong",{children:"Forbidden Patterns"})," section is the most important. This is counterintuitive — most engineers instinctively document what to do, not what to avoid. But explicit negative constraints are more reliable guides for AI behavior than positive ones.",e.jsx("br",{}),e.jsx("br",{}),`When you write "use bcrypt for passwords," Claude knows to use bcrypt when the topic of password hashing comes up. But Claude also knows many other password hashing patterns, and if context is ambiguous, any of them might appear. When you write "NEVER use MD5 or SHA1 for passwords," you've eliminated an entire class of wrong answers before they can be generated.`,e.jsx("br",{}),e.jsx("br",{}),"The most effective Forbidden Patterns sections are:",e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Specific"}),' — "f-strings in SQL expressions" not "unsafe SQL"']}),e.jsxs("li",{children:[e.jsx("strong",{children:"Annotated"}),' — include the risk in a comment ("SQL injection", "command injection")']}),e.jsxs("li",{children:[e.jsx("strong",{children:"Exhaustive for known risks"})," — if your team has had a security incident involving a pattern, that pattern is in Forbidden Patterns, always, and stays there forever"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Domain-aware"})," — a PCI-DSS scope has different forbidden patterns than a HIPAA scope or a GDPR scope; write the ones that apply to your specific environment"]})]}),"Every item in your Forbidden Patterns section should exist because someone either encountered that anti-pattern in production, observed AI generate it unprompted, or identified it as a regulatory risk specific to your context. Generic lists copied from the internet are less valuable than short, specific lists from your team's actual experience."]}),e.jsxs(l,{severity:"high",title:"CLAUDE.md Must Not Contain Secrets or Internal Infrastructure Details",children:["CLAUDE.md is committed to version control and may be readable by anyone with repository access — including contractors, open source contributors, or anyone who gains unauthorized access to your source repository.",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"Never include in CLAUDE.md:"}),e.jsxs("ul",{children:[e.jsx("li",{children:"Actual API keys, tokens, or credentials of any kind"}),e.jsx("li",{children:"Internal IP addresses, VPC CIDR ranges, or private hostnames"}),e.jsx("li",{children:"Production database connection strings"}),e.jsx("li",{children:"Internal tool URLs (Jira instances, Confluence, internal wikis)"}),e.jsx("li",{children:"Employee names associated with sensitive systems"}),e.jsx("li",{children:"Security control implementation details that would aid an attacker in bypassing them"})]}),e.jsx("strong",{children:"Reference by name instead:"})," Write ",e.jsx("code",{children:"PAYMENTS_API_KEY"}),", not the actual key. Write ",e.jsx("code",{children:"use the JIRA_URL environment variable"}),", not the actual Jira URL. Write",e.jsx("code",{children:"see AWS Secrets Manager path /prod/payments/db-credentials"}),", not the actual connection string. The path to a secret is not itself a secret, but the secret value is.",e.jsx("br",{}),e.jsx("br",{}),"The rule is simple: if the information would help an attacker understand, map, or compromise your production system, it doesn't belong in a file that lives in your source repository."]}),e.jsxs(a,{title:"Version CLAUDE.md Like Production Code",children:["CLAUDE.md is not a scratch pad. It is a governing document that shapes the behavior of AI across every engineering session that touches your codebase. Treat it with the same discipline you apply to your most critical configuration files.",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"In practice, this means:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Changes go through PR review"})," — a proposed change to CLAUDE.md should be reviewed by at least one other engineer, the same as a change to your CI pipeline or Terraform configuration"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Maintain a changelog"}),' — when you add a new security constraint, add an entry noting why it was added and when. "Added: no f-strings in SQL (2024-11 security audit finding)" is invaluable context when someone questions the rule years later']}),e.jsxs("li",{children:[e.jsx("strong",{children:"Use org-level templates"})," — create a base CLAUDE.md template for each tech stack your org uses (Python/FastAPI, TypeScript/React, Go/gRPC). Teams fork from the template and add their project-specific constraints. This ensures minimum standards across all projects without requiring every team to rediscover the same lessons"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Audit existing code when rules change"})," — when a new security requirement is added to CLAUDE.md, immediately run a search for violations of that requirement in the existing codebase. Adding a rule going forward is not enough if the problem already exists in 40 files. The CLAUDE.md update and the remediation audit are one task, not two"]})]}),'The question to ask before every CLAUDE.md PR merge: "If a new engineer joined the team tomorrow and their only context for AI-assisted development was this file, would they produce code that meets our standards?" If the answer is no, the file is incomplete.']}),e.jsx("h2",{children:"The ADR as CLAUDE.md Input Pattern"}),e.jsx("p",{children:"Architecture Decision Records (ADRs) are one of the most valuable — and underused — engineering practices. An ADR documents a significant architectural decision: the context, the options considered, the decision made, and the consequences. They prevent the same debate from happening twice and give future engineers the reasoning behind decisions that might otherwise seem arbitrary."}),e.jsx("p",{children:"ADRs and CLAUDE.md have a natural relationship that most teams don't exploit. Every ADR contains implicit constraints: if you decided to use async patterns throughout the API layer, that's a constraint future code must follow. If you decided to ban a certain library after a security incident, that's a constraint. If you decided on a specific error handling pattern, that's a constraint."}),e.jsx("p",{children:'The pattern is straightforward: when you make an architectural decision and write the ADR, extract the constraints from the ADR and add them to CLAUDE.md in the same PR. The ADR becomes the "why"; CLAUDE.md becomes the "what"; together they ensure the decision is enforced in all future AI-assisted development sessions automatically.'}),e.jsx(i,{language:"markdown",filename:"docs/adr/ADR-012-jwt-storage-strategy.md (excerpt)",children:`## Status
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
See: /repo/CLAUDE.md — "Auth Implementation (ADR-012)" section`}),e.jsx(i,{language:"markdown",filename:"CLAUDE.md (section added after ADR-012)",children:`## Auth Implementation (ADR-012, 2024-09-15)
See docs/adr/ADR-012-jwt-storage-strategy.md for full context.

- JWT storage: httpOnly cookie set by server ONLY — NEVER localStorage or sessionStorage
- Cookie attributes: HttpOnly=true, Secure=true, SameSite=Strict
- CSRF: X-CSRF-Token header required on ALL POST, PUT, PATCH, DELETE endpoints
- Token lifecycle: 15min access token, 7-day refresh token with rotation on every use
- Logout: must call POST /auth/logout — client-side state clear alone is insufficient

## Forbidden (from ADR-012)
- document.cookie access for auth tokens (httpOnly means JS can't read them — never try)
- localStorage.setItem('token', ...) — this was the vulnerability, never recreate it
- HS256 JWT signing — we use RS256 to allow token verification without sharing secret`}),e.jsx("p",{children:'Six months after ADR-012, a new engineer starts a Claude Code session and asks Claude to implement a "remember me" feature. Without the CLAUDE.md constraint, Claude might reasonably store a long-lived token in localStorage — a pattern it has seen many times in its training data. With the CLAUDE.md constraint referencing the ADR, Claude knows this specific project made a deliberate decision against that pattern, understands the security reasoning, and implements the correct cookie-based approach instead. The ADR → CLAUDE.md pipeline converts a one-time decision into a permanent constraint.'}),e.jsxs(n,{type:"tip",title:"Scope Your CLAUDE.md at the Right Level",children:["One of the most common CLAUDE.md mistakes is writing everything at the repo root level — a single massive file with hundreds of rules that applies equally to your backend API, your frontend, your data pipeline, and your infrastructure tooling. This creates two problems: the file becomes so long that important rules get lost in the noise, and rules that only apply to one part of the codebase create irrelevant noise when working in another area.",e.jsx("br",{}),e.jsx("br",{}),"The right approach is to write each constraint at the level where it applies:",e.jsxs("ul",{children:[e.jsxs("li",{children:["API authentication requirements belong in ",e.jsx("code",{children:"/src/api/CLAUDE.md"}),", not the root"]}),e.jsxs("li",{children:["Frontend accessibility rules belong in ",e.jsx("code",{children:"/src/components/CLAUDE.md"})]}),e.jsxs("li",{children:["PCI-DSS payment controls belong in ",e.jsx("code",{children:"/src/api/payments/CLAUDE.md"})]}),e.jsxs("li",{children:["Python-wide style conventions belong in ",e.jsx("code",{children:"/src/CLAUDE.md"})]}),e.jsxs("li",{children:["Compliance scope, team identity, and cross-cutting architecture belong in the root ",e.jsx("code",{children:"/CLAUDE.md"})]})]}),"When working in ",e.jsx("code",{children:"/src/api/payments/"}),", the engineer gets all applicable constraints automatically from every level of the hierarchy. When working in ",e.jsx("code",{children:"/src/components/"}),", they get only the constraints relevant to that context. A focused, 40-line CLAUDE.md that engineers actually read and maintain is worth more than a 400-line omnibus file that gradually becomes invisible through familiarity — or worse, that nobody ever reads because it's too long to parse."]})]})}const le=Object.freeze(Object.defineProperty({__proto__:null,default:p},Symbol.toStringTag,{value:"Module"}));function g(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"AI Log Analysis"}),e.jsx("p",{children:"Production logs are among the most information-dense artifacts in software engineering — and among the least effectively analyzed. A production incident generates thousands of log lines per minute. Finding the signal in that noise — the first error that preceded the cascade, the pattern that distinguishes affected users from healthy ones, the specific component that began degrading before alerts fired — is cognitively demanding work that takes experienced engineers time they don't have during an active incident."}),e.jsx("p",{children:"Claude, when given structured access to logs through MCP tools or direct analysis sessions, can perform this analysis much faster than a human scanning log lines. The key is structured logging — logs that are queryable, filterable, and machine-readable are exponentially more useful than unstructured text when an AI is analyzing them."}),e.jsxs(s,{title:"Structured Logging as AI Input",children:["Structured logs — JSON-formatted with consistent field names, request IDs, user IDs, and trace IDs — are not just better for human operators; they are prerequisites for effective AI log analysis. When Claude can filter ",e.jsx("code",{children:"level:error AND service:payment-api AND trace_id:abc123"}),", it can correlate errors across services and identify root causes in seconds. When logs are unstructured strings, Claude must parse them, which introduces error and slows analysis. Structured logging is not a nice-to-have for AI-assisted operations — it is an enabler."]}),e.jsx(t,{title:"Setting Up Structured Logging for AI Analysis",tabs:[{label:"yaml",language:"yaml",filename:"CLAUDE.md (logging standards)",code:`## Logging Standards

### Format
All log output must be structured JSON using pino or winston with JSON transport.

### Required Fields (all log entries)
- timestamp: ISO 8601 format (pino generates automatically)
- level: error/warn/info/debug
- service: service name (process.env.SERVICE_NAME)
- version: application version (process.env.APP_VERSION)
- environment: dev/staging/production
- traceId: distributed trace ID (from request context or generated)
- requestId: individual request ID (for correlating within a single request)

### Required Fields (request logs)
- method: HTTP method
- path: request path (no query string — log that separately to avoid PII)
- statusCode: response status code
- durationMs: request duration in milliseconds
- userId: authenticated user ID (NOT email, NOT name — only UUID)

### FORBIDDEN in logs
- Passwords, tokens, API keys (any value matching secret patterns)
- PII: email addresses, names, phone numbers, addresses
- Full request/response bodies (log only metadata)
- Stack traces in info/warn levels (only in error level, with sanitization)

### Anomaly Detection
Logs are analyzed by Claude Code sessions during incidents.
Ensure log format supports: filtering by service, level, traceId, statusCode
CloudWatch Insights query format must be supported.`},{label:"typescript",language:"typescript",filename:"src/infrastructure/logger.ts",code:`import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    service: process.env.SERVICE_NAME || 'unknown',
    version: process.env.APP_VERSION || 'unknown',
    environment: process.env.NODE_ENV,
  },
  redact: {
    // Automatically redact sensitive fields
    paths: ['password', 'token', 'secret', 'authorization', 'cookie',
            '*.password', '*.token', '*.secret', 'req.headers.authorization'],
    censor: '[REDACTED]',
  },
  serializers: {
    err: pino.stdSerializers.err,  // Standard error serializer
    req: (req) => ({
      method: req.method,
      path: req.url?.split('?')[0],  // No query string (may contain PII)
      traceId: req.headers['x-trace-id'],
    }),
  },
})`}]}),e.jsx(t,{title:"AI Log Analysis Session",tabs:[{label:"bash",language:"bash",filename:"log-analysis-session.sh",code:`# During or after an incident — analyze logs with Claude
# Using AWS CloudWatch Logs directly

# Export relevant logs for analysis
aws logs filter-log-events   --log-group-name "/ecs/production/payment-api"   --start-time $(date -d '2 hours ago' +%s000)   --end-time $(date +%s000)   --filter-pattern '{ $.level = "error" }'   --query 'events[*].message'   --output text > /tmp/error-logs.json

# Analyze with Claude
claude "Analyze the following production error logs from payment-api.

Logs (last 2 hours, errors only): /tmp/error-logs.json

Perform the following analysis:

1. ERROR DISTRIBUTION
   - How many errors total?
   - What are the distinct error types and their frequency?
   - Which traceIds appear in multiple error log lines (cascading failures)?

2. TIMELINE
   - When did errors start? (compare to 30 minutes before)
   - Is the error rate increasing, decreasing, or stable?
   - Are there any error bursts (> 10 errors in 1 minute)?

3. IMPACT SCOPE
   - How many distinct userId values appear in error logs? (user impact)
   - Are errors concentrated in specific userIds or widespread?
   - Are errors concentrated in specific endpoints ($.path)?

4. ROOT CAUSE HYPOTHESIS
   - What is the most likely root cause based on error messages and timing?
   - List hypotheses in order of probability

5. RECOMMENDED ACTIONS
   - What should be investigated first?
   - What queries would confirm or deny the top hypothesis?

Report format: structured summary, then detailed findings"`}]}),e.jsx("h2",{children:"MCP Tools for Observability Platforms"}),e.jsx(t,{title:"Datadog MCP Integration for Log Analysis",tabs:[{label:"yaml",language:"yaml",filename:".claude/mcp-config.json",code:`{
  "mcpServers": {
    "datadog": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-datadog"],
      "env": {
        "DD_API_KEY": "\${DD_API_KEY}",
        "DD_APP_KEY": "\${DD_APP_KEY}",
        "DD_SITE": "datadoghq.eu"
      }
    }
  }
}`},{label:"bash",language:"bash",filename:"datadog-mcp-session.sh",code:`# With Datadog MCP configured, Claude can query directly
claude "Use the Datadog MCP tools to analyze our payment service.

1. Query error logs for payment-api service in the last 1 hour:
   service:payment-api status:error

2. Get the top 10 error patterns (group by @error.message)

3. Check if error rate is elevated compared to baseline:
   Compare errors in last 1 hour vs same time window 7 days ago

4. Query APM traces for slow transactions:
   service:payment-api operation:stripe.charge duration:>2000ms

5. Check if there are correlated errors in dependent services:
   Query: service:(user-api OR notification-service) status:error 
   in the same timeframe

Report: timeline of events, services affected, user impact estimate,
top 3 hypotheses for root cause with supporting evidence from logs"`}]}),e.jsx("h2",{children:"Anomaly Detection Patterns"}),e.jsx(t,{title:"Setting Up Intelligent Alerting",tabs:[{label:"bash",language:"bash",filename:"anomaly-alert-analysis.sh",code:`# When an anomaly alert fires, use Claude to contextualise it
claude "An anomaly detection alert fired: payment-api error rate is 3x baseline.

Context:
- Normal error rate: 0.1% (1 error per 1000 requests)
- Current error rate: 0.32% (3.2 errors per 1000 requests)
- Alert fired at: 14:23 UTC
- Recent deployments: $(git log --oneline --since='6 hours ago' origin/main)

Fetch and analyze the error logs from the past 30 minutes.
Available data sources: /tmp/recent-errors.json

Determine:
1. Are these new error types (first seen after last deployment) or pre-existing?
2. Is the error rate trending up (getting worse) or flat (stable at new baseline)?
3. Are errors correlated with the last deployment time?
4. What percentage of users are affected?

Recommendation:
- If new errors after deployment: suggest rollback assessment
- If pre-existing errors that increased: identify the trigger
- If isolated to a specific user segment: identify the segment for targeted fix"`}]}),e.jsx(r,{title:"Log Analysis Is Not Log-Free Debugging",children:"AI log analysis accelerates incident investigation but does not replace good logging. If your logs don't include the request ID, you cannot correlate events across services. If they don't include the user ID, you cannot assess user impact. If they don't include duration, you cannot identify performance degradation. The quality of AI log analysis is bounded by the quality of the logs themselves. Invest in structured logging with the right fields before expecting AI to make sense of them."}),e.jsx(a,{title:"Correlate Logs Across Services with Trace IDs",children:"In a microservices architecture, a single user request may touch ten services. Without a correlation ID that propagates across service boundaries, you cannot follow a request through the system when debugging an incident. Implement distributed tracing (OpenTelemetry with Jaeger or Datadog APM): every request gets a trace ID at the entry point, and every downstream call carries that trace ID in the header. Include trace IDs in all log entries. This enables Claude to reconstruct the full request path from a single failing trace ID, rather than manually correlating logs across services by timestamp."}),e.jsx(n,{type:"tip",title:"Log Retention Strategy for AI Analysis",children:"AI log analysis sessions work best with logs that are queryable in real time — not archived to cold storage. Configure your log platform to retain hot logs (immediately queryable) for at least 14 days and warm logs for 90 days. This window covers the typical incident investigation timeline and enables post-incident analysis of patterns that weren't noticed during the incident. For GDPR compliance, anonymize PII in logs (replace real user IDs with pseudonymized IDs after 7 days) while retaining the structural information needed for analysis."})]})}const de=Object.freeze(Object.defineProperty({__proto__:null,default:g},Symbol.toStringTag,{value:"Module"}));function f(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Incident Triage Workflow"}),e.jsx("p",{children:"Incident triage is a race against time under cognitive load. The on-call engineer is paged, often in the middle of the night, often for a system they didn't build, and must quickly determine: what is broken, who is affected, what is the most likely cause, and what are the immediate mitigation options? Making good decisions under this pressure requires having the right information, organized in the right way, at the right moment."}),e.jsx("p",{children:"Claude Code can serve as an intelligent triage assistant during incidents: analyzing logs and metrics, generating hypotheses, checking runbooks, and suggesting diagnostic commands — not replacing the engineer's judgment but dramatically accelerating the information-gathering and hypothesis-formation phases that consume most of incident response time."}),e.jsx(s,{title:"The Incident Triage State Machine",children:"Effective incident triage follows a consistent process: (1) Assess — what is the user impact? (2) Contain — stop the bleeding before diagnosing the cause, (3) Diagnose — identify the root cause using evidence, (4) Mitigate — implement a fix or workaround, (5) Validate — confirm the fix restored normal operation, (6) Document — capture the timeline and actions for the post-incident review. Claude assists most effectively in steps 1, 3, and 6."}),e.jsx(t,{title:"Initial Triage Session",tabs:[{label:"bash",language:"bash",filename:"start-triage.sh",code:`#!/bin/bash
# Incident triage starter script — run when paged

INCIDENT_ID="INC-$(date +%Y%m%d-%H%M)"
echo "Starting incident triage: $INCIDENT_ID"

# Collect initial context
echo "Collecting system state..."
RECENT_DEPLOYS=$(git log --oneline --since='4 hours ago' origin/main 2>/dev/null | head -10)
ERROR_RATE=$(curl -s "https://api.datadoghq.com/api/v1/query?from=$(date -d '10 minutes ago' +%s)&to=$(date +%s)&query=sum:payment-api.errors{*}.as_rate()" -H "DD-API-KEY: $DD_API_KEY" | jq '.series[0].pointlist[-1][1]' 2>/dev/null || echo "unknown")
CURRENT_VERSION=$(kubectl get deployment payment-api -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null || echo "unknown")

# Start triage with Claude
claude "I have been paged for an incident. Help me triage.

Incident ID: $INCIDENT_ID
Time: $(date -u)
Alert: Payment service error rate elevated
Current error rate: $ERROR_RATE per minute (baseline: ~0.1)
Current deployed version: $CURRENT_VERSION

Recent deployments (last 4 hours):
$RECENT_DEPLOYS

Step 1 — Assess Impact:
1. How many users are affected? Query error logs for unique userIds in last 10 min
2. What percentage of payment attempts are failing?
3. Are all payment methods affected or only specific ones?

Step 2 — Collect Evidence:
4. Pull the last 50 error log lines: cat /var/log/payment-api/error.log | tail -50
5. Check if errors started at a specific time that correlates with a deployment

Step 3 — Form Hypotheses:
6. Based on the evidence, list the 3 most likely root causes in order of probability
7. For each hypothesis: what one command would confirm or deny it?

I will execute your suggested commands and report back. Let's work through this together."`}]}),e.jsx("h2",{children:"Hypothesis-Driven Diagnosis"}),e.jsx(t,{title:"Structured Hypothesis Generation",tabs:[{label:"bash",language:"bash",filename:"hypothesis-generation.sh",code:`# After initial assessment — structured hypothesis testing
claude "Based on the evidence collected:

Error pattern: 
- All errors are 'stripe.charge failed: card_declined' with error code 'generic_decline'
- Error rate: 40% of payment attempts (up from 0.5%)
- First error: 14:17 UTC
- Most recent deployment: 14:12 UTC (updated Stripe API client from v9 to v10)
- Geographic distribution: errors evenly distributed (not regional)
- User segment: affects all user types equally

Hypothesis 1: Stripe API v10 has a different request format for charge creation
Evidence for: timing perfectly correlates with Stripe client upgrade
Evidence against: would expect 100% failure, not 40%
Test: Check the Stripe API changelog for v9→v10 breaking changes; look at actual Stripe request payload in debug logs

Hypothesis 2: Stripe is having a service incident
Evidence for: 40% failure rate could indicate Stripe degradation
Evidence against: Stripe status.stripe.com shows all systems operational
Test: Check Stripe dashboard for decline reason codes; if 'generic_decline' it could be Stripe-side

Hypothesis 3: Race condition in the new v10 client for concurrent requests
Evidence for: 40% failure rate could indicate intermittent issue
Evidence against: Would expect random distribution, not card_declined errors
Test: Look at request timing — are errors on requests that come within ms of each other?

For Hypothesis 1, the highest probability: 
What exact code changed in the Stripe v10 client upgrade?
Show me: git diff HEAD~1 package-lock.json | grep 'stripe'
Then: npm show stripe@10.0.0 vs stripe@9.14.0 — what changed in request format?"`}]}),e.jsx("h2",{children:"Runbook Integration During Incidents"}),e.jsx(t,{title:"Using Runbooks During Active Incidents",tabs:[{label:"bash",language:"bash",filename:"runbook-triage.sh",code:`# Use Claude to find and execute the relevant runbook
claude "We've confirmed the hypothesis: Stripe v10 changed the idempotency key format
and our implementation is generating duplicate keys under load, causing Stripe to
return generic_decline for what it thinks are duplicate charges.

Check the runbook for this scenario:
cat docs/runbooks/payment-service.md | grep -A 50 'stripe|idempotency'

If the runbook covers this scenario:
1. Follow the runbook steps exactly
2. Report each step as you complete it
3. Run the validation check specified in the runbook after mitigation

If the runbook does not cover this scenario:
1. The immediate mitigation is: rollback to previous deployment
   Execute: kubectl rollout undo deployment/payment-api -n payment
2. Verify rollback: kubectl rollout status deployment/payment-api -n payment
3. Check error rate: [use Datadog query from earlier]
4. Expected recovery: error rate should return to baseline within 2 minutes

After mitigation:
- Confirm error rate has returned to < 0.1% per minute
- Check that in-flight transactions during the rollback resolved correctly
- Post incident update in #incidents Slack channel:
  'MITIGATED: Payment API rolled back to v2.2.1 — error rate returning to baseline.
   Root cause: Stripe v10 idempotency key format change. Fix in progress.'"`}]}),e.jsx(r,{title:"AI Triage Is Advisory, Not Autonomous",children:`Claude's role during an active incident is to analyze information and suggest actions — not to execute destructive operations autonomously. Always confirm before Claude executes commands that: restart services, modify database records, change configuration in production, or roll back deployments. An AI that makes a confident but wrong diagnosis and autonomously executes a rollback can turn a localized incident into a broader one. The "approve each action" mode of Claude Code is the right setting during incidents.`}),e.jsx(a,{title:"Document the Triage Process as It Happens",children:'During an incident, have Claude maintain a running timeline: "Update the incident timeline with what we just found." This produces a structured record of the incident as it unfolds, capturing the exact commands run, the evidence found, and the decisions made. This timeline is the foundation of the post-incident review and is far more accurate than reconstructing it from memory two days later. Start every triage session with: "Create an incident document at docs/incidents/$(date +%Y-%m-%d)-payment-incident.md and keep it updated as we work through the incident."'}),e.jsx(n,{type:"tip",title:"PagerDuty and Opsgenie Runbook Links",children:"The fastest way to get Claude into the incident response workflow is to include a Claude triage starter script link in your PagerDuty or Opsgenie alert body. When the engineer acknowledges the alert, they can run the triage script with one command. The script automatically collects context (recent deployments, current error rate, current version) and starts a Claude session with that context pre-loaded. This eliminates the first 5-10 minutes of manual data collection that currently happens before any diagnosis begins."})]})}const he=Object.freeze(Object.defineProperty({__proto__:null,default:f},Symbol.toStringTag,{value:"Module"}));function y(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Hotfix Generation and Deployment"}),e.jsx("p",{children:"A hotfix is a code change that must be deployed to production as fast as possible to mitigate an active incident. The pressure is high, the risk is high, and the normal development workflow (feature branch, full review, staging deployment, approval gate) needs to be compressed without being bypassed entirely. The wrong hotfix can make an incident worse. The right hotfix compressed through a thoughtful fast-track process can resolve it in minutes."}),e.jsx("p",{children:"Claude excels at hotfix generation when given a clear description of the bug and a stack trace. It can identify the root cause, generate a targeted fix, write a regression test, and prepare the deployment in a fraction of the time it would take an engineer working alone under incident pressure. The engineer's role is to review the fix critically — under pressure, the temptation to accept without reading is highest, which is exactly when it must be resisted."}),e.jsx(s,{title:"Hotfix Process vs Normal Development Process",children:"A hotfix process is a deliberately simplified version of the normal development process, not an escape from it. Key differences: (1) smaller scope (fix only the immediate problem, not related issues), (2) faster review (two engineers, not full team), (3) direct to main (no staging gate, but smoke tests run immediately after), (4) accelerated but not skipped security check. What must never be skipped: code review, tests passing, and engineer accountability for the change."}),e.jsx(t,{title:"Hotfix from Stack Trace",tabs:[{label:"bash",language:"bash",filename:"generate-hotfix.sh",code:`#!/bin/bash
# Hotfix generation workflow
INCIDENT_ID=\${1:-"INC-UNKNOWN"}

echo "=== HOTFIX WORKFLOW: $INCIDENT_ID ==="

# Create hotfix branch from main
git fetch origin main
git checkout -b "hotfix/$INCIDENT_ID" origin/main

# Generate hotfix with Claude
claude "HOTFIX REQUIRED — Active production incident: $INCIDENT_ID

Stack trace from production error logs:
$(cat /tmp/incident-stack-trace.txt)

Affected code:
$(cat src/services/payment/PaymentProcessor.ts)

HOTFIX CONSTRAINTS (non-negotiable):
- Fix ONLY the error shown in the stack trace
- Do NOT refactor, do NOT fix related issues you notice
- Write ONE regression test that proves the bug is fixed
- The fix must be the minimum change that prevents the error
- Do not add new dependencies

Analysis required before writing code:
1. What is the exact line that is throwing the error?
2. What is the root cause (not just the symptom)?
3. What is the simplest possible fix?
4. Are there any edge cases the fix must handle?

After generating:
1. Write the regression test FIRST (in tests/)
2. Implement the fix
3. Run: npm test -- --testPathPattern='PaymentProcessor'
4. All tests must pass

Show me each step before executing."`}]}),e.jsx(t,{title:"Fast-Track Hotfix Review Process",tabs:[{label:"bash",language:"bash",filename:"hotfix-review.sh",code:`# After Claude generates the hotfix — structured review
claude "Review the hotfix diff before deployment.

Hotfix diff:
$(git diff origin/main...HEAD)

Security review (critical for hotfix — cannot skip):
1. Does this change introduce any new security vulnerabilities?
   Check: SQL injection, command injection, authentication bypass, path traversal
2. Does this change expose any sensitive data in logs or responses?
3. Does this change affect authentication or authorization logic?

Correctness review:
4. Does the fix address the root cause (not just the symptom)?
5. Could this fix cause a new failure in a different code path?
6. Are there race conditions or concurrent access issues introduced?

Test coverage:
7. Does the regression test actually reproduce the original bug?
8. Would the test fail if the fix were reverted?

Deployment risk:
9. Does this change require a database migration? (if yes, more careful review needed)
10. Does this change affect any shared infrastructure? (caches, queues)

VERDICT: SAFE TO DEPLOY / NEEDS MODIFICATION / UNSAFE (with explanation)

After review approval, run fast-track deployment:
$(cat docs/runbooks/hotfix-deployment.md | grep -A20 'Fast-track procedure')"`},{label:"yaml",language:"yaml",filename:".github/workflows/hotfix.yml",code:`name: Hotfix Fast-Track

on:
  push:
    branches:
      - 'hotfix/**'

jobs:
  # Hotfix pipeline — faster than normal CI, no staging gate
  hotfix-validate:
    name: Hotfix Validation
    runs-on: ubuntu-latest
    environment: hotfix-approval  # Requires 2 approvers in GitHub settings

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: testdb
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpass
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11

      - uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Type check (must pass)
        run: npx tsc --noEmit

      - name: Full test suite (must pass)
        run: npm test
        env:
          DATABASE_URL: postgresql://testuser:testpass@localhost:5432/testdb

      - name: Security scan
        run: |
          npm audit --audit-level=critical
          npx semgrep --config auto src/ --error

      - name: Notify on failure
        if: failure()
        run: |
          echo "::error::Hotfix validation FAILED — cannot deploy"
          # Notify incident channel

  hotfix-deploy-production:
    name: Deploy to Production
    needs: hotfix-validate
    runs-on: ubuntu-latest
    environment: production-hotfix  # Requires incident commander approval
    steps:
      - name: Deploy hotfix
        run: |
          aws ecs update-service             --cluster production             --service payment-api             --force-new-deployment
          
      - name: Smoke test
        run: |
          sleep 30
          curl -f https://api.production.example.com/health
          # Run the specific smoke test for the fixed functionality
          npm run test:smoke:payment`}]}),e.jsx("h2",{children:"Hotfix Communication Template"}),e.jsx(t,{title:"Incident Communication During Hotfix",tabs:[{label:"bash",language:"bash",filename:"hotfix-comms.sh",code:`# Generate stakeholder communication during hotfix
claude "Generate incident communication for the following hotfix deployment.

Incident: Payment failures affecting 40% of checkout attempts
Root cause: Stripe v10 API client sends malformed idempotency keys under load
Fix: Reverted to Stripe v9.14.0, added idempotency key generation fix for v10
Deployment time: ~5 minutes
Risk: Low (rollback to known-good version)

Generate three communications:

1. SLACK (#incidents channel — technical, real-time):
'🔴 INC-2024-001 UPDATE: Identified root cause — Stripe v10 idempotency key format issue.
Hotfix in deployment (ETA 5 min). Error rate currently 40%. Will update when resolved.'

2. STATUS PAGE (customer-facing — non-technical):
Title: 'Payment Processing — Investigating'
Body: We are investigating an issue affecting some payment transactions.
Our team has identified the cause and is deploying a fix.
Estimated resolution: 5 minutes. We apologize for the inconvenience.

3. MANAGEMENT SUMMARY (3 bullet points max):
- What happened
- Customer impact (quantified)
- Current status and ETA

Write all three. I will copy-paste them."`}]}),e.jsx(r,{title:"Hotfix Code Gets the Same Security Review as Normal Code",children:"The temptation during an incident is to skip security review in the name of speed. This temptation must be resisted. An attacker who knows you are in incident response mode may be deliberately creating the conditions for a hurried, unreviewed hotfix deployment. Security review of a hotfix diff takes 5 minutes — the time investment is trivially small compared to a secondary security incident caused by a rushed fix. Claude's security review checklist from this section runs in seconds. Use it."}),e.jsxs(a,{title:"Hotfix Branches From Main, Not From Feature Branches",children:["Always create hotfix branches from the current production commit, not from a feature branch that may contain unreleased changes. The hotfix should contain only the fix for the current incident. Verify before branching: ",e.jsx("code",{children:"git log --oneline origin/main"}),"shows the commit currently deployed to production. After the hotfix is deployed, cherry-pick it to your next release branch so it is not lost when that release deploys."]}),e.jsx(n,{type:"tip",title:"Regression Test Before Hotfix Deployment",children:"The regression test Claude writes for the hotfix serves two purposes: it verifies the fix works, and it prevents the same bug from recurring in future changes. After the incident is resolved, the regression test stays in the test suite permanently. When reviewing a hotfix, verify the regression test actually reproduces the bug: remove the fix temporarily, run the test, confirm it fails. If removing the fix doesn't fail the test, the test is not a regression test — it is a false sense of security."})]})}const ue=Object.freeze(Object.defineProperty({__proto__:null,default:y},Symbol.toStringTag,{value:"Module"}));function b(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Post-Incident Report Automation"}),e.jsx("p",{children:"Post-incident reviews (PIRs, also called post-mortems or retrospectives) are among the highest-value activities an engineering team can do — when done well. A blameless PIR that honestly examines what happened, why systems and processes failed, and what systemic improvements would prevent recurrence is how organizations get better at reliability over time."}),e.jsx("p",{children:"In practice, PIRs are often delayed (written a week after the incident when memory has faded), incomplete (the timeline reconstruction is approximate), and shallow (action items are vague or never completed). Claude can dramatically improve PIR quality by automating the mechanical parts — timeline reconstruction from logs and Slack history, Five Whys analysis, and action item extraction — leaving the human team to focus on the judgment work: interpretation, learning, and commitment."}),e.jsx(s,{title:"Blameless Culture and AI Analysis",children:"A blameless PIR attributes failures to systems, processes, and conditions rather than to individual mistakes. This is not about avoiding accountability — it is about recognizing that humans make mistakes in contexts shaped by systems, and changing the systems is more effective than blaming the humans. AI-generated PIRs reinforce blamelessness by default: Claude describes what happened in system terms, not human-fault terms. Review generated PIRs to ensure this framing is maintained and strengthen it where the draft implies individual blame."}),e.jsx(t,{title:"Automated PIR Generation",tabs:[{label:"bash",language:"bash",filename:"generate-pir.sh",code:`#!/bin/bash
# Generate PIR from incident artifacts
INCIDENT_ID=\${1:-"INC-2024-001"}

claude "Generate a post-incident review (PIR) for incident $INCIDENT_ID.

Incident artifacts:

1. Incident timeline log (from triage session):
$(cat docs/incidents/\${INCIDENT_ID}-timeline.md 2>/dev/null || echo 'Timeline not found')

2. Alert that triggered the incident:
$(cat /tmp/incident-alert.json 2>/dev/null || echo 'Alert data not available')

3. Commands run during incident (shell history):
$(cat /tmp/incident-commands.txt 2>/dev/null || echo 'Commands not captured')

4. Hotfix PR:
$(gh pr view $HOTFIX_PR_NUMBER --json title,body,reviews,mergedAt 2>/dev/null || echo 'PR not found')

5. Error rate timeline:
$(cat /tmp/error-rate-timeline.json 2>/dev/null || echo 'Metrics not available')

Generate: docs/incidents/\${INCIDENT_ID}-pir.md

PIR structure:

## Summary
- Incident ID, date, duration
- Severity (P0/P1/P2)
- Services affected
- User impact (quantified: X% of users, Y transactions affected)
- Time to detect / time to mitigate / time to resolve

## Timeline
Reconstruct precise timeline from artifacts:
| Time (UTC) | Event |
|-----------|-------|
Use exact timestamps from logs, not approximations.

## Root Cause Analysis
Apply Five Whys:
1. Why did the incident occur? (immediate cause)
2. Why did that happen? (contributing factor)
3. Why did that happen? (systemic cause)
4. Why did that happen? (process gap)
5. Why did that happen? (cultural/organizational factor)

## What Went Well
- Detection mechanisms that worked
- Response actions that were effective
- Team coordination that was effective

## What Could Be Improved
- Detection gaps (why wasn't this caught earlier?)
- Response gaps (what slowed mitigation?)
- Process gaps (what process failed or was missing?)

## Action Items
For each gap identified, a specific, assignable action:
| Action | Owner | Due Date | Priority |
Use SMART criteria: specific, measurable, achievable, relevant, time-bound

## Appendix
- Full error log excerpt
- Relevant metrics graphs (links to Datadog dashboards)"`}]}),e.jsx("h2",{children:"Five Whys Analysis with AI"}),e.jsx(t,{title:"Structured Five Whys Analysis",tabs:[{label:"bash",language:"bash",filename:"five-whys.sh",code:`# Deep root cause analysis using Five Whys
claude "Perform a Five Whys root cause analysis for this incident.

Incident: Payment service returned 40% error rate for 18 minutes
Immediate cause: Stripe v10 API client sent malformed idempotency keys under concurrent load

Five Whys analysis — ask 'Why?' for each answer to find the systemic root cause:

Why 1: Why did the Stripe v10 client generate malformed idempotency keys?
[Expected answer: The idempotency key format changed in v10, and our implementation
was not updated to use the new format]

Why 2: Why was the implementation not updated when the key format changed?
[Expected answer: We upgraded the Stripe client version without reading the migration guide
for the idempotency key format change]

Why 3: Why did we upgrade without reading the migration guide?
[Expected answer: Our upgrade process does not require reviewing changelogs before merging
dependency upgrades]

Why 4: Why does our upgrade process not require changelog review?
[Expected answer: We rely on automated dependency updates (Dependabot) without a gate
for reviewing semantic/behavioral changes in payment-critical libraries]

Why 5: Why do we not have a gate for payment-critical library upgrades?
[Expected answer: We have not classified dependencies by criticality, so payment libraries
get the same (low) review bar as logging libraries]

ROOT CAUSE: Lack of a dependency criticality classification system that would require
human changelog review for changes to payment-critical dependencies.

SYSTEMIC FIX: Define a list of critical dependencies in CLAUDE.md and require manual
changelog review before merging any upgrade to those dependencies.

Generate the action item: 
'Create critical dependency list and update Dependabot config to require human review
for upgrades to: stripe, jsonwebtoken, bcrypt, aws-sdk, pg, typeorm'"`}]}),e.jsx("h2",{children:"Action Item Tracking"}),e.jsx(t,{title:"Creating and Tracking PIR Action Items",tabs:[{label:"bash",language:"bash",filename:"create-action-items.sh",code:`# Extract and create JIRA tickets for PIR action items
claude "Extract action items from the PIR and create JIRA tickets.

PIR action items section:
$(grep -A 50 '## Action Items' docs/incidents/INC-2024-001-pir.md)

For each action item:
1. Assess if it is sufficiently specific to become a JIRA ticket
2. If vague, make it specific (e.g., 'improve monitoring' → 'Add Datadog alert for
   payment error rate > 2x baseline with 5-minute window and PagerDuty routing')
3. Assign to the correct team (based on the system/process it addresses)
4. Set priority: P0 (prevents recurrence of this exact incident), 
                 P1 (prevents similar incidents),
                 P2 (improves response time)

Create JIRA tickets using the JIRA MCP tool for each P0 and P1 action item.
For P2 items, add to the team's backlog directly.

After creating tickets, update docs/incidents/INC-2024-001-pir.md with the JIRA links:
| Action | Owner | JIRA | Due Date | Priority |
|--------|-------|------|----------|----------|"`}]}),e.jsx("h2",{children:"PIR Metrics and Learning Culture"}),e.jsx(t,{title:"Incident Trend Analysis Across PIRs",tabs:[{label:"bash",language:"bash",filename:"incident-trends.sh",code:`# Quarterly incident trend analysis
claude "Analyze incident trends from the last 90 days of PIRs.

PIR documents: docs/incidents/
Find all PIRs from last 90 days: find docs/incidents/ -name '*-pir.md' -newer $(date -d '90 days ago' +%Y-%m-%d)

For each PIR, extract:
- Service affected
- Root cause category (deployment, dependency, configuration, capacity, external service, code bug)
- Detection method (alert fired, user report, manual observation)
- Time to detect
- Time to mitigate
- Recurrence (has this root cause category occurred before?)

Generate a trend report:

## Q4 2024 Incident Trends

### Summary
- Total incidents: X
- Total user-impact time: Y hours
- Most affected service: Z
- Average time to detect: X minutes
- Average time to mitigate: Y minutes

### Root Cause Distribution
[Chart as ASCII table]

### Systemic Issues
Issues that appeared in multiple incidents:

### Action Item Completion
Previous quarter's P0/P1 action items: X total
Completed: Y (%)
Overdue: Z

### Recommendations
Top 3 investments that would most reduce future incident impact"`}]}),e.jsx(r,{title:"PIRs Must Not Be Performance Reviews in Disguise",children:'The blameless culture principle is undermined when PIR action items are framed as individual performance issues or when PIR documents are visible to management during performance review cycles. Protect the psychological safety of PIR participation: PIR documents should be team-internal, action items should target systems and processes, and language like "Engineer X should have caught this" should be revised to "The code review checklist did not include checks for breaking changes in payment-critical libraries." Claude-generated PIRs should be reviewed for inadvertent blame language before being shared.'}),e.jsx(a,{title:"PIR Within 48 Hours, Not 2 Weeks",children:"PIRs lose value rapidly as memories fade, context is lost, and the team moves on. Establish a norm that PIR drafts are generated within 24 hours of incident resolution and reviewed within 48 hours. Claude's ability to reconstruct timelines from log artifacts reduces the effort barrier for early PIR generation. The draft does not need to be perfect — get the timeline down, form the hypotheses, and schedule a 45-minute team review within two days while the details are fresh."}),e.jsx(n,{type:"tip",title:"Share PIRs Broadly for Organizational Learning",children:`The value of a PIR multiplies when it is shared beyond the immediate incident team. A monthly "PIR digest" shared with all engineering teams surfaces patterns across services and prevents the same mistake being made in parallel by teams who don't know each other. Ask Claude to generate a monthly digest: "Summarize the 3-5 key learnings from this month's PIRs, written for engineers who were not involved in these incidents. Focus on the systemic insights and action items that could prevent similar incidents in other services."`})]})}const me=Object.freeze(Object.defineProperty({__proto__:null,default:b},Symbol.toStringTag,{value:"Module"}));function v(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"AI Usage Policy"}),e.jsx("p",{children:"Organizations deploying AI coding assistants at scale need a formal AI usage policy — not as a bureaucratic control, but as a framework that enables engineers to use AI confidently within boundaries that protect the organization, its customers, and its engineers. Without policy, engineers either self-censor (avoiding AI because they are uncertain what is allowed) or overreach (sharing customer data with AI assistants without considering the implications)."}),e.jsx("p",{children:"An effective AI usage policy is specific enough to be actionable, honest about the reasons for each constraint, and written by people who understand both the capabilities and the risks of AI assistants. It is not a blanket prohibition or a blanket approval — it is a nuanced framework that maximizes legitimate AI use while preventing the harms that justify the constraints."}),e.jsx(s,{title:"Policy Principles",children:"A good AI usage policy is built on three principles: (1) Proportionality — the restrictions are proportional to the risk (high restrictions for customer PII, lower restrictions for internal tooling), (2) Clarity — engineers know exactly what is and isn't allowed without consulting legal, and (3) Enforcement — the policy includes technical controls where possible, not just rules that depend entirely on individual compliance."}),e.jsx(t,{title:"AI Usage Policy Template",tabs:[{label:"yaml",language:"yaml",filename:"docs/policy/ai-usage-policy.md",code:`# AI Coding Assistant Usage Policy
Version: 1.2 | Effective: 2024-01-01 | Owner: Engineering Leadership
Review cycle: Quarterly

## Purpose
This policy governs the use of AI coding assistants (Claude Code, GitHub Copilot,
Cursor, and similar tools) in engineering work at [Organization]. It enables engineers
to capture the productivity benefits of AI assistance while protecting customer data,
intellectual property, and security.

## Approved AI Tools
- Claude Code (primary, enterprise license with data residency in EU)
- GitHub Copilot (secondary, for IDE inline completion only)

## What You May Do
- Use AI assistants to write, review, and refactor code
- Ask AI to explain unfamiliar code, APIs, or concepts
- Generate tests, documentation, and boilerplate
- Debug errors and analyze stack traces
- Generate infrastructure code, pipeline configs, runbooks

## Prohibited Data — NEVER Include in AI Prompts
The following data types must never be pasted into an AI assistant prompt:

HIGH RISK (immediate disciplinary action):
- Customer PII: names, emails, addresses, phone numbers
- Customer financial data: card numbers, bank accounts, transaction history
- Authentication credentials: passwords, API keys, tokens, secrets
- Regulated health data (PHI): any patient health information
- Proprietary algorithms or unreleased product specifications

MEDIUM RISK (requires manager approval before use):
- Anonymized customer data (even without direct identifiers)
- Source code from acquired companies under NDA
- Internal product roadmap documents

ALLOWED (no approval needed):
- Your own code and the organization's internal source code
- Sanitized/synthetic data that has no connection to real customers
- Publicly available information

## Code Review Requirements
All AI-generated code must be reviewed by the engineer who will submit it.
'Claude wrote it' is not a substitute for review.
Specific review requirements:
- Security-sensitive code: review by qualified security engineer
- Payment processing code: review by payments team + security
- Infrastructure changes: review by DevOps team

## Intellectual Property
- AI-generated code in your work product belongs to [Organization]
- Do not paste competitor code or third-party proprietary code into AI tools
- Understand: AI training data may include open-source code; review generated code for
  accidental license-incompatible reproduction

## Compliance
- GDPR/HIPAA: prohibitions on customer data above apply with particular force
- SOC 2: AI tool access is logged (via Claude Code audit log integration)
- Security incidents: if you accidentally share prohibited data with an AI tool,
  report to security@example.com immediately

## Enforcement
- Technical: Claude Code API usage logged centrally for audit
- Process: Code review includes AI usage declaration in PR description
- Disciplinary: violations of PII/credential prohibitions escalate to HR`}]}),e.jsx(t,{title:"Generating a Policy with Claude",tabs:[{label:"bash",language:"bash",filename:"generate-policy.sh",code:`# Use Claude to draft an AI usage policy for your organization
claude "Draft an AI coding assistant usage policy for our organization.

Organization context:
- Industry: Financial services (regulated)
- Company size: 200 engineers
- Regulatory requirements: PCI-DSS (payment processing), GDPR (EU customers)
- Current AI tools: Claude Code (enterprise), GitHub Copilot
- Data sensitivity: customer financial data, transaction history, PII
- Existing security policies: docs/security/data-classification-policy.md

Policy requirements:
1. Clear rules on what data can/cannot be shared with AI tools
2. Code review requirements for AI-generated code
3. Tool approval process (how to request access to new AI tools)
4. Incident reporting procedure for accidental data exposure
5. Enforcement mechanisms (technical + process)

Write the policy in plain language that engineers will actually read.
Avoid legal jargon where possible — use 'you must not' rather than 'prohibited by policy'.
Include a 'Quick Reference' section at the top with the 5 most important rules.
Target length: 2-4 pages, not 20 pages.

After drafting: identify any sections that should be reviewed by legal counsel
before publication."`}]}),e.jsx("h2",{children:"Policy Communication and Training"}),e.jsx(t,{title:"Policy Training Materials",tabs:[{label:"bash",language:"bash",filename:"generate-training.sh",code:`# Generate policy training scenarios for onboarding
claude "Generate 10 scenario-based training questions for our AI usage policy.

Each scenario should:
1. Present a realistic situation engineers might encounter
2. Be ambiguous enough to require thinking (not obviously right/wrong)
3. Have a clear correct answer based on our policy
4. Include an explanation of why the answer is correct

Example format:
---
Scenario: You are debugging a payment processing bug and need to paste the relevant
code into Claude Code. The code references a database query that includes a customer's
transaction history by customer_id (a UUID).

Question: Is it acceptable to include this code in your Claude Code prompt?

Answer: YES — customer_id (UUID) without accompanying PII is acceptable. The UUID alone
cannot identify a specific customer without access to the mapping database. However,
do not include actual transaction amounts, dates, or any data that combined with the
UUID could identify a customer.
---

Topics to cover:
- Customer PII in debugging sessions
- Stack traces that contain email addresses
- Testing with production data
- Sharing competitor analysis with AI
- Storing AI-generated code without review
- Using AI for security-sensitive changes",`}]}),e.jsx(r,{title:"Policy Must Come From Leadership, Not Just Security",children:`An AI usage policy that is perceived as a security team's attempt to restrict engineers will be ignored or worked around. The most effective policies are written collaboratively between security, legal, and engineering leadership — and explicitly acknowledge the productivity benefits engineers get from AI tools. Frame restrictions as protecting engineers and the organization, not as distrust of engineers. "We prohibit pasting customer PII into AI tools because it may violate our data processing agreements and could expose us to GDPR fines" is more compelling than "prohibited by security policy."`}),e.jsx(a,{title:"Review Quarterly, Not Annually",children:'AI capabilities and risks evolve faster than annual policy review cycles. The tools available in Q1 2025 are significantly different from Q4 2024, and the policy needs to keep pace. Schedule quarterly policy reviews that cover: what new AI tools engineers are using (officially or not), whether any incidents have occurred that reveal policy gaps, and whether the approved tool list needs updating. Use Claude to assist in the review: "Compare our current AI usage policy against new capabilities in Claude 3.5 and identify any policy sections that should be updated."'}),e.jsx(n,{type:"tip",title:"Technical Controls Outperform Rules Alone",children:"Policy rules that depend entirely on individual compliance will be violated — not from malice, but from time pressure, habit, and context switching. Add technical controls wherever possible: configure Claude Code to refuse prompts that match credit card number patterns, use DLP (Data Loss Prevention) tools to scan for PII before it leaves the corporate network, and log AI tool usage centrally for audit. Technical controls catch accidents that rules alone cannot."})]})}const pe=Object.freeze(Object.defineProperty({__proto__:null,default:v},Symbol.toStringTag,{value:"Module"}));function w(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"AI Engineering Center of Excellence"}),e.jsx("p",{children:"When AI coding assistants are deployed across a large engineering organization, two failure modes emerge. In the first, adoption is siloed: some teams use AI extensively and develop effective patterns, others don't use it at all, and the organization's AI capability is fragmented and uneven. In the second, adoption is ungoverned: everyone uses AI, but each team develops its own patterns, CLAUDE.md conventions, slash commands, and quality gates independently — resulting in duplicated effort and inconsistent outcomes."}),e.jsx("p",{children:"An AI Engineering Center of Excellence (CoE) addresses both failure modes. It creates shared infrastructure (organization-wide CLAUDE.md templates, slash command libraries, MCP servers, quality gate standards) that all teams can use, while establishing the governance model that ensures consistent, compliant AI use. It also creates a community of practice where teams share patterns, learnings, and tools."}),e.jsx(s,{title:"CoE vs. Centralized Control",children:"An AI Engineering CoE operates on the enabling team model, not the centralized control model. Its job is to build shared tooling and patterns that reduce the cost of doing AI development correctly — making the right path the easy path. It does not mandate how teams use AI in their day-to-day work (that would create a bottleneck and resentment). It mandates the boundaries (security, compliance, quality gates) and enables teams to move fast within those boundaries."}),e.jsx(t,{title:"CoE Shared CLAUDE.md Template",tabs:[{label:"yaml",language:"yaml",filename:"templates/CLAUDE.md (org-wide base)",code:`# [Organization] Engineering Standards — CLAUDE.md Base Template
# This template is maintained by the AI Engineering CoE
# Version: 2024-Q4 | Last updated: 2024-12-01
# Import into project-specific CLAUDE.md: @include base-standards.md

## Non-Negotiable Security Rules (enforced by SAST + security gates)
- Never store credentials in code: use AWS Secrets Manager or environment variables
- SQL: parameterized queries ONLY (Prisma, TypeORM ORMs enforce this; raw queries forbidden)
- Auth: JWT in httpOnly cookies ONLY — never localStorage
- Passwords: bcrypt cost >= 12 — never MD5, SHA1, SHA256 raw
- Input validation: Zod/Joi schema validation on ALL external inputs before processing
- CSRF protection: SameSite=Strict + CSRF token on all state-changing endpoints
- Rate limiting: every auth endpoint requires rate limiting (max 5/min per IP)
- Secrets scanning: gitleaks pre-commit hook is mandatory

## Code Quality Standards
- Test coverage: new code must not decrease coverage below current baseline
- Complexity: functions > 15 cyclomatic complexity require refactoring before PR
- Type safety: TypeScript strict mode, no 'any' type without explicit justification comment
- Linting: ESLint + Prettier, zero lint errors before PR review

## AI Development Standards
- SAST runs in every Claude Code session (semgrep --config auto)
- Tests written before implementation for all business logic (AI-TDD)
- Every AI-generated function must have a test
- Architecture conformance: depcruise check before PR

## Org-Specific Tools and Patterns
- JIRA integration: /analyze-ticket command for story analysis
- Internal MCP: jira-mcp, confluence-mcp, vault-mcp available in enterprise setup
- Custom slash commands: see /docs/ai-engineering/slash-commands.md
- ADR template: /write-adr command

## What This Template Does NOT Cover
- Language-specific patterns (add in your project's CLAUDE.md)
- Service-specific architecture decisions (add in your project's CLAUDE.md)
- Team-specific conventions (add in your project's CLAUDE.md)`}]}),e.jsx(t,{title:"Shared Slash Command Library",tabs:[{label:"bash",language:"bash",filename:"setup-org-slash-commands.sh",code:`# Install org-wide slash command library
# These are maintained by the AI Engineering CoE and available to all engineers

mkdir -p ~/.claude/commands

# Download from internal package registry
npm install @acme-corp/claude-commands --global

# Or clone from internal git
git clone git://git.internal.acme.com/ai-engineering/claude-commands ~/.claude/commands/acme

# Available org-wide commands:
cat ~/.claude/commands/acme/security-scan.md
# /security-scan — Run full security audit: semgrep + npm audit + gitleaks

cat ~/.claude/commands/acme/analyze-ticket.md  
# /analyze-ticket [JIRA-ID] — Fetch ticket, extract acceptance criteria, create test plan

cat ~/.claude/commands/acme/write-adr.md
# /write-adr — Generate Architecture Decision Record from current context

cat ~/.claude/commands/acme/generate-tests.md
# /generate-tests [file] — Generate comprehensive test suite for specified file

cat ~/.claude/commands/acme/pr-review.md
# /pr-review — Run AI code review: security, conformance, coverage check

cat ~/.claude/commands/acme/incident-triage.md
# /incident-triage [INCIDENT-ID] — Start structured incident triage session

# List all available commands
ls ~/.claude/commands/acme/`},{label:"yaml",language:"yaml",filename:"commands/security-scan.md (slash command)",code:`Run a comprehensive security scan on the current codebase changes.

Steps:
1. SAST scan with semgrep:
   npx semgrep --config auto src/ --json > /tmp/semgrep-results.json
   
2. Dependency audit:
   npm audit --json > /tmp/npm-audit.json
   
3. Secret detection:
   gitleaks detect --source . --log-opts="origin/main..HEAD" --json > /tmp/gitleaks.json 2>/dev/null

4. Architecture check:
   npx depcruise src/ --config .dependency-cruiser.js --output-type err 2>/dev/null

Analyze all results and report:
- CRITICAL findings (must fix before PR): list with file, line, description, fix
- HIGH findings (should fix before PR): list with file, line, description, fix
- MEDIUM findings (add to tech debt register): list
- Architecture violations: list

If any CRITICAL findings: DO NOT proceed until fixed.
If zero findings: report 'Security scan PASSED — no issues found.'`}]}),e.jsx("h2",{children:"Governance Model"}),e.jsx(t,{title:"CoE Governance Structure",tabs:[{label:"yaml",language:"yaml",filename:"docs/ai-engineering/governance.md",code:`# AI Engineering CoE Governance

## Structure

### Core Team (full-time CoE members)
- AI Engineering Lead (technical strategy, tool evaluation, standards)
- DevOps/Platform Engineer (MCP servers, CI/CD integration, tooling)
- Security Engineer (security standards, policy, SAST rules)

### Community of Practice (representatives from each team)
- One AI champion per engineering team (volunteer, 20% time)
- Monthly community meetings: share patterns, report adoption blockers
- Quarterly all-hands: celebrate wins, share learnings

## Decision Authority

### CoE decides (no team vote needed):
- Security requirements in base CLAUDE.md
- Approved AI tool list
- Compliance controls

### CoE proposes, community votes:
- New shared slash commands
- Changes to code quality standards
- New MCP server integrations

### Teams decide independently:
- Project-specific CLAUDE.md additions
- Team-level conventions and patterns
- How much AI assistance to use for specific tasks

## Change Process for Base CLAUDE.md
1. Engineer proposes change (GitHub issue in ai-engineering/standards repo)
2. CoE reviews for security/compliance implications
3. Community vote (2-week comment period)
4. CoE implements and publishes new version
5. Teams receive automated PR to update their base template import

## SLA for Teams
- New slash command requests: reviewed within 5 business days
- Security exception requests: reviewed within 2 business days
- Tool evaluation requests: reviewed within 10 business days`}]}),e.jsx(r,{title:"Avoid the Ivory Tower Trap",children:'A CoE that is perceived as distant from daily engineering work will be ignored. CoE team members should spend at least 20% of their time embedded in product teams, using the tools they maintain, experiencing the friction points they need to address. The best improvements to org-wide tooling come from engineers who use those tools daily. Build feedback loops: a monthly survey asking "What friction are you experiencing with AI development?" and a Slack channel where teams can report tooling issues in real time.'}),e.jsx(a,{title:"Measure CoE Value in Engineer Hours Saved",children:'CoEs are sometimes seen as overhead. Counter this by measuring and reporting the value delivered: how many engineer-hours were saved by the shared slash command library this quarter? How many security findings were caught by the org-wide SAST rules before they reached production? How much faster do new engineers reach productivity with the org-wide CLAUDE.md template vs. without it? Ask Claude to help measure this: "Analyze our JIRA data for the last quarter and estimate the engineer hours saved by CoE tooling, using these assumptions about time-per-finding-caught and time-per-command-used."'}),e.jsx(n,{type:"tip",title:"Inner-Source the AI Engineering Tooling",children:`Treat the CoE's tooling (slash commands, CLAUDE.md templates, MCP servers) as inner-source projects: published in an internal package registry, documented, versioned with changelogs, and open to contributions from any engineer in the organization. Engineers who contribute improvements to shared tooling should be recognized — this behavior creates multiplier effects where one engineer's workflow improvement benefits the entire organization. Set up a monthly "tools spotlight" to highlight engineer contributions to the shared library.`})]})}const ge=Object.freeze(Object.defineProperty({__proto__:null,default:w},Symbol.toStringTag,{value:"Module"}));function x(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Measuring AI Impact"}),e.jsx("p",{children:`"We're getting 10x productivity" is a claim frequently made about AI coding assistants and almost never measured rigorously. This creates a credibility problem: organizations that make inflated claims face skepticism from engineers and leadership alike, and when the expected productivity gains don't materialize uniformly, the entire AI adoption initiative loses support.`}),e.jsx("p",{children:"Vibe Engineering takes a metrics-driven approach to AI adoption measurement. The goal is honest assessment: what measurable improvements are attributable to AI-assisted development, and what improvements are attributable to other factors? Some gains will be large and attributable. Others will be difficult to isolate. Measuring honestly, even when the results are mixed, builds the trust needed for sustained AI adoption."}),e.jsx(s,{title:"DORA Metrics as the Baseline",children:"The DORA (DevOps Research and Assessment) metrics — Deployment Frequency, Lead Time for Changes, Change Failure Rate, and Time to Restore Service — are the most widely validated measures of software delivery performance. They provide an objective baseline against which AI adoption impact can be measured. A team that was deploying weekly and moves to daily deployments after AI adoption has a measurable change. A team whose change failure rate increased after AI adoption has a signal that warrants investigation."}),e.jsx(t,{title:"DORA Metrics Measurement",tabs:[{label:"bash",language:"bash",filename:"measure-dora.sh",code:`# Measure DORA metrics for AI impact assessment
claude "Calculate our DORA metrics for the last 90 days.

Data sources:
1. GitHub deployments API (production deployments):
   gh api repos/:owner/:repo/deployments --jq '[.[] | select(.environment == "production")] | length'

2. Pull request data (for lead time):
   gh pr list --state merged --base main --limit 100 --json number,createdAt,mergedAt,title

3. Incident data (for MTTR and change failure rate):
   cat docs/incidents/*.pir.md | grep -E 'Date:|Severity:|Duration:|Triggered by deployment:'

Calculate:

DEPLOYMENT FREQUENCY:
- Production deployments in last 90 days: [count]
- Daily average: [count / 90]
- DORA classification: Elite (multiple/day), High (1/day-1/week), Medium (1/week-1/month), Low (<monthly)

LEAD TIME FOR CHANGES:
- For each PR merged to main: time from first commit to production deployment
- Median lead time: [median]
- DORA classification: Elite (<1hr), High (1hr-1day), Medium (1day-1week), Low (>1week)

CHANGE FAILURE RATE:
- Deployments that required hotfix or rollback / total deployments
- Target: Elite < 5%, High 5-10%, Medium 10-15%, Low > 15%

MEAN TIME TO RESTORE:
- For each production incident: time from detection to resolution
- Median MTTR: [median]
- DORA classification: Elite (<1hr), High (<1day), Medium (<1week), Low (>1week)

Report baseline metrics. We will re-measure in 90 days after AI adoption to assess delta."`}]}),e.jsx(t,{title:"AI-Specific Metrics Dashboard",tabs:[{label:"bash",language:"bash",filename:"ai-metrics.sh",code:`# Collect AI-specific metrics from Claude Code usage logs
claude "Analyze Claude Code usage data and generate an AI impact report.

Claude Code audit logs: ~/.claude/logs/ (or organization's central log storage)
GitHub PR data for the last 30 days with AI usage tag

AI Usage Metrics:
1. Active users: how many engineers used Claude Code at least once this week?
2. Session frequency: average sessions per engineer per day
3. Task distribution: what types of tasks are engineers using Claude for?
   (code generation, code review, test writing, debugging, documentation)
4. Acceptance rate: what % of Claude suggestions are accepted (from VS Code telemetry)

Code Quality Metrics (compare AI-assisted vs non-AI-assisted PRs):
5. Defect rate: bugs reported per PR for AI-assisted vs non-AI-assisted features
6. Test coverage: average test coverage for AI-assisted vs non-AI-assisted code
7. Security findings: SAST findings per 1000 lines in AI-assisted vs non-AI-assisted code
8. Review cycles: average number of review cycles before merge (AI vs non-AI)

Productivity Metrics:
9. PR throughput: PRs merged per engineer per week (before/after AI adoption)
10. Cycle time: PR open to merge time for AI-assisted vs non-AI-assisted
11. Time allocation: estimated hours saved on test writing, documentation, boilerplate

ROI Calculation:
Given:
- Average engineer fully-loaded cost: $200/hour
- Claude Code cost: $X/month per engineer
- Hours saved per engineer per month (from surveys + time studies): Y hours
- ROI = (Y hours * $200) / (Claude Code cost + hours spent on AI governance)

Report format: executive summary with 5 headline numbers, then detailed metrics"`}]}),e.jsx("h2",{children:"Measuring Quality, Not Just Speed"}),e.jsx(t,{title:"AI Code Quality Assessment",tabs:[{label:"bash",language:"bash",filename:"ai-quality-assessment.sh",code:`# Assess whether AI-generated code meets quality bar
claude "Perform a quality assessment on AI-generated code from the last sprint.

Identify AI-generated PRs:
- PRs with 'AI-assisted' label in GitHub
- PRs where commit messages reference Claude Code

For a sample of 10 AI-assisted PRs:
Analyze each for:

1. TEST QUALITY
   - Do tests verify behavior (not just achieve coverage)?
   - Are there meaningful assertions (not just 'toBeDefined')?
   - Are edge cases covered?

2. SECURITY
   - Run semgrep against the changed files
   - Count and categorize findings

3. ARCHITECTURE CONFORMANCE
   - Run depcruise against the changed files
   - Does the code follow the layered architecture?

4. CODE READABILITY
   - Are functions focused (do one thing)?
   - Are variable names descriptive?
   - Is business logic documented with comments where non-obvious?

5. DOCUMENTATION
   - Are public APIs documented?
   - Are complex algorithms explained?

Score each PR on a 1-5 scale for each dimension.
Compare average scores to non-AI-assisted PRs from the same period.
Identify the quality dimensions where AI-assisted code is better/worse.
Recommend process adjustments for areas where AI-assisted code is weaker."`}]}),e.jsx(r,{title:"Vanity Metrics vs. Actionable Metrics",children:"Lines of code generated per day, number of AI sessions, and suggestion acceptance rate are vanity metrics — they measure AI activity, not AI value. A team that generates 10,000 AI-written lines of untested, insecure code has high AI activity and negative AI value. Focus measurement on outcomes: defect rate, deployment frequency, lead time, and team-reported productivity satisfaction. These measure whether AI adoption is actually improving software delivery performance."}),e.jsx(a,{title:"Controlled Experiments for Attribution",children:"To attribute improvements to AI rather than other factors (process changes, team growth, simpler features), run controlled experiments. Have two teams with similar complexity work on comparable features — one with AI assistance, one without — and compare lead time, defect rate, and quality metrics. Or use a before/after comparison with a control: team A adopts AI in Q1, team B adopts AI in Q2. Compare team A's metrics change in Q1 vs. team B's change in Q1 (baseline for non-AI changes). This attribution is imperfect but better than anecdote."}),e.jsx(n,{type:"tip",title:"Survey for Qualitative Impact",children:'Quantitative metrics capture some AI impact but miss the qualitative dimensions that matter most to engineers: reduced cognitive fatigue, faster learning, more enjoyment of complex problem-solving, reduced context-switching overhead. Run a quarterly engineer experience survey with questions like: "How has AI assistance changed the cognitive demands of your work?" and "What types of tasks do you now complete with more confidence?" Ask Claude to analyze survey results and identify themes: "Analyze these 50 survey responses and identify the top 5 themes in how engineers describe AI impact on their work experience."'})]})}const fe=Object.freeze(Object.defineProperty({__proto__:null,default:x},Symbol.toStringTag,{value:"Module"}));function A(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Governance, Cost, and Risk Management"}),e.jsx("p",{children:"Scaling AI coding assistant adoption from a pilot with ten engineers to a program with hundreds introduces governance, cost, and risk management challenges that are not present at the individual level. Token costs that are negligible for one engineer become significant at scale. Risks that are manageable for occasional use (data exposure, IP contamination, model hallucinations) require systematic controls at scale. And the organizational changes required for effective AI adoption — new roles, new processes, new skills — require change management discipline."}),e.jsx("p",{children:"Vibe Engineering organizations treat AI adoption as a program to be managed, not just a tool rollout. This means budget management, risk frameworks, intellectual property policies, and governance structures that scale with the organization."}),e.jsx(s,{title:"Token Governance as Cloud Cost Management",children:"AI API costs scale with usage in ways that are less visible than traditional compute costs. A single poorly-scoped prompt that sends 100,000 tokens of context to the API costs more than a hundred efficiently-scoped prompts. Organizations deploying Claude Code at scale need the same cost governance they apply to AWS or Azure spend: budgets, alerts, cost attribution by team, and optimization guidance that helps engineers use AI efficiently."}),e.jsx(t,{title:"Token Usage Monitoring and Budget Management",tabs:[{label:"bash",language:"bash",filename:"token-governance.sh",code:`# Set up token usage monitoring for the organization
claude "Design a token governance system for our Claude Code deployment.

Current usage:
- 50 engineers using Claude Code
- Anthropic API key shared via enterprise proxy
- Current monthly spend: $X (from last invoice)
- No per-team visibility or limits

Design required:

1. COST ATTRIBUTION
   - How to attribute token usage to individual engineers and teams
   - Options: per-user API keys, proxy with header-based attribution, audit log parsing
   - Recommendation with implementation details

2. BUDGET ALERTS
   - Daily spend alert: >$X triggers Slack notification to FinOps team
   - Weekly team report: each team lead receives their team's usage
   - Monthly forecast: project end-of-month spend based on daily trend

3. USAGE OPTIMIZATION RULES (add to org CLAUDE.md)
   - Context window efficiency: include only relevant code, not entire files
   - Prefer focused prompts over broad exploration prompts
   - Use --continue for follow-up questions in same session (reduces context reload)
   - Archive completed sessions (frees context for new work)

4. BUDGET POLICY
   - Team monthly budget: allocated based on team size and complexity
   - Overage process: engineer reviews with team lead, adjust limit if justified
   - No hard cutoffs that would interrupt incident response

Generate:
- Implementation plan for option 1 (cost attribution)
- Alert configuration for option 2
- Policy document for option 4"`},{label:"yaml",language:"yaml",filename:"CLAUDE.md (token efficiency)",code:`## Claude Code Session Efficiency Guidelines

### Context Window Management
- Include only relevant files in context — do not paste entire codebases
- For large files, include only the functions/classes relevant to the current task
- Reference file paths for context Claude can read itself vs. pasting content directly
- Close and start fresh sessions when switching to unrelated tasks

### Prompt Efficiency
- Be specific about scope: 'Add error handling to the processPayment() function'
  is more efficient than 'Review the payment code and suggest improvements'
- Include expected output format to reduce back-and-forth
- Ask Claude to plan before implementing for complex tasks (reduces failed attempts)

### Session Management
- Use --continue flag to stay in the same session for related follow-up questions
- Start a new session when context has drifted (errors mentioning irrelevant code)
- Save session transcripts for debugging and knowledge capture

### Cost-Aware Patterns
- Use claude with specific file paths rather than 'look at everything'
- For exploratory sessions, use a focused sample rather than all files
- Request summaries rather than full output when you need an overview`}]}),e.jsx("h2",{children:"Intellectual Property Risk Management"}),e.jsx(t,{title:"IP Risk Policy and Technical Controls",tabs:[{label:"yaml",language:"yaml",filename:"docs/policy/ai-ip-policy.md",code:`# AI and Intellectual Property Policy

## What Claude Code Generates Is Ours
Code generated by Claude Code as part of your work product belongs to [Organization].
Anthropic's enterprise agreement includes IP indemnification for Claude-generated code.

## License Contamination Risk
AI models are trained on public code that includes open-source code under various licenses.
There is a theoretical risk that Claude could reproduce open-source code verbatim in
a way that creates a license obligation.

Mitigation approach:
1. Claude Code by default does not reproduce long verbatim passages of training data
2. For any generated function > 50 lines that looks "too clean" or "too standard",
   run it through our license scanner: 
   npx licensee-check generated-file.ts
3. All generated code undergoes code review — reviewers should flag anything that
   looks like it could be from a known open-source project

## Competitor Code Prohibition
NEVER paste code, architecture documents, or technical specifications from:
- Competitors or potential acquisition targets
- Third parties under NDA
- Code you have obtained through unauthorized means

This includes: screenshots of competitor code, decompiled binaries, leaked source code.
Doing so could create legal liability regardless of what Claude does with the input.

## Trade Secret Inputs
When working on proprietary algorithms or unreleased features:
- Use Claude Code without including the proprietary algorithm in the prompt
- Describe the algorithm abstractly if you need AI assistance with surrounding code
- Consult legal before pasting unreleased product specifications into any AI tool

## Enterprise Agreement Coverage
Our Claude Code enterprise agreement includes:
- Data residency in EU (required for GDPR)
- No training on our prompts or outputs
- IP indemnification
- SOC 2 Type II certification

See: docs/vendor/anthropic-enterprise-agreement-summary.md`}]}),e.jsx("h2",{children:"Risk Register for AI Adoption"}),e.jsx(t,{title:"AI Risk Assessment and Mitigation",tabs:[{label:"bash",language:"bash",filename:"ai-risk-assessment.sh",code:`# Generate AI adoption risk register
claude "Generate a risk register for our AI coding assistant program.

For each risk category below, assess:
- Likelihood (High/Medium/Low)
- Impact (High/Medium/Low)
- Current controls
- Recommended additional controls

Risk categories:

1. DATA EXPOSURE
   Risk: Engineers paste customer PII or credentials into AI prompts
   
2. SECURITY VULNERABILITIES
   Risk: AI-generated code introduces security vulnerabilities that pass review
   
3. MODEL HALLUCINATION
   Risk: Claude generates plausible but incorrect code that passes tests 
   but fails in edge cases
   
4. VENDOR DEPENDENCY
   Risk: Heavy reliance on Anthropic creates concentration risk (API changes, pricing,
   service availability)
   
5. SKILL ATROPHY
   Risk: Engineers lose ability to write code without AI assistance, reducing
   team capability when AI is unavailable

6. INTELLECTUAL PROPERTY
   Risk: AI-generated code reproduces open-source code in ways that create license obligations
   
7. REGULATORY COMPLIANCE
   Risk: AI outputs in regulated domains (medical, financial) are incorrect and acted upon
   
8. COST OVERRUN
   Risk: Token costs escalate beyond budget as usage scales

Format as a risk register table with columns:
Risk | Likelihood | Impact | Risk Score | Current Controls | Additional Controls | Owner"`}]}),e.jsx(r,{title:"Skill Atrophy Is a Real Organizational Risk",children:"Over-reliance on AI coding assistance can reduce engineers' ability to reason about code independently — a skill that remains essential when AI tools are unavailable (during incidents with network issues, for extremely sensitive contexts where AI cannot be used, or when a specific problem is outside AI's capability). Organizations should ensure engineers maintain fundamental coding skills through deliberate practice: code review of AI-generated code (requires reading and understanding code), algorithmic problem-solving sessions without AI, and periodic design discussions where AI is not the first tool reached for."}),e.jsx(a,{title:"Multi-Vendor Strategy for Resilience",children:"Dependence on a single AI provider creates concentration risk. A Anthropic API outage or a significant pricing change could disrupt the entire engineering organization. Build resilience through: (1) evaluating multiple tools annually (Claude Code, GitHub Copilot, Cursor), (2) maintaining the ability to work without AI for critical workflows, (3) documenting AI-specific process dependencies in your business continuity plan. This is not about distrusting Anthropic — it is the same portfolio approach applied to any critical vendor."}),e.jsx(n,{type:"tip",title:"Quarterly Business Review for AI Program",children:"Treat your AI coding assistant program like any significant technology investment: run a quarterly business review that covers spend vs. budget, measured impact vs. targets, open risks and their mitigation status, and upcoming changes (new capabilities, policy updates, pricing changes). Include both engineering leadership and finance. This keeps the program accountable, surfaces problems before they escalate, and demonstrates the organizational maturity that justifies continued investment in AI-assisted engineering."})]})}const ye=Object.freeze(Object.defineProperty({__proto__:null,default:A},Symbol.toStringTag,{value:"Module"}));function k(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Requirements Discovery"}),e.jsx("p",{children:"The quality of AI-generated code is bounded by the quality of its specification. A vague requirement produces code that may technically satisfy the words while missing the intent entirely. Requirements discovery — eliciting, clarifying, and structuring requirements — is one of the highest-leverage activities in Vibe Engineering, because it determines whether everything that follows is building the right thing."}),e.jsx("p",{children:"Claude is a capable collaborator in this process. Used well, it can help surface unstated assumptions, identify conflicting requirements, generate acceptance criteria, and translate stakeholder language into technical specifications. Used poorly — as a passive transcriber of whatever the stakeholder first says — it adds no value and may paper over gaps that will surface as expensive bugs later."}),e.jsx(s,{title:"Requirements as the AI's Specification",children:"When you give Claude a requirement to implement, you are not giving it a suggestion. You are giving it the complete specification for what success looks like. Every ambiguity in the requirement is a decision Claude will make unilaterally, using its training data defaults. Every missing edge case is a behavior Claude will invent. The time spent making requirements precise is not overhead — it is the primary engineering activity in an AI-augmented workflow."}),e.jsx("h2",{children:"Using Claude for Stakeholder Requirement Elicitation"}),e.jsx("p",{children:'Stakeholders often describe requirements in terms of solutions ("I want a button that exports to Excel") rather than needs ("I need to share monthly sales data with my finance team"). Claude can help you dig from the surface description to the underlying need — which often reveals a better solution than what was initially requested.'}),e.jsx(i,{language:"text",filename:"Elicitation Prompt Pattern",children:`I have a stakeholder requirement that needs clarification before we implement it.

Stakeholder request: "I want users to be able to export their data"

Help me identify:
1. The underlying need behind this request
2. The unstated assumptions in the request
3. The questions I must ask the stakeholder before writing acceptance criteria
4. The edge cases that will need to be addressed in implementation
5. Non-functional requirements that are likely implied but unstated`}),e.jsx("p",{children:"Claude will respond with probing questions and identified gaps. You then take those back to the stakeholder, return with answers, and repeat until the requirement is fully specified. This structured elicitation process typically surfaces 5-10 issues that would otherwise have become bugs, change requests, or architectural problems."}),e.jsx("h2",{children:"Extracting Requirements from Existing Code"}),e.jsx("p",{children:"In most enterprises, the definitive specification of what a system does is the code itself. Documentation is stale, specs are missing, and the only person who knew the original intent left two years ago. Claude can read the codebase and extract implicit requirements — which is essential before making changes that might break undocumented behavior."}),e.jsx(t,{title:"Extracting Requirements from Code",tabs:[{label:"prompt",language:"text",filename:"Claude Code session",code:`Read the following files and extract the implicit business requirements:
- src/billing/invoice.service.ts
- src/billing/invoice.model.ts
- tests/billing/invoice.service.test.ts

For each requirement you identify:
1. State the requirement in plain English
2. Cite the specific code that implies it
3. Flag any requirements that appear inconsistent across files
4. Identify behaviors in the code that have no corresponding test (undocumented requirements)

Output as a structured markdown document I can use as a baseline spec.`},{label:"output",language:"markdown",filename:"extracted-requirements.md",code:`# Invoice Service — Extracted Requirements

## Functional Requirements

### FR-001: Invoice Creation
- Invoices must have a unique invoice number in format INV-{YEAR}-{SEQUENCE}
- Cited: invoice.service.ts:47, invoice.model.ts:23
- Test coverage: ✅ test_invoice_number_format()

### FR-002: Tax Calculation
- Tax rate varies by customer.country — US customers: 0%, UK customers: 20% VAT
- Cited: invoice.service.ts:89-103
- Test coverage: ✅ test_uk_vat(), test_us_no_tax()

### FR-003: Invoice Immutability (UNDOCUMENTED)
- Once an invoice status is "SENT", the line items cannot be modified
- Cited: invoice.service.ts:156 — throws error on update if status === 'SENT'
- Test coverage: ❌ NO TEST — this behavior is undocumented and untested

## Inconsistencies Found
- invoice.model.ts:45 allows null due_date
- invoice.service.ts:201 throws if due_date is null when creating a PDF
- These are inconsistent — either null should be disallowed at the model level
  or the PDF generation should handle null gracefully`}]}),e.jsx("h2",{children:"Structuring Requirements as Acceptance Criteria"}),e.jsx("p",{children:"Acceptance criteria are the bridge between stakeholder requirements and AI implementation. They must be written in a form that is both human-readable (so stakeholders can validate them) and machine-verifiable (so they can be expressed as passing tests). Claude can generate acceptance criteria from raw requirements, but you must review them carefully — Claude will sometimes write criteria that are too permissive or that miss important negative cases."}),e.jsx(i,{language:"text",filename:"Acceptance Criteria Generation Prompt",children:`Convert this requirement into acceptance criteria using the Gherkin Given/When/Then format.

Requirement: "Users should be able to reset their password via email"

For each scenario:
- Cover the happy path
- Cover all error cases (invalid email, expired token, already-used token)
- Cover security cases (token can only be used once, expires after 1 hour)
- Include negative tests (what should NOT happen)

Output as a .feature file I can use as the basis for implementation tests.`}),e.jsx(i,{language:"gherkin",filename:"password-reset.feature",children:`Feature: Password Reset

  Scenario: Successful password reset
    Given a registered user with email "alice@example.com"
    When Alice requests a password reset
    Then she receives an email containing a reset link
    And the link contains a token that expires in 60 minutes

  Scenario: Password reset with unregistered email
    Given no user exists with email "ghost@example.com"
    When a password reset is requested for "ghost@example.com"
    Then the response is 200 OK (to prevent email enumeration)
    And no email is sent

  Scenario: Token expires after 1 hour
    Given Alice has a password reset token created 61 minutes ago
    When she attempts to use the token
    Then she receives a 400 error with message "Reset link has expired"
    And her password is not changed

  Scenario: Token can only be used once
    Given Alice has successfully reset her password using a token
    When she attempts to use the same token again
    Then she receives a 400 error with message "Reset link has already been used"

  Scenario: Token is invalidated when password changes by other means
    Given Alice has an active reset token
    When Alice changes her password through account settings
    Then the reset token is invalidated
    And attempting to use the old token returns 400`}),e.jsx("h2",{children:"Requirements Conflicts and Gap Analysis"}),e.jsx("p",{children:"Large projects accumulate requirements from multiple stakeholders across multiple sessions. Conflicts between them are common and often go unnoticed until implementation reveals the contradiction. Claude can perform systematic gap and conflict analysis across a requirements document."}),e.jsx(o,{title:"Requirements Conflict Detection",children:"Before beginning implementation of a large feature, give Claude the full requirements document and ask it to identify: (1) requirements that directly contradict each other, (2) requirements that overlap without explicitly reconciling the overlap, (3) requirements that imply infrastructure or capabilities not mentioned elsewhere, and (4) requirements with no acceptance criteria. This analysis typically takes Claude 30-60 seconds and surfaces issues that would take days to discover during implementation."}),e.jsx(a,{title:"Commit Requirements Before Implementation",children:"Treat the final requirements document — acceptance criteria, edge cases, and all — as a first-class artefact that is committed to git before any implementation begins. This creates an immutable record of what was agreed, prevents scope creep during Claude sessions (Claude cannot quietly relax a requirement it does not remember), and gives you a reference point for future change requests. The requirements document is not a living document during the implementation sprint — it is a specification that Claude works against."}),e.jsx(r,{title:"Claude Fills Gaps With Assumptions",children:'When a requirement is ambiguous, Claude does not stop and ask for clarification by default. It makes a choice based on what seems most likely given its training data, and continues. These silent assumptions are the primary source of AI-generated code that is technically correct but wrong for your context. The mitigation is to ask Claude explicitly: "Before implementing, list every assumption you are making that is not stated in the requirements." Review that list. Any incorrect assumption is a bug you prevented.'}),e.jsx(n,{type:"tip",title:"The 10-Minute Requirements Audit",children:`Before starting any non-trivial implementation session with Claude, spend 10 minutes running your requirements through this checklist: (1) Is the happy path fully specified? (2) Are error cases enumerated? (3) Are security requirements explicit? (4) Are performance requirements stated with numbers? (5) Are there any "it should be obvious" assumptions that aren't written down? Every "yes, but it's obvious" is a gap. Write it down. What's obvious to you is not obvious to a model trained on the entire internet.`})]})}const be=Object.freeze(Object.defineProperty({__proto__:null,default:k},Symbol.toStringTag,{value:"Module"}));function C(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"ADRs with AI"}),e.jsx("p",{children:"Architecture Decision Records (ADRs) are short documents that capture a significant architectural decision: the context that prompted it, the options considered, the decision made, and the consequences. They are one of the most valuable artefacts in a long-lived codebase — and one of the most consistently neglected, because writing them well takes time and discipline."}),e.jsx("p",{children:"Claude Code dramatically lowers the cost of maintaining ADRs. It can draft an ADR from a conversation about a decision, extract implicit decisions from existing code, keep ADRs fresh as the codebase evolves, and cross-reference ADRs against implementation to detect when reality has drifted from the documented decision."}),e.jsx(s,{title:"Why ADRs Matter for AI-Augmented Engineering",children:'ADRs serve a double purpose in a Vibe Engineering context. First, they are historical records for human engineers — understanding why a decision was made is essential before reversing it. Second, they are context for Claude. When ADRs are referenced in CLAUDE.md or included in Claude sessions, they prevent Claude from suggesting architectural changes that contradict decisions the team deliberately made. An ADR saying "we chose PostgreSQL over MongoDB because of ACID transaction requirements" stops Claude from suggesting a MongoDB migration to improve write performance.'}),e.jsx("h2",{children:"Generating an ADR with Claude"}),e.jsx("p",{children:'The most common ADR workflow is: the team makes a decision in a meeting or async discussion, then never writes it down because someone has to "write the ADR" and it keeps getting deprioritised. Claude can turn a rough description of a decision into a well-structured ADR in minutes.'}),e.jsx(t,{title:"ADR Generation from Decision Notes",tabs:[{label:"prompt",language:"text",filename:"Claude Code session",code:`Generate an Architecture Decision Record from the following decision notes.
Use the MADR format (Markdown Architectural Decision Records).

Decision notes:
"We decided to use React Query (TanStack Query) instead of Redux for server state
management. Main reasons: Redux was being used only for API data caching, not for
genuinely shared client state. Redux required too much boilerplate. React Query
gives us cache invalidation, background refetching, and optimistic updates out of
the box. The team was already familiar with it. Downside: we'll need to migrate
existing Redux slices that were doing API calls."

Also include:
- Consequences (positive and negative)
- What we are NOT deciding (scope)
- How this decision affects CLAUDE.md constraints`},{label:"output",language:"markdown",filename:"docs/adrs/ADR-012-react-query-over-redux.md",code:`# ADR-012: Use React Query for Server State Management

## Status
Accepted

## Date
2025-03-15

## Context
The application uses Redux for state management. Analysis revealed that approximately
80% of our Redux slices exist solely to cache API responses — not to manage shared
client-side state. This pattern required significant boilerplate (action creators,
reducers, selectors, thunks) for each endpoint and made cache invalidation logic
complex and error-prone.

Server state (data that originates on the server) has different requirements from
client state (UI state, form state, user preferences). Mixing them in a single store
creates accidental complexity.

## Decision
We will use TanStack Query (React Query) v5 for all server state management.
Redux will be retained only for genuinely shared client state (currently: user
preferences, UI theme, active modal state).

## Options Considered

### Option A: Continue with Redux + RTK Query
- Pros: No migration cost; team already knows it; RTK Query improves on raw Redux
- Cons: Still more boilerplate than React Query; less community momentum

### Option B: React Query (chosen)
- Pros: Purpose-built for server state; excellent DX; background refetching,
  cache invalidation, optimistic updates built-in; strong ecosystem
- Cons: Migration cost for existing Redux API slices; two state libraries in codebase
  during migration period

### Option C: SWR
- Pros: Simpler API than React Query; smaller bundle
- Cons: Fewer features; less mature ecosystem; team less familiar

## Consequences

### Positive
- Eliminates ~60% of Redux boilerplate
- Background refetching keeps data fresh automatically
- Cache invalidation is declarative (queryClient.invalidateQueries)
- Optimistic updates for mutations without manual rollback logic

### Negative
- Migration effort: ~15 Redux slices need conversion (estimated 3 sprints)
- During migration: two state management patterns coexist
- Team must learn React Query patterns and mental model

## What This Decision Does NOT Cover
- Client state management (Redux remains for this)
- WebSocket / real-time data (separate ADR-013)
- State persistence (Redux Persist — separate evaluation needed)

## CLAUDE.md Impact
Add to CLAUDE.md:

## State Management
- Server state: React Query (TanStack Query v5) — use useQuery, useMutation
- Client state: Redux Toolkit — use createSlice, useSelector, useDispatch
- Do NOT use Redux for API calls — this is a React Query concern
- Do NOT use React Query for client-only state — this is a Redux concern
`}]}),e.jsx("h2",{children:"Extracting Implicit ADRs from Existing Code"}),e.jsx("p",{children:"Most codebases contain dozens of undocumented architectural decisions — choices made years ago that are now structural constraints. Claude can scan code and surface these implicit decisions so they can be documented before someone unknowingly reverses them."}),e.jsx(i,{language:"text",filename:"Implicit Decision Extraction Prompt",children:`Scan the codebase and identify architectural decisions that appear to have been made
but are not documented in docs/adrs/.

For each implicit decision you find:
1. State what decision appears to have been made
2. Cite the evidence in the code (file paths and line numbers)
3. Estimate how significant reversing this decision would be (low/medium/high)
4. Draft a one-sentence ADR title I can use to document it

Focus on: technology choices, integration patterns, data model constraints,
authentication approaches, error handling patterns, logging conventions.`}),e.jsx("h2",{children:"Keeping ADRs Current"}),e.jsx("p",{children:"ADRs have a staleness problem: decisions change, implementations evolve, but the documents stay behind. Claude can perform periodic freshness checks — comparing ADR content against current code to detect when reality has drifted from the documented decision."}),e.jsxs(o,{title:"ADR Freshness Check",children:["Run this check quarterly or before major refactoring work. For each ADR, Claude reads the document and the code it describes, then reports: (1) Is the implementation consistent with the ADR? (2) Has the decision been partially reversed? (3) Are there new technologies in use that the ADR's options section did not consider? (4) Does the ADR's CLAUDE.md section still match the current CLAUDE.md?",e.jsx("br",{}),e.jsx("br",{}),'ADRs that no longer reflect reality should be marked "Superseded" with a reference to the new ADR, not deleted — the history of why decisions were made and changed is itself valuable.']}),e.jsx(i,{language:"bash",filename:"ADR Freshness Check (Claude Slash Command)",children:`# .claude/commands/check-adrs.md
Check whether the following ADRs are still accurately reflected in the codebase.

For each ADR in docs/adrs/:
1. Read the ADR
2. Find the relevant code it describes
3. Check whether the implementation matches the decision
4. Report: CURRENT | DRIFTED | SUPERSEDED

For any DRIFTED ADR, describe specifically what has changed and draft
a brief update or a new "superseding" ADR.`}),e.jsx("h2",{children:"ADR Templates in CLAUDE.md"}),e.jsx("p",{children:'Standardising your ADR format in CLAUDE.md ensures that every AI-generated ADR follows the same structure — which matters when you have dozens of them and engineers need to scan them quickly. It also means any engineer can ask Claude to "write an ADR for this decision" and get a consistently formatted result.'}),e.jsx(i,{language:"markdown",filename:"CLAUDE.md (ADR Section)",children:`## Architecture Decision Records

ADRs live in docs/adrs/. Naming: ADR-{NNN}-{slug}.md

### ADR Format (MADR)
markdown
# ADR-{NNN}: {Title}

## Status
{Proposed | Accepted | Superseded by ADR-NNN | Deprecated}

## Date
{YYYY-MM-DD}

## Context
{What situation prompted this decision?}

## Decision
{What was decided?}

## Options Considered
{Brief summary of alternatives evaluated}

## Consequences
### Positive
### Negative

## CLAUDE.md Impact
{What rules should be added to CLAUDE.md based on this decision?}


### When to write an ADR
- Choosing between two or more viable technologies
- Establishing a pattern that will be followed across the codebase
- Reversing a previous architectural decision
- Making a decision with significant future consequences that is not obvious`}),e.jsx(a,{title:"Reference ADRs in PR Descriptions",children:"When a PR implements a feature that was guided by an ADR, reference the ADR in the PR description. This creates a bidirectional link: the ADR explains why, the PR shows how. When Claude generates PR descriptions (as covered in the code review chapter), include ADR references in the PR description template so Claude includes them automatically."}),e.jsx(n,{type:"tip",title:"ADRs as Claude Context",children:'The highest-value use of ADRs in Vibe Engineering is as context for Claude. When starting a Claude session for a significant feature, include the relevant ADRs in the context: "Before implementing, read docs/adrs/ADR-003, ADR-007, and ADR-012. These constrain the architectural choices you may make." This prevents Claude from suggesting architecturally sound but locally wrong implementations — solutions that would be good in a greenfield project but contradict decisions your team made deliberately.'})]})}const ve=Object.freeze(Object.defineProperty({__proto__:null,default:C},Symbol.toStringTag,{value:"Module"}));function I(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"API Contract Design"}),e.jsx("p",{children:"API contracts — OpenAPI specifications, gRPC proto files, AsyncAPI event schemas — are the formal interface definitions that teams use to build against each other's services without tight coupling. Good contracts are precise, versioned, and discoverable. Bad contracts are vague, inconsistent, and become the source of integration bugs that surface only in production."}),e.jsx("p",{children:"Claude is an effective collaborator for API contract design. It can generate well-structured OpenAPI specs from natural language descriptions, review existing contracts for inconsistencies, and ensure contracts follow your organisation's conventions. The key is to treat contract design as a specification activity — not an implementation activity — and to establish your conventions in CLAUDE.md before the first session."}),e.jsx(s,{title:"Contract-First Design",children:"In a contract-first approach, the API contract is designed and agreed upon before any implementation begins. The contract becomes the specification that both the provider team and the consumer team work against simultaneously. Claude accelerates this process by generating a draft contract from a description of the intended behavior, which the teams then review and refine together. The implementation follows the contract; the contract does not follow the implementation."}),e.jsx("h2",{children:"Generating OpenAPI Specs from Requirements"}),e.jsx(t,{title:"OpenAPI Spec Generation",tabs:[{label:"prompt",language:"text",filename:"Claude Code session",code:`Generate an OpenAPI 3.1 specification for a Product Catalogue API.

Requirements:
- List products (paginated, filterable by category and price range)
- Get a single product by ID
- Create a product (admin only)
- Update a product (admin only, partial updates supported)
- Delete a product (admin only, soft delete)

Conventions from CLAUDE.md:
- Pagination: cursor-based using 'cursor' and 'limit' query params, max limit 100
- Error format: { "error": { "code": "SNAKE_CASE_CODE", "message": "...", "details": {} } }
- Auth: Bearer JWT in Authorization header
- Versioning: URL path prefix /v1/
- Soft deletes: never physically delete, set deleted_at timestamp

Include realistic example values in all schemas.`},{label:"openapi",language:"yaml",filename:"openapi/product-catalogue.yaml",code:`openapi: 3.1.0
info:
  title: Product Catalogue API
  version: 1.0.0
  description: Manage product listings for the e-commerce platform

servers:
  - url: https://api.example.com/v1

security:
  - BearerAuth: []

paths:
  /products:
    get:
      operationId: listProducts
      summary: List products
      security: []  # Public endpoint
      parameters:
        - name: cursor
          in: query
          schema: { type: string }
          description: Pagination cursor from previous response
        - name: limit
          in: query
          schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
        - name: category
          in: query
          schema: { type: string, example: "electronics" }
        - name: min_price
          in: query
          schema: { type: number, format: decimal, minimum: 0 }
        - name: max_price
          in: query
          schema: { type: number, format: decimal, minimum: 0 }
      responses:
        '200':
          description: Paginated list of products
          content:
            application/json:
              schema:
                type: object
                required: [data, pagination]
                properties:
                  data:
                    type: array
                    items: { $ref: '#/components/schemas/Product' }
                  pagination:
                    $ref: '#/components/schemas/CursorPagination'

    post:
      operationId: createProduct
      summary: Create a product (admin only)
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/CreateProductRequest' }
      responses:
        '201':
          description: Product created
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Product' }
        '403':
          $ref: '#/components/responses/Forbidden'

components:
  schemas:
    Product:
      type: object
      required: [id, name, price, category, created_at]
      properties:
        id: { type: string, format: uuid, example: "018e4c2f-a3b1-7000-8000-000000000001" }
        name: { type: string, maxLength: 255, example: "Wireless Noise-Cancelling Headphones" }
        price: { type: number, format: decimal, minimum: 0, example: 299.99 }
        category: { type: string, example: "electronics" }
        deleted_at: { type: string, format: date-time, nullable: true }
        created_at: { type: string, format: date-time }

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  responses:
    Forbidden:
      description: Insufficient permissions
      content:
        application/json:
          schema: { $ref: '#/components/schemas/Error' }

    Error:
      description: Error response
      content:
        application/json:
          schema: { $ref: '#/components/schemas/ErrorBody' }`}]}),e.jsx("h2",{children:"gRPC Proto Design"}),e.jsx("p",{children:"For internal service-to-service communication, gRPC with Protocol Buffers is often preferred over REST for performance and strong typing. Claude can generate well-structured proto files that follow proto3 best practices and your organisation's naming conventions."}),e.jsx(i,{language:"protobuf",filename:"proto/inventory/v1/inventory.proto",children:`syntax = "proto3";

package inventory.v1;

option go_package = "github.com/example/platform/gen/go/inventory/v1";

import "google/protobuf/timestamp.proto";
import "google/protobuf/field_mask.proto";

// InventoryService manages product stock levels
service InventoryService {
  // GetStock returns the current stock level for a product
  rpc GetStock(GetStockRequest) returns (GetStockResponse);

  // ReserveStock reserves stock for an order (idempotent by order_id)
  rpc ReserveStock(ReserveStockRequest) returns (ReserveStockResponse);

  // WatchStock streams real-time stock level changes for a product
  rpc WatchStock(WatchStockRequest) returns (stream StockEvent);
}

message GetStockRequest {
  string product_id = 1;  // UUID
  string warehouse_id = 2; // Optional: omit for aggregate across all warehouses
}

message GetStockResponse {
  int32 available = 1;    // Available for new orders
  int32 reserved = 2;     // Reserved for pending orders
  int32 total = 3;        // available + reserved
  google.protobuf.Timestamp as_of = 4;
}

message ReserveStockRequest {
  string order_id = 1;    // Idempotency key
  string product_id = 2;
  int32 quantity = 3;
  string warehouse_id = 4;
}

message ReserveStockResponse {
  bool success = 1;
  string reservation_id = 2;  // Empty if success=false
  string failure_reason = 3;  // INSUFFICIENT_STOCK | WAREHOUSE_NOT_FOUND
}`}),e.jsx("h2",{children:"Event Schema Design with AsyncAPI"}),e.jsx("p",{children:"Event-driven architectures require event schemas that are as carefully designed as REST APIs. AsyncAPI is the OpenAPI equivalent for asynchronous messaging. Claude can generate AsyncAPI documents from descriptions of the events your system emits and consumes."}),e.jsx(i,{language:"yaml",filename:"asyncapi/order-events.yaml",children:`asyncapi: 2.6.0
info:
  title: Order Events
  version: 1.0.0

channels:
  order.created:
    description: Published when a new order is successfully placed
    publish:
      operationId: publishOrderCreated
      message:
        $ref: '#/components/messages/OrderCreated'

  order.cancelled:
    description: Published when an order is cancelled by customer or system
    publish:
      operationId: publishOrderCancelled
      message:
        $ref: '#/components/messages/OrderCancelled'

components:
  messages:
    OrderCreated:
      name: OrderCreated
      contentType: application/json
      payload:
        type: object
        required: [event_id, event_type, occurred_at, order_id, customer_id, total_amount]
        properties:
          event_id:
            type: string
            format: uuid
            description: Globally unique event identifier (for deduplication)
          event_type:
            type: string
            const: order.created
          occurred_at:
            type: string
            format: date-time
          order_id:
            type: string
            format: uuid
          customer_id:
            type: string
            format: uuid
          total_amount:
            type: number
            format: decimal
          currency:
            type: string
            pattern: '^[A-Z]{3}$'
            example: USD`}),e.jsx("h2",{children:"Contract Review and Consistency Checking"}),e.jsx("p",{children:"Existing APIs often have inconsistencies: some endpoints use camelCase field names, others use snake_case; some return 404 for not-found, others return 200 with an empty result; some paginate with offset/limit, others with cursors. Claude can audit your API contracts for these inconsistencies and generate a prioritised list of improvements."}),e.jsx(o,{title:"API Contract Audit",children:"Run a contract audit before any major API version bump. Provide Claude with all your OpenAPI files and ask it to check: (1) naming convention consistency across all schemas and operations, (2) error response format consistency, (3) pagination approach consistency, (4) authentication approach consistency, (5) HTTP method semantic correctness, and (6) required vs optional field decisions that seem arbitrary. The output is a prioritised list of inconsistencies to fix in the next version."}),e.jsx(a,{title:"API Conventions in CLAUDE.md",children:"Document your API conventions in CLAUDE.md so that every Claude-generated API spec automatically follows them. Conventions to document: field naming (snake_case vs camelCase), ID format (UUID vs integer), pagination approach, error response format, versioning strategy, date/time format (ISO 8601, always UTC), and boolean field naming (is_active vs active vs enabled). Claude will apply these conventions to every spec it generates, eliminating consistency review as a manual step."}),e.jsxs(r,{title:"Validate Generated Specs Before Use",children:["Claude-generated OpenAPI specs may contain structural errors that are not immediately obvious — missing required fields in schemas, incorrect $ref paths, or operation IDs that are not unique. Always validate generated specs with a tool before using them: ",e.jsx("code",{children:"npx @redocly/cli lint"}),"for OpenAPI, ",e.jsx("code",{children:"buf lint"})," for proto files. Make this part of your CI pipeline so that API contract validation is automatic."]}),e.jsx(n,{type:"tip",title:"Contract-First Accelerates Parallel Development",children:"Once a contract is agreed upon and committed, the provider team and consumer team can work in parallel — the provider implements the spec, the consumer mocks it using tools like Prism or Mockoon. Ask Claude to generate mock server configurations from your OpenAPI spec so teams can start integration work immediately without waiting for the real implementation. This is one of the highest-leverage applications of contract-first design in a Vibe Engineering workflow."})]})}const we=Object.freeze(Object.defineProperty({__proto__:null,default:I},Symbol.toStringTag,{value:"Module"}));function j(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"NFR Automation"}),e.jsx("p",{children:"Non-functional requirements (NFRs) — performance, security, accessibility, reliability, and compliance — are the requirements that most often get skipped in AI-assisted development. They are not features you can demo. They are constraints that determine whether the feature is actually production-ready. And because they are invisible when satisfied, it is tempting to let AI generate code without ever specifying them."}),e.jsx("p",{children:"Vibe Engineering treats NFR compliance as an automated gate in the agent loop — not as a manual checklist someone remembers to run at the end of the sprint. This section covers how to embed NFR checks into Claude sessions and CI pipelines so that code which violates them never makes it into a PR."}),e.jsx(s,{title:"NFRs as Agent Loop Gates",children:"An NFR gate is a check that runs automatically after every Claude-generated change, before the engineer reviews the output. If the check fails, Claude is responsible for fixing the issue before reporting completion. The engineer's job is not to run NFR checks manually — it is to configure the agent loop so that NFR compliance is a precondition for task completion. Automation is the only way to enforce NFRs reliably at AI generation speed."}),e.jsx("h2",{children:"Performance NFR Automation"}),e.jsx("p",{children:"Performance requirements that are not expressed as failing tests are not requirements — they are wishes. The most effective approach is to write performance assertions into the test suite itself, so that Claude cannot implement a feature without satisfying the performance contract."}),e.jsx(i,{language:"python",filename:"tests/performance/test_api_latency.py",children:`import time
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
    assert "Index Scan" in str(plan) or "Bitmap Index Scan" in str(plan),         "Product category query is doing a full table scan — missing index"
`}),e.jsx(i,{language:"markdown",filename:"CLAUDE.md (Performance NFRs)",children:`## Performance Requirements

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
All performance tests must pass before reporting completion.`}),e.jsx("h2",{children:"Accessibility NFR Automation"}),e.jsx("p",{children:"Accessibility (a11y) compliance is a legal requirement in many jurisdictions (ADA, EN 301 549, WCAG 2.1 AA) and is consistently one of the most commonly skipped NFRs in AI-generated frontend code. Axe-core and Pa11y can run accessibility checks automatically in the CI pipeline."}),e.jsx(i,{language:"javascript",filename:"tests/a11y/accessibility.test.js",children:`import { test, expect } from '@playwright/test'
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
})`}),e.jsx(i,{language:"markdown",filename:"CLAUDE.md (Accessibility NFRs)",children:`## Accessibility Requirements (WCAG 2.1 AA)

All React components must:
- Use semantic HTML elements (button, nav, main, aside, article, section)
- Include aria-label on all interactive elements without visible text
- Maintain logical tab order (no tabindex > 0)
- Provide alt text for all images (empty alt="" for decorative images)
- Ensure color contrast ratio >= 4.5:1 for normal text, >= 3:1 for large text
- Never use color alone to convey information

After implementing any UI component, run: npx playwright test tests/a11y/
Zero critical or serious violations permitted.`}),e.jsx("h2",{children:"Security NFR Automation in the Agent Loop"}),e.jsx(l,{severity:"high",title:"Security NFRs Must Run Before PR Submission",children:"Security NFR automation must run inside the Claude session, before the engineer ever sees the output. If SAST runs only in CI after the PR is opened, the engineer has already reviewed code that may have vulnerabilities. Running security checks in-loop means Claude fixes the issues before you review — reducing cognitive load and ensuring the diff you review is already security-clean."}),e.jsx(i,{language:"markdown",filename:"CLAUDE.md (Security NFRs in Loop)",children:`## Security NFR Gates (run after every code change)

### Python/FastAPI projects

bandit -r src/ -ll              # No HIGH severity findings
semgrep --config auto src/     # No CRITICAL/HIGH findings
safety check                   # No known CVEs in dependencies


### TypeScript/Node projects

npm audit --audit-level=high   # No HIGH/CRITICAL vulnerabilities
npx eslint src/ --rule '{no-eval: error, no-implied-eval: error}'
semgrep --config auto src/     # No CRITICAL/HIGH findings


Report all findings before marking any security-adjacent task complete.
Do not suppress findings without explicit instruction.`}),e.jsx("h2",{children:"Reliability NFR Automation"}),e.jsx("p",{children:"Reliability requirements — retry logic, circuit breakers, timeout handling, graceful degradation — are among the most commonly omitted behaviors in AI-generated code. Claude will generate the happy path correctly; it will omit the failure paths unless they are explicitly required."}),e.jsx(o,{title:"Failure Mode Requirements in CLAUDE.md",children:`For every external dependency your service calls (databases, HTTP APIs, message queues), add an explicit failure mode requirement to CLAUDE.md. "When the inventory service returns 5xx, the product display must fall back to showing 'Availability unknown' — do not propagate the error to the user." "All HTTP client calls must have a 5-second timeout. Never use indefinite waits." These requirements prevent the most common class of reliability bugs in AI-generated code.`}),e.jsx(i,{language:"markdown",filename:"CLAUDE.md (Reliability NFRs)",children:`## Reliability Requirements

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

Verify failure paths have tests. A function with only happy-path tests is incomplete.`}),e.jsx(a,{title:"Encode NFRs as Tests, Not Comments",children:'An NFR written as a comment in the code ("// TODO: add retry logic") is not an NFR — it is a wish. An NFR written as a failing test is a requirement. Before asking Claude to implement any feature with non-trivial NFRs, write the NFR test cases first (the AI-TDD approach). For performance: write a test that measures latency and asserts it is below threshold. For accessibility: write an axe-core test. For security: write a test that verifies the security behavior (e.g., unauthenticated requests return 401). Claude cannot implement the feature without satisfying the tests — and the tests will catch any regression.'}),e.jsx(n,{type:"info",title:"NFR Automation Pays Compound Interest",children:"The initial investment in NFR automation — writing the performance tests, setting up axe, configuring SAST in the agent loop — is front-loaded. Once in place, every subsequent AI-generated feature is automatically verified against these requirements. Over a project lifetime, this means hundreds of features that would otherwise have needed manual NFR review instead get it automatically. The teams that skip NFR automation spend that time on production incidents instead."})]})}const xe=Object.freeze(Object.defineProperty({__proto__:null,default:j},Symbol.toStringTag,{value:"Module"})),T=`# CLAUDE.md — Python FastAPI Service

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
`,S=`# CLAUDE.md — TypeScript React Frontend

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
`,R=`# CLAUDE.md — Kubernetes / Helm Infrastructure as Code

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
`;function P(){return e.jsxs("div",{className:"lesson-content",children:[e.jsx("h2",{children:"Enterprise CLAUDE.md Patterns"}),e.jsx("p",{children:"A CLAUDE.md file is the primary mechanism for encoding your organisation's engineering standards directly into Claude Code's working context. When Claude reads your CLAUDE.md at session start, every subsequent code generation, edit, and suggestion operates within those constraints — without you having to repeat them in every prompt. For enterprise teams, this is not a convenience feature; it is the difference between an AI assistant that reinforces your compliance posture and one that silently works against it."}),e.jsx("p",{children:"The templates below are drawn from three common enterprise contexts: a Python backend with SOC 2 requirements, a TypeScript frontend with GDPR obligations, and a Kubernetes infrastructure codebase with CIS security benchmarks. Each template is designed to be dropped into the root of its repository and extended with project-specific details."}),e.jsx(s,{term:"CLAUDE.md as a Persistent Instruction Layer",children:e.jsx("p",{children:"CLAUDE.md is a Markdown file that Claude Code reads at the start of every session in a given directory. It functions as a standing system prompt that persists across all interactions in that workspace. Unlike a prompt you type, it cannot be forgotten mid-task, and it applies consistently to every developer on the team who uses Claude Code in that repository. The file can include technology constraints, forbidden patterns, security rules, compliance requirements, and coding conventions — effectively encoding your engineering standards as machine-readable policy."})}),e.jsx("h2",{children:"Template 1: Python FastAPI Service with SOC 2 Compliance"}),e.jsx("p",{children:"FastAPI services that handle user data in regulated environments face a specific set of risks: SQL injection through dynamic query construction, credential exposure through logging, and audit gaps that fail compliance reviews. This template addresses each directly by naming the forbidden pattern alongside the requirement, so Claude understands not just what to do but why a deviation would be harmful."}),e.jsx(i,{language:"text",filename:"CLAUDE.md",children:T}),e.jsx(n,{type:"note",title:"Why SQLAlchemy-Only Matters",children:e.jsx("p",{children:"The prohibition on raw SQL is not stylistic preference — it is a security control. Raw SQL with f-strings or concatenation is the leading cause of SQL injection vulnerabilities, which remain in the OWASP Top 10. SQLAlchemy's parameterised queries make injection structurally impossible: user-supplied values are never interpreted as SQL syntax. When this rule is in CLAUDE.md, Claude will not generate raw SQL even when it would be marginally shorter or more convenient."})}),e.jsx(a,{title:"SOC 2 Audit Logging: Log the Fact, Not the Value",children:e.jsxs("p",{children:["SOC 2 Type II requires evidence that all privileged and state-changing operations are logged. The critical nuance is that audit logs must capture ",e.jsx("em",{children:"what changed"})," (action, actor, resource) without capturing ",e.jsx("em",{children:"what the new value is"})," — because the audit log itself could expose PII. The CLAUDE.md template above encodes this distinction explicitly: log the action type and resource IDs, never the field values. This pattern satisfies audit requirements while passing PII-in-logs scanners."]})}),e.jsx("h2",{children:"Template 2: TypeScript React Frontend with GDPR"}),e.jsx("p",{children:"Frontend codebases face a different compliance surface than backends. The browser is a hostile environment where user data can leak through localStorage persistence, third-party scripts, and improperly scoped cookies. GDPR's consent requirements are particularly tricky for AI assistants to respect by default — without explicit instruction, an AI will often generate analytics initialisation code that fires unconditionally on page load."}),e.jsx(i,{language:"text",filename:"CLAUDE.md",children:S}),e.jsx(n,{type:"note",title:"Why localStorage PII Is a GDPR Risk",children:e.jsx("p",{children:"localStorage persists data across browser sessions and is readable by any JavaScript running on the same origin — including injected third-party scripts. Storing PII there means it may persist after a user requests deletion, be exposed through XSS attacks, and lack the consent lifecycle controls that GDPR Article 7 requires. The CLAUDE.md constraint to use httpOnly cookies (set server-side) for session tokens removes this entire class of risk from AI-generated code."})}),e.jsx(a,{title:"Accessibility as a CLAUDE.md Constraint",children:e.jsx("p",{children:"WCAG 2.1 AA compliance is increasingly a legal requirement in enterprise contexts (EU Web Accessibility Directive, US Section 508, UK Public Sector Bodies Accessibility Regulations). Encoding it in CLAUDE.md means that Claude generates accessible markup by default: semantic HTML, explicit alt text, focus management on modals, and keyboard operability for interactive elements. The cost of retrofitting inaccessible code is substantially higher than generating accessible code in the first place."})}),e.jsx("h2",{children:"Template 3: Kubernetes / Helm IaC with Security Hardening"}),e.jsx("p",{children:"Infrastructure as Code is particularly high-stakes for AI-assisted generation because a single misconfigured security context, a hardcoded credential, or a missing network policy can expose an entire cluster. This template is structured around the CIS Kubernetes Benchmark controls most commonly violated by generated code, and it includes the exact YAML syntax Claude should use rather than abstract descriptions."}),e.jsx(i,{language:"text",filename:"CLAUDE.md",children:R}),e.jsx(l,{title:"Hardcoded Credentials in IaC Are a Critical Risk",severity:"critical",children:e.jsx("p",{children:"Infrastructure configuration files committed to git with embedded secrets are one of the most frequent causes of cloud breaches. Unlike application code where secrets might be isolated to a single service, IaC credentials often carry administrative-level permissions across entire environments. The CLAUDE.md template above prohibits this pattern entirely and requires Vault-based secret injection. This constraint must be enforced at the CLAUDE.md level because it is easy for an AI to generate a convenient working example with a hardcoded value when not explicitly told otherwise."})}),e.jsx(a,{title:"Non-Root Containers and ReadOnly Filesystems",children:e.jsx("p",{children:"Running containers as root is the default in many base images, but it means that a container escape vulnerability grants attackers root access on the host node. The securityContext block in the template (runAsNonRoot, runAsUser, readOnlyRootFilesystem) is the Kubernetes-native way to enforce least privilege at the container level. Including the exact YAML in CLAUDE.md means Claude will emit this block on every Deployment it generates, even in quick examples, because the template normalises it as boilerplate rather than an optional hardening step."})}),e.jsx("h2",{children:"Structuring CLAUDE.md for Enterprise Teams"}),e.jsx("p",{children:"Real enterprise repositories benefit from a layered approach to CLAUDE.md files. A global file in the user's home directory sets organisation-wide defaults, while each repository's CLAUDE.md adds project-specific rules. Subdirectory CLAUDE.md files can further scope rules to specific service boundaries within a monorepo."}),e.jsxs(o,{name:"Layered CLAUDE.md Strategy",category:"Configuration",whenToUse:"Any team with more than one repository, or any monorepo with distinct service boundaries. The global layer prevents repetition of organisation standards; the repository layer adds project context; the subdirectory layer handles domain-specific constraints.",children:[e.jsx("p",{children:"Organise CLAUDE.md files in three layers, each extending the one above:"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Layer 1 — Global (~/.claude/CLAUDE.md):"})," Organisation-wide rules that apply everywhere: preferred languages, company-wide security baselines, internal tool access patterns, escalation contacts for security findings."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Layer 2 — Repository (./CLAUDE.md):"})," Project-specific stack, compliance requirements, architecture decisions, forbidden patterns specific to this codebase, and how to run tests and linting."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Layer 3 — Subdirectory (./src/billing/CLAUDE.md):"})," Domain-specific constraints for high-sensitivity areas — for example, billing code that must follow PCI-DSS patterns, or authentication code that has additional review requirements."]})]}),e.jsxs(a,{title:"Forbidden Patterns Are More Effective Than Positive Instructions",children:[e.jsx("p",{children:"When writing CLAUDE.md, resist the urge to describe only what you want. Explicitly naming forbidden patterns is more effective for two reasons. First, LLMs have strong priors toward common patterns from their training data — raw SQL, console.log, and hardcoded values are all common in training corpora. Positive instructions alone may not override these priors. Second, forbidden patterns create unambiguous failure conditions: Claude can recognise that a string matches a forbidden pattern even if it would not have thought to apply the positive rule to that specific case."}),e.jsx("p",{children:'For each forbidden pattern, include the reason. "No raw SQL — SQL injection risk that fails SOC 2 pen tests" is more effective than "No raw SQL" because it gives Claude the context to generalise the rule to similar-but-not-identical cases.'})]})]})}const Ae=Object.freeze(Object.defineProperty({__proto__:null,default:P},Symbol.toStringTag,{value:"Module"}));function E(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Custom Slash Commands"}),e.jsx("p",{children:'Slash commands in Claude Code are reusable prompt templates stored as Markdown files in your repository. They turn complex, multi-step workflows into single commands that any engineer on the team can invoke consistently. Instead of every engineer remembering the right prompt for "implement a new API endpoint," the team maintains one authoritative command that encodes the correct approach.'}),e.jsx("p",{children:"Custom slash commands are the mechanism by which Vibe Engineering practices spread across a team without requiring everyone to individually learn the right prompting patterns. They are version-controlled, peer-reviewable, and continuously improvable — exactly like any other piece of engineering infrastructure."}),e.jsx(s,{title:"Slash Commands as Team Infrastructure",children:"A well-maintained library of slash commands is to prompt engineering what a shared component library is to UI development. Instead of every engineer reinventing the same patterns, the team's best practices are encoded once, reviewed by seniors, and made available to everyone. New engineers immediately have access to production-grade prompting patterns without needing to develop them from scratch. Senior engineers improve commands over time as they learn what works."}),e.jsx("h2",{children:"Slash Command File Structure"}),e.jsxs("p",{children:["Slash commands live in the ",e.jsx("code",{children:".claude/commands/"})," directory at the root of your repository. Each command is a ",e.jsx("code",{children:".md"})," file. The file name becomes the command name:",e.jsx("code",{children:"implement-endpoint.md"})," is invoked as ",e.jsx("code",{children:"/implement-endpoint"}),"."]}),e.jsx(i,{language:"bash",filename:"Repository Structure",children:`.claude/
  commands/
    implement-endpoint.md    # /implement-endpoint
    review-security.md       # /review-security
    add-tests.md             # /add-tests
    update-adr.md            # /update-adr
    fix-vulnerability.md     # /fix-vulnerability
    generate-migration.md    # /generate-migration
    pr-description.md        # /pr-description
CLAUDE.md                    # Global constraints (read before all commands)`}),e.jsx("h2",{children:"Core Command Examples"}),e.jsx("h3",{children:"/implement-endpoint"}),e.jsx(i,{language:"markdown",filename:".claude/commands/implement-endpoint.md",children:`# Implement API Endpoint

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
- Catch exceptions silently — log them with the logger in src/lib/logger.py`}),e.jsx("h3",{children:"/review-security"}),e.jsx(i,{language:"markdown",filename:".claude/commands/review-security.md",children:`# Security Review

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
description of the vulnerability, and a specific fix recommendation.`}),e.jsx("h3",{children:"/add-tests"}),e.jsx(i,{language:"markdown",filename:".claude/commands/add-tests.md",children:`# Add Tests

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
Report: number of tests added, all passing.`}),e.jsx("h3",{children:"/generate-migration"}),e.jsx(i,{language:"markdown",filename:".claude/commands/generate-migration.md",children:`# Generate Database Migration

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
3. The commands to apply it: alembic upgrade head`}),e.jsx("h2",{children:"Using $ARGUMENTS in Commands"}),e.jsxs("p",{children:["The ",e.jsx("code",{children:"$ARGUMENTS"})," placeholder is replaced with whatever text follows the command when invoked. This makes commands flexible without sacrificing the structured workflow they encode."]}),e.jsx(i,{language:"text",filename:"Usage Examples",children:`# Invoke with arguments
/implement-endpoint POST /v1/orders — create a new order, validate the cart, charge payment

/review-security src/auth/jwt.service.ts src/auth/session.service.ts

/add-tests src/billing/invoice.service.ts — focus on edge cases for tax calculation

/generate-migration add user_preferences JSONB column to users table, not null with default '{}'`}),e.jsx("h2",{children:"Building a Command Library"}),e.jsx("p",{children:"Start with the five or six workflows your team performs most frequently. A good starting set for most teams: implement-endpoint, add-tests, review-security, pr-description, generate-migration, and fix-vulnerability. Add commands as you notice engineers asking Claude the same multi-step questions repeatedly — that repetition is a signal that the workflow should be encoded as a command."}),e.jsx(o,{title:"Command Lifecycle",children:"Treat slash commands like any other piece of code: propose via PR, review by senior engineers, merge when approved, improve iteratively based on use. A new command should be used for 2-3 real tasks before being merged — dogfooding reveals gaps that are not obvious when writing the command in the abstract. Commands that are never used should be removed — stale commands mislead new engineers about what workflows are standard."}),e.jsx(a,{title:"Commands Should Encode Quality Gates",children:'Every command that produces code should include explicit quality gates in its final step. "Run pytest and report results" — not "implement the code." This ensures Claude never silently produces code that fails its own tests. The quality gate is part of the command, not an optional step the user might forget to run.'}),e.jsxs(n,{type:"tip",title:"Personal vs Shared Commands",children:["Commands in ",e.jsx("code",{children:".claude/commands/"})," are shared with the whole team via version control. Personal commands (individual preferences, experimental workflows) can go in",e.jsx("code",{children:"~/.claude/commands/"})," on your local machine and won't affect teammates. Use the team directory for anything that encodes a shared standard; use the personal directory for individual experimentation before proposing it as a team command."]})]})}const ke=Object.freeze(Object.defineProperty({__proto__:null,default:E},Symbol.toStringTag,{value:"Module"}));function D(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"MCP Enterprise Tools"}),e.jsx("p",{children:"The Model Context Protocol (MCP) lets Claude Code connect to external tools and data sources as first-class resources in a session. Where CLAUDE.md provides static context (rules, patterns, constraints), MCP provides dynamic context: the actual JIRA ticket Claude is implementing, the current state of the GitHub repository, the Confluence page describing the architecture, the Slack thread where the decision was made."}),e.jsx("p",{children:"Connecting Claude to enterprise tools via MCP transforms it from an isolated code-generation assistant into an integrated member of your engineering workflow — one that reads the same tickets, documents, and repositories as the rest of the team."}),e.jsx(s,{title:"MCP: Dynamic Context at Scale",children:"Without MCP, every Claude session starts with only the context you manually paste in. This creates a bottleneck: you spend time summarising tickets, copying error messages, and describing system state instead of directing Claude. With MCP, Claude can read the source directly — the JIRA ticket, the GitHub PR, the Confluence spec, the PagerDuty incident. This is the difference between telling Claude what the ticket says and giving Claude the ticket."}),e.jsx("h2",{children:"JIRA Integration"}),e.jsx("p",{children:"The JIRA MCP server allows Claude to read tickets, update status, add comments, and create subtasks. In a Vibe Engineering workflow, this enables the end-to-end feature workflow: Claude reads the ticket requirements directly, implements them, then updates the ticket with a summary of what was built."}),e.jsx(i,{language:"json",filename:".claude/mcp.json",children:`{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-jira"],
      "env": {
        "JIRA_HOST": "https://yourorg.atlassian.net",
        "JIRA_EMAIL": "\${JIRA_EMAIL}",
        "JIRA_API_TOKEN": "\${JIRA_API_TOKEN}"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "\${GITHUB_TOKEN}"
      }
    },
    "confluence": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-confluence"],
      "env": {
        "CONFLUENCE_HOST": "https://yourorg.atlassian.net/wiki",
        "CONFLUENCE_EMAIL": "\${CONFLUENCE_EMAIL}",
        "CONFLUENCE_API_TOKEN": "\${CONFLUENCE_API_TOKEN}"
      }
    }
  }
}`}),e.jsx(i,{language:"text",filename:"JIRA-Driven Session Example",children:`# Claude session with JIRA MCP connected

User: Read ticket PLAT-2847 and implement it following our standard workflow.

Claude:
[reads JIRA ticket PLAT-2847]

Ticket: "Add rate limiting to the public API endpoints"
Acceptance criteria from ticket:
- Max 100 requests per minute per API key
- Return 429 with Retry-After header when limit exceeded
- Rate limit counts must be stored in Redis
- Rate limit status visible in the API response headers (X-RateLimit-*)

I'll now implement this following the workflow in CLAUDE.md:

Step 1: Writing failing tests...
[writes tests/api/test_rate_limiting.py]

Step 2: Committing tests...
[runs: git add tests/ && git commit -m "test: rate limiting acceptance tests for PLAT-2847"]

Step 3: Implementing rate limit middleware...
[implements src/middleware/rate_limit.py]

Step 4: Running quality gates...
pytest: 8 tests passed
tsc: no errors
bandit: no findings

Step 5: Updating JIRA ticket...
[adds comment to PLAT-2847: "Implementation complete. PR #847 opened. All acceptance criteria satisfied."]
[transitions ticket to "In Review"]`}),e.jsx("h2",{children:"GitHub Integration"}),e.jsx("p",{children:"The GitHub MCP server gives Claude read and write access to repositories, pull requests, issues, and actions. This enables Claude to open PRs, read existing code before modifying it, check CI status, and respond to PR review comments."}),e.jsx(i,{language:"text",filename:"GitHub MCP Session Examples",children:`# Reading existing PR before implementing related changes
"Read PR #823 to understand the changes already merged to the auth module,
 then implement the session invalidation feature that was deferred from that PR."

# Opening a PR after implementation
"Create a PR for the changes on branch feat/rate-limiting with:
 - Title: feat(api): add rate limiting per PLAT-2847
 - Description generated from the changes (follow the PR template)
 - Link to JIRA ticket PLAT-2847
 - Reviewers: @alice @bob"

# Responding to review comments
"Read the review comments on PR #847 and address each one.
 For each comment: explain your change in a reply, then implement it."`}),e.jsx("h2",{children:"Confluence Integration"}),e.jsx("p",{children:"Technical decisions documented in Confluence are invisible to Claude without MCP. With the Confluence MCP server, Claude can read architectural runbooks, API documentation, onboarding guides, and decision records — and use them as context when generating code."}),e.jsx(i,{language:"text",filename:"Confluence-Driven Session",children:`# Read the architecture doc before implementing
"Before implementing the notification service, read the architecture spec at:
 https://yourorg.atlassian.net/wiki/spaces/PLAT/pages/123456/Notification+Service+Architecture

 Then implement the email notification channel following the patterns documented there."`}),e.jsx("h2",{children:"Slack Integration"}),e.jsx("p",{children:'Slack threads often contain the context that never made it into the ticket: "we decided to use Redis for this because of the discussion in #platform-eng on Tuesday." With Slack MCP, Claude can read referenced threads to recover that context.'}),e.jsx(i,{language:"json",filename:".claude/mcp.json (Slack addition)",children:`{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "\${SLACK_BOT_TOKEN}",
        "SLACK_TEAM_ID": "\${SLACK_TEAM_ID}"
      }
    }
  }
}`}),e.jsx("h2",{children:"Internal System MCP Servers"}),e.jsx("p",{children:"The most powerful MCP integrations are custom servers that connect Claude to your internal systems — feature flags, deployment systems, monitoring dashboards, internal APIs. These transform Claude from a general-purpose assistant into one that understands your specific operational environment."}),e.jsx(o,{title:"Building an Internal MCP Server",children:"An MCP server is a small Node.js or Python process that implements the MCP protocol. Anthropic provides official SDKs for both. A minimal internal MCP server for a feature flag system might expose three tools: list_flags(), get_flag(name), and create_flag(name, description, default). Once Claude has access to these tools, it can read current flag states before implementing flag-gated features, and create new flags as part of implementation."}),e.jsx(i,{language:"typescript",filename:"mcp-servers/feature-flags/index.ts",children:`import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js"
import { FeatureFlagClient } from "./client.js"

const server = new Server(
  { name: "feature-flags", version: "1.0.0" },
  { capabilities: { tools: {} } }
)

const client = new FeatureFlagClient(process.env.FLAGSMITH_URL!, process.env.FLAGSMITH_KEY!)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_flags",
      description: "List all feature flags and their current state",
      inputSchema: { type: "object", properties: {} }
    },
    {
      name: "get_flag",
      description: "Get the current state and description of a specific flag",
      inputSchema: {
        type: "object",
        properties: { name: { type: "string" } },
        required: ["name"]
      }
    }
  ]
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "list_flags") {
    const flags = await client.listFlags()
    return { content: [{ type: "text", text: JSON.stringify(flags, null, 2) }] }
  }
  if (request.params.name === "get_flag") {
    const flag = await client.getFlag(request.params.arguments!.name as string)
    return { content: [{ type: "text", text: JSON.stringify(flag, null, 2) }] }
  }
  throw new Error(Unknown tool: \${request.params.name})
})

const transport = new StdioServerTransport()
await server.connect(transport)`}),e.jsxs(l,{severity:"high",title:"MCP Credential Security",children:["MCP server configurations contain API tokens and credentials. Never commit these values directly to ",e.jsx("code",{children:".claude/mcp.json"}),". Use environment variable references (",e.jsxs("code",{children:["$","${VARIABLE_NAME}"]}),") and load them from a secrets manager or your shell environment. Add ",e.jsx("code",{children:".claude/mcp.json"})," to ",e.jsx("code",{children:".gitignore"})," if it contains any non-templated values. For team-shared configurations, use a templated version that each engineer populates from their own credentials."]}),e.jsx(a,{title:"Least-Privilege MCP Credentials",children:"Create dedicated API tokens for Claude MCP servers with the minimum required permissions. The JIRA token needs read access to tickets and write access to comments — it does not need admin access. The GitHub token needs repo read/write — it does not need organisation admin. Dedicated tokens can be rotated independently and audited separately from personal tokens."}),e.jsx(n,{type:"tip",title:"Start with Read-Only MCP",children:"When introducing MCP to a team, start with read-only integrations. Claude reading JIRA tickets and Confluence docs has no side effects. Once the team is comfortable with Claude having that context, expand to write operations (commenting on tickets, opening PRs) with explicit review of what Claude is doing before it does it. Write operations via MCP should be treated with the same review discipline as code changes."})]})}const Ce=Object.freeze(Object.defineProperty({__proto__:null,default:D},Symbol.toStringTag,{value:"Module"}));function _(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Automated Quality Gates"}),e.jsx("p",{children:"Quality gates are automated checks that enforce standards at specific points in the development workflow. In Vibe Engineering, they operate at three levels: inside the Claude session (before you see the output), at commit time (pre-commit hooks), and in CI (before the PR can merge). Each level serves a different purpose and catches a different class of issue."}),e.jsx("p",{children:"The goal is that by the time a PR reaches human review, the mechanical quality checks have already passed. Reviewers focus on architectural judgment and business correctness — not on pointing out missing semicolons, obvious security issues, or failing tests. This keeps review fast and meaningful."}),e.jsxs(s,{title:"The Three-Layer Quality Gate",children:[e.jsx("strong",{children:"Layer 1 — Agent Loop:"})," Claude runs checks after each code change and fixes issues before reporting completion. The engineer never sees code that fails these checks.",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"Layer 2 — Pre-commit:"})," Hooks run when the engineer commits. They catch issues that slip through the agent loop — for example, secrets accidentally added to test files. Fast hooks only (lint, format, secret scanning). Slow checks do not belong here.",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"Layer 3 — CI Pipeline:"})," Full checks run on every PR. All tests, full SAST, coverage thresholds, build verification, dependency audits. PRs cannot merge until all checks pass. This is the final gate before code enters the main branch."]}),e.jsx("h2",{children:"Agent Loop Quality Gates (CLAUDE.md)"}),e.jsx("p",{children:"The agent loop gates are configured in CLAUDE.md. They run inside Claude's session, before the output reaches you. This is the fastest and highest-leverage layer — every fix Claude makes in response to a failing gate takes seconds; the same fix requested via a PR comment takes hours."}),e.jsx(i,{language:"markdown",filename:"CLAUDE.md (Agent Loop Gates)",children:`## Quality Gate Sequence

After every code change, run the following checks in order.
Do NOT report a task complete until all checks pass.

### TypeScript/Node
bash
npm run build              # Fails on type errors or build errors
npm test                   # All tests must pass
npm run lint               # Zero warnings, zero errors
npm audit --audit-level=high  # No HIGH/CRITICAL CVEs


### Python/FastAPI
bash
ruff check src/            # Linting — zero issues
ruff format src/ --check   # Formatting — must match ruff format
mypy src/                  # Type check — zero errors
pytest --tb=short          # All tests must pass
bandit -r src/ -ll         # Security — no HIGH findings


### If a check fails
1. Read the error output carefully
2. Fix the issue
3. Re-run ALL checks from the beginning
4. Do not re-run only the failing check — previous checks may now fail

### Reporting
When complete, include in your response:
- Number of tests run and passed
- Lines of code changed (additions/deletions)
- Any lint warnings you fixed
- Any security findings you remediated`}),e.jsx("h2",{children:"Pre-Commit Hooks"}),e.jsx("p",{children:"Pre-commit hooks are the commit-time gate. They should be fast (under 10 seconds) and focused on things that are cheap to check but expensive to miss: secret scanning, basic formatting, and syntax errors. Slow checks in pre-commit hooks frustrate engineers and get bypassed."}),e.jsx(i,{language:"yaml",filename:".pre-commit-config.yaml",children:`repos:
  # Secret scanning — highest priority
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']

  # Git-leaks as a second secret scanner
  - repo: https://github.com/zricethezav/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks

  # Formatting (fast — uses cached results)
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.3.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  # Prevent large files (catch accidental binary commits)
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: check-added-large-files
        args: ['--maxkb=500']
      - id: check-merge-conflict
      - id: check-yaml
      - id: end-of-file-fixer
      - id: trailing-whitespace`}),e.jsx(i,{language:"bash",filename:"Install and configure pre-commit",children:`# Install pre-commit
pip install pre-commit

# Install the git hooks
pre-commit install

# Initialize the secrets baseline (first time setup)
detect-secrets scan > .secrets.baseline

# Run all hooks against all files (initial setup check)
pre-commit run --all-files`}),e.jsx(i,{language:"markdown",filename:"CLAUDE.md (Pre-commit note)",children:`## Committing Changes

Pre-commit hooks are installed and will run automatically on git commit.

If a pre-commit hook fails:
- detect-secrets: You may have accidentally included a credential — review the diff
  immediately. Do NOT use --no-verify to bypass this check.
- ruff: The hook auto-fixes most issues. Re-stage the modified files and commit again.
- check-added-large-files: Do not commit binary files. Use Git LFS if large files
  are genuinely needed.

Never use git commit --no-verify. If a hook is blocking a legitimate commit,
flag it to a senior engineer — do not bypass it unilaterally.`}),e.jsx("h2",{children:"CI Pipeline Quality Gates"}),e.jsx("p",{children:"The CI pipeline is the authoritative quality gate. It runs in a clean environment, against the real dependencies, and its results cannot be influenced by local environment differences. A PR that fails CI does not merge, period."}),e.jsx(i,{language:"yaml",filename:".github/workflows/quality.yml",children:`name: Quality Gates

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  quality:
    name: All Quality Checks
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'

      - name: Install dependencies
        run: pip install -r requirements-dev.txt

      # Gate 1: Linting and formatting
      - name: Ruff lint
        run: ruff check src/ tests/

      - name: Ruff format check
        run: ruff format src/ tests/ --check

      # Gate 2: Type checking
      - name: MyPy type check
        run: mypy src/

      # Gate 3: Tests with coverage
      - name: Run tests
        run: pytest --cov=src --cov-report=xml --cov-fail-under=80
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost/test_db

      # Gate 4: Security scanning
      - name: Bandit SAST
        run: bandit -r src/ -f json -o bandit-report.json
        continue-on-error: false

      - name: Safety dependency audit
        run: safety check --full-report

      - name: Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: auto

      # Gate 5: Build verification
      - name: Docker build
        run: docker build -t app:ci .`}),e.jsx("h2",{children:"Coverage Thresholds"}),e.jsx("p",{children:"Coverage thresholds in CI prevent the gradual erosion that happens when new code is added without tests. Set the threshold at your current coverage level and enforce that it can only go up — never down."}),e.jsx(i,{language:"ini",filename:"pyproject.toml (coverage config)",children:`[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "--cov=src --cov-report=term-missing --cov-fail-under=80"

[tool.coverage.run]
omit = [
    "*/migrations/*",
    "*/tests/*",
    "*/conftest.py",
]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "if TYPE_CHECKING:",
    "raise NotImplementedError",
]`}),e.jsx(o,{title:"Ratchet Pattern for Coverage",children:`Rather than a fixed coverage threshold (which can feel arbitrary), use a ratchet: record the current coverage in a file committed to the repository, and fail CI if coverage drops below that value. As coverage improves, update the ratchet. The ratchet never moves backwards. This creates continuous improvement without the "we're already at 80%, close enough" problem.`}),e.jsx(r,{title:"Do Not Bypass CI Gates Under Pressure",children:"The most dangerous moment for quality gates is a production incident that needs a hotfix. Pressure to merge quickly creates pressure to bypass checks. This is exactly the wrong response — code under pressure is more likely to have errors, not less. Configure your CI to allow repository admins to bypass checks only in explicit emergency scenarios, and require that bypassed checks are re-run after the emergency is resolved. Every bypass should be logged and reviewed in the post-incident report."}),e.jsx(a,{title:"CLAUDE.md Must Match CI",children:"The checks Claude runs in-session must match the checks CI runs. If Claude runs ruff but CI runs pylint, Claude will produce code that passes its own checks but fails CI. Maintain a single source of truth: the check commands in CLAUDE.md should be copy-paste identical to the CI steps. When CI configuration changes, CLAUDE.md must be updated simultaneously."}),e.jsx(n,{type:"tip",title:"Branch Protection Rules",children:"Configure branch protection rules in GitHub/GitLab to require CI to pass before merge, require at least one human code review approval, and dismiss stale approvals when new commits are pushed. These rules enforce the quality gate process even when delivery pressure is high. They should be enabled from the start of the project, not added after the first production incident."})]})}const Ie=Object.freeze(Object.defineProperty({__proto__:null,default:_},Symbol.toStringTag,{value:"Module"}));function L(){return e.jsxs("div",{children:[e.jsxs(s,{title:"AI-TDD Loop",children:[e.jsx("p",{children:"AI-First Test-Driven Development reframes the classic TDD cycle around what AI agents are actually good at: running code in a loop until an objective criterion is satisfied. Tests are that criterion. When you write tests before implementation, you give Claude Code a machine-verifiable specification it can execute, evaluate, and iterate against without human supervision."}),e.jsx("p",{children:"The five-step AI-TDD cycle:"}),e.jsxs("ol",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Write failing tests that specify behavior."})," You, the human, write tests that encode exactly what the code must do. These tests fail today because the implementation does not exist yet. That failure is intentional — it proves the tests are real."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Commit tests to git."})," Commit the test files before touching any implementation code. This creates an immutable, timestamped specification. The git history proves you defined the contract before the implementation, and it prevents scope creep during the Claude session."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Give Claude Code the tests and requirements."})," Open Claude Code and provide the test files alongside relevant context: your CLAUDE.md constraints, the data models involved, any external API contracts. Claude now has everything it needs to work autonomously."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Claude implements until all tests pass."})," Claude writes the implementation, runs the test suite, reads failures, adjusts the code, and repeats. This loop continues until every test passes. You do not need to be present during this phase — Claude is working against an objective target."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Human reviews implementation for correctness and security."})," When Claude reports all tests green, you review the implementation. You are not checking whether it works — the tests already verified that. You are checking whether the approach is sound, whether there are security concerns the tests did not capture, and whether the code is maintainable."]})]}),e.jsx("p",{children:`The critical insight is that tests transform a vague instruction ("build a user registration endpoint") into a precise, executable contract. Claude cannot argue with a failing test. It either passes or it does not. This eliminates the ambiguity that makes AI-generated code unreliable, and it means you can verify Claude's output without reading every line.`})]}),e.jsx(t,{title:"Test-First: FastAPI User Service",tabs:[{label:"python",language:"python",filename:"tests/test_user_service.py",code:`# tests/test_user_service.py - Written BEFORE implementation
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

Run pytest after implementing. All 4 tests must pass before you stop.`}]}),e.jsxs("p",{children:["Notice what these tests specify without saying so explicitly. The 201/422/409 status codes define the entire HTTP contract. The ",e.jsx("code",{children:'assert "password" not in data'})," assertion encodes a security requirement. The bcrypt prefix check verifies a cryptographic implementation detail. You have written the security policy as code. Claude cannot comply with the security requirements without satisfying the tests, and it cannot fake compliance — the tests run against real behavior."]}),e.jsxs(o,{title:"Red-Green-Refactor with AI",children:[e.jsx("p",{children:"The classic Red-Green-Refactor cycle maps cleanly onto the human/AI collaboration model, with each phase assigned to whoever is best suited for it."}),e.jsxs("dl",{children:[e.jsx("dt",{children:e.jsx("strong",{children:"RED — Write failing tests (human writes these)"})}),e.jsx("dd",{children:"You write the tests. This is not a step you can or should delegate to Claude. Writing tests requires understanding the business requirements, the security constraints, the edge cases that matter for your domain. This is where your expertise is irreplaceable. The tests you write in this phase become the specification Claude will work against. Invest time here — a shallow test suite produces shallow implementations."}),e.jsx("dt",{children:e.jsx("strong",{children:"GREEN — Claude implements code to pass tests (AI does this)"})}),e.jsxs("dd",{children:["Claude takes the failing tests and implements code to make them pass. This is mechanical, iterative work — exactly what Claude is fast at. Claude runs"," ",e.jsx("code",{children:"pytest"}),", reads the failure output, adjusts the code, runs again. It continues until the suite is green. You do not supervise this loop. You gave Claude an objective success criterion; let it work."]}),e.jsx("dt",{children:e.jsx("strong",{children:"REFACTOR — Human reviews and Claude assists cleanup (collaborative)"})}),e.jsx("dd",{children:"Once tests are green, you review the implementation for code quality, security issues the tests did not cover, and architectural concerns. Claude assists by explaining its choices, suggesting cleanup, and implementing refactors you direct. This phase is a conversation — you bring judgment, Claude brings execution speed."})]}),e.jsx("p",{children:'The power of this division is that the phases are cleanly separated by verifiability. Red phase produces something verifiable. Green phase is verified by running tests. Refactor phase preserves test-verified behavior while improving structure. At no point does "it seems to work" substitute for a passing test suite.'})]}),e.jsx("h3",{children:"Property-Based Testing with AI"}),e.jsx("p",{children:"Example-based tests verify specific inputs. Property-based tests verify invariants across thousands of generated inputs. When you combine property-based testing with Claude Code, you can specify the mathematical properties a function must satisfy and let hypothesis find the edge cases that break your implementation."}),e.jsx("p",{children:'Ask Claude: "Using hypothesis, generate property-based tests for the Payment model that verify the invariant that amount is always positive and never exceeds the account balance." Claude will write the hypothesis strategies, run them, and if a counterexample is found, it will fix the implementation until the property holds universally.'}),e.jsx(i,{language:"python",filename:"test_payment_processor.py",children:`from hypothesis import given, strategies as st
import pytest

@given(
    amount=st.decimals(min_value=0.01, max_value=999999.99, places=2),
    currency=st.sampled_from(["USD", "EUR", "GBP"])
)
def test_payment_amount_always_rounds_to_cents(amount, currency):
    """Property: any valid payment amount should round correctly."""
    payment = Payment(amount=amount, currency=currency)
    assert len(str(payment.amount).split(".")[-1]) <= 2`}),e.jsx("p",{children:"This test will run hundreds of times with different decimal values. If any combination produces a Payment where the amount has more than two decimal places — a rounding bug that could cause accounting discrepancies — hypothesis finds it and reports the minimal failing example. Claude can then fix the rounding logic and re-run until the property holds for all inputs."}),e.jsx("h3",{children:"Contract Testing Between Microservices"}),e.jsx("p",{children:"In a microservices architecture, teams write code against each other's APIs. Contract tests let the consumer team define what they expect from a provider before the provider implements it. This is the AI-TDD model applied at the service boundary level: write the contract first, then let the provider team (or Claude) implement to satisfy it."}),e.jsx(i,{language:"python",filename:"test_consumer_contract.py",children:`# Consumer-driven contract test — written by the consumer team
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
        assert result["available"] is True`}),e.jsxs("p",{children:['When you give this contract test to Claude along with the instruction "implement the InventoryService ',e.jsx("code",{children:"/inventory/{product_id}"}),' endpoint to satisfy this Pact contract", Claude has a precise, machine-verifiable target. The Pact framework will run the contract against the real implementation. If it does not match, Claude gets a structured failure message and can adjust. The consumer team never needs to coordinate synchronously with the provider team — the contract does it.']}),e.jsxs(r,{children:["Never skip the test review step. Claude can write tests that pass vacuously — for example, ",e.jsx("code",{children:"assert True"}),', or a test that only exercises the happy path and ignores the behavior the test name claims to verify. Before committing any Claude-written tests to your repository, review each one for: Does it actually test the behavior described? Would it catch a real regression if someone removed the relevant code? If the answer to either question is no, the test is not a test — it is a false sense of security. This applies especially to tests Claude writes during the Green phase when you ask it to "add more test coverage."']}),e.jsx(a,{title:"Tests Are the Sacred Spec",children:`Commit your tests before asking Claude to implement. This creates an immutable specification anchored in git history. If during implementation Claude suggests changing a test to make it pass — for example, weakening an assertion or removing a case that "seems unnecessary" — reject it. You gave Claude the spec; the spec is sacred. Claude's job is to make the existing tests pass, not to redefine what passing means. The one exception: if a test is genuinely wrong (it encodes a requirement you misunderstood), you can change it — but do that consciously, with a separate commit and a clear comment explaining why the requirement changed. Never let Claude quietly weaken a test as a shortcut to green.`}),e.jsx(n,{type:"tip",children:"The best AI-TDD sessions start with boundary conditions first: empty input, maximum values, invalid types, concurrent writes, missing required fields. These edge cases constrain the implementation more tightly than happy-path tests and reveal assumptions Claude might otherwise make silently. A happy-path test for user creation tells Claude what to build. A test for duplicate email, a test for a 10,000-character name, and a test for a null password together tell Claude how to build it safely. Write the hard cases first, commit them, then let Claude implement."})]})}const je=Object.freeze(Object.defineProperty({__proto__:null,default:L},Symbol.toStringTag,{value:"Module"}));function O(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Feature Workflow: JIRA to PR"}),e.jsx("p",{children:"The end-to-end feature workflow is where Vibe Engineering produces its most dramatic gains in delivery velocity. With JIRA MCP connected, Claude can read a ticket, ask clarifying questions, create a plan, implement with tests, run quality gates, and open a PR — all as a single orchestrated workflow. What previously took a full day of context-switching between systems can be compressed into a focused 2-3 hour session."}),e.jsx("p",{children:"This section describes the complete workflow as a repeatable pattern, with the specific commands and checkpoints where human judgment is required."}),e.jsx(s,{title:"The Assisted Feature Workflow",children:"The goal is not to remove the engineer from the feature implementation. The goal is to remove the mechanical work — reading and reformatting ticket content, setting up boilerplate, remembering command syntax, writing test scaffolding — so the engineer can focus on the decisions that require judgment: understanding the business intent, evaluating architectural tradeoffs, reviewing the implementation for correctness and security."}),e.jsx("h2",{children:"Phase 1: Ticket to Plan (10 minutes)"}),e.jsx("p",{children:"The first phase turns a JIRA ticket into an implementation plan that the engineer reviews before any code is written. This plan is the contract for the session — it defines scope, identifies risks, and surfaces questions before they become implementation assumptions."}),e.jsx(i,{language:"text",filename:"Phase 1 Prompt",children:`Read JIRA ticket $TICKET_ID and create an implementation plan.

The plan must include:
1. Summary of what needs to be built (in your own words, not copy-paste)
2. Files to be created or modified (with brief explanation of why each)
3. External dependencies this touches (APIs, services, databases)
4. Risks or ambiguities that need clarification before implementation
5. Estimated test cases (happy path + error cases)
6. Any CLAUDE.md constraints that are particularly relevant to this ticket

Do NOT write any code yet. Output only the plan.
I will review it and confirm before you proceed.`}),e.jsx("p",{children:"The engineer reads the plan. If anything is wrong — the scope is too broad, a risk was missed, an architectural concern isn't addressed — they correct it now, not after hours of implementation. The plan review is a 5-minute investment that prevents multi-hour rework."}),e.jsx("h2",{children:"Phase 2: Branch and Tests (20 minutes)"}),e.jsx("p",{children:"Once the plan is approved, Claude creates the feature branch and writes the tests. The tests are committed before any implementation — this is the AI-TDD discipline applied to the full feature workflow."}),e.jsx(i,{language:"text",filename:"Phase 2 Prompt",children:`Plan approved. Proceed with phase 2.

1. Create a feature branch: git checkout -b feat/$TICKET_ID-$SLUG

2. Write the failing tests as specified in the plan.
   Tests live in tests/ following our existing structure.
   Each test must have a docstring explaining what behavior it verifies.

3. Run the tests to confirm they fail for the right reasons (not import errors):
   pytest tests/[relevant test file] -v

4. Commit the tests:
   git add tests/
   git commit -m "test($TICKET_ID): add acceptance tests for [feature name]"

5. Report: test file paths created, test names, and the failure reason for each
   (what error they produce when run against the current implementation).`}),e.jsx("h2",{children:"Phase 3: Implementation (1-2 hours)"}),e.jsx("p",{children:"This is the phase where Claude does the most work autonomously. The engineer can be doing other things while Claude iterates — the tests provide the objective success criterion, so there is no need to supervise each iteration."}),e.jsx(t,{title:"Phase 3: Implementation Session",tabs:[{label:"prompt",language:"text",filename:"Phase 3 prompt",code:`Tests committed. Proceed with implementation.

Implement the feature to make all tests in the committed test files pass.

Constraints from CLAUDE.md apply. Additional constraints for this ticket:
- [any ticket-specific constraints identified in the plan]

After each significant change, run:
pytest tests/[relevant files] --tb=short

Continue iterating until all tests pass.

When all tests pass, run the full quality gate sequence from CLAUDE.md:
1. pytest --cov=src --cov-fail-under=80
2. ruff check src/ && ruff format src/ --check
3. mypy src/
4. bandit -r src/ -ll

Report: tests passing, coverage percentage, any lint/type/security issues found and how you resolved them.`},{label:"completion",language:"text",filename:"Expected completion report",code:`Implementation complete for PLAT-2847 (Rate Limiting).

Tests: 12 passed, 0 failed
New tests: tests/api/test_rate_limiting.py (8 tests)
Updated tests: tests/middleware/test_middleware_stack.py (4 tests)

Coverage: 84.2% (was 83.1% — increased)

Files created:
  src/middleware/rate_limit.py          (127 lines)
  src/redis/rate_limit_store.py         (45 lines)

Files modified:
  src/main.py                           (added middleware registration)
  src/config/settings.py               (added RATE_LIMIT_* env vars)

Quality gates:
  ruff: ✅ clean
  mypy: ✅ clean
  bandit: ✅ clean (0 findings)

One decision I made: chose sliding window algorithm over fixed window because
the acceptance criteria says "100 requests per minute" — fixed window can
allow 200 requests in a 2-minute span at window boundaries. Sliding window
prevents this. If you prefer fixed window for simplicity, I can change it.`}]}),e.jsx("h2",{children:"Phase 4: Human Review (15-30 minutes)"}),e.jsx("p",{children:"This is the non-delegatable phase. The engineer reviews every diff, not the summary. They verify that the implementation makes sense, the tests actually test what they claim, and no security or architectural issues slipped through."}),e.jsx(i,{language:"text",filename:"Review Checklist",children:`## Implementation Review Checklist

### Code Review
- [ ] Read every line of every modified file (not just the summary)
- [ ] The implementation matches the plan (no undiscussed scope creep)
- [ ] Tests actually test the claimed behavior (not vacuous assertions)
- [ ] Error handling is correct (not silent swallows, not generic 500s)
- [ ] Logging uses the standard logger (no console.log / print statements)
- [ ] No new environment variables without docs/env.example update

### Security Review
- [ ] No new SQL queries without parameterization
- [ ] No new external HTTP calls without timeout
- [ ] No sensitive data in logs
- [ ] Auth checks present on new endpoints

### Architecture Review
- [ ] Implementation follows the patterns in CLAUDE.md
- [ ] No new dependencies without explicit justification
- [ ] ADR implications considered (no decisions that contradict existing ADRs)

If anything in this list fails, return to Claude with specific feedback.`}),e.jsx("h2",{children:"Phase 5: PR Creation (10 minutes)"}),e.jsx("p",{children:"Once the engineer approves the implementation, Claude creates the PR with a complete description. This description is not a summary of what changed — it is a professional communication to reviewers that explains the context, the approach, and what reviewers should focus on."}),e.jsx(i,{language:"text",filename:"Phase 5 Prompt",children:`Implementation approved. Create a pull request.

PR requirements:
- Title: "feat(rate-limiting): implement per-API-key rate limiting [PLAT-2847]"
- Branch: feat/PLAT-2847-rate-limiting → main
- Description must include:
  * What problem this solves (context from the ticket)
  * What approach was taken and why (the sliding window decision, etc.)
  * What tests cover this feature
  * What to look for in review (any areas of uncertainty)
  * Link to JIRA ticket PLAT-2847
  * Any follow-up work deferred to future tickets

After creating the PR:
1. Transition JIRA ticket PLAT-2847 to "In Review"
2. Add a comment on the JIRA ticket with the PR URL
3. Report the PR URL`}),e.jsxs(o,{title:"The 5-Phase Workflow as a Slash Command",children:["Encode this entire workflow as a slash command in ",e.jsx("code",{children:".claude/commands/feature.md"}),"so any engineer can invoke it with ",e.jsx("code",{children:"/feature PLAT-2847"}),". The command file encodes the five phases, the commit conventions, the quality gate sequence, and the PR template. New engineers on the team immediately have access to the complete workflow without needing to learn each step individually."]}),e.jsx(a,{title:"One Ticket per Session",children:"Keep each Claude session focused on one JIRA ticket. Multi-ticket sessions lead to scope creep, interleaved implementations that are hard to review, and commits that touch multiple concerns. The ticket boundary is also the natural PR boundary — one ticket, one PR, one focused review. If a ticket is too large for one session, decompose it into subtasks before starting."}),e.jsx(n,{type:"tip",title:"The Review is Where the Value Is",children:`It is tempting to measure Vibe Engineering productivity by how fast Claude generates the implementation. But the value is created in the review — the moment when an experienced engineer reads Claude's approach and confirms "yes, that's the right way to do this in our system." Speed without review is vibe coding. Speed with thorough review is Vibe Engineering. Protect the time for review; do not compress it.`})]})}const Te=Object.freeze(Object.defineProperty({__proto__:null,default:O},Symbol.toStringTag,{value:"Module"}));function q(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"AI Pair Programming"}),e.jsx("p",{children:'Traditional pair programming has one driver (who writes the code) and one navigator (who thinks about the bigger picture, catches mistakes, and asks "why are we doing it this way?"). The practice works because it forces continuous explanation and review — you cannot silently make a questionable decision when your partner is watching.'}),e.jsx("p",{children:"AI pair programming changes the role assignments. Claude is almost always the most effective driver — it writes code faster and makes fewer syntax errors than a human. The engineer is almost always the most effective navigator — they understand the business context, the architectural constraints, and the failure modes that Claude will not consider unless prompted."}),e.jsx("p",{children:"The key to effective AI pair programming is knowing when each party should lead — and when to intervene."}),e.jsx(s,{title:"The Human as Navigator",children:"In AI pair programming, the engineer's primary job is navigation: directing where the code is going, checking the path is correct, and catching when the driver has gone off-course. This requires staying mentally engaged with what Claude is doing — not reviewing the final output, but watching the approach as it develops and redirecting before the wrong approach is fully implemented. A navigator who only reviews the finished result is not pair programming; they are code reviewing."}),e.jsx("h2",{children:"When to Lead vs. When to Delegate"}),e.jsx("h3",{children:"Let Claude Lead"}),e.jsx("p",{children:"Claude excels at tasks that are well-defined, follow patterns it has seen many times, and have clear success criteria. Delegating these tasks frees the engineer for higher-judgment work."}),e.jsxs("ul",{children:[e.jsx("li",{children:"Implementing functions once you have specified the interface and tests"}),e.jsx("li",{children:"Writing boilerplate (model definitions, migration files, test fixtures)"}),e.jsx("li",{children:"Adding error handling to existing functions following established patterns"}),e.jsx("li",{children:"Implementing CRUD endpoints that follow your API conventions"}),e.jsx("li",{children:"Translating a data schema into ORM models"}),e.jsx("li",{children:"Writing docstrings and inline comments"}),e.jsx("li",{children:"Refactoring for style consistency after the logic is correct"})]}),e.jsx("h3",{children:"The Engineer Must Lead"}),e.jsx("p",{children:"The engineer must lead when the task requires judgment that cannot be encoded in a prompt: deep knowledge of the organisation's history, strategic context, or the specific failure modes of the existing system."}),e.jsxs("ul",{children:[e.jsx("li",{children:"Deciding which of two valid architectures fits the team's capabilities better"}),e.jsx("li",{children:"Understanding why a legacy system works the way it does before modifying it"}),e.jsx("li",{children:"Evaluating whether a new dependency is safe to introduce given the organisation's risk profile"}),e.jsx("li",{children:"Determining whether a performance issue is worth fixing now or later"}),e.jsx("li",{children:"Assessing the blast radius of a breaking API change"}),e.jsx("li",{children:"Deciding what tests are actually necessary vs. what tests just increase coverage numbers"})]}),e.jsx("h2",{children:"Effective Navigation Techniques"}),e.jsx("h3",{children:"Frontload the Constraints"}),e.jsx("p",{children:'The most expensive navigating is correcting wrong turns after they have been fully implemented. Prevent wrong turns by giving Claude the constraints that define "right" before implementation begins — not as feedback after the fact.'}),e.jsx(i,{language:"text",filename:"Constraint-First Navigation",children:`# Less effective: Let Claude implement, then correct
"Implement the payment processing service"
[Claude implements with Stripe, which we don't use]
"Actually we use Braintree — redo it"

# More effective: Constraints first
"Implement the payment processing service.
 Constraints:
 - Use the Braintree SDK (see src/clients/braintree.ts for the wrapper)
 - All amounts in cents (integer) — never floating point
 - Log transaction IDs but never card numbers or CVVs
 - All failures must update the order status to PAYMENT_FAILED via OrderService
 Now implement."`}),e.jsx("h3",{children:"Ask for the Plan Before the Code"}),e.jsx("p",{children:`For any non-trivial task, ask Claude to describe its approach before writing code. This is the pair programming equivalent of the navigator saying "before you start, walk me through what you're going to do." A bad approach caught at the description stage costs 30 seconds to correct. The same approach caught after full implementation costs an hour.`}),e.jsx(i,{language:"text",filename:"Plan-Before-Code Prompt",children:`Before writing any code, describe your approach for implementing the
distributed lock mechanism.

Tell me:
1. Which algorithm you plan to use and why
2. Which Redis commands you will use
3. How you will handle lock expiry and renewal
4. How you will handle the case where the lock holder crashes

Do not write any code yet. I will approve or redirect the approach first.`}),e.jsx("h3",{children:"Rubber Duck Debugging with AI"}),e.jsx("p",{children:"When debugging a complex issue, narrate the problem to Claude as if explaining it to a colleague who is unfamiliar with the codebase. This forces you to articulate your mental model, which often surfaces the misunderstanding that is causing the bug. Claude can then ask clarifying questions or suggest what you might have missed."}),e.jsx(o,{title:"The Debugging Dialogue",children:`Effective debugging with an AI pair is a dialogue, not a request. Start with "here's what I observe, here's what I expect, and here's what I've already ruled out." Claude responds with hypotheses. You verify each one. Claude narrows. You find the bug. This process is faster than asking Claude to "fix this bug" — because Claude doesn't have the runtime context you have from watching the system misbehave.`}),e.jsx("h2",{children:"Handling Claude Mistakes"}),e.jsx("p",{children:"Claude makes characteristic mistakes. Knowing the patterns lets you catch them quickly without reviewing everything with equal suspicion."}),e.jsx("h3",{children:"Confident Wrongness"}),e.jsx("p",{children:"Claude writes incorrect code with the same confident tone as correct code. The most dangerous form is when it implements a slightly wrong version of a security pattern — JWT validation that technically runs but is bypassable, rate limiting that has an off-by-one in the window calculation, bcrypt with the cost factor hardcoded to 10 instead of 12. These pass a casual review. Review security-critical code with active suspicion, not passive approval."}),e.jsx("h3",{children:"Scope Creep"}),e.jsx("p",{children:'Claude sometimes implements more than you asked for, especially when it sees "related" improvements it could make. This is usually well-intentioned but creates unreviewed changes. If Claude modifies files outside the scope you defined, do not accept the changes without understanding them — even if they look like improvements.'}),e.jsx(i,{language:"markdown",filename:"CLAUDE.md (Scope Constraint)",children:`## Scope

Only modify files that are directly required to implement the requested task.
Do NOT:
- Refactor code you notice but that is not related to the current task
- Add features that "seem useful" but were not requested
- Update dependencies unless the task requires a new dependency
- Modify test files that are not failing or not related to the current task

If you notice something worth improving outside the current scope, mention it
as a suggestion but do not implement it without explicit approval.`}),e.jsx("h3",{children:"Test Weakening"}),e.jsx("p",{children:"When tests fail, Claude's first instinct is sometimes to weaken the test rather than fix the implementation — change an assertion to be less strict, add a try/except that swallows the failure, or mock the thing being tested. Watch for this pattern. Tests represent the specification; they should not change unless the specification changed."}),e.jsx(r,{title:"Never Allow Claude to Modify Tests to Make Them Pass",children:"If Claude proposes changing a test assertion to fix a failing test — weakening a check, removing a case, or mocking a dependency that the test is supposed to exercise — reject it. The test represents a requirement. If the test is wrong, you change it consciously with a clear commit message explaining why the requirement changed. If the implementation is wrong, the implementation changes. Tests are not obstacles to work around."}),e.jsx(a,{title:"Rotate Focus Every 25 Minutes",children:"In extended AI pair programming sessions, rotate your focus: 25 minutes of directing Claude on implementation tasks, then 5 minutes of reviewing what was built. This prevents the drift where you realise after two hours that Claude took an approach that diverged from what you intended 90 minutes ago. Short review cycles catch drift early when it is cheap to correct."}),e.jsx(n,{type:"tip",title:"Use Claude's Uncertainty as a Signal",children:`When Claude explicitly expresses uncertainty ("I'm not sure this is the right approach for your codebase" or "this depends on how you've structured X"), treat it as a signal to lead. Claude is telling you that it doesn't have enough context to make the right choice autonomously. Step in, provide the context, make the decision, then hand back to Claude for execution. Uncertainty is not a failure — it is the system working correctly.`})]})}const Se=Object.freeze(Object.defineProperty({__proto__:null,default:q},Symbol.toStringTag,{value:"Module"}));function N(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Large-Scale Cross-File Changes"}),e.jsx("p",{children:"Some changes are inherently wide — they touch dozens or hundreds of files across a codebase. Renaming a domain concept, changing an error handling pattern, migrating a library version, adding a new required parameter to a foundational function. These changes are tedious, error-prone, and risky when done manually. They are also exactly the kind of mechanical, pattern-following work that Claude excels at — when approached with the right strategy."}),e.jsx("p",{children:"The risks of large-scale AI changes are different from the risks of small changes. An incorrect small change affects one file and is easy to spot in review. An incorrect pattern applied to 50 files is hard to spot because the sheer volume of the diff overwhelms the reviewer's attention. The safety strategy is to decompose large changes into stages, each of which is independently verifiable."}),e.jsx(s,{title:"Staged Cross-File Changes",children:"Never attempt a large cross-file change in a single Claude session with a single commit. Instead, decompose the change into stages: (1) an automated search to identify the scope, (2) a small pilot on 1-2 files, (3) review and approval of the pilot, (4) application of the pattern to remaining files in batches, (5) verification after each batch. This staged approach means no individual review requires reading hundreds of files — each stage is a manageable scope."}),e.jsx("h2",{children:"Step 1: Scope Discovery"}),e.jsx("p",{children:"Before touching any code, understand the full scope of the change. Claude can search the codebase to identify every file that needs modification, grouped by the type of change required."}),e.jsx(i,{language:"text",filename:"Scope Discovery Prompt",children:`We need to migrate from the deprecated logger.log() API to the new structured logger.
Do NOT modify any files yet.

First, find all usages across the codebase:
1. Run: grep -r "logger.log(" src/ --include="*.ts" -l
2. Run: grep -r "console.log(" src/ --include="*.ts" -l
3. For each file found, categorize:
   - Type A: Only uses logger.log() with a string message (simple replacement)
   - Type B: Uses logger.log() with interpolated variables (needs restructuring)
   - Type C: Uses console.log() (needs import change + restructuring)

Report:
- Total files affected
- Count per type
- First 3 examples of each type with the current code and proposed replacement

Do not make any changes.`}),e.jsx("h2",{children:"Step 2: Pilot on Representative Files"}),e.jsx("p",{children:"Pick one file of each type and have Claude apply the change. Review the pilot carefully — this is where you validate that Claude's pattern is correct before it is applied at scale."}),e.jsx(i,{language:"text",filename:"Pilot Change Prompt",children:`Apply the logger migration to these three pilot files only:
- src/services/order.service.ts (Type A)
- src/api/payment.handler.ts (Type B)
- src/workers/email.worker.ts (Type C)

For each file:
1. Show me the BEFORE and AFTER diff (use diff format)
2. Explain any decisions you made that aren't mechanical
3. Do not commit yet

I will review the three diffs, then decide whether to proceed with the full migration.`}),e.jsx("p",{children:"Read the pilot diffs. Check that the pattern is exactly right. If anything is wrong — a missed edge case, an incorrect restructuring, a new import that's wrong — correct it in the pilot before applying it to the remaining files. One correction in the pilot vs. the same correction across 47 files."}),e.jsx("h2",{children:"Step 3: Batch Application with Verification"}),e.jsx("p",{children:"Apply the change in batches of 5-10 files, running the test suite after each batch. If a batch introduces a regression, the blast radius is limited to 10 files and you know which batch caused it."}),e.jsx(i,{language:"text",filename:"Batch Application Prompt",children:`Pilot approved. Apply the logger migration in batches.

Batch 1 (Type A files — simple replacements):
Apply to: src/services/user.service.ts, src/services/product.service.ts,
          src/services/cart.service.ts, src/services/notification.service.ts,
          src/services/audit.service.ts

After each batch:
1. Run: npm test
2. Run: npx tsc --noEmit
3. Report: tests passing, type check clean, files modified

If tests fail after a batch, stop and report which test failed and in which file.
Do not proceed to the next batch until I confirm.`}),e.jsx("h2",{children:"Pattern: Rename Across Codebase"}),e.jsx("p",{children:"Renaming a concept — a class name, a database column that's reflected in models, a configuration key — requires changes that span models, migrations, tests, API responses, and documentation. Claude can orchestrate this safely with careful staging."}),e.jsx(i,{language:"text",filename:"Rename Workflow",children:`We are renaming the concept 'Customer' to 'Account' across the codebase.
This is a breaking change that requires a two-phase migration.

Phase 1 (today — backwards compatible):
1. Add 'account_id' as an alias alongside 'customer_id' in the API response
2. Update the domain model to accept both names
3. Add deprecation warnings when 'customer_id' is used
4. Update internal code to use 'account' terminology
5. Do NOT remove 'customer_id' from the API yet

Phase 2 (next release — after all consumers migrated):
1. Remove 'customer_id' from API responses
2. Generate migration to rename the database column

Start with Phase 1 only. Show me the file list before making changes.`}),e.jsx("h2",{children:"Codemod-Assisted Changes"}),e.jsx("p",{children:"For syntactic changes (import renaming, API signature changes), AST-based codemods are more reliable than text replacement. Claude can generate codemods using jscodeshift (JavaScript) or libCST (Python) that make precise, syntactically correct changes."}),e.jsx(i,{language:"javascript",filename:"Generated jscodeshift codemod",children:`// codemod: migrate-logger-import.js
// Generated by Claude — migrates from old logger to structured logger
export default function transform(file, api) {
  const j = api.jscodeshift
  const root = j(file.source)

  // Replace: import { logger } from '../utils/logger'
  // With:    import { createLogger } from '../lib/structured-logger'
  root
    .find(j.ImportDeclaration, {
      source: { value: (v) => v.includes('utils/logger') },
    })
    .forEach((path) => {
      path.node.source.value = '../lib/structured-logger'
      path.node.specifiers.forEach((spec) => {
        if (spec.local.name === 'logger') {
          spec.imported.name = 'createLogger'
        }
      })
    })

  // Replace: logger.log('message') with logger.info({ msg: 'message' })
  root
    .find(j.CallExpression, {
      callee: {
        object: { name: 'logger' },
        property: { name: 'log' },
      },
    })
    .forEach((path) => {
      path.node.callee.property.name = 'info'
      if (path.node.arguments.length === 1 &&
          path.node.arguments[0].type === 'StringLiteral') {
        const msg = path.node.arguments[0].value
        path.node.arguments = [j.objectExpression([
          j.property('init', j.identifier('msg'), j.stringLiteral(msg))
        ])]
      }
    })

  return root.toSource()
}`}),e.jsx(o,{title:"Human-in-the-Loop for Large Changes",children:"For changes affecting more than 20 files, insert a mandatory human review checkpoint after every 20-file batch. The reviewer should sample-check 3-5 files randomly from the batch — not just the first and last — to verify the pattern was applied consistently. Sample checking is not thorough review; it is anomaly detection. If any sampled file has an issue, review the full batch before proceeding."}),e.jsx(r,{title:"Test Coverage is Not Optional for Large Changes",children:`Large cross-file changes with low test coverage are particularly dangerous. Tests are the only way to verify that a mechanical change did not introduce a semantic error. If the codebase has low coverage in the areas being changed, add tests before the cross-file change — not after. "We'll add tests later" is how silent regressions from large refactorings stay hidden in production for months.`}),e.jsx(a,{title:"One Change Type Per Commit",children:'Each batch commit should contain only one type of change. "Rename Customer to Account in service layer" is one commit. "Rename Customer to Account in API handlers" is a separate commit. "Rename Customer to Account in tests" is a separate commit. This granularity makes the git history navigable if you need to bisect a regression — you can immediately see which layer introduced the issue.'}),e.jsx(n,{type:"info",title:"Large Changes are a Test of Your Test Suite",children:"A large cross-file change that your test suite catches quickly is a sign of good tests. A large change that slips into production undetected is a sign of test gaps. Use large refactoring projects as an opportunity to audit coverage: before the change, identify which files have no tests and add them. The investment pays dividends not just for this change but for every future change to those files."})]})}const Re=Object.freeze(Object.defineProperty({__proto__:null,default:N},Symbol.toStringTag,{value:"Module"}));function U(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"AI as First Reviewer"}),e.jsx("p",{children:"Code review is one of the most valuable but expensive activities in software engineering. Done well, it catches bugs, spreads knowledge, and maintains code quality. Done poorly — or skipped because of time pressure — it fails at all three. The bottleneck is almost always human attention: reviewers have limited time, and that time is most valuable when focused on architectural judgment and business correctness, not on pointing out missing null checks or inconsistent naming."}),e.jsx("p",{children:"Running Claude as a first-pass reviewer before human review addresses this bottleneck. Claude catches the mechanical issues — style inconsistencies, obvious null pointer risks, missing error handling, performance anti-patterns — so that human reviewers arrive at a cleaner diff and can focus on what humans do best."}),e.jsx(s,{title:"Two-Stage Review",children:"The two-stage review model: Claude reviews first and leaves structured comments on the PR. The author addresses Claude's comments and pushes a new commit. A human reviewer then reviews the updated diff, with confidence that the mechanical issues have already been caught. Human review time focuses on intent, architecture, and business correctness. The total time per PR decreases; the quality of what reaches production increases."}),e.jsx("h2",{children:"Running Claude as First Reviewer"}),e.jsx(t,{title:"First-Pass Code Review Session",tabs:[{label:"prompt",language:"text",filename:"Review prompt",code:`Review the diff in this PR as a senior engineer.

Focus on:
1. CORRECTNESS: Logic errors, missing edge cases, incorrect assumptions
2. SECURITY: Any of the OWASP Top 10, missing auth checks, data exposure
3. PERFORMANCE: N+1 queries, missing indexes, inefficient algorithms
4. ERROR HANDLING: Unhandled exceptions, silent failures, incorrect status codes
5. MAINTAINABILITY: Code that will confuse the next engineer, missing comments
   on non-obvious logic, functions that are too long or do too many things

Do NOT flag:
- Style issues that are caught by the linter (they're already enforced)
- Missing tests (there's a separate test coverage check in CI)
- Purely personal preference without a concrete reason

For each finding:
- Category (CORRECTNESS/SECURITY/PERFORMANCE/ERROR/MAINTAINABILITY)
- Severity (CRITICAL/HIGH/MEDIUM/LOW)
- File and line number
- What the problem is
- A specific suggestion for how to fix it

End with a summary: APPROVE (no critical/high issues) or CHANGES REQUESTED.`},{label:"output",language:"markdown",filename:"Claude review output",code:`## Code Review: feat/rate-limiting

### Findings

**[SECURITY] [CRITICAL] src/middleware/rate_limit.py:47**
The Redis key for rate limiting is constructed from the raw API key without hashing:
python
redis_key = f"rate_limit:{api_key}"  # ← exposes full API key in Redis

If Redis is compromised (or if logs include Redis commands), API keys are exposed.
Fix: hash the key before storing: redis_key = f"rate_limit:{hashlib.sha256(api_key.encode()).hexdigest()[:16]}"

**[CORRECTNESS] [HIGH] src/middleware/rate_limit.py:82**
The sliding window implementation has a race condition. Between the INCR and EXPIRE
calls, a second request can arrive and the EXPIRE is never set if INCR returns 1 for
that second request too (two concurrent "first requests").
Fix: Use a Lua script or Redis pipeline to make INCR + EXPIRE atomic.

**[ERROR HANDLING] [MEDIUM] src/middleware/rate_limit.py:103**
When Redis is unavailable, the exception is caught and the request proceeds without
rate limiting:
python
except RedisConnectionError:
    pass  # ← fail open

This may be intentional (availability over security) but it should be logged and
there should be an explicit comment explaining the decision. Fail-open rate limiting
is a design choice that should be visible.

**[PERFORMANCE] [LOW] src/api/rate_limit_status.py:34**
The endpoint queries Redis twice for the same key (once for count, once for TTL).
These can be combined into a single pipeline call.

---
**Verdict: CHANGES REQUESTED**
One CRITICAL finding (security) and one HIGH finding (correctness) must be addressed
before human review.`}]}),e.jsx("h2",{children:"Integrating First-Pass Review into the Workflow"}),e.jsx("p",{children:"The most effective integration is as a GitHub Actions step that runs automatically when a PR is opened, posts Claude's review as a PR comment, and optionally blocks merge until the author addresses any CRITICAL or HIGH findings."}),e.jsx(i,{language:"yaml",filename:".github/workflows/ai-review.yml",children:`name: AI First Review

on:
  pull_request:
    types: [opened, synchronize]
    branches: [main, develop]

jobs:
  ai-review:
    name: Claude First-Pass Review
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get diff
        id: diff
        run: |
          git diff origin/\${{ github.base_ref }}...HEAD -- '*.py' '*.ts' '*.tsx' > diff.txt
          echo "diff_lines=$(wc -l < diff.txt)" >> $GITHUB_OUTPUT

      - name: Run Claude review
        if: steps.diff.outputs.diff_lines > 0
        run: |
          # Your Claude API call here — see SDK docs for implementation
          # Post the review as a PR comment via GitHub API
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`}),e.jsx("h2",{children:"Review Categories to Prioritise"}),e.jsx("p",{children:"Not all review findings are equally important. A well-configured first-pass review focuses Claude's attention on the highest-impact categories and avoids wasting reviewer time on low-value findings."}),e.jsx("h3",{children:"Always Check (CRITICAL/HIGH)"}),e.jsxs("ul",{children:[e.jsx("li",{children:"Authentication and authorization: missing checks, bypassable checks"}),e.jsx("li",{children:"Input validation: SQL injection, command injection, path traversal"}),e.jsx("li",{children:"Data exposure: PII in logs, credentials in responses, stack traces in errors"}),e.jsx("li",{children:"Race conditions in concurrent code"}),e.jsx("li",{children:"Unhandled promise rejections (Node.js) or uncaught exceptions that crash the process"})]}),e.jsx("h3",{children:"Check When Relevant (MEDIUM)"}),e.jsxs("ul",{children:[e.jsx("li",{children:"N+1 query patterns in loops"}),e.jsx("li",{children:"Missing database indexes on frequently queried columns"}),e.jsx("li",{children:"Fail-open error handling without explicit justification"}),e.jsx("li",{children:"Hardcoded configuration values that should be in env vars"})]}),e.jsx("h3",{children:"Flag but Don't Block (LOW)"}),e.jsxs("ul",{children:[e.jsx("li",{children:"Functions exceeding 50 lines without a clear reason"}),e.jsx("li",{children:"Missing comments on non-obvious algorithmic choices"}),e.jsx("li",{children:"Inconsistent naming within the new code"})]}),e.jsxs(o,{title:"The Review Prompt as Team Artefact",children:["The system prompt for your AI reviewer should be version-controlled and team-owned, not left to each engineer to write ad-hoc. Store it in ",e.jsx("code",{children:".claude/review-prompt.md"}),"and reference it in the CI workflow. When the team discovers that Claude consistently misses a certain class of issue, update the prompt. When a finding category is generating too much noise, tune it down. The review prompt improves over time just like the rest of your engineering infrastructure."]}),e.jsx(a,{title:"Human Reviewers Should See Claude's Comments",children:`Make Claude's first-pass review visible to human reviewers — post it as a PR comment with a clear label ("AI First Review"). This serves two purposes: (1) reviewers know what has already been checked and can focus elsewhere, (2) when Claude misses something, the human reviewer can see the gap and the team can improve the review prompt. Transparency about what the AI checked is essential for maintaining confidence in the review process.`}),e.jsx(n,{type:"tip",title:"Use First-Pass Review for Self-Review Too",children:"Run the first-pass review prompt on your own code before opening a PR. This is especially valuable before requesting review from senior engineers — it catches the issues you would have caught anyway in a second reading, and gets them fixed before you spend social capital on a review. A 5-minute self-review session that finds 3 issues is 3 fewer issues the senior engineer has to point out."})]})}const Pe=Object.freeze(Object.defineProperty({__proto__:null,default:U},Symbol.toStringTag,{value:"Module"}));function F(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"PR Description Automation"}),e.jsx("p",{children:'Pull request descriptions are engineering communication artefacts. A good PR description explains what problem is being solved, what approach was taken, what the reviewer should focus on, and how to test the change. A bad PR description is "fixes stuff" or a copy-paste of the commit messages. The difference matters: reviewers make better decisions with context, and future engineers reading git history understand the codebase better when PRs are well-described.'}),e.jsx("p",{children:"Writing good PR descriptions is exactly the kind of structured, pattern-following task that Claude excels at — given the diff, the ticket, and a template, Claude can produce a professional PR description faster than a human and without the temptation to shortcut it under time pressure."}),e.jsx(s,{title:"PR Descriptions as Team Communication",children:"A PR description is not for the author — it is for the reviewer and for future engineers reading git history. The author knows what they did and why. The PR description exists to communicate that knowledge to everyone else. When Claude generates PR descriptions, it does so from the reader's perspective: what does a reviewer need to know to evaluate this change? What context is not obvious from reading the diff alone?"}),e.jsx("h2",{children:"PR Description Slash Command"}),e.jsx(i,{language:"markdown",filename:".claude/commands/pr-description.md",children:`# Generate PR Description

Generate a professional pull request description for the current branch.

## Information to gather
1. Run: git log origin/main..HEAD --oneline (get commit list)
2. Run: git diff origin/main..HEAD --stat (get files changed summary)
3. Run: git diff origin/main..HEAD (get full diff)
4. If JIRA MCP is connected, read the linked ticket

## PR Description Template

markdown
## What & Why
<!-- 2-3 sentences: what problem does this solve? why now? -->

## Approach
<!-- How was this implemented? Were there alternative approaches considered?
     Why was this approach chosen? Keep to the most important decisions. -->

## Changes
<!-- Key changes, grouped logically (not a file-by-file list) -->
- **[Area]**: What changed and why

## Testing
<!-- How was this tested? What tests were added? -->
- [ ] Unit tests: [test file] — [what they cover]
- [ ] Integration tests: [what scenario]
- [ ] Manual testing: [how to manually verify if applicable]

## Review Focus
<!-- What should reviewers pay most attention to? -->
- [The most important thing to review]
- [Any areas of uncertainty or tradeoffs]

## Related
- JIRA: [TICKET-ID](link)
- ADR: [if this implements or relates to an ADR]
- Follows up on: [PR number if this is related to a previous PR]


## Output
Generate the description following this template.
Do not include sections that don't apply (e.g., no ADR section if not relevant).
Be specific — use actual file names, function names, and line numbers where helpful.
Aim for 200-400 words total.`}),e.jsx("h2",{children:"Changelog Generation"}),e.jsx("p",{children:"Changelogs are consistently neglected because they require synthesising information across many PRs after the fact. Claude can generate well-structured changelogs from git history on demand — either for a release or for periodic documentation updates."}),e.jsx(t,{title:"Automated Changelog Generation",tabs:[{label:"prompt",language:"text",filename:"Changelog prompt",code:`Generate a user-facing changelog for the changes between tags v2.3.0 and v2.4.0.

Steps:
1. Run: git log v2.3.0..v2.4.0 --oneline
2. For each commit, categorize it:
   - feat: New feature
   - fix: Bug fix
   - perf: Performance improvement
   - security: Security fix
   - breaking: Breaking change (!! — these go at the top)

Format as a CHANGELOG.md entry:

## [2.4.0] - 2025-03-15

### Breaking Changes
- [Only if any breaking changes exist]

### Security
- [Security fixes — brief but clear about what was fixed]

### New Features
- [User-facing description, not technical implementation detail]

### Bug Fixes
- [What was broken, what is fixed]

### Performance
- [Measurable improvement if known]

Rules:
- Write from the user/operator perspective ("Added support for..." not "Implemented...")
- Security fixes: mention the vulnerability type without giving exploitation detail
- Breaking changes: explain what users need to change in their configuration/code`},{label:"output",language:"markdown",filename:"CHANGELOG.md entry",code:`## [2.4.0] - 2025-03-15

### Security
- Fixed rate limiting bypass that allowed API keys to exceed request limits at
  Redis cluster failover boundaries (#847)
- API keys are now stored hashed in Redis, preventing key exposure if the
  cache layer is compromised (#851)

### New Features
- Added per-API-key rate limiting with configurable limits (default: 100 req/min)
  Rate limit status is visible in X-RateLimit-Limit, X-RateLimit-Remaining,
  and X-RateLimit-Reset response headers (#847)
- Product catalogue now supports cursor-based pagination for consistent
  performance on large catalogues (#823)
- Added support for EUR and GBP currencies in the checkout flow (#834)

### Bug Fixes
- Fixed invoice tax calculation incorrectly applying UK VAT to EU customers (#819)
- Fixed password reset tokens not being invalidated when the user changes their
  password through account settings (#826)

### Performance
- Product list endpoint p95 latency reduced from 450ms to 180ms by adding
  composite index on (category, deleted_at) (#831)`}]}),e.jsx("h2",{children:"Migration Guide Generation"}),e.jsx("p",{children:"Breaking changes require migration guides that explain what changed, why, and exactly how to update consuming code. These are time-consuming to write but critical for downstream teams. Claude can draft migration guides from the diff and the ADR."}),e.jsx(i,{language:"text",filename:"Migration Guide Prompt",children:`Generate a migration guide for the breaking API change in this PR.

The change: Renamed 'customer_id' field to 'account_id' in all API responses.
Deprecation period: customer_id will continue to be returned alongside account_id
until v3.0.0, then removed.

The migration guide should:
1. Explain what changed (before/after examples)
2. Explain why the change was made (briefly)
3. Give step-by-step migration instructions
4. Show before/after code examples for the most common usage patterns
5. Explain what the deprecation timeline is
6. List the endpoints affected

Audience: engineers consuming our REST API (not internal contributors).`}),e.jsx("h2",{children:"Release Notes for Product Teams"}),e.jsx("p",{children:"Product-facing release notes are different from technical changelogs — they focus on user impact rather than implementation detail. Claude can translate technical changelogs into product-team-readable release notes."}),e.jsx(i,{language:"text",filename:"Release Notes Translation Prompt",children:`Translate this technical changelog into product release notes for our product team.

Rules:
- Write in plain English (no code, no technical terms without explanation)
- Focus on user impact ("Customers can now..." not "Added endpoint...")
- Security fixes: mention only if they affect user behavior
- Performance improvements: translate to user experience ("Pages load faster")
- Skip: refactoring, test additions, internal tooling changes
- Format: 3-5 bullet points, each one sentence

Input: [paste technical changelog]`}),e.jsx(o,{title:"PR Description as the Source of Truth",children:`The PR description should be thorough enough that a future engineer reading it without the code context can understand: what problem was being solved, what approach was taken, and what tradeoffs were accepted. This is especially important for decisions that look questionable out of context — "we chose the simpler approach here because the performance SLA doesn't require the more complex algorithm." Without that context in the PR description, the next engineer to touch that code may refactor it "correctly" and break the deliberate simplicity tradeoff.`}),e.jsx(a,{title:"Review the Generated Description Before Submitting",children:`Claude's generated PR description is a starting draft, not a final submission. Read it before posting. Check: (1) Is the "Why" section accurate — does it capture the real motivation? (2) Are the reviewer focus areas the right ones? (3) Is there any context that only you know that didn't make it in? (4) Would a reviewer who wasn't at the planning meeting understand the approach? A 5-minute review of a generated description is much faster than writing one from scratch, and it's still your communication.`}),e.jsx(n,{type:"tip",title:"Store the PR Template in CLAUDE.md",children:'Add your PR description template to CLAUDE.md so Claude applies it automatically in any session, not just when the slash command is invoked. Append: "When creating a PR, use the PR description template from .github/pull_request_template.md." This ensures consistent descriptions whether the PR is created via the slash command, at the end of a feature session, or any other way.'})]})}const Ee=Object.freeze(Object.defineProperty({__proto__:null,default:F},Symbol.toStringTag,{value:"Module"}));function G(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Architecture Conformance"}),e.jsx("p",{children:"Every engineering organization has an intended architecture: layers that should not call each other, modules that should only depend in one direction, patterns that are required (or forbidden) in certain contexts. Over time, without enforcement, codebases drift. A domain model imports an HTTP library. A repository layer calls a controller. A utility function grows into a god object that everything depends on. This drift is called architectural erosion, and it is one of the most expensive forms of technical debt because it compounds — each violation makes the next one slightly more likely and slightly harder to fix."}),e.jsx("p",{children:"AI coding assistants accelerate architectural drift if left unconstrained. Claude does not know your intended architecture unless you tell it. It will happily import a database client into a presentation layer component, call an internal service from a public API handler without going through the domain, or create circular dependencies that break your build in subtle ways. Vibe Engineering uses fitness functions and automated conformance checks to detect drift before it merges."}),e.jsx(s,{title:"Architectural Fitness Functions",children:'A fitness function is an automated test that verifies a structural property of the codebase rather than a behavioral property. Where a unit test asks "does this function return the right value?", a fitness function asks "does this module only import from the allowed layers?" Fitness functions run in CI on every PR and fail the build if architectural rules are violated. They make architecture a machine-verifiable constraint, not a guideline in a wiki document nobody reads.'}),e.jsx("h2",{children:"Defining Layer Boundaries in CLAUDE.md"}),e.jsx("p",{children:"The first step in enforcing architecture conformance with AI is making the architecture explicit in CLAUDE.md. Claude can only follow rules it knows about. If your CLAUDE.md documents the layered architecture and the allowed dependency directions, Claude will generate code that respects them."}),e.jsx(t,{title:"Architecture Rules in CLAUDE.md",tabs:[{label:"yaml",language:"yaml",filename:"CLAUDE.md",code:`## Architecture: Layered Architecture Constraints

### Layer Definitions

Presentation Layer:  src/api/, src/web/
Application Layer:   src/application/
Domain Layer:        src/domain/
Infrastructure:      src/infrastructure/
Shared Kernel:       src/shared/


### Allowed Dependencies (top → bottom only)
- Presentation → Application (via use case interfaces)
- Application → Domain (domain models and services)
- Infrastructure → Domain (implements domain interfaces)
- Any layer → Shared Kernel

### Forbidden Dependencies
- Domain MUST NOT import from: src/api/, src/application/, src/infrastructure/
- Application MUST NOT import from: src/api/, src/infrastructure/
- Circular imports are ALWAYS forbidden

### Enforcement
- dependency-cruiser runs on every PR: npm run check:arch
- Violations block merge — do not add exceptions without ADR approval

### What This Means When Writing Code
- Never import an Express/Fastify type into src/domain/
- Domain services must only accept/return domain models (no HTTP request objects)
- Use dependency injection for infrastructure adapters — inject interfaces, not implementations
- If you need to access the database from a domain service, define a repository interface in
  src/domain/repositories/ and implement it in src/infrastructure/repositories/`}]}),e.jsx("h2",{children:"Automated Conformance with dependency-cruiser"}),e.jsx(t,{title:"dependency-cruiser Configuration and CI Integration",tabs:[{label:"bash",language:"bash",filename:"architecture-check.sh",code:`# Install dependency-cruiser
npm install --save-dev dependency-cruiser

# Generate initial config (then customize)
npx depcruise --init

# Run architecture check
npx depcruise src/ --config .dependency-cruiser.js

# Ask Claude to analyze violations and fix them
claude "Run: npx depcruise src/ --config .dependency-cruiser.js --output-type err-html > /tmp/arch-violations.html

For each violation found:
1. Identify which layer is importing from a forbidden layer
2. Determine the correct fix: either move the file, extract an interface, or use DI
3. Implement the fix
4. Re-run depcruise until zero violations remain

Do not add exceptions to .dependency-cruiser.js — fix the actual violations."`},{label:"json",language:"javascript",filename:".dependency-cruiser.js",code:`/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-domain-to-infrastructure',
      severity: 'error',
      comment: 'Domain layer must not depend on infrastructure',
      from: { path: '^src/domain' },
      to: { path: '^src/infrastructure' },
    },
    {
      name: 'no-domain-to-application',
      severity: 'error',
      comment: 'Domain layer must not depend on application layer',
      from: { path: '^src/domain' },
      to: { path: '^src/application' },
    },
    {
      name: 'no-domain-to-api',
      severity: 'error',
      comment: 'Domain layer must not depend on API/presentation layer',
      from: { path: '^src/domain' },
      to: { path: '^src/(api|web)' },
    },
    {
      name: 'no-application-to-infrastructure',
      severity: 'error',
      comment: 'Application layer must not directly reference infrastructure',
      from: { path: '^src/application' },
      to: { path: '^src/infrastructure' },
    },
    {
      name: 'no-circular-deps',
      severity: 'error',
      comment: 'Circular dependencies are never allowed',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    reporterOptions: {
      dot: { collapsePattern: 'node_modules/[^/]+' },
    },
  },
}`}]}),e.jsx("h2",{children:"Detecting Drift in PRs with Claude Code"}),e.jsx("p",{children:'Beyond automated tools, Claude Code can perform architectural review as part of the PR review workflow. When a PR touches multiple layers, ask Claude to check for boundary violations that tools might not catch — semantic violations like "this function is in the domain layer but its logic is HTTP-response formatting."'}),e.jsx(t,{title:"AI Architecture Review Prompt",tabs:[{label:"bash",language:"bash",filename:"arch-review-prompt.sh",code:`# As part of PR review — run architectural fitness check
claude "Review the files changed in this PR for architectural conformance.

Changed files:
$(git diff --name-only origin/main...HEAD)

For each changed file:
1. Which architectural layer does it belong to?
2. Does it import from any layer it should not (per CLAUDE.md architecture rules)?
3. Does the logic inside belong in this layer (semantic conformance)?
   Example violation: a domain service that constructs HTTP response objects
4. Are there any circular dependencies introduced?

Run: npx depcruise $(git diff --name-only origin/main...HEAD | tr '
' ' ') --config .dependency-cruiser.js

Report: list of violations with file paths, or 'Architecture conformance: PASS'"`}]}),e.jsx("h2",{children:"Architecture Decision Records as Conformance Source"}),e.jsx("p",{children:"Fitness functions are most powerful when their rules are traceable to specific Architecture Decision Records. When a rule has a documented reason, engineers understand why they cannot take the shortcut, and the rule is less likely to be quietly disabled when it becomes inconvenient."}),e.jsx(t,{title:"Linking ADRs to Conformance Rules",tabs:[{label:"yaml",language:"yaml",filename:"CLAUDE.md (ADR references)",code:`## Architecture Rules (with ADR references)

### Rule: Domain must not import from Infrastructure
- Enforced by: .dependency-cruiser.js rule 'no-domain-to-infrastructure'
- Rationale: ADR-007 — Hexagonal Architecture Adoption
- Reason: Allows domain logic to be tested without database/external service dependencies
- Correct approach: Define interface in src/domain/ports/, implement in src/infrastructure/

### Rule: No circular dependencies
- Enforced by: .dependency-cruiser.js rule 'no-circular-deps'
- Rationale: ADR-003 — Module Boundary Policy
- Reason: Circular deps cause initialization order bugs and prevent tree-shaking
- Correct approach: Extract shared code to src/shared/ or restructure ownership

### Adding exceptions
- Exceptions require an approved ADR
- ADR template: docs/architecture/decisions/ADR-NNN-title.md
- Use /write-adr slash command to generate draft`}]}),e.jsx(r,{title:"Drift Accelerates With AI",children:'AI coding assistants are particularly likely to introduce architectural violations when they see a "simpler" path to making code work. If Claude needs data from the database inside a domain service, it may simply import the database client directly rather than going through the repository interface — because that is the shortest path to making the tests pass. Without automated enforcement, these shortcuts accumulate quickly. The fitness function is the only reliable defense.'}),e.jsx(a,{title:"Run Architecture Checks Before, Not After",children:"Add the architecture check to your pre-commit hook and CI pipeline. Detecting violations at commit time (when Claude just wrote them) is dramatically cheaper than detecting them in a PR review two days later, and infinitely cheaper than discovering them during a security audit six months later. The depcruise check takes under ten seconds on most codebases — there is no performance argument for skipping it."}),e.jsx(n,{type:"tip",title:"Visualize Your Architecture Periodically",children:'Run dependency-cruiser with the --output-type dot flag to generate a visual dependency graph. Review this graph quarterly. Architectural drift is often invisible in day-to-day code review but immediately obvious when you see a diagram with arrows going in every direction. Ask Claude: "Generate the architecture diagram and identify the top 3 areas of architectural drift compared to our intended layered architecture."'})]})}const De=Object.freeze(Object.defineProperty({__proto__:null,default:G},Symbol.toStringTag,{value:"Module"}));function M(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Technical Debt Management"}),e.jsx("p",{children:'Technical debt is the cost of deferred quality work — shortcuts taken under time pressure, patterns that made sense in 2019 but are now liabilities, tests never written, abstractions that grew into god objects, copy-pasted code that diverged. Every non-trivial codebase carries it. The question is never "do we have technical debt?" but "do we know what debt we have, and are we managing it intentionally?"'}),e.jsx("p",{children:"AI coding assistants create a new dynamic for technical debt. On one hand, Claude can identify, document, and remediate debt at a speed no human team could match. On the other hand, without discipline, AI-assisted development creates debt at the same accelerated pace — poorly structured code that works but is unmaintainable, missing tests, duplicated logic, and shallow abstractions that collapse under future requirements."}),e.jsx("p",{children:"Vibe Engineering treats technical debt as a first-class concern. Debt is tracked explicitly, remediation is AI-assisted, and new debt is prevented by making quality gates part of the development loop — not a separate cleanup project that never gets scheduled."}),e.jsx(s,{title:"AI-Assisted Debt Identification",children:'Claude Code can analyze a codebase and produce a structured technical debt inventory in a fraction of the time a manual review would take. The key is to ask Claude to look for specific categories of debt with machine-verifiable evidence — not vague observations about "complexity" but concrete findings like "this function has cyclomatic complexity of 34" or "this module has 8 direct dependents but no tests."'}),e.jsx(t,{title:"Technical Debt Audit Prompt",tabs:[{label:"bash",language:"bash",filename:"debt-audit.sh",code:`# Run a structured technical debt audit
claude "Perform a technical debt audit on src/. For each category below,
produce a structured list of findings with file paths, line numbers,
and severity (high/medium/low).

Categories to audit:

1. COMPLEXITY DEBT
   - Run: npx ts-complexity-report src/ --threshold 15
   - Functions with cyclomatic complexity > 15 (high), 10-15 (medium)

2. TEST DEBT
   - Run: npx jest --coverage --coverageThreshold='{}' 2>&1 | grep -E 'Uncovered'
   - Modules with 0% test coverage (high), < 50% coverage (medium)

3. DUPLICATION DEBT
   - Run: npx jscpd src/ --min-lines 10 --reporters json
   - Copy-paste blocks > 20 lines (high), 10-20 lines (medium)

4. DEPENDENCY DEBT
   - Run: npm outdated --json
   - Packages > 2 major versions behind (high), 1 major behind (medium)
   - Run: npm audit --json
   - Critical CVEs (high), high severity CVEs (medium)

5. TYPE SAFETY DEBT
   - Count: grep -r 'any' src/ --include='*.ts' | wc -l
   - Files with > 5 uses of 'any' type (medium)

Output format:
CATEGORY | SEVERITY | FILE | LINE | FINDING | ESTIMATED EFFORT (hours)"`}]}),e.jsx("h2",{children:"Debt Register in CLAUDE.md"}),e.jsx("p",{children:"Once debt is identified, it needs to be tracked. A debt register in CLAUDE.md serves two purposes: it gives Claude context about known issues that should not be extended when writing new code, and it gives the team a shared, version-controlled view of what debt exists."}),e.jsx(t,{title:"Technical Debt Register in CLAUDE.md",tabs:[{label:"yaml",language:"yaml",filename:"CLAUDE.md",code:`## Technical Debt Register

### High Priority (block new features in affected areas)

#### DEBT-001: PaymentProcessor god class
- File: src/services/PaymentProcessor.ts (1,847 lines)
- Issue: Handles authorization, settlement, refunds, webhooks, currency conversion
  in a single class with 34 methods. Cyclomatic complexity > 50.
- Impact: All payment-related bugs cluster here. 40% of incidents touch this file.
- Remediation: Extract into PaymentAuthorizer, PaymentSettler, RefundProcessor, WebhookHandler
- Estimated effort: 3 days
- Owner: @payments-team
- DO NOT add new methods to PaymentProcessor — route new payment features to new services

#### DEBT-002: User service 0% test coverage
- File: src/services/UserService.ts
- Issue: Critical service with no automated tests. 3 production incidents in 6 months.
- Impact: Every change is manual-test-only. Change velocity: near zero.
- Remediation: Write characterization tests capturing current behavior, then refactor
- Estimated effort: 2 days
- Owner: @identity-team
- When touching UserService: write a test for every function you change before changing it

### Medium Priority (address in next quarter)

#### DEBT-003: 47 uses of 'any' type in OrderService
- Files: src/services/order/*.ts
- Remediation: Run /generate-types slash command on affected files`}]}),e.jsx("h2",{children:"Automated Remediation Campaigns"}),e.jsx("p",{children:"Some types of technical debt are mechanical enough that Claude can remediate them systematically. Type safety improvements, test coverage gaps, and outdated dependency upgrades are all candidates for AI-driven remediation campaigns."}),e.jsx(t,{title:"Automated Debt Remediation Campaign",tabs:[{label:"bash",language:"bash",filename:"remediation-campaign.sh",code:`# Campaign: Eliminate 'any' types in OrderService
claude "Technical debt campaign: eliminate TypeScript 'any' types in src/services/order/

Step 1: Find all 'any' usages:
grep -n ': any' src/services/order/*.ts

For each 'any' found:
1. Analyze the value's actual runtime shape (check callers and usages)
2. Define a proper interface or type alias in src/types/order.ts
3. Replace the 'any' with the specific type
4. Run: npx tsc --noEmit to verify no new type errors

Target: zero 'any' usages in src/services/order/
Do NOT suppress errors with @ts-ignore or @ts-expect-error
Report before/after count."

# Campaign: Increase test coverage for UserService
claude "Technical debt campaign: add characterization tests for UserService.

File: src/services/UserService.ts
Current coverage: 0%

Strategy for characterization tests:
1. For each public method, write tests that capture CURRENT behavior (not ideal behavior)
2. These tests document what the code actually does, enabling safe refactoring later
3. Do not refactor the implementation — only add tests

Run: npm test -- --coverage --collectCoverageFrom='src/services/UserService.ts'
Target: 60% coverage minimum
Report: methods covered, methods not covered, key edge cases found"`}]}),e.jsx("h2",{children:"Preventing New Debt With Quality Gates"}),e.jsx("p",{children:"The most effective debt management strategy is preventing new debt. Quality gates in the CI pipeline enforce minimum standards on every PR, making it impossible to merge code that falls below the threshold."}),e.jsx(t,{title:"Ratchet Pattern: No New Debt Policy",tabs:[{label:"yaml",language:"yaml",filename:".github/workflows/quality-gates.yml",code:`name: Quality Gates

on: [pull_request]

jobs:
  no-new-debt:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Coverage ratchet (must not decrease)
        run: |
          # Get coverage on main branch
          git stash
          npm ci --silent
          MAIN_COVERAGE=$(npx jest --coverage --coverageThreshold='{}' --json 2>/dev/null | jq '.coverageMap | to_entries | map(.value.s) | flatten | (map(select(. > 0)) | length) / length * 100' || echo "0")
          git stash pop
          
          # Get coverage on PR branch
          PR_COVERAGE=$(npx jest --coverage --coverageThreshold='{}' --json 2>/dev/null | jq '.coverageMap | to_entries | map(.value.s) | flatten | (map(select(. > 0)) | length) / length * 100' || echo "0")
          
          echo "Main coverage: $MAIN_COVERAGE%"
          echo "PR coverage: $PR_COVERAGE%"
          
          if (( $(echo "$PR_COVERAGE < $MAIN_COVERAGE - 1" | bc -l) )); then
            echo "Coverage decreased by more than 1%. New debt introduced."
            exit 1
          fi

      - name: Complexity gate (no new high-complexity functions)
        run: |
          npx ts-complexity-report src/ --threshold 20 --failOnHigherThan 20
          
      - name: Duplication gate
        run: |
          npx jscpd src/ --min-lines 15 --threshold 5
          # Fails if duplication percentage exceeds 5%`}]}),e.jsx(r,{title:"Don't Let AI Add Debt While Fixing Debt",children:'When asking Claude to remediate technical debt, specify constraints tightly. Claude will sometimes "fix" a complexity problem by extracting methods that are essentially the same function split into pieces with no real separation of concerns, or by adding a passing test that does not actually exercise the code path you care about. Review remediation PRs more carefully than feature PRs — the goal is genuine improvement, not metric manipulation.'}),e.jsx(a,{title:"Schedule Debt Sprints, Not Debt Someday",children:"Technical debt that is tracked but never remediated is only marginally better than debt that is ignored. Effective debt management requires allocating real capacity — typically 20% of each sprint — to remediation work. Use Claude to make this work fast enough that 20% goes further than it used to. A well-scoped debt remediation session with Claude can cover ground that would have taken a developer a full week in a few hours, making the 20% investment return far more than 20% improvement."}),e.jsx(n,{type:"tip",title:"Use the Strangler Fig Pattern for God Objects",children:'When Claude needs to work in or around a known god object (like DEBT-001 PaymentProcessor), use the strangler fig pattern: new functionality goes into a new, properly structured module, and calls from the god object are redirected to the new module. Over time, the god object shrinks as its responsibilities migrate out. Ask Claude: "Implement the new refund retry feature in a new RefundRetryService, and add a delegation call from PaymentProcessor.retryRefund() to RefundRetryService. Do not add logic to PaymentProcessor."'})]})}const _e=Object.freeze(Object.defineProperty({__proto__:null,default:M},Symbol.toStringTag,{value:"Module"}));function W(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Unit and Integration Test Generation"}),e.jsx("p",{children:"Test generation is one of the highest-leverage applications of AI in the development workflow. Writing tests is cognitively demanding but structurally predictable: you need to understand the function's contract, enumerate the cases that matter, write the assertions that verify each case. Claude excels at the mechanical parts of this work while you retain the judgment about which cases actually matter for your domain."}),e.jsxs("p",{children:["The key discipline is directing Claude toward tests that verify behavior rather than tests that achieve coverage metrics. A test suite where every function has 100% line coverage but no assertion would fail every CI run if the coverage tool treated a",e.jsx("code",{children:"console.log"})," as a statement — and yet that suite would be useless. Coverage is a floor, not a ceiling. The ceiling is: does this test catch real regressions?"]}),e.jsx(s,{title:"Test Generation Strategy: Outside-In",children:'The most effective AI test generation strategy is outside-in: start with the public contract (what callers expect), then work inward to edge cases and internal invariants. Ask Claude to enumerate the cases for a function before writing any tests — "what are all the ways this function could be called, and what should happen in each case?" Use that enumeration as the test plan, then have Claude implement tests for each case.'}),e.jsx(t,{title:"Generating Unit Tests From Implementation",tabs:[{label:"bash",language:"bash",filename:"generate-unit-tests.sh",code:`# Generate unit tests for an existing function
claude "Generate comprehensive unit tests for the calculateShippingCost function
in src/domain/shipping/calculator.ts.

Before writing any tests, enumerate all test cases:
1. Valid inputs: what are the normal cases?
2. Boundary conditions: minimum/maximum values, exact thresholds
3. Invalid inputs: null, undefined, negative values, wrong types
4. Business rules: what invariants must always hold?
5. Error conditions: when should it throw vs return an error value?

Then implement tests for each case using Jest.
Each test must:
- Have a descriptive name that reads as a behavior statement (not 'test case 1')
- Have exactly one assertion per test (or group related assertions with a comment)
- Use factories/builders for test data (not inline object literals)
- NOT mock the function under test (only mock its external dependencies)

Run: npm test -- --testPathPattern='calculator' after writing
Target: all tests pass, function coverage > 90%"`},{label:"typescript",language:"typescript",filename:"tests/shipping/calculator.test.ts (generated)",code:`// Generated by Claude Code — reviewed and approved by engineer
import { calculateShippingCost } from '../../src/domain/shipping/calculator'
import { ShipmentBuilder } from '../factories/ShipmentBuilder'
import { AddressBuilder } from '../factories/AddressBuilder'

describe('calculateShippingCost', () => {
  describe('standard domestic shipments', () => {
    it('calculates base rate for shipment under 1kg', () => {
      const shipment = new ShipmentBuilder().withWeight(0.5).build()
      expect(calculateShippingCost(shipment)).toEqual({ amount: 4.99, currency: 'USD' })
    })

    it('applies weight surcharge for shipments 1kg to 10kg', () => {
      const shipment = new ShipmentBuilder().withWeight(5).build()
      const cost = calculateShippingCost(shipment)
      expect(cost.amount).toBeGreaterThan(4.99)
      expect(cost.amount).toBeLessThan(20)
    })

    it('applies heavy freight rate for shipments over 10kg', () => {
      const shipment = new ShipmentBuilder().withWeight(15).build()
      const cost = calculateShippingCost(shipment)
      expect(cost.amount).toBeGreaterThanOrEqual(25)
    })
  })

  describe('boundary conditions', () => {
    it('treats exactly 1kg as standard (not surcharge) rate', () => {
      const at1kg = new ShipmentBuilder().withWeight(1).build()
      const below1kg = new ShipmentBuilder().withWeight(0.999).build()
      expect(calculateShippingCost(at1kg).amount).toBe(calculateShippingCost(below1kg).amount)
    })
  })

  describe('invalid inputs', () => {
    it('throws for zero weight', () => {
      const shipment = new ShipmentBuilder().withWeight(0).build()
      expect(() => calculateShippingCost(shipment)).toThrow('Weight must be positive')
    })

    it('throws for negative weight', () => {
      const shipment = new ShipmentBuilder().withWeight(-1).build()
      expect(() => calculateShippingCost(shipment)).toThrow('Weight must be positive')
    })
  })
})`}]}),e.jsx("h2",{children:"Mutation Testing: Verifying Test Quality"}),e.jsxs("p",{children:["Mutation testing answers the question that coverage metrics cannot: if this line of code were wrong, would a test catch it? A mutation testing tool modifies your code in small ways (flipping a ",e.jsx("code",{children:">"})," to ",e.jsx("code",{children:">="}),", changing a ",e.jsx("code",{children:"+"})," to a ",e.jsx("code",{children:"-"}),'), runs the test suite, and reports whether any tests failed. If no test fails for a mutation, that mutation "survived" — meaning you have dead tests or missing cases.']}),e.jsx(t,{title:"Mutation Testing with Stryker",tabs:[{label:"bash",language:"bash",filename:"mutation-testing.sh",code:`# Install Stryker mutation testing framework
npm install --save-dev @stryker-mutator/core @stryker-mutator/jest-runner

# Run mutation tests on a specific module
npx stryker run --mutate 'src/domain/shipping/calculator.ts'

# Ask Claude to fix surviving mutants
claude "Stryker mutation testing found surviving mutants in src/domain/shipping/calculator.ts.

Surviving mutants report:
$(npx stryker run --mutate 'src/domain/shipping/calculator.ts' --reporters json 2>/dev/null | jq '.mutants[] | select(.status == "Survived") | {id, mutatorName, location, replacement}')

For each surviving mutant:
1. Understand what code change the mutant made
2. Determine which business behavior that change would break
3. Write a test that would catch that regression
4. Add the test to the existing test file
5. Re-run Stryker to verify the mutant is now killed

Target: mutation score > 80%"`}]}),e.jsx("h2",{children:"Integration Test Generation"}),e.jsx("p",{children:"Integration tests verify that components work together correctly — a service with its database, an API with its authentication middleware, a message handler with its queue. Claude can generate integration tests from API contracts and data models, but needs explicit context about the infrastructure being integrated."}),e.jsx(t,{title:"Generating Integration Tests for a REST API",tabs:[{label:"bash",language:"bash",filename:"generate-integration-tests.sh",code:`# Generate integration tests for the Orders API
claude "Generate integration tests for the Orders API.

Context:
- API spec: docs/api/orders-api.yaml (OpenAPI 3.0)
- Database: PostgreSQL via TypeORM, test database: process.env.TEST_DATABASE_URL
- Auth: JWT bearer token — use TEST_JWT_SECRET env var to generate test tokens
- Test framework: Jest + Supertest

For each endpoint in the OpenAPI spec, generate:
1. Happy path test with valid data
2. Authentication failure test (missing/invalid token)
3. Validation error test (invalid request body)
4. Not-found test (for endpoints with resource IDs)
5. At least one test for documented error responses

Test setup requirements:
- Use beforeEach to reset database state (truncate tables, not drop)
- Use a factory function to create test users and generate their JWT tokens
- All tests must be independent — no test should depend on another's side effects

Run: npm run test:integration after generating
All tests must pass against a real test database (not mocked)."`}]}),e.jsxs(r,{title:"Review Generated Tests for Vacuous Assertions",children:["Claude sometimes generates tests that technically pass but assert nothing meaningful. Watch for: ",e.jsx("code",{children:"expect(result).toBeDefined()"})," (always true unless result is undefined), ",e.jsx("code",{children:"expect(result).toBeTruthy()"}),' (passes for any non-empty value), or tests that call the function but never assert on the return value. Before accepting any generated test file, read each assertion and ask: "Would this test fail if I removed the relevant business logic?"']}),e.jsx(a,{title:"Use Test Factories, Not Inline Data",children:'When Claude generates tests, instruct it to use test factory functions rather than inline object literals. Factories make tests more maintainable — when a model changes, you update the factory once rather than 40 test files. Ask Claude: "Create a UserFactory and OrderFactory in tests/factories/ before generating the tests. All test data should come from these factories." This also surfaces a useful side effect: Claude will often discover inconsistencies in your data model when it tries to build a factory for it.'}),e.jsx(n,{type:"tip",title:"Characterization Tests for Legacy Code",children:'For code with no existing tests, use characterization tests: tests that document what the code currently does, rather than what it should do. Ask Claude: "Write characterization tests for src/legacy/OrderProcessor.ts. The tests should capture the current behavior by calling the code with various inputs and recording what it returns. Do not change the implementation. These tests will protect us during future refactoring." Characterization tests are the prerequisite for safe refactoring of untested legacy code.'})]})}const Le=Object.freeze(Object.defineProperty({__proto__:null,default:W},Symbol.toStringTag,{value:"Module"}));function H(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"E2E Tests From User Stories"}),e.jsx("p",{children:"End-to-end tests are the most expensive tests to write and maintain, but they catch a class of bugs that no unit or integration test can: the ones that only appear when a real browser drives a real application through a real user journey. They also serve as the most unambiguous verification that acceptance criteria are actually met — a Playwright test that logs in as a user, adds items to a cart, and completes a purchase is proof that the feature works in a way that a passing unit test is not."}),e.jsx("p",{children:"The challenge with E2E tests is that they are brittle, slow, and require a full running stack. AI assistance addresses the writing cost but not the running cost — which is why E2E tests in a Vibe Engineering workflow are targeted at user journeys that represent real business value, not at exercising every UI component."}),e.jsx(s,{title:"Gherkin to Playwright: The Mapping",children:"When you have BDD acceptance criteria written in Gherkin (Given/When/Then), Claude can directly translate them into Playwright tests. The Gherkin scenario is a natural-language specification of exactly what the E2E test should do. This translation is mechanical enough for Claude to do reliably, but it requires that the selectors, page structure, and test data setup are also provided — Claude cannot guess your application's DOM structure."}),e.jsx(t,{title:"Gherkin to Playwright Test Generation",tabs:[{label:"bash",language:"bash",filename:"generate-e2e-from-gherkin.sh",code:`# Generate Playwright E2E tests from acceptance criteria
claude "Convert the following Gherkin acceptance criteria into Playwright tests.

Gherkin scenarios from JIRA story ENG-1234:

Feature: User Checkout Flow
  Scenario: Successful checkout with saved payment method
    Given I am logged in as a registered user with a saved Visa card
    And my cart contains 2 items totaling $47.50
    When I navigate to /checkout
    And I click 'Use saved card ending in 4242'
    And I click 'Place Order'
    Then I should see the order confirmation page
    And I should see my order number
    And I should receive an order confirmation email

  Scenario: Checkout fails with declined card
    Given I am logged in as a registered user
    And my cart contains 1 item
    When I navigate to /checkout
    And I enter card number 4000000000000002 (Stripe test decline card)
    And I click 'Place Order'
    Then I should see the error message 'Your card was declined'
    And I should remain on the checkout page
    And no order should be created

Application context for selectors:
- Checkout page: /checkout
- Saved card selector: [data-testid='saved-payment-card']
- Place order button: [data-testid='place-order-btn']
- Order confirmation heading: [data-testid='order-confirmation-number']
- Error message: [data-testid='payment-error-message']
- Base URL: process.env.E2E_BASE_URL

Test setup:
- User fixture: tests/e2e/fixtures/users.ts (use createRegisteredUser())
- Cart fixture: tests/e2e/fixtures/cart.ts (use addItemsToCart())
- Use Playwright's test.use({ storageState }) for auth state

Generate tests in: tests/e2e/checkout.spec.ts
Run: npx playwright test tests/e2e/checkout.spec.ts"`},{label:"typescript",language:"typescript",filename:"tests/e2e/checkout.spec.ts (generated)",code:`import { test, expect } from '@playwright/test'
import { createRegisteredUser, createUserWithSavedCard } from './fixtures/users'
import { addItemsToCart } from './fixtures/cart'

test.describe('Checkout Flow', () => {
  test('successful checkout with saved payment method', async ({ page, request }) => {
    // Setup
    const user = await createUserWithSavedCard(request)
    await addItemsToCart(request, user.id, [
      { sku: 'SKU-001', quantity: 1, price: 27.50 },
      { sku: 'SKU-002', quantity: 1, price: 20.00 },
    ])

    // Login and navigate
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', user.email)
    await page.fill('[data-testid="password-input"]', user.password)
    await page.click('[data-testid="login-btn"]')
    await page.goto('/checkout')

    // Complete checkout with saved card
    await page.click('[data-testid="saved-payment-card"]')
    await page.click('[data-testid="place-order-btn"]')

    // Verify confirmation
    await expect(page).toHaveURL(//order-confirmation//)
    await expect(page.locator('[data-testid="order-confirmation-number"]')).toBeVisible()
    await expect(page.locator('[data-testid="order-confirmation-number"]')).toHaveText(/ORD-d+/)
  })

  test('checkout fails gracefully with declined card', async ({ page, request }) => {
    const user = await createRegisteredUser(request)
    await addItemsToCart(request, user.id, [{ sku: 'SKU-001', quantity: 1, price: 27.50 }])

    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', user.email)
    await page.fill('[data-testid="password-input"]', user.password)
    await page.click('[data-testid="login-btn"]')
    await page.goto('/checkout')

    // Enter declining test card
    await page.fill('[data-testid="card-number-input"]', '4000000000000002')
    await page.fill('[data-testid="card-expiry-input"]', '12/28')
    await page.fill('[data-testid="card-cvv-input"]', '123')
    await page.click('[data-testid="place-order-btn"]')

    // Verify error state
    await expect(page.locator('[data-testid="payment-error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="payment-error-message"]')).toContainText('Your card was declined')
    await expect(page).toHaveURL('/checkout')
  })
})`}]}),e.jsx("h2",{children:"Visual Regression Testing"}),e.jsx("p",{children:"Visual regression tests capture screenshots of UI states and compare them against baselines, failing if pixels change unexpectedly. They catch a class of bugs that functional tests miss — layout shifts, color changes, hidden elements — particularly valuable for design system components that are shared across many features."}),e.jsx(t,{title:"Visual Regression with Playwright",tabs:[{label:"bash",language:"bash",filename:"visual-regression.sh",code:`# Ask Claude to add visual regression to existing E2E tests
claude "Add visual regression snapshots to tests/e2e/checkout.spec.ts.

For each major state in the checkout flow, add a screenshot assertion:
1. Initial checkout page load (empty state)
2. Cart summary populated
3. Payment form filled
4. Order confirmation page

Use Playwright's built-in screenshot comparison:
  await expect(page).toHaveScreenshot('checkout-initial.png', {
    maxDiffPixelRatio: 0.01  // Allow 1% pixel difference for anti-aliasing
  })

Mask dynamic content (timestamps, order numbers, prices that vary):
  await expect(page).toHaveScreenshot('checkout-confirmation.png', {
    mask: [page.locator('[data-testid="order-number"]'),
           page.locator('[data-testid="order-date"]')]
  })

Update baseline screenshots:
  npx playwright test --update-snapshots tests/e2e/checkout.spec.ts

Then run normally to compare:
  npx playwright test tests/e2e/checkout.spec.ts"`}]}),e.jsx("h2",{children:"Maintaining E2E Tests as the UI Evolves"}),e.jsx("p",{children:"The hardest problem with E2E tests is maintenance. When selectors change, tests break. Claude can help keep tests in sync with the UI, but requires the right context."}),e.jsx(t,{title:"Fixing Broken E2E Tests After UI Changes",tabs:[{label:"bash",language:"bash",filename:"fix-broken-e2e.sh",code:`# E2E tests broke after UI refactor — ask Claude to fix selectors
claude "Our E2E tests are failing after the checkout UI redesign.

Failing test output:
$(npx playwright test tests/e2e/checkout.spec.ts 2>&1 | grep -A5 'Error:')

The current page HTML for the checkout page is:
$(npx playwright codegen --target=html http://localhost:3000/checkout 2>/dev/null ||   curl -s http://localhost:3000/checkout | grep 'data-testid')

For each failing selector:
1. Find the new data-testid attribute in the current HTML
2. If data-testid is missing, identify the best stable selector (prefer: data-testid > id > role > text)
3. Update the selector in the test file
4. If a new data-testid needs to be added to the component, add it to both the component and test

Run: npx playwright test tests/e2e/checkout.spec.ts after each fix
All tests must pass before stopping."`}]}),e.jsx(r,{title:"E2E Tests Are Not Unit Tests — Don't Write Hundreds",children:"E2E tests should cover critical user journeys, not every UI state. A test suite with 500 E2E tests will take 40 minutes to run, be constantly broken by UI changes, and provide diminishing returns over a well-structured unit and integration test suite. Aim for 20-50 E2E tests that cover the journeys that matter most to the business: registration, authentication, primary purchase flow, critical admin workflows. Ask Claude to identify which user stories represent critical paths before generating E2E tests for them."}),e.jsxs(a,{title:"Use data-testid Attributes as Test Contracts",children:["Add ",e.jsx("code",{children:"data-testid"}),' attributes to UI components as part of your development standard, not as an afterthought when tests break. Include in CLAUDE.md: "Every interactive UI element and data display that E2E tests reference must have a data-testid attribute. data-testid values are a public API — they must not be changed without updating the corresponding tests." This makes E2E selectors stable and makes the relationship between UI and tests explicit.']}),e.jsxs(n,{type:"tip",title:"Playwright Test Generator as Starting Point",children:["Use Playwright's built-in test generator to capture user interactions as a starting point: ",e.jsx("code",{children:"npx playwright codegen http://localhost:3000/checkout"}),`. This generates a raw Playwright script that records your clicks and inputs. Then ask Claude: "Refactor this generated Playwright script into a proper test with fixtures, assertions for all acceptance criteria, and error state coverage." This is faster than writing tests from scratch when you don't have Gherkin scenarios available.`]})]})}const Oe=Object.freeze(Object.defineProperty({__proto__:null,default:H},Symbol.toStringTag,{value:"Module"}));function z(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Security Test Automation"}),e.jsx("p",{children:"Security vulnerabilities are defects. Treating them as defects means they should be caught by automated tests that run on every PR, not discovered by a penetration tester six months after deployment. The OWASP Top 10 is a catalog of the most common web application vulnerabilities — and for most of them, automated tests can be written that verify the vulnerability is absent. Claude can generate this test suite from your API specification and CLAUDE.md security requirements."}),e.jsx("p",{children:'Security test automation serves two purposes: it catches new vulnerabilities introduced during development, and it documents your security posture in executable form. When an auditor asks "how do you verify SQL injection is prevented?", pointing to a passing test suite is more credible than pointing to a code review checklist.'}),e.jsxs(s,{title:"Security Tests as Executable Policy",children:['Every security requirement in your CLAUDE.md should have a corresponding automated test. If your CLAUDE.md says "passwords must be hashed with bcrypt cost factor ',">=",' 12", there should be a test that reads the database after a user creation and verifies the hash prefix is ',e.jsx("code",{children:"$2b$12$"}),'. If it says "rate limit login to 5 attempts per 15 minutes", there should be a test that makes 6 rapid requests and asserts the 6th returns 429. Security requirements without tests are wishes.']}),e.jsx(t,{title:"OWASP Top 10 Test Generation",tabs:[{label:"bash",language:"bash",filename:"generate-owasp-tests.sh",code:`# Generate security tests for OWASP Top 10 vulnerabilities
claude "Generate automated security tests for our REST API.
API base: http://localhost:3000
Auth: Bearer JWT (use TEST_JWT_SECRET to generate tokens)

Generate tests for each OWASP Top 10 category relevant to this API:

A01 - Broken Access Control:
- Test that user A cannot access user B's resources (IDOR)
- Test that /admin endpoints require admin role (not just authentication)
- Test that deleted resources return 404 (not the resource)

A02 - Cryptographic Failures:
- Test that /users response never includes password or password_hash fields
- Test that API responses over HTTP are rejected (HTTPS only in production)

A03 - Injection:
- SQL injection: POST /users with email: "' OR '1'='1" — must return 400, not 200
- SQL injection in search: GET /search?q='; DROP TABLE users;-- — must return results or 400
- NoSQL injection: POST /login with { "username": {"$gt": ""} } — must return 401

A04 - Insecure Design:
- Test that password reset tokens expire after 1 hour
- Test that password reset tokens are single-use

A07 - Identification and Authentication Failures:
- Test that 6 consecutive failed logins for same account returns 429
- Test that JWT tokens expire after the configured TTL
- Test that expired tokens are rejected with 401

A09 - Security Logging:
- Test that failed authentication attempts are logged (check audit log table)
- Test that admin actions are logged with actor identity

Use Jest + Supertest. Place tests in tests/security/
Run: npm test -- --testPathPattern='security' after generating."`},{label:"typescript",language:"typescript",filename:"tests/security/access-control.test.ts (generated)",code:`import request from 'supertest'
import app from '../../src/app'
import { createTestUser, generateJWT } from '../factories/auth'
import { db } from '../helpers/database'

describe('A01 - Broken Access Control', () => {
  let userA: TestUser
  let userB: TestUser
  let tokenA: string
  let tokenB: string

  beforeEach(async () => {
    userA = await createTestUser()
    userB = await createTestUser()
    tokenA = generateJWT(userA.id, process.env.TEST_JWT_SECRET!)
    tokenB = generateJWT(userB.id, process.env.TEST_JWT_SECRET!)
  })

  it('prevents user A from reading user B profile (IDOR)', async () => {
    const response = await request(app)
      .get(/users/\${userB.id})
      .set('Authorization', Bearer \${tokenA})
    expect(response.status).toBe(403)
  })

  it('prevents user A from updating user B profile (IDOR)', async () => {
    const response = await request(app)
      .patch(/users/\${userB.id})
      .set('Authorization', Bearer \${tokenA})
      .send({ name: 'Hijacked Name' })
    expect(response.status).toBe(403)
    // Verify B's name was not changed
    const userBAfter = await db.user.findUnique({ where: { id: userB.id } })
    expect(userBAfter!.name).not.toBe('Hijacked Name')
  })

  it('rejects unauthenticated access to protected resources', async () => {
    const response = await request(app).get(/users/\${userA.id})
    expect(response.status).toBe(401)
  })
})

describe('A03 - SQL Injection', () => {
  let token: string

  beforeEach(async () => {
    const user = await createTestUser()
    token = generateJWT(user.id, process.env.TEST_JWT_SECRET!)
  })

  it('handles SQL injection in email field without exposing data', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: "' OR '1'='1", password: 'anything' })
    // Must return 400 (validation) or 401 (auth failure), never 200
    expect([400, 401]).toContain(response.status)
    // Must not expose user data
    expect(response.body).not.toHaveProperty('token')
  })

  it('handles SQL injection in search query safely', async () => {
    const response = await request(app)
      .get("/products/search?q='; DROP TABLE users;--")
      .set('Authorization', Bearer \${token})
    // Should handle gracefully — not 500
    expect(response.status).not.toBe(500)
  })
})`}]}),e.jsx("h2",{children:"Fuzzing with Fast-Check"}),e.jsx("p",{children:"Property-based fuzzing generates random inputs to find edge cases your manual tests missed. For security testing, fuzzing input validation is particularly valuable — you specify the space of possible malicious inputs and let the framework find the ones that slip through."}),e.jsx(t,{title:"Input Fuzzing for Injection Prevention",tabs:[{label:"bash",language:"bash",filename:"fuzz-security.sh",code:`# Generate fuzz tests for input validation
claude "Generate fast-check property-based fuzz tests for input validation
in our user registration endpoint POST /users.

Install: npm install --save-dev fast-check

Generate fuzz tests for:

1. Email field fuzzing:
   - Property: any input that is not a valid email format must return 422
   - Include: SQL injection strings, XSS payloads, null bytes, unicode exploits
   - Use fc.emailAddress() for valid emails (should return 201)
   - Use fc.string() for arbitrary strings (should return 422)

2. Name field fuzzing:
   - Property: names > 255 characters must return 422
   - Property: names with null bytes must return 422
   - Property: any valid name (letters, spaces, hyphens up to 255 chars) must return 201

3. Password field fuzzing:
   - Property: passwords with unicode confusables must be handled consistently
   - Property: passwords > 72 chars must be truncated safely by bcrypt (not cause errors)

Use fast-check's fc.assert() with fc.property() for each test.
Run 1000 examples per test (fc.assert(fc.property(...), { numRuns: 1000 }))

Place in tests/security/fuzzing.test.ts"`}]}),e.jsx("h2",{children:"Penetration Test Scenarios as Automated Tests"}),e.jsx("p",{children:"Many common penetration test findings can be automated into regression tests. Once you've run a pentest (or had a finding reported), encode the finding as a test so it can never regress."}),e.jsx(t,{title:"Encoding Pentest Findings as Regression Tests",tabs:[{label:"bash",language:"bash",filename:"pentest-regression.sh",code:`# Encode a pentest finding as a regression test
claude "Create a regression test for the following pentest finding.

Finding: CVE-2024-INTERNAL-001
Severity: High
Description: The /api/admin/reports endpoint was accessible with a valid user JWT
that did not have the 'admin' role. An attacker with a regular user account could
read all user records by calling GET /api/admin/reports.

Remediation applied: Added role check middleware to /api/admin/* routes.

Test to create (tests/security/regressions/cve-2024-internal-001.test.ts):
1. Create a regular user account
2. Generate a valid JWT for that user
3. Call GET /api/admin/reports with that JWT
4. Assert the response is 403 (forbidden), not 200
5. Verify the response body contains an error message, not user data

Name the test: 'CVE-2024-INTERNAL-001: regular user cannot access admin reports'
Add a comment at the top of the test file: 'Regression test for CVE-2024-INTERNAL-001'
This test must be in the security test suite so it runs on every PR."`}]}),e.jsx(r,{title:"Security Tests Run Against a Test Environment, Not Production",children:"Security tests that probe for injection vulnerabilities, test rate limiting, or verify access controls must run against a dedicated test environment with test accounts and test data. Never run automated security tests against a production environment — rate limiting tests will lock out real users, injection tests may trigger security monitoring alerts, and any misconfiguration could cause real damage. CI/CD pipelines should run security tests against a staging or test environment that mirrors production configuration."}),e.jsx(a,{title:"Add Security Tests to the PR Template",children:'Include a security test checklist in your PR template. For any PR that touches authentication, authorization, data access, or input handling, the template should prompt: "Have you added or updated security tests for the OWASP categories affected by this change?" Making this a visible question in every PR review creates a culture where security testing is expected, not exceptional.'}),e.jsx(n,{type:"tip",title:"OWASP ZAP for Automated Dynamic Scanning",children:'OWASP ZAP (Zed Attack Proxy) provides automated dynamic application security testing (DAST) that complements your unit and integration security tests. Ask Claude to generate a ZAP automation config: "Generate a ZAP automation framework script that crawls our API using the OpenAPI spec at docs/api/openapi.yaml and runs the active scanner against authentication endpoints. Output: JSON report at /tmp/zap-report.json. Fail if any HIGH or CRITICAL findings are discovered." Integrate the ZAP scan into your nightly CI pipeline.'})]})}const qe=Object.freeze(Object.defineProperty({__proto__:null,default:z},Symbol.toStringTag,{value:"Module"}));function B(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Test Data Generation"}),e.jsx("p",{children:`Test data is the invisible infrastructure of a test suite. Bad test data produces brittle tests: tests that fail when a hardcoded email already exists in the database, tests that only work in one developer's local environment because they depend on seed data nobody else seeded, tests that use "test@test.com" and "password123" as realistic inputs for a system that will receive complex real-world data. Good test data is generated programmatically, isolated per test, representative of real inputs, and never contains real PII.`}),e.jsx("p",{children:"AI assistance is valuable both for generating the test data infrastructure (factories, builders, seed scripts) and for generating the data itself — particularly synthetic data that mirrors the statistical properties of production data without containing any real user information."}),e.jsx(s,{title:"The Four Types of Test Data",children:"Effective test data management requires four distinct capabilities: (1) factory functions that create model instances with sensible defaults for unit tests, (2) seed scripts that populate a database with a known state for integration tests, (3) synthetic production-like datasets for load and performance tests, and (4) GDPR-compliant anonymized copies of production data for debugging specific production issues in a development environment."}),e.jsx("h2",{children:"Test Factory Generation"}),e.jsx(t,{title:"Generating Test Factories with Faker",tabs:[{label:"bash",language:"bash",filename:"generate-factories.sh",code:`# Generate test factories for all domain models
claude "Generate test factory functions for all models in src/domain/models/.

Use @faker-js/faker for realistic data generation.
Install: npm install --save-dev @faker-js/faker

For each model, create a factory that:
1. Has sensible defaults for all required fields (using faker for realistic data)
2. Accepts an optional partial override parameter
3. Has a save() method that persists to the test database
4. Has a build() method that returns the object without saving

Example pattern for User model:
  export const UserFactory = {
    build: (overrides: Partial<User> = {}): User => ({
      id: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: 'user',
      createdAt: new Date(),
      ...overrides
    }),
    create: async (overrides: Partial<User> = {}): Promise<User> => {
      const data = UserFactory.build(overrides)
      return db.user.create({ data })
    }
  }

Generate factories for: User, Order, Product, Address, PaymentMethod
Place in: tests/factories/index.ts

Important:
- Never use real-looking email domains that could be real people (use example.com)
- Use faker.internet.email({ provider: 'example.com' }) for email fields
- For password fields, use a pre-hashed bcrypt string to avoid slow hashing in tests"`},{label:"typescript",language:"typescript",filename:"tests/factories/index.ts (generated)",code:`import { faker } from '@faker-js/faker'
import { db } from '../helpers/database'
import type { User, Order, Product } from '../../src/domain/models'
// Pre-hashed bcrypt of "TestPassword123!" — avoids slow hashing in tests
const TEST_PASSWORD_HASH = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewc7sT8bXJ3DJBZ2'

export const UserFactory = {
  build: (overrides: Partial<User> = {}): User => ({
    id: faker.string.uuid(),
    email: faker.internet.email({ provider: 'example.com' }),
    name: faker.person.fullName(),
    passwordHash: TEST_PASSWORD_HASH,
    role: 'user' as const,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
  create: async (overrides: Partial<User> = {}): Promise<User> => {
    const data = UserFactory.build(overrides)
    return db.user.create({ data })
  },
  createAdmin: async (overrides: Partial<User> = {}): Promise<User> => {
    return UserFactory.create({ role: 'admin', ...overrides })
  },
}

export const ProductFactory = {
  build: (overrides: Partial<Product> = {}): Product => ({
    id: faker.string.uuid(),
    sku: faker.string.alphanumeric(8).toUpperCase(),
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price({ min: 1, max: 500 })),
    currency: 'USD',
    stock: faker.number.int({ min: 0, max: 1000 }),
    ...overrides,
  }),
  create: async (overrides: Partial<Product> = {}): Promise<Product> => {
    return db.product.create({ data: ProductFactory.build(overrides) })
  },
}`}]}),e.jsx("h2",{children:"Synthetic Production-Like Data"}),e.jsx("p",{children:"Performance and load testing require large datasets that mirror the statistical properties of production data — the distribution of order sizes, the ratio of active to inactive users, the typical product catalog depth. Claude can generate realistic synthetic datasets from your production data schema."}),e.jsx(t,{title:"Synthetic Dataset Generation",tabs:[{label:"bash",language:"bash",filename:"generate-synthetic-data.sh",code:`# Generate a synthetic production-like dataset for load testing
claude "Generate a database seed script for load testing.

Target dataset size: 100,000 users, 500,000 orders, 10,000 products

Production data characteristics (approximate — do not use real data):
- User distribution: 70% with 1-5 orders, 20% with 6-20 orders, 10% with 20+ orders
- Order value distribution: median $45, mean $67, max $1,200 (log-normal distribution)
- Order status distribution: 60% delivered, 25% pending, 10% processing, 5% cancelled
- Product categories: Electronics (30%), Clothing (25%), Home (20%), Books (15%), Other (10%)
- Geographic distribution: 60% US, 15% UK, 10% CA, 5% AU, 10% other

Generate: scripts/seed/load-test-seed.ts

Requirements:
- Use transactions for bulk inserts (10,000 records per transaction)
- Show progress every 10,000 records
- Estimated runtime: < 5 minutes
- Can be re-run idempotently (clear tables before seeding)
- CLI flag --size=small (1000 users) for development seeding

Run: npx ts-node scripts/seed/load-test-seed.ts
After seeding: npx k6 run tests/load/checkout-flow.js"`}]}),e.jsx("h2",{children:"PII Anonymization for Development Data"}),e.jsx("p",{children:"When a production bug requires debugging with real data characteristics, the correct approach is not to copy production data to a development environment — it is to anonymize a production snapshot before using it. Claude can generate the anonymization pipeline."}),e.jsx(t,{title:"GDPR-Compliant Data Anonymization Pipeline",tabs:[{label:"bash",language:"bash",filename:"anonymize-pipeline.sh",code:`# Generate PII anonymization script
claude "Generate a PostgreSQL data anonymization script for GDPR compliance.

We need to anonymize production database snapshots before using them in development.

Tables and PII fields to anonymize:
users:
  - email → faker.internet.email({ provider: 'anonymized.example' })
  - name → faker.person.fullName()
  - phone → faker.phone.number()
  - ip_address → '0.0.0.0'
  - date_of_birth → keep year, randomize month/day within year

orders:
  - billing_address_line1 → faker.location.streetAddress()
  - billing_name → users.name (already anonymized — use consistent fake name)
  - notes → '[ANONYMIZED]' if not null, else null

payment_methods:
  - last_four → random 4-digit string
  - billing_zip → faker.location.zipCode()
  - DELETE all rows from payment_methods where type = 'bank_account'

audit_logs:
  - ip_address → '0.0.0.0'
  - user_agent → 'anonymized'

Requirements:
- Must maintain referential integrity (anonymized name consistent across tables for same user)
- Use a seeded random for reproducibility: ANONYMIZATION_SEED env var
- Verify no real email domains remain after anonymization: SELECT email FROM users WHERE email NOT LIKE '%anonymized.example'
- Log: records processed, fields anonymized, verification results

Output: scripts/anonymize/anonymize-prod-snapshot.ts
Usage: npx ts-node scripts/anonymize/anonymize-prod-snapshot.ts --input prod-dump.sql --output dev-seed.sql"`}]}),e.jsx(r,{title:"Never Use Real Production Data in Development Without Anonymization",children:'Copying a production database snapshot to a development environment without anonymization is a GDPR violation, a SOC 2 violation, and an exposure risk. Development environments have weaker security controls than production — more people have access, logs are less monitored, and there is no breach detection. Enforce this in CLAUDE.md: "The development database must never contain real user PII. If you need production-like data for debugging, run the anonymization pipeline first." Include this as a check in your development environment setup script.'}),e.jsx(a,{title:"Isolate Test Data Per Test, Not Per Suite",children:`The best test data strategy is to create exactly the data each test needs, inside that test's setup, and clean it up after. Tests that share a database state are order-dependent and fail non-deterministically. Ask Claude when generating tests: "Each test should create its own data using factories and clean up after itself. Do not use beforeAll to create shared data — use beforeEach or inline creation." This makes tests independently runnable and parallelizable.`}),e.jsxs(n,{type:"tip",title:"Snapshot Tests for Complex Data Structures",children:['For complex objects (nested order objects, report outputs, serialized payloads), Jest snapshot tests can capture the exact structure and detect regressions. Ask Claude: "Add snapshot tests for the OrderSerializer.toJSON() output. The snapshot should use factory data with fixed seeds so it is deterministic. Replace dynamic fields (timestamps, UUIDs) with static values before snapshotting." Use ',e.jsx("code",{children:"toMatchInlineSnapshot()"})," for small objects (the snapshot is visible in the test file) and ",e.jsx("code",{children:"toMatchSnapshot()"})," for large objects."]})]})}const Ne=Object.freeze(Object.defineProperty({__proto__:null,default:B},Symbol.toStringTag,{value:"Module"}));function V(){return e.jsxs("div",{children:[e.jsxs(s,{title:"SAST in the Agent Loop",children:[e.jsx("p",{children:"Most engineering teams run security scanners in CI — a pipeline that executes after code is pushed to a remote branch. For human-paced development, this is adequate: the feedback loop is measured in hours, which is fast enough for daily work. For AI-assisted development, where an agent can generate and commit dozens of files in minutes, CI-only scanning is not a safety net — it is a post-mortem."}),e.jsx("p",{children:"The solution is to integrate Static Application Security Testing (SAST) tools — Semgrep, Bandit, CodeQL, Snyk — directly into the Claude Code agent loop. Instead of running security scans after code is written and hoping engineers fix findings, Claude runs the scanner itself, reads the findings, and fixes issues before the engineer ever sees the code. Security shifts all the way left: into the generation step itself."}),e.jsx("p",{children:"When Claude writes code, it immediately runs the scanner, reads structured JSON output, fixes every critical and high finding, re-runs to confirm zero findings, and only then presents the code to the engineer. The engineer receives code that has already passed a security scan — not code that needs one."})]}),e.jsxs(o,{title:"Scan-Fix-Verify Loop",children:[e.jsx("p",{children:'The security loop runs inside every Claude Code generation session. It is not a separate step that happens afterward — it is part of what "writing code" means when Claude is doing it.'}),e.jsxs("ol",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Claude writes code."})," Claude generates the implementation based on requirements and CLAUDE.md constraints."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Claude runs Semgrep/Bandit."})," Immediately after writing files, Claude runs the configured scanners against the changed files. Output is captured as structured JSON — not displayed to the user, consumed by Claude itself."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Claude reads findings."})," Claude parses the JSON output, categorises findings by severity, and identifies which are auto-fixable versus which require human judgment."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Claude fixes each finding."})," For each critical and high finding, Claude reads the flagged file and line number, understands the root cause, and applies a fix that eliminates the vulnerability — not a suppression comment, not a threshold adjustment, an actual fix."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Claude re-runs the scanner to verify zero findings."})," After fixing, Claude runs the scanner again on the same files. If new findings appear or old ones remain, the fix-verify loop repeats. Claude does not stop until the scanner reports clean."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Only then does Claude present code to the engineer."})," The engineer receives code that has already cleared the security bar. Code review focuses on architecture and correctness, not on catching SQL injections."]})]})]}),e.jsx("h3",{children:"The /security-scan Custom Command"}),e.jsxs("p",{children:["The ",e.jsx("code",{children:"/security-scan"})," command is a Claude Code custom command defined in",e.jsx("code",{children:".claude/commands/security-scan.md"}),". It encodes the full scanning workflow as a reusable instruction set. Claude invokes it as a named command rather than reconstructing the scanning steps from memory each time."]}),e.jsx(i,{language:"yaml",filename:".claude/commands/security-scan.md",children:`# /security-scan

Run the following security scanners on changed files and fix all critical/high findings:

## Steps
1. Run Semgrep with org ruleset:
   semgrep --config=p/owasp-top-ten --config=.semgrep/custom-rules.yml --json src/

2. Run Bandit for Python:
   bandit -r src/ -f json -ll

3. Run Snyk for dependencies:
   snyk test --json

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
- If you can't fix a finding safely, escalate to the engineer`}),e.jsx(t,{title:"Security Scanner MCP Server",tabs:[{label:"python",language:"python",filename:"mcp_servers/security_scanner.py",code:`# mcp_servers/security_scanner.py
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
    asyncio.run(main())`}]}),e.jsxs("p",{children:["By exposing the scanners as MCP tools, Claude gains structured access to security findings without needing to parse shell output from scratch each time. The",e.jsx("code",{children:"run_semgrep"})," tool returns only the top 20 critical/high findings to stay within context window limits — enough for a fix loop, without flooding the conversation. Claude can call these tools in sequence, fix findings between calls, and call again to confirm resolution."]}),e.jsx("h3",{children:"Custom Semgrep Rules for Organization-Specific Patterns"}),e.jsx("p",{children:"Generic rulesets (p/owasp-top-ten, p/python) catch well-known vulnerability classes. The highest-leverage security investment for a mature team is writing custom rules for patterns specific to their codebase: internal SDK misuse, proprietary data handling requirements, compliance rules unique to the industry. Each custom rule encodes a lesson learned from a code review and permanently prevents the same mistake in all future AI-generated code."}),e.jsx(i,{language:"yaml",filename:".semgrep/custom-rules.yml",children:`rules:
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
    languages: [python]`}),e.jsx("p",{children:'Notice that each rule encodes not just what is forbidden but why. The message field is what Claude reads when the scanner fires. A message that says "SQL injection risk: never use f-strings in SQL. Use parameterized queries." gives Claude enough context to apply the correct fix without additional prompting. Write messages for Claude to act on, not just for humans to read.'}),e.jsxs(l,{severity:"critical",children:["The ",e.jsx("code",{children:"nosec"})," comment is a security debt marker, not a fix. Every"," ",e.jsx("code",{children:"# nosec"})," in your codebase is a finding that was suppressed instead of fixed. When Claude encounters a finding it cannot fix cleanly, the correct behavior is to escalate to the engineer — not to add a suppression comment and move on. Require PR comments explaining every nosec, tied to a specific rule ID and a justification. Audit them in quarterly security reviews. A codebase where nosec comments accumulate unchecked is one where the security scanning is producing theater rather than protection."]}),e.jsx("h3",{children:"Integrating SAST into CI as a Gate"}),e.jsx("p",{children:"The in-loop scanning catches issues before commit. The CI gate is a second, independent verification: even if the pre-commit scanning is bypassed or misconfigured, the CI pipeline catches it before the code reaches main. Both layers are required. The in-loop scan catches issues fast and cheaply. The CI gate is the enforcement mechanism that cannot be bypassed."}),e.jsx(i,{language:"yaml",filename:".github/workflows/security.yml",children:`name: Security Scan
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
          sarif_file: semgrep.sarif`}),e.jsx("p",{children:"The SARIF upload integrates findings directly into the GitHub PR interface: each finding appears as an inline annotation on the diff, at the exact line where the issue was detected. Reviewers see security issues in context without switching to a separate dashboard. When Claude's in-loop scanning is working correctly, this CI step should produce zero findings — it is verifying that the in-loop scan did its job."}),e.jsx(a,{title:"Make SAST a Required Check, Not an Advisory One",children:"Run SAST on every PR, not just on main. The cost of fixing a SQL injection after merge is 10x the cost of fixing it before. Make the SAST CI job a required status check — not optional, not advisory. If it is advisory, it will be ignored. Engineers under deadline pressure will merge with failing advisory checks and tell themselves they will fix it later. Later never comes. Required checks cannot be ignored; they must be addressed or explicitly overridden with documented justification. The friction is intentional: security findings should require effort to bypass."}),e.jsxs(n,{type:"tip",children:["Start with ",e.jsx("code",{children:"p/owasp-top-ten"})," as your Semgrep baseline. Add custom rules one at a time as you discover organization-specific patterns — when a code review catches something the baseline missed, that becomes a rule. A focused ruleset with zero false positives is worth more than a comprehensive ruleset that engineers learn to ignore. Every false positive erodes trust in the scanner and trains Claude to suppress findings rather than fix them. Precision matters more than recall when the scanner is running in an automated loop."]})]})}const Ue=Object.freeze(Object.defineProperty({__proto__:null,default:V},Symbol.toStringTag,{value:"Module"}));function $(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Dependency Vulnerability Remediation"}),e.jsx("p",{children:"The majority of real-world application security vulnerabilities do not originate in code you wrote — they originate in the open-source dependencies your code depends on. The average Node.js application has over 1,000 transitive dependencies. When any one of them has a published CVE, your application is affected. Keeping up with vulnerability remediations across this dependency surface area is a continuous, time-consuming engineering task — and one where Claude Code provides substantial leverage."}),e.jsx("p",{children:"The challenge is not just detecting vulnerable dependencies (automated tools handle that) but remediating them safely. A patch upgrade to fix a CVE might introduce breaking API changes. A major version bump that contains a security fix might require migrating dozens of call sites. Claude can assess the impact, generate the migration code, and validate that tests still pass — turning a multi-day remediation into hours."}),e.jsx(s,{title:"Automated CVE Remediation Loop",children:"The Vibe Engineering approach to vulnerability remediation is to automate as much of the assessment and remediation work as possible, while keeping the engineer in the decision loop for changes that involve breaking API changes or architectural trade-offs. For pure patch upgrades (no API changes, no behavior changes), Claude can handle the full remediation autonomously. For major version migrations, Claude does the analysis and migration work while you approve the approach."}),e.jsx(t,{title:"Automated npm Vulnerability Remediation",tabs:[{label:"bash",language:"bash",filename:"vuln-remediation.sh",code:`# Step 1: Assess current vulnerability state
npm audit --json > /tmp/audit-report.json
cat /tmp/audit-report.json | jq '.vulnerabilities | to_entries[] | {
  package: .key,
  severity: .value.severity,
  via: .value.via,
  fixAvailable: .value.fixAvailable
}' | head -50

# Step 2: Ask Claude to triage and remediate
claude "Perform dependency vulnerability remediation.

Current audit report: /tmp/audit-report.json
Current package.json: package.json
Current package-lock.json: package-lock.json

Triage vulnerabilities by category:

CATEGORY A — Patch upgrade available (no breaking changes):
  - Upgrade the package
  - Run: npm audit to verify resolved
  - Run: npm test to verify nothing broke
  - Commit with message: 'security: patch CVE-XXXX in package-name'

CATEGORY B — Minor/patch upgrade with possible behavior changes:
  - Upgrade the package
  - Run tests
  - If tests fail, investigate the change and fix call sites
  - Report what changed

CATEGORY C — Major version upgrade required:
  - DO NOT upgrade automatically
  - For each: show me the CHANGELOG entry for the security fix
  - Describe what API changes the major version introduces
  - Estimate effort to migrate
  - Wait for my approval before proceeding

CATEGORY D — No fix available (vulnerability in transitive dep with no patch):
  - Check if the vulnerability is actually reachable from our code
  - If not reachable: add to .nsprc with justification comment
  - If reachable: identify alternative packages and estimate migration effort

Run: npm audit after all Category A remediations
Target: 0 high/critical vulnerabilities"`}]}),e.jsx("h2",{children:"Breaking Change Migration"}),e.jsx("p",{children:"Major version upgrades for security fixes often require migrating call sites to new APIs. Claude excels at these mechanical migrations when given the migration guide and the affected files."}),e.jsx(t,{title:"Major Version Migration Workflow",tabs:[{label:"bash",language:"bash",filename:"major-version-migration.sh",code:`# Example: Migrating jsonwebtoken from v8 to v9 (security fix for algorithm confusion)
claude "Migrate jsonwebtoken from v8 to v9 to remediate CVE-2022-23529.

Breaking changes in v9:
1. jwt.verify() callback signature changed: errors are now more specific types
2. algorithm: 'none' is now rejected by default (security improvement)
3. secretOrPublicKey can no longer be an empty string

Find all usages:
grep -rn 'jsonwebtoken|jwt.verify|jwt.sign|jwt.decode' src/ --include='*.ts'

For each usage:
1. Identify if it uses the old callback pattern for jwt.verify()
2. Check if any call passes algorithm: 'none' (security issue — these should be removed)
3. Check for empty string secrets

Migration steps:
1. npm install jsonwebtoken@^9.0.0
2. Update all jwt.verify() calls to handle new error types
3. Remove any uses of algorithm: 'none'
4. Update TypeScript types: npm install --save-dev @types/jsonwebtoken@^9.0.0
5. Run: npm test — all JWT-related tests must pass

Show me each changed file before applying. Run tests after completing all changes."`}]}),e.jsx("h2",{children:"Automated Dependency Updates with Dependabot"}),e.jsx(t,{title:"Dependabot Configuration and Auto-Merge",tabs:[{label:"yaml",language:"yaml",filename:".github/dependabot.yml",code:`version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: daily
      time: "06:00"
      timezone: "UTC"
    open-pull-requests-limit: 10
    # Auto-merge patch updates after CI passes
    automerged-updates:
      - match:
          dependency-type: direct
          update-type: semver:patch
      - match:
          dependency-type: indirect
          update-type: semver:patch
    labels:
      - "dependencies"
      - "auto-update"
    commit-message:
      prefix: "deps"
      include: "scope"
    # Group all non-major updates together
    groups:
      minor-and-patch:
        update-types:
          - minor
          - patch
        exclude-patterns:
          - "typescript"  # TypeScript upgrades need manual review`},{label:"bash",language:"bash",filename:"review-dependabot-pr.sh",code:`# When Dependabot opens a PR with a minor/major update, use Claude to review
claude "Review Dependabot PR #$(gh pr list --label dependencies --json number --jq '.[0].number').

PR details:
$(gh pr view --json title,body,files 2>/dev/null)

For this dependency update:
1. Read the CHANGELOG/RELEASE NOTES for the version being upgraded to
2. Identify any breaking changes that affect our usage
3. Find all our call sites: grep -rn 'package-name' src/
4. Assess: is our usage affected by any breaking changes?
5. Run: npm test -- to verify tests still pass with the update applied

Report:
- Summary of changes in new version
- Our usage pattern (how we use this package)
- Breaking changes that affect us: YES/NO (with specific details if YES)
- Test results: PASS/FAIL
- Recommendation: MERGE/NEEDS_MIGRATION/REJECT (with reasoning)"`}]}),e.jsx(r,{title:"CVE Severity Scores Are Not Context-Free",children:`A CRITICAL severity CVE in a package does not automatically mean your application is at critical risk. The vulnerability may require network access you don't expose, may only be exploitable in a configuration you don't use, or may be in a code path that your application never executes. Before treating a CRITICAL as a drop-everything emergency, ask Claude to assess reachability: "Is CVE-XXXX reachable in our usage of this package? Show me our call sites and trace whether the vulnerable code path can be triggered." Context changes the priority.`}),e.jsx(a,{title:"Never Suppress Vulnerabilities Without Documentation",children:`When you add a vulnerability to .nsprc or npm audit --ignore, document why. "Vulnerability is in a test-only dependency that is never deployed to production" is a legitimate suppression reason. "We haven't gotten around to fixing it" is not. Include in your suppressions: the CVE ID, the date of suppression, the reason, and the engineer who approved the suppression. Review suppressions quarterly. Ask Claude to generate this review: "List all suppressed vulnerabilities in .nsprc with their suppression date and reason. Flag any older than 90 days for re-evaluation."`}),e.jsx(n,{type:"tip",title:"Use Socket.dev for Supply Chain Security",children:"npm audit only catches known CVEs. Supply chain attacks (malicious packages published to npm, dependency confusion, typosquatting) are not caught by CVE databases. Socket.dev provides real-time analysis of package behavior, detecting packages that unexpectedly add network access, file system access, or install scripts. Integrate Socket into your PR pipeline: the GitHub Action will warn when a dependency update includes packages with suspicious behaviors that CVE databases would miss."})]})}const Fe=Object.freeze(Object.defineProperty({__proto__:null,default:$},Symbol.toStringTag,{value:"Module"}));function K(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Compliance Controls in CLAUDE.md"}),e.jsx("p",{children:"Regulatory compliance frameworks — SOC 2, GDPR, HIPAA, PCI-DSS — require that specific technical controls be in place and consistently applied. In traditional software development, these controls live in wikis, checklists, and policy documents that developers consult sporadically, if at all. Violations are discovered during audits, months after the non-compliant code was merged."}),e.jsx("p",{children:`Vibe Engineering moves compliance controls into CLAUDE.md, making them active constraints that shape AI-generated code from the first prompt. When Claude sees that HIPAA requires PHI to be encrypted at rest and in transit, it will implement encryption as a default behavior rather than an afterthought. When GDPR's data minimization principle is encoded as "collect only fields necessary for the stated purpose", Claude will push back on data models that capture more than they need.`}),e.jsx(s,{title:"Compliance as Code",children:"Machine-readable compliance controls in CLAUDE.md are not a replacement for legal review or formal compliance programs — they are a first line of defense that prevents the most common compliance violations from ever being written. Think of them as guardrails: they do not make you compliant, but they prevent the obvious violations that auditors find most often. Legal and compliance teams should review and approve the CLAUDE.md compliance section just as they would any other policy document."}),e.jsx(t,{title:"GDPR Controls in CLAUDE.md",tabs:[{label:"yaml",language:"yaml",filename:"CLAUDE.md (GDPR section)",code:`## GDPR Compliance Controls

### Lawful Basis
- Every data collection must have a documented lawful basis (consent, contract, legitimate interest)
- Do not add new user data fields without documenting the lawful basis in the model comment
- Example: // Collected under: contract performance (Art. 6(1)(b)) — required for order fulfillment

### Data Minimization (Art. 5(1)(c))
- Collect only fields necessary for the stated purpose
- API responses must not include fields not required by the consumer
- Audit logs must not log request bodies containing PII (log only metadata: user_id, action, timestamp)

### Right to Erasure (Art. 17)
- Every user record must support soft-delete with a deleted_at timestamp
- Hard delete must be available for erasure requests: DELETE /users/:id/gdpr-erasure
- Erasure must cascade to all associated PII: orders (anonymize), audit_logs (anonymize IP/user_agent)
- Retention policy: user data deleted 30 days after account closure unless legal hold

### Data Retention
- User data: deleted 30 days after account closure
- Audit logs: retained 7 years (legal requirement), PII anonymized after 90 days
- Payment data: not stored (Stripe tokenization only) — never store raw card numbers
- Session data: expires after 24 hours of inactivity

### Cross-Border Transfers
- No user data may be stored in regions outside EU/EEA without Standard Contractual Clauses
- Database instances: eu-west-1 (primary), eu-central-1 (replica) ONLY
- Do not use AWS services that replicate data to US regions for EU user data

### Consent
- Marketing consent must be opt-in (not pre-checked checkboxes)
- Consent must be granular: separate consent for email, SMS, third-party sharing
- Consent withdrawal must be as easy as consent grant
- Consent records must be stored with timestamp and mechanism (API call, form submission)

### Breach Notification
- Potential data breaches must be reported to security@example.com within 1 hour of detection
- GDPR requires notification to supervisory authority within 72 hours
- See: runbooks/security-incident-response.md`}]}),e.jsx(t,{title:"HIPAA Controls in CLAUDE.md",tabs:[{label:"yaml",language:"yaml",filename:"CLAUDE.md (HIPAA section)",code:`## HIPAA Technical Safeguards

### PHI Definition
Protected Health Information (PHI) in this system includes:
- patient_id, user_id linked to health records
- diagnosis codes, treatment records, prescription data
- lab results, vital signs, medical images
- Any field in tables: patients, health_records, prescriptions, lab_results

### Encryption Requirements
- PHI at rest: AES-256 encryption required (database column-level encryption for PHI fields)
- PHI in transit: TLS 1.2+ required (TLS 1.3 preferred), no unencrypted channels
- API keys and credentials: AWS Secrets Manager only — never in code, env files, or logs
- Backup encryption: same standard as production (AWS KMS)

### Access Controls (§164.312(a))
- PHI access requires: authentication + authorization check + audit log entry
- Minimum necessary standard: users see only PHI required for their role
- Emergency access procedure: documented in runbooks/emergency-access.md
- Automatic logoff: sessions expire after 15 minutes of inactivity for PHI-accessing roles

### Audit Controls (§164.312(b))
- All PHI access must be logged: who accessed what data, when, from where
- Audit log format: { user_id, patient_id, action, resource, timestamp, ip_address }
- Audit logs must be tamper-evident (append-only, separate audit database)
- Audit log retention: 6 years minimum

### PHI in Logs — ABSOLUTELY FORBIDDEN
- No PHI fields may appear in application logs, error messages, or stack traces
- Use patient_id (UUID) in logs, never actual health data
- Log scrubbing: PHI patterns must be redacted before any log shipping
- Semgrep rule enforces this: /security/rules/no-phi-in-logs.yaml

### What to Do When Unsure
If you are unsure whether data is PHI or whether a pattern is HIPAA-compliant:
- Stop and ask the engineer before proceeding
- Do not guess — a wrong guess in HIPAA context creates liability`}]}),e.jsx(t,{title:"PCI-DSS Controls in CLAUDE.md",tabs:[{label:"yaml",language:"yaml",filename:"CLAUDE.md (PCI-DSS section)",code:`## PCI-DSS Controls (SAQ A-EP)

### Cardholder Data — Never Store
This application MUST NOT store:
- Primary Account Numbers (PAN) — full card numbers
- Card Verification Values (CVV, CVC, CVV2)
- PIN or PIN blocks
- Full magnetic stripe data

All payment processing is delegated to Stripe. We store only:
- Stripe customer ID (cus_xxx) — not payment data
- Stripe payment method ID (pm_xxx) — not payment data
- Last four digits of card (display only — not sensitive)
- Card brand (Visa, Mastercard — display only)

### Tokenization Pattern (Required)
CORRECT:
  const paymentMethod = await stripe.paymentMethods.create({ type: 'card', card: token })
  await db.user.update({ stripePaymentMethodId: paymentMethod.id })  // Store token only

FORBIDDEN:
  await db.user.update({ cardNumber: req.body.cardNumber })  // NEVER store card numbers

### Network Segmentation
- Payment-related API endpoints in src/api/payments/ run in PCI-scoped network segment
- No cross-calls from non-PCI services to payment services
- Payment service database is isolated (pci-db instance, not shared with main app)

### Vulnerability Management
- npm audit must show 0 HIGH/CRITICAL vulnerabilities before any payment-related deployment
- Payment dependencies reviewed separately with security team before upgrade`}]}),e.jsx("h2",{children:"Compliance Verification as Code"}),e.jsx(t,{title:"Automated Compliance Verification",tabs:[{label:"bash",language:"bash",filename:"compliance-check.sh",code:`# Run compliance verification checks
claude "Run automated compliance verification for GDPR and HIPAA controls.

GDPR checks:
1. Verify all user tables have soft-delete support:
   grep -r 'deleted_at' src/domain/models/ --include='*.ts' -l
   Expected: users.ts, orders.ts present

2. Verify no PII in audit log definitions:
   grep -r 'AuditLog' src/ --include='*.ts' -A10 | grep -E 'email|name|phone|address'
   Expected: no matches

3. Verify consent fields are opt-in (boolean defaulting to false):
   grep -r 'marketingConsent|emailConsent|smsConsent' src/ --include='*.ts'
   Expected: default: false in all schema definitions

HIPAA checks:
1. Verify PHI fields use column encryption:
   grep -r 'diagnosis|treatment|prescription' src/domain/models/ --include='*.ts' -B2
   Expected: @Encrypted() decorator present above each PHI column

2. Verify no PHI in logger calls:
   grep -r 'logger.' src/ --include='*.ts' | grep -E 'diagnosis|treatment|prescription|dob'
   Expected: no matches

3. Verify audit logs include patient_id for all PHI access:
   grep -r 'auditLog|AuditService' src/infrastructure/audit/ --include='*.ts' -A5
   Expected: patient_id field in all audit log entries

Output: PASS or FAIL for each check with file references for failures."`}]}),e.jsx(r,{title:"CLAUDE.md Is Not a Substitute for Legal Review",children:"Encoding compliance requirements in CLAUDE.md is an engineering control, not a legal determination. The controls should be reviewed and approved by your legal and compliance teams before they are treated as authoritative. A GDPR section written by an engineer without legal review may have gaps, misinterpretations, or be out of date with regulatory guidance. Work with your DPO and legal counsel to define the controls, then encode those controls in CLAUDE.md as implementation guidance."}),e.jsx(a,{title:"Keep Compliance Controls in Sync With Policy",children:`Compliance frameworks update. GDPR guidance evolves through regulatory decisions. HIPAA gets new guidance documents. Schedule a quarterly review of your CLAUDE.md compliance sections against your official compliance policies. Ask Claude: "Compare our CLAUDE.md GDPR section with the current GDPR requirements list in docs/compliance/gdpr-requirements.pdf. Identify any gaps or outdated controls." This keeps the AI's guardrails aligned with your actual obligations.`}),e.jsx(n,{type:"tip",title:"Use Semgrep Rules for Compliance Enforcement",children:"Encode the most critical compliance controls as Semgrep rules that block PRs. For HIPAA: a Semgrep rule that fails if any variable named after PHI fields is passed to a logger. For PCI: a rule that fails if any string matching a card number pattern is assigned to a database field. These rules run in milliseconds and provide immediate feedback to engineers when they accidentally violate a compliance control, rather than waiting for a code review or audit."})]})}const Ge=Object.freeze(Object.defineProperty({__proto__:null,default:K},Symbol.toStringTag,{value:"Module"}));function Y(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Secrets Detection"}),e.jsx("p",{children:"Accidentally committing secrets to source code is one of the most common and most costly security incidents in software development. An API key committed to a public GitHub repository is typically found and exploited within minutes by automated bots scanning for credentials. Even private repositories are not safe — secrets in commit history persist forever, surviving branch deletions, reverts, and rebase operations."}),e.jsx("p",{children:"AI coding assistants introduce a new vector: Claude might generate code that includes example secrets that look real, or it might move a configuration value into code without recognizing it should be an environment variable. Vibe Engineering treats secrets detection as a pre-commit and CI enforcement gate, not a post-incident cleanup activity."}),e.jsx(s,{title:"Defense in Depth for Secrets",children:"No single tool catches all secrets. The defense-in-depth strategy uses three layers: (1) pre-commit hooks that scan staged files before they are committed, (2) CI pipeline scans that scan the full PR diff including historical commits, (3) periodic repository-wide scans that catch secrets that slipped through. Each layer catches what the previous one might miss."}),e.jsx(t,{title:"Pre-commit Secrets Scanning with Gitleaks",tabs:[{label:"bash",language:"bash",filename:"secrets-setup.sh",code:`# Install Gitleaks
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
- Note: rotating credentials in git history requires git-filter-repo (different process)"`},{label:"yaml",language:"yaml",filename:".pre-commit-config.yaml",code:`repos:
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
        exclude: package-lock.json`}]}),e.jsx(t,{title:"Gitleaks Configuration with Custom Rules",tabs:[{label:"yaml",language:"yaml",filename:".gitleaks.toml",code:`title = "Gitleaks Configuration"

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
regex = '''(jwt[_-]?secret|JWT[_-]?SECRET)s*[=:]s*["']?[A-Za-z0-9+/]{20,}'''
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
]`}]}),e.jsx("h2",{children:"CI Pipeline Secret Scanning"}),e.jsx(t,{title:"GitHub Actions Secret Scanning",tabs:[{label:"yaml",language:"yaml",filename:".github/workflows/secrets-scan.yml",code:`name: Secrets Detection

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
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          GITLEAKS_LICENSE: \${{ secrets.GITLEAKS_LICENSE }}  # For organizations
        with:
          config-path: .gitleaks.toml

      - name: TruffleHog — verify no secrets in history
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: \${{ github.event.repository.default_branch }}
          head: HEAD
          extra_args: --debug --only-verified

      - name: Upload secrets report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: secrets-scan-report
          path: results.sarif`}]}),e.jsx("h2",{children:"Vault Integration for Secrets Management"}),e.jsx(t,{title:"Replacing Hardcoded Secrets with Vault",tabs:[{label:"bash",language:"bash",filename:"vault-integration.sh",code:`# Ask Claude to migrate hardcoded secrets to Vault/AWS Secrets Manager
claude "Audit our codebase for secrets that should be in AWS Secrets Manager.

Find patterns that look like hardcoded secrets (not environment variable references):
grep -rn 'api_key|apiKey|API_KEY|secret|password|token' src/ --include='*.ts'   | grep -v 'process.env' | grep -v '// ' | grep -v 'getSecret' | grep -v 'secretName'

For each finding that is a hardcoded credential:
1. Identify the service it belongs to
2. Generate the AWS CLI command to store it in Secrets Manager:
   aws secretsmanager create-secret      --name '/myapp/production/service-name/credential-name'      --secret-string 'ROTATE_THIS_FIRST'      --region eu-west-1

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
- Run: gitleaks detect to verify no secrets remain in code"`}]}),e.jsx(r,{title:"Rotating Credentials After Exposure Is Not Optional",children:"If Gitleaks or TruffleHog finds a real secret — even in a private repository, even if the commit was made 5 minutes ago — that credential must be rotated immediately. The sequence is: (1) rotate the credential in the issuing service NOW, (2) then remove it from the code, (3) then clean git history. Do not reverse this order. Cleaning git history before rotating means the credential is still valid while you work on the cleanup. And git history rewriting takes time — during that time, anyone who already cloned the repository has the old history with the secret."}),e.jsxs(a,{title:"Secrets Baseline for Existing Repositories",children:["When introducing detect-secrets to an existing repository for the first time, there may be existing false positives that should be acknowledged. Run",e.jsx("code",{children:"detect-secrets scan > .secrets.baseline"}),' to create a baseline of known (reviewed) "secrets" that are actually false positives. Commit the baseline. From that point forward, detect-secrets will only alert on new findings not in the baseline. Review the baseline carefully before committing — anything in the baseline is being suppressed, so it needs human review to confirm it is truly a false positive.']}),e.jsx(n,{type:"tip",title:"GitHub Secret Scanning for Public Repositories",children:"GitHub's built-in secret scanning automatically detects common credential patterns (AWS keys, Stripe keys, GitHub tokens, etc.) in public repositories and notifies both the repository owner and the credential issuer. For private repositories, enable this feature in Settings > Security > Secret Scanning. GitHub partners with service providers who will automatically revoke credentials when found. This is a useful backstop, but it is not a replacement for pre-commit scanning — GitHub secret scanning runs after the push, when the damage is already done."})]})}const Me=Object.freeze(Object.defineProperty({__proto__:null,default:Y},Symbol.toStringTag,{value:"Module"}));function Q(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Code-First API Documentation"}),e.jsx("p",{children:"API documentation has a half-life. The moment a developer writes a description of an endpoint, that description begins drifting from reality as the implementation evolves. By six months post-launch, most hand-maintained API documentation is inaccurate in at least one significant way — wrong field names, outdated error codes, missing required parameters, documented behavior that was changed but not updated. Consumers of the API trust the docs, build against them, and discover the truth through broken integrations."}),e.jsx("p",{children:"Code-first API documentation inverts this relationship: the code is the source of truth, and documentation is generated from the code. When the implementation changes, running the documentation generation produces an accurate spec. Claude accelerates both the initial generation and the ongoing maintenance, treating API documentation as a deliverable that is produced as part of the development workflow."}),e.jsx(s,{title:"OpenAPI as Living Spec",children:"OpenAPI 3.x is the lingua franca of REST API documentation. When generated from code (rather than written by hand), an OpenAPI spec accurately reflects the actual API behavior. It powers API clients, mock servers, validation middleware, and documentation portals. Keeping it generated — not hand-maintained — is the only reliable way to keep it accurate."}),e.jsx(t,{title:"Generating OpenAPI Spec from TypeScript",tabs:[{label:"bash",language:"bash",filename:"generate-openapi.sh",code:`# Generate OpenAPI spec from FastAPI (Python)
# FastAPI generates OpenAPI automatically — access at /openapi.json
curl http://localhost:8000/openapi.json | python3 -m json.tool > docs/api/openapi.json

# Generate OpenAPI from Express/TypeScript using tsoa
npm install tsoa
npx tsoa spec  # generates docs/swagger.json from TypeScript decorators

# Generate OpenAPI from NestJS
# NestJS Swagger module generates spec automatically
# Access at: http://localhost:3000/api-json

# Ask Claude to generate missing JSDoc/decorators for OpenAPI generation
claude "Our OpenAPI spec is missing documentation for several endpoints.

Run: npx tsoa spec 2>&1 | grep 'WARNING|missing'

For each endpoint missing documentation:
1. Read the controller method signature and implementation
2. Add JSDoc comments with:
   - @summary - one-line description
   - @description - detailed description including business rules
   - @param - each path/query parameter with type and description
   - @returns - success response with example
   - @throws - documented error responses (400, 401, 403, 404, 500)
3. Add @example for request body schemas

After adding documentation:
- Run: npx tsoa spec
- Verify: no more WARNING messages
- Check: docs/swagger.json has been updated with new documentation"`},{label:"typescript",language:"typescript",filename:"src/api/controllers/OrderController.ts (with docs)",code:`import { Controller, Get, Post, Body, Path, Route, Tags, Security, Response, Example } from 'tsoa'
import { OrderService } from '../services/OrderService'
import { CreateOrderRequest, Order, OrderError } from '../models'

@Route('orders')
@Tags('Orders')
@Security('bearerAuth')
export class OrderController extends Controller {
  constructor(private orderService: OrderService) {
    super()
  }

  /**
   * Create a new order for the authenticated user.
   *
   * Orders are created in PENDING status and transition to PROCESSING
   * once payment is confirmed. The order ID is returned immediately;
   * use GET /orders/:id to poll for status changes.
   *
   * @summary Create order
   * @param requestBody Order creation payload
   * @returns Created order with ID and PENDING status
   */
  @Post()
  @Response<OrderError>(400, 'Invalid order data', {
    code: 'VALIDATION_ERROR',
    message: 'items must contain at least one item',
  })
  @Response<OrderError>(422, 'Stock unavailable', {
    code: 'INSUFFICIENT_STOCK',
    message: 'Product SKU-123 has 0 units available',
  })
  @Example<Order>({
    id: 'ord_01J5K9P2Q3R4S5T6U7V8W9X0Y1',
    status: 'PENDING',
    items: [{ sku: 'SKU-123', quantity: 2, unitPrice: 29.99 }],
    total: { amount: 59.98, currency: 'USD' },
    createdAt: '2024-01-15T10:30:00Z',
  })
  public async createOrder(@Body() requestBody: CreateOrderRequest): Promise<Order> {
    return this.orderService.create(requestBody)
  }
}`}]}),e.jsx("h2",{children:"API Changelog Generation"}),e.jsx("p",{children:"API consumers need to know when the API changes. A machine-generated changelog, produced by diffing OpenAPI specs between versions, provides accurate, complete change documentation without requiring developers to maintain it manually."}),e.jsx(t,{title:"Automated API Changelog",tabs:[{label:"bash",language:"bash",filename:"generate-api-changelog.sh",code:`# Install openapi-diff
npm install -g openapi-diff

# Compare API versions
openapi-diff docs/api/openapi-v1.json docs/api/openapi-v2.json   --json > /tmp/api-diff.json

# Ask Claude to generate human-readable changelog from the diff
claude "Generate a human-readable API changelog from the openapi-diff output.

API diff: /tmp/api-diff.json
Previous version: v1.2.0
New version: v1.3.0

Categorize changes as:
- BREAKING: removed endpoints, renamed fields, changed required status, type changes
- FEATURE: new endpoints, new optional fields
- DEPRECATED: endpoints or fields marked as deprecated
- FIX: corrected documentation, added missing descriptions

Format as markdown suitable for docs/api/CHANGELOG.md:

## [1.3.0] - 2024-01-15

### Breaking Changes
- Removed: DELETE /users/:id (use DELETE /users/:id/deactivate instead)
- Changed: POST /orders now requires 'currency' field (was optional, defaulted to USD)

### New Features  
- Added: GET /orders/:id/tracking — order tracking status and carrier information
- Added: optional 'notes' field on POST /orders

### Deprecations
- Deprecated: GET /users (use GET /users/search with empty query instead — removed in v2.0.0)

Append to docs/api/CHANGELOG.md and commit with: git commit -m 'docs(api): changelog for v1.3.0'"`}]}),e.jsx("h2",{children:"Docs Portal Publishing"}),e.jsx(t,{title:"Publishing to Docs Portal",tabs:[{label:"yaml",language:"yaml",filename:".github/workflows/publish-docs.yml",code:`name: Publish API Documentation

on:
  push:
    branches: [main]
    paths:
      - 'src/api/**'
      - 'docs/api/**'

jobs:
  generate-and-publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Generate OpenAPI spec
        run: |
          npm ci
          npx tsoa spec
          # Validate the generated spec
          npx @redocly/cli lint docs/swagger.json

      - name: Generate API changelog
        run: |
          # Compare with previous version
          git show HEAD~1:docs/swagger.json > /tmp/previous-spec.json || true
          if [ -f /tmp/previous-spec.json ]; then
            npx openapi-diff /tmp/previous-spec.json docs/swagger.json --json > /tmp/diff.json
            node scripts/generate-changelog.js  # Uses Claude SDK to format changelog
          fi

      - name: Publish to Redoc portal
        run: |
          npx @redocly/cli build-docs docs/swagger.json             --output docs/portal/index.html             --title "MyApp API Documentation"

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: docs/portal
          destination_dir: api-docs`}]}),e.jsx(r,{title:"Generated Docs Still Need Human Review",children:`Code-generated documentation is accurate to the code, but accurate code is not always clear documentation. Claude-generated descriptions may be technically correct but confusing to API consumers who lack context about your domain. Review generated documentation for clarity, not just correctness. Pay particular attention to error responses — "returns 422 when validation fails" is less useful than "returns 422 when the order total exceeds the user's credit limit, including a balance field in the error response."`}),e.jsx(a,{title:"Schema-First for New APIs",children:'For new APIs, write the OpenAPI schema first, then implement to match it. Ask Claude: "Generate an OpenAPI 3.0 schema for a product catalog API with endpoints for listing, searching, and managing products. Include example requests and responses." Review and approve the schema, then: "Implement the Express routes and controllers that exactly satisfy this OpenAPI schema. Use express-openapi-validator middleware to enforce request/response validation against the schema." This ensures documentation and implementation never diverge.'}),e.jsxs(n,{type:"tip",title:"Redocly CLI for Schema Validation",children:["Use ",e.jsx("code",{children:"npx @redocly/cli lint openapi.yaml"}),' in your CI pipeline to catch OpenAPI spec issues before they reach the documentation portal. Redocly validates not just spec syntax but semantic quality: unused schemas, inconsistent naming conventions, missing descriptions, and deprecated features. Ask Claude to fix any lint issues: "Run @redocly/cli lint and fix all reported issues in docs/openapi.yaml. Do not suppress warnings — fix the underlying documentation."']})]})}const We=Object.freeze(Object.defineProperty({__proto__:null,default:Q},Symbol.toStringTag,{value:"Module"}));function J(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Architecture Document Freshness"}),e.jsx("p",{children:"Architecture diagrams are the most-referenced and least-maintained form of engineering documentation. A C4 diagram drawn when the system was designed accurately describes the intended architecture. A year later, after dozens of microservices were added, three were decomposed, and two external integrations were swapped for alternatives, that diagram describes a system that no longer exists. Developers continue citing it because nothing replaced it, and so incorrect mental models propagate."}),e.jsx("p",{children:"The solution is diagrams-as-code: architecture diagrams generated from the actual codebase and dependency graph, updated automatically when the codebase changes. Claude can generate and maintain Mermaid diagrams and C4 models directly from code analysis, ensuring the documentation reflects what was actually built."}),e.jsx(s,{title:"Diagrams-as-Code",children:"Mermaid is a markdown-like syntax for diagrams that renders in GitHub, GitLab, Notion, and most modern documentation platforms. C4 is a hierarchical model for software architecture covering Context, Containers, Components, and Code. When architecture diagrams are stored as text in the repository, they can be version-controlled, reviewed in PRs, and generated by Claude from code analysis rather than manually drawn."}),e.jsx(t,{title:"Generating Architecture Diagrams from Code",tabs:[{label:"bash",language:"bash",filename:"generate-architecture-docs.sh",code:`# Generate a Mermaid system context diagram from the codebase
claude "Analyze our codebase and generate architecture documentation.

Step 1: Analyze the system
- Read src/config/external-services.ts for external service integrations
- Read src/infrastructure/ for infrastructure adapters (database, cache, queue)
- Read package.json for major dependencies
- Read docker-compose.yml for local service topology

Step 2: Generate a C4 System Context Diagram (Mermaid)
Format:
mermaid
C4Context
  title System Context Diagram — MyApp

  Person(user, 'Customer', 'Uses the web application')
  Person(admin, 'Admin', 'Manages platform settings')

  System(myapp, 'MyApp', 'E-commerce platform')

  System_Ext(stripe, 'Stripe', 'Payment processing')
  System_Ext(sendgrid, 'SendGrid', 'Transactional email')
  System_Ext(auth0, 'Auth0', 'Identity and authentication')

  Rel(user, myapp, 'Shops, places orders')
  Rel(admin, myapp, 'Manages products, orders')
  Rel(myapp, stripe, 'Processes payments', 'HTTPS/REST')
  Rel(myapp, sendgrid, 'Sends emails', 'HTTPS/REST')
  Rel(myapp, auth0, 'Authenticates users', 'OAuth 2.0/OIDC')


Step 3: Generate a Container Diagram showing internal services
Step 4: Write to docs/architecture/README.md
Step 5: Note the generation date and commit hash in the diagram header"`},{label:"yaml",language:"yaml",filename:"CLAUDE.md (architecture docs)",code:`## Architecture Documentation Maintenance

### Diagrams
Location: docs/architecture/
Diagrams must be regenerated when:
- A new external service integration is added
- A new microservice or major module is created
- A service is deprecated or removed
- A significant architectural decision is implemented (see ADRs)

### Regeneration Command
Run: claude "Regenerate architecture diagrams in docs/architecture/ based on the
current codebase. Compare to the existing diagrams and list what changed."

### C4 Diagram Levels
- Level 1 (Context): docs/architecture/c4-context.md — external actors and systems
- Level 2 (Container): docs/architecture/c4-containers.md — deployable units
- Level 3 (Component): docs/architecture/c4-components-{service}.md — per service

### Validation
Architecture diagrams are reviewed by tech leads in architecture review meetings (bi-weekly)
Out-of-date diagrams flagged with: <!-- STALE: regenerate after {event} -->`}]}),e.jsx("h2",{children:"Automated Diagram Updates on Code Changes"}),e.jsx(t,{title:"CI-Triggered Architecture Doc Updates",tabs:[{label:"yaml",language:"yaml",filename:".github/workflows/update-architecture-docs.yml",code:`name: Update Architecture Documentation

on:
  push:
    branches: [main]
    paths:
      - 'src/infrastructure/**'
      - 'src/config/external-services.ts'
      - 'docker-compose.yml'
      - 'package.json'

jobs:
  update-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: \${{ secrets.GITHUB_TOKEN }}

      - name: Generate dependency graph
        run: |
          npm ci
          npx depcruise src/ --output-type dot > /tmp/dependency-graph.dot
          dot -Tsvg /tmp/dependency-graph.dot > docs/architecture/dependency-graph.svg

      - name: Validate Mermaid diagrams
        run: |
          # Check that all .mermaid files in docs/ are valid syntax
          find docs/ -name "*.mermaid" -exec npx @mermaid-js/mermaid-cli -i {} -o /tmp/mermaid-check.svg ;

      - name: Commit updated diagrams
        run: |
          git config user.name "Architecture Bot"
          git config user.email "bot@example.com"
          git add docs/architecture/dependency-graph.svg
          git diff --staged --quiet || git commit -m "docs(arch): auto-update dependency graph [skip ci]"
          git push`}]}),e.jsx("h2",{children:"C4 Model Maintenance Workflow"}),e.jsx(t,{title:"Keeping C4 Models Current",tabs:[{label:"bash",language:"bash",filename:"refresh-c4-models.sh",code:`# Monthly architecture doc refresh — run after significant changes
claude "Perform an architecture documentation audit.

Step 1: Read the current C4 diagrams in docs/architecture/

Step 2: Compare to reality by analyzing:
- All HTTP clients in src/ (external service integrations): 
  grep -r 'axios|fetch|http.get' src/ --include='*.ts' -l
- All database models: ls src/domain/models/
- All message queue subscriptions: grep -r 'queue|subscribe|consumer' src/ -l
- All environment variables: cat .env.example

Step 3: For each discrepancy found (in code but not in diagram, or in diagram but not in code):
- List the discrepancy
- Generate the corrected diagram section

Step 4: Update the diagrams with corrections and add:
<!-- Last verified: $(date -I) by architecture audit -->
<!-- Commit: $(git rev-parse --short HEAD) -->

Step 5: List any new services or integrations that should be added to the
docs/architecture/decisions/ ADR log."`}]}),e.jsxs(a,{title:"Stale Diagram Markers",children:["When you know a diagram is about to become stale — a new integration is being planned, a service is being deprecated — add a marker comment to the diagram before the work begins: ",e.jsxs("code",{children:["<!-- PLANNED CHANGE: add ",service," integration after ",ticket," merges -->"]}),'. This alerts readers that the diagram will be updated, and it gives Claude a clear signal when the work completes: "Remove all PLANNED CHANGE markers from architecture docs and regenerate the affected diagrams to reflect the completed change." This pattern prevents the diagram from being treated as current when it is deliberately temporary.']}),e.jsx(n,{type:"tip",title:"Structurizr for Complex Enterprise Architecture",children:"For organizations with dozens of services and complex architecture, Structurizr provides a code-first architecture description language (Structurizr DSL) that generates multiple diagram levels from a single model definition. Claude can generate and maintain Structurizr DSL files from code analysis. The DSL is stored in the repository, rendered on commit, and can be exported to multiple formats including Mermaid, PlantUML, and the Structurizr web viewer. This scales better than maintaining individual Mermaid diagrams for large systems."})]})}const He=Object.freeze(Object.defineProperty({__proto__:null,default:J},Symbol.toStringTag,{value:"Module"}));function X(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Runbook Generation"}),e.jsx("p",{children:"A runbook is an operational procedure document: what to do when the payment service is degraded, how to restart the worker queue without data loss, what the step-by-step process is for rolling back a bad deployment. Runbooks are among the most valuable documentation an engineering team can have — and among the least likely to be written, because they are created during or after incidents when nobody wants to write documentation."}),e.jsx("p",{children:"Claude can generate runbooks from the codebase, infrastructure configuration, and incident history, producing accurate operational procedures that an on-call engineer can follow at 2am without knowing the system intimately. The key is to generate runbooks when the system is healthy, not when it is broken."}),e.jsx(s,{title:"Runbooks as Code",children:"Runbooks stored in the repository alongside the code they describe stay in sync through the same pull request process as code changes. When a service gets a new dependency, the PR includes a runbook update. When a deployment procedure changes, the runbook is updated in the same commit. Claude can both generate initial runbooks and update them when infrastructure changes are made."}),e.jsx(t,{title:"Generating Service Runbooks from Infrastructure Code",tabs:[{label:"bash",language:"bash",filename:"generate-runbook.sh",code:`# Generate a comprehensive runbook for the payment service
claude "Generate a production runbook for the payment-service.

Analyze these sources to understand the service:
1. src/services/payment/ — service implementation
2. infra/terraform/modules/payment-service/ — infrastructure definition
3. .github/workflows/deploy-payment.yml — deployment pipeline
4. src/config/payment.config.ts — configuration and dependencies
5. Recent incident reports in docs/incidents/ (if any)

Generate: docs/runbooks/payment-service.md

Runbook sections required:

## Service Overview
- What the service does (1 paragraph)
- Dependencies: upstream (what calls this service) and downstream (what this service calls)
- SLO: 99.9% availability, p99 latency < 500ms, error rate < 0.1%

## Startup and Shutdown
- Normal startup procedure (steps with exact commands)
- Graceful shutdown procedure (drain in-flight requests before stopping)
- Expected startup time and how to verify health

## Health Checks
- Health endpoint: GET /health (expected response)
- Readiness endpoint: GET /ready (expected response)
- Key metrics to check: (from Datadog/CloudWatch)

## Common Failure Modes
For each dependency failure:
- Database unavailable: symptoms, detection, mitigation
- Stripe API degraded: symptoms, detection, mitigation (circuit breaker behavior)
- Redis cache unavailable: symptoms, detection, mitigation (graceful degradation)

## Deployment
- Deploy command: (from CI/CD pipeline)
- Rollback command: (immediate rollback procedure)
- Smoke test after deployment: (commands to run)
- Known risky migrations: (flag any database migrations)

## Escalation
- On-call: #payments-oncall Slack channel
- Escalation path: on-call engineer → payments team lead → VP Engineering"`}]}),e.jsx(t,{title:"Failure Mode Runbook from Error Handling Code",tabs:[{label:"bash",language:"bash",filename:"generate-failure-runbook.sh",code:`# Generate failure mode documentation from error handling code
claude "Generate failure mode documentation from the error handling patterns in our codebase.

Find all error types and handling patterns:
grep -rn 'catch|throw new|ErrorType.' src/ --include='*.ts' | head -100

For each significant error type found:
1. What causes this error?
2. What is the user impact when it occurs?
3. How is it currently handled (retry? fallback? alert?)?
4. What should an on-call engineer do when they see it in logs?
5. Are there known root causes to investigate first?

Format as a failure mode catalog in docs/runbooks/failure-modes.md:

## PaymentAuthorizationError
**Cause**: Stripe declined the payment authorization
**User impact**: Checkout fails with 'payment declined' message
**Current handling**: Non-retryable — fails immediately with user-facing error
**On-call action**: Check Stripe dashboard for service degradation. If Stripe status.stripe.com
shows degradation, this is expected. If no Stripe degradation, investigate specific decline
reason in audit logs: SELECT * FROM payment_audit WHERE error_code = 'authorization_failed' 
AND created_at > NOW() - INTERVAL '1 hour'

## DatabaseConnectionPoolExhausted
**Cause**: All database connection pool slots are in use (pool size: 20)
**User impact**: All requests fail with 503 until connections free up
**Current handling**: Request queuing with 30-second timeout, then 503
**On-call action**: 
1. Check connection count: SELECT count(*) FROM pg_stat_activity WHERE state = 'active'
2. If > 18 connections: identify long-running queries: SELECT pid, duration, query FROM pg_stat_activity ORDER BY duration DESC LIMIT 10
3. Kill blocking queries if safe: SELECT pg_terminate_backend(pid) WHERE pid = ?"`}]}),e.jsx("h2",{children:"Keeping Runbooks Current"}),e.jsx(t,{title:"Runbook Staleness Detection",tabs:[{label:"yaml",language:"yaml",filename:".github/workflows/runbook-freshness.yml",code:`name: Check Runbook Freshness

on:
  push:
    branches: [main]
    paths:
      - 'src/services/**'
      - 'infra/terraform/**'
      - '.github/workflows/deploy-*.yml'

jobs:
  check-runbook-freshness:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Identify services changed without runbook updates
        run: |
          # Get changed service directories
          CHANGED_SERVICES=$(git diff --name-only HEAD~1 HEAD | grep '^src/services/' | cut -d/ -f3 | sort -u)
          
          # Check if corresponding runbooks were updated
          for service in $CHANGED_SERVICES; do
            RUNBOOK="docs/runbooks/\${service}.md"
            if [ -f "$RUNBOOK" ]; then
              RUNBOOK_LAST_CHANGED=$(git log -1 --format="%H" -- "$RUNBOOK")
              SERVICE_LAST_CHANGED=$(git log -1 --format="%H" -- "src/services/$service/")
              if [ "$RUNBOOK_LAST_CHANGED" != "$SERVICE_LAST_CHANGED" ]; then
                echo "WARNING: $RUNBOOK may be stale (service changed but runbook not updated)"
                echo "::warning file=$RUNBOOK::Runbook may need update after changes to src/services/$service/"
              fi
            else
              echo "MISSING: No runbook found for service: $service"
              echo "::warning::No runbook found at $RUNBOOK for service $service"
            fi
          done`}]}),e.jsx(r,{title:"Runbooks Must Be Tested, Not Just Written",children:'A runbook that has never been executed is documentation, not an operational procedure. Schedule game day exercises where engineers follow runbooks for non-critical scenarios (restarting a service in a test environment, running through the rollback procedure on staging). Find the gaps before 2am, not during an incident. Ask Claude: "Identify which steps in docs/runbooks/payment-service.md could be tested safely in our staging environment without affecting production."'}),e.jsx(a,{title:"Link Runbooks from Alerts",children:`Every monitoring alert that pages an on-call engineer should include a direct link to the relevant runbook. This is a configuration change in your alerting tool (Datadog, PagerDuty, Opsgenie), not a documentation change. Ask Claude: "Update our Terraform Datadog monitor definitions in infra/terraform/datadog-monitors.tf to add a 'runbook_url' field pointing to the relevant docs/runbooks/ page for each monitor." This ensures that when an engineer receives an alert, they have the operational context they need in a single click.`}),e.jsx(n,{type:"tip",title:"Post-Incident Runbook Updates",children:'After every incident, run a runbook review as part of the post-incident process. Ask Claude: "We had an incident where X happened. Our runbook at docs/runbooks/Y.md describes the procedure for this scenario. Based on what actually worked during the incident (notes in docs/incidents/YYYY-MM-DD-incident.md), identify gaps or incorrect steps in the runbook and update it." Incidents are the most valuable source of runbook improvement — capturing lessons immediately ensures they are not lost.'})]})}const ze=Object.freeze(Object.defineProperty({__proto__:null,default:X},Symbol.toStringTag,{value:"Module"}));function Z(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Knowledge Capture and Onboarding"}),e.jsx("p",{children:"Every engineering team accumulates tribal knowledge — understanding that lives only in the heads of people who were there. Why was this service extracted from the monolith instead of left in place? Why does the payment flow have three redundant retry mechanisms? Why is there a mysterious sleep(2000) in the checkout handler that nobody dares remove? This knowledge is invisible to new engineers, invisible to auditors, and vulnerable to departures. When the engineer who made those decisions leaves, the knowledge leaves with them."}),e.jsx("p",{children:"Claude Code can help capture this knowledge in two ways: by analyzing commit history and code comments to infer the reasoning behind decisions, and by providing a conversational interface for existing engineers to externalize their knowledge into structured documentation. The goal is a codebase that explains itself — one where a new engineer can understand not just what the code does but why it does it that way."}),e.jsx(s,{title:"Decision Archaeology",children:"Decision archaeology is the practice of using git history, commit messages, PR descriptions, and code comments to reconstruct the reasoning behind past decisions. Claude can perform this analysis at scale — reading thousands of commits and synthesizing the story of how a system evolved into its current state. This creates the foundation for onboarding documentation that captures not just the current architecture but the context that explains it."}),e.jsx(t,{title:"Codebase Orientation Guide Generation",tabs:[{label:"bash",language:"bash",filename:"generate-onboarding-docs.sh",code:`# Generate a codebase orientation guide for new engineers
claude "Generate a codebase orientation guide for new engineers joining the team.

Analyze:
1. Directory structure: ls -la src/
2. Package.json for tech stack and key dependencies
3. README.md (if exists)
4. CLAUDE.md for architectural decisions and conventions
5. docs/architecture/ for system design
6. git log --oneline -50 for recent significant changes

Generate: docs/ONBOARDING.md

Required sections:

## Quick Start (Day 1)
- How to run the application locally (exact commands)
- How to run tests (exact commands)
- How to access the development environment
- Who to ask when stuck (link to team channels)

## Architecture Overview
- What the system does (business context)
- High-level architecture (link to C4 diagram or inline Mermaid)
- Key services and their responsibilities
- Data flow for the most important user journey

## Codebase Structure
For each top-level src/ directory:
- What it contains
- When would I add something here vs elsewhere?
- Key conventions to know

## Development Conventions
- Branch naming: feature/ENG-XXX-description
- Commit format: conventional commits (feat:, fix:, docs:, etc.)
- PR requirements: tests, CLAUDE.md constraints, reviewer assignment
- How to use CLAUDE.md when writing code with Claude Code

## Common Development Tasks
- Adding a new API endpoint: step-by-step guide
- Adding a new database model: step-by-step guide
- Running and writing tests: guide with examples

## Where to Find Things
- API documentation: /docs/api/
- Architecture decisions: /docs/architecture/decisions/ (ADRs)
- Runbooks: /docs/runbooks/
- Incident history: /docs/incidents/"`}]}),e.jsx("h2",{children:"Tribal Knowledge Extraction"}),e.jsx(t,{title:"Extracting Tribal Knowledge from Commit History",tabs:[{label:"bash",language:"bash",filename:"extract-tribal-knowledge.sh",code:`# Extract tribal knowledge from git history for a specific file
claude "Perform decision archaeology on src/services/payment/PaymentProcessor.ts.

Analyze the full git history for this file:
git log --follow -p src/services/payment/PaymentProcessor.ts | head -500

Also analyze:
git log --follow --format='%H %s %b' src/services/payment/PaymentProcessor.ts

For each significant change:
1. What was the business reason for the change?
2. What problem was being solved?
3. What alternatives were considered (from PR description or commit message)?
4. Are there any 'do not remove' or 'important' comments that explain constraints?

Special attention to:
- Any sleep() or artificial delays: why do they exist? Is the reason still valid?
- Multiple retry mechanisms: what failure modes were they added to handle?
- Unusual error handling patterns: what incidents prompted them?
- Configuration flags and feature flags: are they still needed?

Generate: docs/architecture/decisions/ADR-PAYMENT-PROCESSOR-HISTORY.md
Format as a decision log showing the evolution of this service."`},{label:"bash",language:"bash",filename:"knowledge-interview.sh",code:`# Structured knowledge extraction from a departing engineer
claude "I am a departing senior engineer and I want to document my tribal knowledge
about the payment system before I leave. Ask me questions to extract this knowledge.

Start with:
1. What are the most important things a new engineer needs to know about the payment service?
2. What are the gotchas — things that will bite them if they don't know about them?
3. What decisions were made that seem weird but have good reasons?
4. What would you change if you had 6 more months on this project?

As I answer, help me structure the information into:
- docs/architecture/decisions/ (architectural reasoning)
- docs/runbooks/ (operational procedures)
- Inline code comments (specific code explanations)
- ONBOARDING.md updates (what new engineers need to know first)

Let's start with the most critical knowledge first."`}]}),e.jsx("h2",{children:"Automated Onboarding Validation"}),e.jsx(t,{title:"Testing Onboarding Documentation Accuracy",tabs:[{label:"bash",language:"bash",filename:"validate-onboarding.sh",code:`# Validate that onboarding docs are accurate by following them
claude "Act as a new engineer following the ONBOARDING.md documentation.

Read: docs/ONBOARDING.md

For each step in the Quick Start section:
1. Execute the exact command described
2. Report whether it succeeded or failed
3. If failed: what was the actual error? What needs to change in the docs?

For each command in 'Common Development Tasks':
1. Attempt to execute it
2. Verify the expected result matches reality

Report: a list of documentation issues found, with:
- The section that is incorrect
- What the documentation says
- What actually happens
- The corrected command or instruction

This identifies onboarding documentation rot before it frustrates a new team member."`}]}),e.jsx(r,{title:"Onboarding Docs Rot Silently",children:`Onboarding documentation becomes inaccurate the moment it is written, because the codebase continues to evolve. Schedule a documentation review every quarter where one team member (ideally someone who hasn't onboarded recently) follows the onboarding guide and reports anything that doesn't work. Alternatively, use each new hire as an opportunity to update the docs: "Keep a log of anything confusing or broken during your first week. We'll use your feedback to update ONBOARDING.md." New engineers are the most sensitive detectors of documentation gaps precisely because they don't have the tribal knowledge to fill them in.`}),e.jsx(a,{title:"Code Comments That Explain Why, Not What",children:'The most valuable code comments explain the reasoning behind non-obvious choices, not what the code does (which is visible from reading it). Ask Claude: "Review src/services/payment/PaymentProcessor.ts and add comments to any code that requires domain or historical context to understand. Specifically: explain the sleep(500) on line 47, the fallback retry mechanism in processWithFallback(), and the hardcoded maximum retry count. Do not add comments that simply restate what the code does." Explanatory comments with JIRA ticket references or ADR numbers create a paper trail that prevents future engineers from removing important constraints without understanding their purpose.'}),e.jsx(n,{type:"tip",title:"CLAUDE.md as Onboarding Document",children:`Your CLAUDE.md file is itself an onboarding document for AI-assisted development. A new engineer who reads the CLAUDE.md understands the project's architectural decisions, coding standards, security requirements, and workflow conventions before writing a single line of code. Invest in making it comprehensive and well-organized — it serves both Claude and human engineers. Ask new hires: "After reading our CLAUDE.md, what questions do you still have?" Their questions reveal gaps that should be filled before the next hire joins.`})]})}const Be=Object.freeze(Object.defineProperty({__proto__:null,default:Z},Symbol.toStringTag,{value:"Module"}));function ee(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Pipeline as Code"}),e.jsx("p",{children:"CI/CD pipelines are software. They have bugs, they need maintenance, they accumulate technical debt, and they benefit from the same engineering discipline as production code. Yet most organizations treat pipelines as an afterthought — copied from a Stack Overflow answer, patched over time, never refactored, and understood only by the one DevOps engineer who originally wrote them. When that engineer leaves, the pipeline becomes a black box that everyone is afraid to touch."}),e.jsx("p",{children:"Claude Code can generate, maintain, and improve CI/CD pipeline definitions with the same discipline it brings to application code. This means pipelines that have clear structure, documented steps, security best practices (least-privilege permissions, no secrets in YAML), efficient caching, and matrix builds that minimize CI time. It also means self-healing pipelines that can diagnose their own failures."}),e.jsx(s,{title:"The Ideal Pipeline Properties",children:"A well-engineered CI/CD pipeline is: (1) fast — under 10 minutes for full test suite via parallelization and caching, (2) reliable — failures are real failures, not intermittent flakiness, (3) secure — minimum permissions, no secrets in YAML, (4) transparent — failures link to actionable information, and (5) self-documenting — step names describe what they do and why."}),e.jsx(t,{title:"Generating a GitHub Actions Pipeline",tabs:[{label:"bash",language:"bash",filename:"generate-pipeline.sh",code:`# Generate a complete CI/CD pipeline
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

Generate: .github/workflows/ci.yml and .github/workflows/deploy.yml"`},{label:"yaml",language:"yaml",filename:".github/workflows/ci.yml (generated)",code:`name: CI

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
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`}]}),e.jsx("h2",{children:"Matrix Builds for Efficiency"}),e.jsx(t,{title:"Matrix Strategy for Parallel Testing",tabs:[{label:"yaml",language:"yaml",filename:".github/workflows/matrix-tests.yml",code:`name: Parallel Test Matrix

jobs:
  test:
    name: Tests (\${{ matrix.shard }}/\${{ matrix.total-shards }})
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

      - name: Run test shard \${{ matrix.shard }} of \${{ matrix.total-shards }}
        run: |
          npx jest             --shard=\${{ matrix.shard }}/\${{ matrix.total-shards }}             --coverage             --coverageDirectory=coverage-\${{ matrix.shard }}

      - name: Upload coverage shard
        uses: actions/upload-artifact@5d5d22a31266ced268874388b861e4b58bb5c2f3  # v4.3.1
        with:
          name: coverage-\${{ matrix.shard }}
          path: coverage-\${{ matrix.shard }}

  merge-coverage:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@c850b930e6ba138125429b7e5c93fc707a7f8427  # v4.1.4
        with:
          pattern: coverage-*
          merge-multiple: true

      - name: Merge coverage reports
        run: npx nyc merge coverage-* coverage/coverage-final.json`}]}),e.jsx("h2",{children:"Self-Healing Pipeline Diagnostics"}),e.jsx(t,{title:"Diagnosing Pipeline Failures with Claude",tabs:[{label:"bash",language:"bash",filename:"diagnose-pipeline.sh",code:`# Ask Claude to diagnose a CI failure
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
- Identify the root cause in the PR diff"`}]}),e.jsxs(r,{title:"Pin Action Versions to SHA Hashes",children:["GitHub Actions from the marketplace are not immutable when referenced by tag. The tag ",e.jsx("code",{children:"actions/checkout@v4"})," can be changed by the action author to point to different code. Referencing actions by their full commit SHA (",e.jsx("code",{children:"actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11"}),') ensures you always run the exact version you tested with. Ask Claude to pin all action references: "Update .github/workflows/*.yml to pin all action references to their full commit SHA instead of version tags. Use the GitHub API to resolve the current SHA for each tagged version."']}),e.jsx(a,{title:"OIDC Instead of Long-Lived AWS Credentials",children:`Never store long-lived AWS access keys as GitHub Secrets. Use GitHub's OIDC (OpenID Connect) integration with AWS to generate short-lived credentials for each pipeline run. Ask Claude: "Update our deploy pipeline to use AWS OIDC instead of AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY. Generate the Terraform for the IAM OIDC provider and the GitHub Actions role, and update the workflow to use the aws-actions/configure-aws-credentials action with role-to-assume." This eliminates the credential rotation burden and the risk of long-lived secret exposure.`}),e.jsx(n,{type:"tip",title:"Cache Aggressively for Speed",children:'The fastest way to improve CI time is aggressive caching. Cache: node_modules (keyed on package-lock.json hash), Playwright browser binaries, Docker layer cache, and TypeScript incremental build output. Ask Claude: "Analyze our current CI workflow and add caching for all cacheable artifacts. Use the GitHub Actions cache action with appropriate cache keys. Estimate the time savings for each cache added." A typical Node.js pipeline can go from 8 minutes to under 4 minutes with proper caching.'})]})}const Ve=Object.freeze(Object.defineProperty({__proto__:null,default:ee},Symbol.toStringTag,{value:"Module"}));function te(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Infrastructure as Code"}),e.jsx("p",{children:"Infrastructure as Code (IaC) applies software engineering discipline to the definition and management of infrastructure: servers, databases, networks, and cloud services are defined in code, version-controlled, reviewed in PRs, and deployed through automated pipelines. Claude accelerates IaC authoring significantly — a Terraform module that would take an engineer a day to write, test, and document can be generated in an hour, with security scanning and best practices applied automatically."}),e.jsx("p",{children:"The discipline Vibe Engineering brings to IaC is the same it brings to application code: IaC changes go through PR review, security scanning runs before apply, and CLAUDE.md includes IaC conventions and security requirements that constrain what Claude generates."}),e.jsx(s,{title:"IaC Security is Higher Stakes Than Application Security",children:"A security vulnerability in application code affects the application layer. A security vulnerability in infrastructure code — an S3 bucket that is publicly readable, a security group that opens port 22 to 0.0.0.0/0, an IAM policy with wildcard permissions — can expose the entire cloud environment. IaC changes must be reviewed more carefully than application changes and must pass automated security scanning (Checkov, tfsec) before applying."}),e.jsx(t,{title:"Generating Terraform with Security Scanning",tabs:[{label:"bash",language:"bash",filename:"generate-terraform.sh",code:`# Generate Terraform for a new application component
claude "Generate Terraform for a new API service deployment on AWS ECS Fargate.

Requirements:
- Service: payment-api (Node.js, port 3000)
- Container image: ECR repository (to be created)
- CPU: 256, Memory: 512 (can scale to 2048/4096 under load)
- Auto-scaling: min 2 tasks, max 20 tasks, scale on CPU > 70%
- Networking: private subnet, behind ALB (existing ALB target group attachment)
- Secrets: payment-api secrets from AWS Secrets Manager (STRIPE_SECRET_KEY, DB_PASSWORD)
- Logging: CloudWatch Logs, 30-day retention
- IAM: minimum permissions (only the specific Secrets Manager ARNs it needs)

Security requirements (from CLAUDE.md):
- No public IP on ECS tasks
- IAM role must follow least-privilege (no wildcard actions or resources)
- CloudWatch log group must have encryption enabled
- ECR repository must have image scanning enabled
- All tags must include: Environment, Service, ManagedBy=terraform, Team

After generating:
1. Run: checkov -d infra/terraform/modules/payment-api/ --output cli
2. Fix any HIGH or CRITICAL findings
3. Run: tfsec infra/terraform/modules/payment-api/
4. Fix any HIGH findings

Place in: infra/terraform/modules/payment-api/"`},{label:"hcl",language:"hcl",filename:"infra/terraform/modules/payment-api/main.tf (generated)",code:`# ECS Fargate Service for payment-api
# Generated by Claude Code — reviewed by DevOps team
# Checkov: PASSED | tfsec: PASSED

locals {
  service_name = "payment-api"
  tags = {
    Environment = var.environment
    Service     = local.service_name
    ManagedBy   = "terraform"
    Team        = "payments"
  }
}

resource "aws_ecs_task_definition" "payment_api" {
  family                   = "\${var.environment}-\${local.service_name}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name  = local.service_name
    image = "\${aws_ecr_repository.payment_api.repository_url}:\${var.image_tag}"
    portMappings = [{
      containerPort = 3000
      protocol      = "tcp"
    }]
    secrets = [
      {
        name      = "STRIPE_SECRET_KEY"
        valueFrom = data.aws_secretsmanager_secret.stripe.arn
      },
      {
        name      = "DB_PASSWORD"
        valueFrom = data.aws_secretsmanager_secret.db_password.arn
      }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.payment_api.name
        "awslogs-region"        = data.aws_region.current.name
        "awslogs-stream-prefix" = local.service_name
      }
    }
    readonlyRootFilesystem = true  # CKV_DOCKER_3
    user                   = "1000"  # Non-root user
  }])

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "payment_api" {
  name              = "/ecs/\${var.environment}/\${local.service_name}"
  retention_in_days = 30
  kms_key_id        = aws_kms_key.logs.arn  # CKV_AWS_158
  tags              = local.tags
}

resource "aws_ecr_repository" "payment_api" {
  name                 = "\${var.environment}/\${local.service_name}"
  image_tag_mutability = "IMMUTABLE"  # CKV_AWS_51

  image_scanning_configuration {
    scan_on_push = true  # CKV_AWS_163
  }

  encryption_configuration {
    encryption_type = "KMS"
    kms_key         = aws_kms_key.ecr.arn
  }

  tags = local.tags
}`}]}),e.jsx(t,{title:"Checkov IaC Security Scanning",tabs:[{label:"bash",language:"bash",filename:"checkov-scan.sh",code:`# Scan Terraform with Checkov before applying
pip install checkov

# Scan a specific module
checkov -d infra/terraform/modules/   --framework terraform   --output cli   --output sarif   --output-file-path /tmp/checkov-results

# Fail CI on HIGH/CRITICAL findings
checkov -d infra/terraform/   --check HIGH,CRITICAL   --compact   --quiet

# Ask Claude to fix Checkov findings
claude "Checkov found security issues in our Terraform.

Checkov output:
$(checkov -d infra/terraform/modules/payment-api/ --output cli 2>/dev/null | grep -A5 'FAILED')

For each FAILED check:
1. Understand what the check is verifying (read the check ID description)
2. Implement the fix in the Terraform code
3. Re-run checkov to verify the fix
4. Add a comment in the code explaining what the fix does

Do NOT add a skip annotation (# checkov:skip) unless the finding is a genuine false positive.
If you believe a finding is a false positive, explain why and I will decide whether to skip.

Target: 0 HIGH/CRITICAL findings"`}]}),e.jsx("h2",{children:"Terraform Module Reuse Pattern"}),e.jsx(t,{title:"Generating Reusable Terraform Modules",tabs:[{label:"bash",language:"bash",filename:"generate-module.sh",code:`# Generate a reusable Terraform module
claude "Generate a reusable Terraform module for AWS ECS Fargate services.

This module should be reusable across all our microservices (payment-api,
user-service, notification-service, etc.).

Module inputs (variables):
- service_name: string
- environment: string (dev/staging/production)
- image_uri: string (ECR image URI with tag)
- cpu/memory: number (with sensible defaults: 256/512)
- port: number (container port)
- desired_count: number (default 2)
- min_capacity / max_capacity: number (for auto-scaling)
- secrets: map(string) — map of env var name to Secrets Manager ARN
- vpc_id, private_subnet_ids: from data sources
- alb_target_group_arn: string

Module outputs:
- service_arn
- task_definition_arn  
- ecs_task_role_arn (for granting additional permissions)
- cloudwatch_log_group_name

Constraints:
- All Checkov HIGH/CRITICAL checks must pass
- Must use aws_iam_role_policy with explicit statements (no wildcard *)
- Must include auto-scaling policy (CPU-based)
- Must include tags variable merged with required tags

Place in: infra/terraform/modules/ecs-fargate-service/
Include: main.tf, variables.tf, outputs.tf, README.md"`}]}),e.jsxs(r,{title:"Terraform Plan Before Apply — Always",children:["Never allow ",e.jsx("code",{children:"terraform apply"})," to run without a preceding",e.jsx("code",{children:"terraform plan"}),' review. In CI/CD, the plan output should be posted as a PR comment (using tools like Atlantis or terraform-pr-commenter), reviewed by a human before apply runs. Destroying and recreating a production database because a Terraform resource was recreated instead of updated is a career-limiting event. Claude can help you understand plan output: "Read the terraform plan output at /tmp/plan.txt and explain: what will be destroyed, what will be created, what will be updated in-place? Flag any destructive operations."']}),e.jsx(a,{title:"State Backend and Locking",children:'Always use a remote state backend with locking (AWS S3 + DynamoDB, Terraform Cloud, or similar). Local state is the fastest path to state file conflicts, accidental deletions, and lost state. Ask Claude to generate the backend configuration when creating new Terraform workspaces: "Generate the Terraform backend configuration for S3 state storage with DynamoDB locking. Include the S3 bucket (with versioning and encryption), DynamoDB table, and IAM policies for CI/CD access."'}),e.jsx(n,{type:"tip",title:"Pulumi for TypeScript-Native IaC",children:'If your team is more comfortable with TypeScript than HCL, Pulumi provides Infrastructure as Code using real programming languages. Ask Claude to generate Pulumi programs rather than Terraform when your team prefers TypeScript: "Generate a Pulumi TypeScript program that creates the same infrastructure as our Terraform module in infra/terraform/modules/ecs-fargate-service/. Use the @pulumi/aws SDK. Apply the same security requirements from CLAUDE.md." Pulumi programs can be tested with standard TypeScript testing tools and have native support for loops, conditions, and abstractions.'})]})}const $e=Object.freeze(Object.defineProperty({__proto__:null,default:te},Symbol.toStringTag,{value:"Module"}));function ie(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Container and Kubernetes Generation"}),e.jsx("p",{children:"Containerization and Kubernetes manifest authoring are areas where Claude provides particularly high leverage: the patterns are well-established, the security best practices are documented, and the boilerplate is extensive. A production-grade Dockerfile with multi-stage builds, non-root user, minimal attack surface, and health checks takes an experienced engineer 30-60 minutes. Claude generates it in minutes and can scan it with Hadolint and Trivy before you review."}),e.jsx("p",{children:"The discipline is in the review and the constraints. A Docker image that runs as root, contains a full development toolchain in the production image, or leaks secrets in build args will pass CI if you don't have a scanner in the loop. Vibe Engineering puts container scanning in the pre-commit and CI gates."}),e.jsxs(s,{title:"Production Dockerfile Requirements",children:["A production-ready Dockerfile must: use a specific base image version (not",e.jsx("code",{children:":latest"}),"), use multi-stage builds to minimize image size, run as a non-root user (UID > 1000), set a read-only root filesystem where possible, not include development tools (npm, pip, gcc) in the production stage, not copy .env files or secrets into the image, and include a proper HEALTHCHECK instruction."]}),e.jsx(t,{title:"Production Dockerfile Generation",tabs:[{label:"bash",language:"bash",filename:"generate-dockerfile.sh",code:`# Generate a production Dockerfile
claude "Generate a production-ready Dockerfile for our Node.js TypeScript API.

Application: Express.js API
- Build: npm run build (TypeScript → dist/)
- Runtime: node dist/server.js
- Port: 3000
- Requires: Node.js 20
- Runtime dependencies: node_modules (production only)
- Health check endpoint: GET /health (returns 200)

Security requirements:
- Multi-stage build (build stage + production stage)
- Production stage must be based on node:20-alpine (minimal attack surface)
- Non-root user: create user 'appuser' with UID 1001
- No development dependencies in production image
- No .env files copied into image
- Read-only filesystem: app writes to /tmp only (use tmpfs in K8s)
- HEALTHCHECK using curl or wget

After generating:
1. Run: hadolint Dockerfile (must pass with 0 errors)
2. Build: docker build -t payment-api:test .
3. Run: trivy image payment-api:test --exit-code 1 --severity HIGH,CRITICAL
4. Fix any findings from trivy (update base image or patch packages)
5. Run: docker run --user 1001 --read-only payment-api:test — verify starts successfully"`},{label:"docker",language:"dockerfile",filename:"Dockerfile (generated)",code:`# Build stage
FROM node:20-alpine3.19 AS builder

WORKDIR /app

# Install dependencies (including dev deps for build)
COPY package*.json ./
RUN npm ci --include=dev

# Copy source and build
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Prune to production dependencies only
RUN npm prune --production

# Production stage — minimal image
FROM node:20-alpine3.19 AS production

# Security: create non-root user
RUN addgroup -g 1001 -S appgroup &&     adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copy only what's needed for production
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./

# Set non-root user
USER appuser

# Application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3   CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start application
CMD ["node", "dist/server.js"]`}]}),e.jsx("h2",{children:"Kubernetes Manifest Generation"}),e.jsx(t,{title:"Generating K8s Manifests",tabs:[{label:"bash",language:"bash",filename:"generate-k8s.sh",code:`# Generate Kubernetes manifests for a service
claude "Generate production Kubernetes manifests for the payment-api service.

Service requirements:
- Image: 123456789.dkr.ecr.eu-west-1.amazonaws.com/payment-api:latest
  (will be overridden by Kustomize per environment)
- Replicas: 2 minimum (HPA will manage up to 20)
- CPU request: 100m, limit: 500m
- Memory request: 128Mi, limit: 512Mi
- Port: 3000
- Health checks: /health (liveness), /ready (readiness)
- Secrets: pulled from external-secrets operator (AWS Secrets Manager)
- Namespace: payment

Security requirements (all security contexts must be set):
- runAsNonRoot: true
- runAsUser: 1001
- readOnlyRootFilesystem: true
- allowPrivilegeEscalation: false
- capabilities: drop ALL
- Pod security standard: restricted

Workload requirements:
- PodDisruptionBudget: minAvailable 1
- HorizontalPodAutoscaler: CPU target 70%, min 2, max 20
- topologySpreadConstraints: spread across zones
- No hostNetwork, no hostPID
- ServiceAccount with no cluster-level permissions

After generating:
1. Run: kubectl apply --dry-run=client -f k8s/payment-api/
2. Run: kubesec scan k8s/payment-api/deployment.yaml
3. Run: kube-score score k8s/payment-api/
4. Fix any HIGH findings

Generate to: k8s/payment-api/ (deployment.yaml, service.yaml, hpa.yaml, pdb.yaml, externalsecret.yaml)"`},{label:"yaml",language:"yaml",filename:"k8s/payment-api/deployment.yaml (generated)",code:`apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-api
  namespace: payment
  labels:
    app: payment-api
    version: "1.0"
spec:
  replicas: 2
  selector:
    matchLabels:
      app: payment-api
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0  # Zero-downtime deployments
  template:
    metadata:
      labels:
        app: payment-api
    spec:
      serviceAccountName: payment-api
      automountServiceAccountToken: false
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        runAsGroup: 1001
        fsGroup: 1001
        seccompProfile:
          type: RuntimeDefault
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: DoNotSchedule
          labelSelector:
            matchLabels:
              app: payment-api
      containers:
        - name: payment-api
          image: 123456789.dkr.ecr.eu-west-1.amazonaws.com/payment-api:latest
          ports:
            - containerPort: 3000
              protocol: TCP
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: [ALL]
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          volumeMounts:
            - name: tmp
              mountPath: /tmp  # Required for read-only root filesystem
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5
          envFrom:
            - secretRef:
                name: payment-api-secrets  # From ExternalSecret
      volumes:
        - name: tmp
          emptyDir: {}`}]}),e.jsx("h2",{children:"Helm Chart Generation"}),e.jsx(t,{title:"Converting Manifests to Helm Charts",tabs:[{label:"bash",language:"bash",filename:"generate-helm.sh",code:`# Convert K8s manifests to a Helm chart
claude "Convert the Kubernetes manifests in k8s/payment-api/ into a Helm chart.

The chart should:
1. Parameterize all environment-specific values in values.yaml:
   - image.repository, image.tag
   - replicaCount
   - resources.requests/limits (with production defaults)
   - autoscaling.enabled, minReplicas, maxReplicas, targetCPUUtilizationPercentage
   - environment (dev/staging/production)
   
2. Include separate values files per environment:
   - values.yaml (base defaults)
   - values-staging.yaml (staging overrides)  
   - values-production.yaml (production overrides with higher limits)

3. Hardcode security context values (these must never change):
   - runAsNonRoot: true
   - readOnlyRootFilesystem: true
   - capabilities.drop: [ALL]
   # These are security requirements, not configuration

4. Include chart tests (helm test):
   - Test that /health returns 200
   - Test that /ready returns 200

Create: helm/payment-api/
Validate: helm lint helm/payment-api/
Template: helm template payment-api helm/payment-api/ --values helm/payment-api/values-staging.yaml | kubectl apply --dry-run=client -f -"`}]}),e.jsxs(r,{title:"Never Set Latest as Image Tag in Production",children:["The ",e.jsx("code",{children:":latest"}),' tag in Kubernetes is not deterministic — it resolves to whatever was most recently pushed to the registry, which changes with every deployment to every environment. Production manifests must use a specific, immutable image tag (a git commit SHA or a semantic version). In CLAUDE.md: "Kubernetes production manifests must never use image tag :latest. Use the Git commit SHA as the image tag. CI/CD will inject the correct tag via Kustomize or Helm ',e.jsxs("code",{children:["--set image.tag=","{'${{ github.sha }}'}"]}),'."']}),e.jsxs(a,{title:"kube-score for Policy Enforcement",children:["kube-score analyzes Kubernetes manifests against a set of best practices and security policies, similar to Checkov for Terraform. Run it in CI on any PR that changes K8s manifests: ",e.jsx("code",{children:"kube-score score k8s/**/*.yaml"}),". Common findings it catches: missing resource limits (causing noisy-neighbor problems), missing pod disruption budgets (causing downtime during node drains), missing readiness probes (causing traffic to unhealthy pods), and missing security contexts. Ask Claude to fix any kube-score findings before manifests are reviewed."]}),e.jsxs(n,{type:"tip",title:"Trivy for Container Vulnerability Scanning",children:["Trivy scans Docker images for OS package vulnerabilities, language package vulnerabilities, and secret exposure. Integrate it into your CI pipeline:",e.jsx("code",{children:"trivy image --exit-code 1 --severity HIGH,CRITICAL your-image:tag"}),'. When Trivy reports HIGH or CRITICAL vulnerabilities, ask Claude to fix them: "Trivy found HIGH vulnerabilities in the base image node:20-alpine3.18. The fixed version is alpine3.19. Update the Dockerfile to use node:20-alpine3.19 and re-run Trivy to verify the vulnerabilities are resolved."']})]})}const Ke=Object.freeze(Object.defineProperty({__proto__:null,default:ie},Symbol.toStringTag,{value:"Module"}));function ae(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h1",{children:"Release Automation"}),e.jsx("p",{children:"A release is a decision and a set of operations: determine the new version number, generate the changelog, tag the commit, build the artifacts, deploy to production, and communicate what changed. Most organizations do some of these steps manually — a human decides the version, writes a changelog by reading commits, creates the git tag, and types the deployment command. This process is slow, error-prone, and inconsistent across releases."}),e.jsxs("p",{children:["Semantic release automates the entire pipeline by making version numbers a function of commit messages. Conventional commits (",e.jsx("code",{children:"feat:"}),", ",e.jsx("code",{children:"fix:"}),",",e.jsx("code",{children:"chore:"}),", ",e.jsx("code",{children:"BREAKING CHANGE:"}),") encode the version impact of each change. The release tooling reads the commits since the last release and determines the next version number automatically, generates a structured changelog, creates the git tag, publishes the release, and triggers the deployment. Claude enforces conventional commits through linting and can generate them correctly from any change description."]}),e.jsx(s,{title:"Semantic Versioning as Communication",children:"Semantic version numbers (MAJOR.MINOR.PATCH) communicate change impact to consumers. A patch release signals that no existing behavior changed — consumers can upgrade without risk. A minor release adds capability without breaking existing usage. A major release breaks the existing API contract and requires consumer migration. When version numbers are generated automatically from conventional commits, they carry this information reliably. When humans choose version numbers manually, they are often wrong — minor changes get major versions, breaking changes get patches."}),e.jsx(t,{title:"Setting Up Semantic Release",tabs:[{label:"bash",language:"bash",filename:"setup-semantic-release.sh",code:`# Install semantic-release and plugins
npm install --save-dev   semantic-release   @semantic-release/changelog   @semantic-release/git   @semantic-release/github   @semantic-release/npm   @commitlint/cli   @commitlint/config-conventional

# Configure commitlint
echo "module.exports = { extends: ['@commitlint/config-conventional'] }" > commitlint.config.js

# Add commitlint to pre-commit hook
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'

# Test commitlint
echo "feat: add new payment method" | npx commitlint  # Should pass
echo "added payment method" | npx commitlint          # Should fail

# Ask Claude to help with commit message format
claude "I need to write a commit message for the following changes:
$(git diff --staged --stat)

Changes summary: Added rate limiting to the login endpoint to prevent brute force attacks.
Added a Redis-backed rate limiter, updated the login handler, and added tests.
This is a new feature that doesn't break existing behavior.

Write the correct conventional commit message for these changes.
Format: type(scope): description
Available types: feat, fix, docs, style, refactor, test, chore, perf, ci, build
Use breaking change footer if applicable."`},{label:"json",language:"json",filename:".releaserc.json",code:`{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    [
      "@semantic-release/release-notes-generator",
      {
        "preset": "conventionalcommits",
        "presetConfig": {
          "types": [
            { "type": "feat", "section": "Features" },
            { "type": "fix", "section": "Bug Fixes" },
            { "type": "perf", "section": "Performance Improvements" },
            { "type": "revert", "section": "Reverts" },
            { "type": "docs", "section": "Documentation", "hidden": false },
            { "type": "chore", "hidden": true },
            { "type": "style", "hidden": true },
            { "type": "refactor", "hidden": true },
            { "type": "test", "hidden": true },
            { "type": "build", "hidden": true },
            { "type": "ci", "hidden": true }
          ]
        }
      }
    ],
    [
      "@semantic-release/changelog",
      {
        "changelogFile": "CHANGELOG.md"
      }
    ],
    "@semantic-release/npm",
    [
      "@semantic-release/git",
      {
        "assets": ["CHANGELOG.md", "package.json"],
        "message": "chore(release): \${nextRelease.version} [skip ci]\\n\\n\${nextRelease.notes}"
      }
    ],
    "@semantic-release/github"
  ]
}`}]}),e.jsx("h2",{children:"Feature Flag Management"}),e.jsx("p",{children:"Feature flags decouple deployment from release: code ships to production in a disabled state and is activated separately, enabling dark launches, A/B testing, and instant rollback without a code deployment. Claude can generate feature flag scaffolding and help manage flag lifecycles."}),e.jsx(t,{title:"Feature Flag Integration",tabs:[{label:"bash",language:"bash",filename:"feature-flags.sh",code:`# Generate feature flag scaffolding for a new feature
claude "Add a feature flag for the new payment methods feature.

Feature: PAYMENT_METHODS_V2
Status: shipping disabled, will be enabled for 10% of users in week 1, 100% in week 2

Generate:
1. Feature flag type definition in src/features/flags.ts:
   export enum FeatureFlag {
     PAYMENT_METHODS_V2 = 'payment_methods_v2',
     // ... existing flags
   }

2. Flag check utility in src/features/useFlag.ts:
   - Check LaunchDarkly (or environment variable fallback)
   - Type-safe flag evaluation with default value
   - Track flag evaluation in analytics

3. Update PaymentController to gate the new payment method endpoints behind the flag:
   if (await featureFlags.isEnabled(FeatureFlag.PAYMENT_METHODS_V2, userId)) {
     return this.paymentServiceV2.processPayment(request)
   }
   return this.paymentService.processPayment(request)  // Original path

4. Add a cleanup TODO comment: // TODO: Remove flag + old code path after 2024-02-01

After implementing:
- Run tests: all tests must pass (test both flag-on and flag-off paths)
- Run: grep -r 'payment_methods_v2' src/ to verify all usages are gated"`}]}),e.jsx("h2",{children:"Automated Changelog Generation"}),e.jsx(t,{title:"Generating Release Notes with Claude",tabs:[{label:"bash",language:"bash",filename:"generate-release-notes.sh",code:`# Generate human-friendly release notes from conventional commits
claude "Generate release notes for version 2.3.0.

Commits since v2.2.0:
$(git log v2.2.0..HEAD --pretty=format:'%H %s' --no-merges)

PR descriptions for significant features:
$(gh pr list --state merged --base main --search 'merged:>=$(git log -1 --format=%aI v2.2.0)' --json title,body --jq '.[] | "## " + .title + "\\n" + .body' 2>/dev/null | head -200)

Generate two versions of release notes:

1. TECHNICAL (for CHANGELOG.md — follows keepachangelog.com format):
## [2.3.0] - $(date -I)
### Added
- ...
### Changed
- ...
### Fixed
- ...
### Security
- ...

2. BUSINESS (for stakeholder communication — plain English, no technical jargon):
### What's New in v2.3.0
A summary paragraph of the key value delivered in this release.

#### New Capabilities
- [Feature]: what users can now do that they couldn't before

#### Improvements
- [What changed]: the customer benefit, not the technical change

Write both to /tmp/release-notes-2.3.0.md"`}]}),e.jsxs(r,{title:"Conventional Commits Require Team-Wide Discipline",children:[`Semantic release only works if every commit to main follows the conventional commit format. One improperly formatted commit message (e.g., a merge commit "Merge branch 'feature/x'") can cause semantic-release to fail or produce the wrong version number. Enforce commitlint via the commit-msg git hook, and configure GitHub to require conventional commit message formats on PR titles (which become the squash-merge commit message). The GitHub action `,e.jsx("code",{children:"amannn/action-semantic-pull-request"}),"validates PR title format automatically."]}),e.jsx(a,{title:"Feature Flag Lifecycle Management",children:'Feature flags that are never removed become permanent complexity. Establish a maximum flag lifetime policy (typically 2-4 weeks) and enforce it. Ask Claude to help with cleanup: "Find all feature flags in src/features/flags.ts that have a TODO comment with a cleanup date in the past. For each one, implement the permanent path (remove the flag check and the old code path), update the tests to remove flag-based branching, and delete the flag from the FeatureFlag enum." This cleanup is exactly the kind of mechanical refactoring where Claude provides leverage.'}),e.jsxs(n,{type:"tip",title:"Dry-Run Releases for Verification",children:["Run ",e.jsx("code",{children:"npx semantic-release --dry-run"}),' in CI on every PR to preview what version the release pipeline would produce if this PR were merged. This surfaces misclassified commits (a breaking change labeled as a fix) before merge, not after. Include the dry-run output in the PR description. Ask Claude: "The semantic-release dry run shows this PR would trigger a major version bump, but I only added a new optional field to the API response. Explain whether this should be a major or minor bump, and if minor, how to fix the commit message."']})]})}const Ye=Object.freeze(Object.defineProperty({__proto__:null,default:ae},Symbol.toStringTag,{value:"Module"}));export{De as A,_e as B,Le as C,Oe as D,qe as E,Ne as F,Ue as G,Fe as H,Ge as I,Me as J,We as K,He as L,ze as M,Be as N,Ve as O,$e as P,Ke as Q,Ye as R,oe as a,ce as b,le as c,de as d,he as e,ue as f,me as g,pe as h,ge as i,fe as j,ye as k,be as l,ve as m,we as n,xe as o,Ae as p,ke as q,Ce as r,re as s,Ie as t,je as u,Te as v,Se as w,Re as x,Pe as y,Ee as z};
