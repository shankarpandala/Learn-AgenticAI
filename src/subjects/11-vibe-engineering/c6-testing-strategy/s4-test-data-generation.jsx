import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function TestDataGeneration() {
  return (
    <article className="prose-content">
      <h1>Test Data Generation</h1>

      <p>
        Test data is the invisible infrastructure of a test suite. Bad test data produces
        brittle tests: tests that fail when a hardcoded email already exists in the database,
        tests that only work in one developer's local environment because they depend on seed
        data nobody else seeded, tests that use "test@test.com" and "password123" as realistic
        inputs for a system that will receive complex real-world data. Good test data is
        generated programmatically, isolated per test, representative of real inputs, and
        never contains real PII.
      </p>

      <p>
        AI assistance is valuable both for generating the test data infrastructure (factories,
        builders, seed scripts) and for generating the data itself — particularly synthetic
        data that mirrors the statistical properties of production data without containing
        any real user information.
      </p>

      <ConceptBlock title="The Four Types of Test Data">
        Effective test data management requires four distinct capabilities: (1) factory
        functions that create model instances with sensible defaults for unit tests,
        (2) seed scripts that populate a database with a known state for integration tests,
        (3) synthetic production-like datasets for load and performance tests, and
        (4) GDPR-compliant anonymized copies of production data for debugging specific
        production issues in a development environment.
      </ConceptBlock>

      <h2>Test Factory Generation</h2>

      <SDKExample
        title="Generating Test Factories with Faker"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'generate-factories.sh',
            code: `# Generate test factories for all domain models
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
- For password fields, use a pre-hashed bcrypt string to avoid slow hashing in tests"`,
          },
          {
            label: 'typescript',
            language: 'typescript',
            filename: 'tests/factories/index.ts (generated)',
            code: `import { faker } from '@faker-js/faker'
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
}`,
          },
        ]}
      />

      <h2>Synthetic Production-Like Data</h2>

      <p>
        Performance and load testing require large datasets that mirror the statistical
        properties of production data — the distribution of order sizes, the ratio of
        active to inactive users, the typical product catalog depth. Claude can generate
        realistic synthetic datasets from your production data schema.
      </p>

      <SDKExample
        title="Synthetic Dataset Generation"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'generate-synthetic-data.sh',
            code: `# Generate a synthetic production-like dataset for load testing
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
After seeding: npx k6 run tests/load/checkout-flow.js"`,
          },
        ]}
      />

      <h2>PII Anonymization for Development Data</h2>

      <p>
        When a production bug requires debugging with real data characteristics, the correct
        approach is not to copy production data to a development environment — it is to
        anonymize a production snapshot before using it. Claude can generate the
        anonymization pipeline.
      </p>

      <SDKExample
        title="GDPR-Compliant Data Anonymization Pipeline"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'anonymize-pipeline.sh',
            code: `# Generate PII anonymization script
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
Usage: npx ts-node scripts/anonymize/anonymize-prod-snapshot.ts --input prod-dump.sql --output dev-seed.sql"`,
          },
        ]}
      />

      <WarningBlock title="Never Use Real Production Data in Development Without Anonymization">
        Copying a production database snapshot to a development environment without anonymization
        is a GDPR violation, a SOC 2 violation, and an exposure risk. Development environments
        have weaker security controls than production — more people have access, logs are less
        monitored, and there is no breach detection. Enforce this in CLAUDE.md: "The development
        database must never contain real user PII. If you need production-like data for debugging,
        run the anonymization pipeline first." Include this as a check in your development
        environment setup script.
      </WarningBlock>

      <BestPracticeBlock title="Isolate Test Data Per Test, Not Per Suite">
        The best test data strategy is to create exactly the data each test needs, inside
        that test's setup, and clean it up after. Tests that share a database state are
        order-dependent and fail non-deterministically. Ask Claude when generating tests:
        "Each test should create its own data using factories and clean up after itself.
        Do not use beforeAll to create shared data — use beforeEach or inline creation."
        This makes tests independently runnable and parallelizable.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Snapshot Tests for Complex Data Structures">
        For complex objects (nested order objects, report outputs, serialized payloads),
        Jest snapshot tests can capture the exact structure and detect regressions.
        Ask Claude: "Add snapshot tests for the OrderSerializer.toJSON() output. The snapshot
        should use factory data with fixed seeds so it is deterministic. Replace dynamic
        fields (timestamps, UUIDs) with static values before snapshotting."
        Use <code>toMatchInlineSnapshot()</code> for small objects (the snapshot is visible
        in the test file) and <code>toMatchSnapshot()</code> for large objects.
      </NoteBlock>
    </article>
  )
}
