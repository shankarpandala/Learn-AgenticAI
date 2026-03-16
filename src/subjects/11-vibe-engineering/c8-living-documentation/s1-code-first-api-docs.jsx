import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function CodeFirstApiDocs() {
  return (
    <article className="prose-content">
      <h1>Code-First API Documentation</h1>

      <p>
        API documentation has a half-life. The moment a developer writes a description of
        an endpoint, that description begins drifting from reality as the implementation
        evolves. By six months post-launch, most hand-maintained API documentation is
        inaccurate in at least one significant way — wrong field names, outdated error codes,
        missing required parameters, documented behavior that was changed but not updated.
        Consumers of the API trust the docs, build against them, and discover the truth
        through broken integrations.
      </p>

      <p>
        Code-first API documentation inverts this relationship: the code is the source of
        truth, and documentation is generated from the code. When the implementation changes,
        running the documentation generation produces an accurate spec. Claude accelerates
        both the initial generation and the ongoing maintenance, treating API documentation
        as a deliverable that is produced as part of the development workflow.
      </p>

      <ConceptBlock title="OpenAPI as Living Spec">
        OpenAPI 3.x is the lingua franca of REST API documentation. When generated from
        code (rather than written by hand), an OpenAPI spec accurately reflects the actual
        API behavior. It powers API clients, mock servers, validation middleware, and
        documentation portals. Keeping it generated — not hand-maintained — is the only
        reliable way to keep it accurate.
      </ConceptBlock>

      <SDKExample
        title="Generating OpenAPI Spec from TypeScript"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'generate-openapi.sh',
            code: `# Generate OpenAPI spec from FastAPI (Python)
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

Run: npx tsoa spec 2>&1 | grep 'WARNING\|missing'

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
- Check: docs/swagger.json has been updated with new documentation"`,
          },
          {
            label: 'typescript',
            language: 'typescript',
            filename: 'src/api/controllers/OrderController.ts (with docs)',
            code: `import { Controller, Get, Post, Body, Path, Route, Tags, Security, Response, Example } from 'tsoa'
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
}`,
          },
        ]}
      />

      <h2>API Changelog Generation</h2>

      <p>
        API consumers need to know when the API changes. A machine-generated changelog,
        produced by diffing OpenAPI specs between versions, provides accurate, complete
        change documentation without requiring developers to maintain it manually.
      </p>

      <SDKExample
        title="Automated API Changelog"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'generate-api-changelog.sh',
            code: `# Install openapi-diff
npm install -g openapi-diff

# Compare API versions
openapi-diff docs/api/openapi-v1.json docs/api/openapi-v2.json \
  --json > /tmp/api-diff.json

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

Append to docs/api/CHANGELOG.md and commit with: git commit -m 'docs(api): changelog for v1.3.0'"`,
          },
        ]}
      />

      <h2>Docs Portal Publishing</h2>

      <SDKExample
        title="Publishing to Docs Portal"
        tabs={[
          {
            label: 'yaml',
            language: 'yaml',
            filename: '.github/workflows/publish-docs.yml',
            code: `name: Publish API Documentation

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
          npx @redocly/cli build-docs docs/swagger.json \
            --output docs/portal/index.html \
            --title "MyApp API Documentation"

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${'$'}{{ secrets.GITHUB_TOKEN }}
          publish_dir: docs/portal
          destination_dir: api-docs`,
          },
        ]}
      />

      <WarningBlock title="Generated Docs Still Need Human Review">
        Code-generated documentation is accurate to the code, but accurate code is not
        always clear documentation. Claude-generated descriptions may be technically correct
        but confusing to API consumers who lack context about your domain. Review generated
        documentation for clarity, not just correctness. Pay particular attention to error
        responses — "returns 422 when validation fails" is less useful than "returns 422
        when the order total exceeds the user's credit limit, including a balance field
        in the error response."
      </WarningBlock>

      <BestPracticeBlock title="Schema-First for New APIs">
        For new APIs, write the OpenAPI schema first, then implement to match it.
        Ask Claude: "Generate an OpenAPI 3.0 schema for a product catalog API with
        endpoints for listing, searching, and managing products. Include example
        requests and responses." Review and approve the schema, then: "Implement the
        Express routes and controllers that exactly satisfy this OpenAPI schema. Use
        express-openapi-validator middleware to enforce request/response validation
        against the schema." This ensures documentation and implementation never diverge.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Redocly CLI for Schema Validation">
        Use <code>npx @redocly/cli lint openapi.yaml</code> in your CI pipeline to
        catch OpenAPI spec issues before they reach the documentation portal. Redocly
        validates not just spec syntax but semantic quality: unused schemas, inconsistent
        naming conventions, missing descriptions, and deprecated features. Ask Claude
        to fix any lint issues: "Run @redocly/cli lint and fix all reported issues in
        docs/openapi.yaml. Do not suppress warnings — fix the underlying documentation."
      </NoteBlock>
    </article>
  )
}
