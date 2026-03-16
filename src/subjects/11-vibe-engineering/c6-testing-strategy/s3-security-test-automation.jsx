import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function SecurityTestAutomation() {
  return (
    <article className="prose-content">
      <h1>Security Test Automation</h1>

      <p>
        Security vulnerabilities are defects. Treating them as defects means they should be
        caught by automated tests that run on every PR, not discovered by a penetration tester
        six months after deployment. The OWASP Top 10 is a catalog of the most common web
        application vulnerabilities — and for most of them, automated tests can be written that
        verify the vulnerability is absent. Claude can generate this test suite from your
        API specification and CLAUDE.md security requirements.
      </p>

      <p>
        Security test automation serves two purposes: it catches new vulnerabilities introduced
        during development, and it documents your security posture in executable form. When an
        auditor asks "how do you verify SQL injection is prevented?", pointing to a passing
        test suite is more credible than pointing to a code review checklist.
      </p>

      <ConceptBlock title="Security Tests as Executable Policy">
        Every security requirement in your CLAUDE.md should have a corresponding automated test.
        If your CLAUDE.md says "passwords must be hashed with bcrypt cost factor {">="} 12", there
        should be a test that reads the database after a user creation and verifies the hash
        prefix is <code>$2b$12$</code>. If it says "rate limit login to 5 attempts per 15
        minutes", there should be a test that makes 6 rapid requests and asserts the 6th returns
        429. Security requirements without tests are wishes.
      </ConceptBlock>

      <SDKExample
        title="OWASP Top 10 Test Generation"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'generate-owasp-tests.sh',
            code: `# Generate security tests for OWASP Top 10 vulnerabilities
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
- SQL injection: POST /users with email: \"' OR '1'='1\" — must return 400, not 200
- SQL injection in search: GET /search?q='; DROP TABLE users;-- — must return results or 400
- NoSQL injection: POST /login with { \"username\": {\"$gt\": \"\"} } — must return 401

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
Run: npm test -- --testPathPattern='security' after generating."`,
          },
          {
            label: 'typescript',
            language: 'typescript',
            filename: 'tests/security/access-control.test.ts (generated)',
            code: `import request from 'supertest'
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
})`,
          },
        ]}
      />

      <h2>Fuzzing with Fast-Check</h2>

      <p>
        Property-based fuzzing generates random inputs to find edge cases your manual tests
        missed. For security testing, fuzzing input validation is particularly valuable —
        you specify the space of possible malicious inputs and let the framework find the
        ones that slip through.
      </p>

      <SDKExample
        title="Input Fuzzing for Injection Prevention"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'fuzz-security.sh',
            code: `# Generate fuzz tests for input validation
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

Place in tests/security/fuzzing.test.ts"`,
          },
        ]}
      />

      <h2>Penetration Test Scenarios as Automated Tests</h2>

      <p>
        Many common penetration test findings can be automated into regression tests.
        Once you've run a pentest (or had a finding reported), encode the finding as
        a test so it can never regress.
      </p>

      <SDKExample
        title="Encoding Pentest Findings as Regression Tests"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'pentest-regression.sh',
            code: `# Encode a pentest finding as a regression test
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
This test must be in the security test suite so it runs on every PR."`,
          },
        ]}
      />

      <WarningBlock title="Security Tests Run Against a Test Environment, Not Production">
        Security tests that probe for injection vulnerabilities, test rate limiting, or
        verify access controls must run against a dedicated test environment with test
        accounts and test data. Never run automated security tests against a production
        environment — rate limiting tests will lock out real users, injection tests
        may trigger security monitoring alerts, and any misconfiguration could cause real
        damage. CI/CD pipelines should run security tests against a staging or test
        environment that mirrors production configuration.
      </WarningBlock>

      <BestPracticeBlock title="Add Security Tests to the PR Template">
        Include a security test checklist in your PR template. For any PR that touches
        authentication, authorization, data access, or input handling, the template should
        prompt: "Have you added or updated security tests for the OWASP categories affected
        by this change?" Making this a visible question in every PR review creates a culture
        where security testing is expected, not exceptional.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="OWASP ZAP for Automated Dynamic Scanning">
        OWASP ZAP (Zed Attack Proxy) provides automated dynamic application security testing
        (DAST) that complements your unit and integration security tests. Ask Claude to
        generate a ZAP automation config: "Generate a ZAP automation framework script that
        crawls our API using the OpenAPI spec at docs/api/openapi.yaml and runs the active
        scanner against authentication endpoints. Output: JSON report at /tmp/zap-report.json.
        Fail if any HIGH or CRITICAL findings are discovered." Integrate the ZAP scan into
        your nightly CI pipeline.
      </NoteBlock>
    </article>
  )
}
