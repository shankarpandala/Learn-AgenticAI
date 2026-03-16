import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function ComplianceControlsInClaudeMd() {
  return (
    <article className="prose-content">
      <h1>Compliance Controls in CLAUDE.md</h1>

      <p>
        Regulatory compliance frameworks — SOC 2, GDPR, HIPAA, PCI-DSS — require that
        specific technical controls be in place and consistently applied. In traditional
        software development, these controls live in wikis, checklists, and policy documents
        that developers consult sporadically, if at all. Violations are discovered during
        audits, months after the non-compliant code was merged.
      </p>

      <p>
        Vibe Engineering moves compliance controls into CLAUDE.md, making them active
        constraints that shape AI-generated code from the first prompt. When Claude sees
        that HIPAA requires PHI to be encrypted at rest and in transit, it will implement
        encryption as a default behavior rather than an afterthought. When GDPR's data
        minimization principle is encoded as "collect only fields necessary for the stated
        purpose", Claude will push back on data models that capture more than they need.
      </p>

      <ConceptBlock title="Compliance as Code">
        Machine-readable compliance controls in CLAUDE.md are not a replacement for legal
        review or formal compliance programs — they are a first line of defense that prevents
        the most common compliance violations from ever being written. Think of them as
        guardrails: they do not make you compliant, but they prevent the obvious violations
        that auditors find most often. Legal and compliance teams should review and approve
        the CLAUDE.md compliance section just as they would any other policy document.
      </ConceptBlock>

      <SDKExample
        title="GDPR Controls in CLAUDE.md"
        tabs={[
          {
            label: 'yaml',
            language: 'yaml',
            filename: 'CLAUDE.md (GDPR section)',
            code: `## GDPR Compliance Controls

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
- See: runbooks/security-incident-response.md`,
          },
        ]}
      />

      <SDKExample
        title="HIPAA Controls in CLAUDE.md"
        tabs={[
          {
            label: 'yaml',
            language: 'yaml',
            filename: 'CLAUDE.md (HIPAA section)',
            code: `## HIPAA Technical Safeguards

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
- Do not guess — a wrong guess in HIPAA context creates liability`,
          },
        ]}
      />

      <SDKExample
        title="PCI-DSS Controls in CLAUDE.md"
        tabs={[
          {
            label: 'yaml',
            language: 'yaml',
            filename: 'CLAUDE.md (PCI-DSS section)',
            code: `## PCI-DSS Controls (SAQ A-EP)

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
- Payment dependencies reviewed separately with security team before upgrade`,
          },
        ]}
      />

      <h2>Compliance Verification as Code</h2>

      <SDKExample
        title="Automated Compliance Verification"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'compliance-check.sh',
            code: `# Run compliance verification checks
claude "Run automated compliance verification for GDPR and HIPAA controls.

GDPR checks:
1. Verify all user tables have soft-delete support:
   grep -r 'deleted_at' src/domain/models/ --include='*.ts' -l
   Expected: users.ts, orders.ts present

2. Verify no PII in audit log definitions:
   grep -r 'AuditLog' src/ --include='*.ts' -A10 | grep -E 'email|name|phone|address'
   Expected: no matches

3. Verify consent fields are opt-in (boolean defaulting to false):
   grep -r 'marketingConsent\|emailConsent\|smsConsent' src/ --include='*.ts'
   Expected: default: false in all schema definitions

HIPAA checks:
1. Verify PHI fields use column encryption:
   grep -r 'diagnosis\|treatment\|prescription' src/domain/models/ --include='*.ts' -B2
   Expected: @Encrypted() decorator present above each PHI column

2. Verify no PHI in logger calls:
   grep -r 'logger\.' src/ --include='*.ts' | grep -E 'diagnosis|treatment|prescription|dob'
   Expected: no matches

3. Verify audit logs include patient_id for all PHI access:
   grep -r 'auditLog\|AuditService' src/infrastructure/audit/ --include='*.ts' -A5
   Expected: patient_id field in all audit log entries

Output: PASS or FAIL for each check with file references for failures."`,
          },
        ]}
      />

      <WarningBlock title="CLAUDE.md Is Not a Substitute for Legal Review">
        Encoding compliance requirements in CLAUDE.md is an engineering control, not a legal
        determination. The controls should be reviewed and approved by your legal and compliance
        teams before they are treated as authoritative. A GDPR section written by an engineer
        without legal review may have gaps, misinterpretations, or be out of date with regulatory
        guidance. Work with your DPO and legal counsel to define the controls, then encode
        those controls in CLAUDE.md as implementation guidance.
      </WarningBlock>

      <BestPracticeBlock title="Keep Compliance Controls in Sync With Policy">
        Compliance frameworks update. GDPR guidance evolves through regulatory decisions.
        HIPAA gets new guidance documents. Schedule a quarterly review of your CLAUDE.md
        compliance sections against your official compliance policies. Ask Claude: "Compare
        our CLAUDE.md GDPR section with the current GDPR requirements list in
        docs/compliance/gdpr-requirements.pdf. Identify any gaps or outdated controls."
        This keeps the AI's guardrails aligned with your actual obligations.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Use Semgrep Rules for Compliance Enforcement">
        Encode the most critical compliance controls as Semgrep rules that block PRs.
        For HIPAA: a Semgrep rule that fails if any variable named after PHI fields is
        passed to a logger. For PCI: a rule that fails if any string matching a card
        number pattern is assigned to a database field. These rules run in milliseconds
        and provide immediate feedback to engineers when they accidentally violate a
        compliance control, rather than waiting for a code review or audit.
      </NoteBlock>
    </article>
  )
}
