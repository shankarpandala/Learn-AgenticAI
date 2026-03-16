import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'

export default function APIContractDesign() {
  return (
    <article className="prose-content">
      <h1>API Contract Design</h1>

      <p>
        API contracts — OpenAPI specifications, gRPC proto files, AsyncAPI event schemas — are the
        formal interface definitions that teams use to build against each other's services without
        tight coupling. Good contracts are precise, versioned, and discoverable. Bad contracts are
        vague, inconsistent, and become the source of integration bugs that surface only in production.
      </p>

      <p>
        Claude is an effective collaborator for API contract design. It can generate well-structured
        OpenAPI specs from natural language descriptions, review existing contracts for inconsistencies,
        and ensure contracts follow your organisation's conventions. The key is to treat contract design
        as a specification activity — not an implementation activity — and to establish your conventions
        in CLAUDE.md before the first session.
      </p>

      <ConceptBlock title="Contract-First Design">
        In a contract-first approach, the API contract is designed and agreed upon before any
        implementation begins. The contract becomes the specification that both the provider team
        and the consumer team work against simultaneously. Claude accelerates this process by
        generating a draft contract from a description of the intended behavior, which the teams
        then review and refine together. The implementation follows the contract; the contract does
        not follow the implementation.
      </ConceptBlock>

      <h2>Generating OpenAPI Specs from Requirements</h2>

      <SDKExample
        title="OpenAPI Spec Generation"
        tabs={[
          {
            label: "prompt",
            language: "text",
            filename: "Claude Code session",
            code: `Generate an OpenAPI 3.1 specification for a Product Catalogue API.

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

Include realistic example values in all schemas.`,
          },
          {
            label: "openapi",
            language: "yaml",
            filename: "openapi/product-catalogue.yaml",
            code: `openapi: 3.1.0
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
          schema: { $ref: '#/components/schemas/ErrorBody' }`,
          },
        ]}
      />

      <h2>gRPC Proto Design</h2>

      <p>
        For internal service-to-service communication, gRPC with Protocol Buffers is often preferred
        over REST for performance and strong typing. Claude can generate well-structured proto files
        that follow proto3 best practices and your organisation's naming conventions.
      </p>

      <CodeBlock language="protobuf" filename="proto/inventory/v1/inventory.proto">
{`syntax = "proto3";

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
}`}
      </CodeBlock>

      <h2>Event Schema Design with AsyncAPI</h2>

      <p>
        Event-driven architectures require event schemas that are as carefully designed as REST APIs.
        AsyncAPI is the OpenAPI equivalent for asynchronous messaging. Claude can generate AsyncAPI
        documents from descriptions of the events your system emits and consumes.
      </p>

      <CodeBlock language="yaml" filename="asyncapi/order-events.yaml">
{`asyncapi: 2.6.0
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
            example: USD`}
      </CodeBlock>

      <h2>Contract Review and Consistency Checking</h2>

      <p>
        Existing APIs often have inconsistencies: some endpoints use camelCase field names, others use
        snake_case; some return 404 for not-found, others return 200 with an empty result; some paginate
        with offset/limit, others with cursors. Claude can audit your API contracts for these
        inconsistencies and generate a prioritised list of improvements.
      </p>

      <PatternBlock title="API Contract Audit">
        Run a contract audit before any major API version bump. Provide Claude with all your OpenAPI
        files and ask it to check: (1) naming convention consistency across all schemas and operations,
        (2) error response format consistency, (3) pagination approach consistency, (4) authentication
        approach consistency, (5) HTTP method semantic correctness, and (6) required vs optional field
        decisions that seem arbitrary. The output is a prioritised list of inconsistencies to fix
        in the next version.
      </PatternBlock>

      <BestPracticeBlock title="API Conventions in CLAUDE.md">
        Document your API conventions in CLAUDE.md so that every Claude-generated API spec automatically
        follows them. Conventions to document: field naming (snake_case vs camelCase), ID format (UUID
        vs integer), pagination approach, error response format, versioning strategy, date/time format
        (ISO 8601, always UTC), and boolean field naming (is_active vs active vs enabled). Claude will
        apply these conventions to every spec it generates, eliminating consistency review as a manual
        step.
      </BestPracticeBlock>

      <WarningBlock title="Validate Generated Specs Before Use">
        Claude-generated OpenAPI specs may contain structural errors that are not immediately obvious —
        missing required fields in schemas, incorrect $ref paths, or operation IDs that are not unique.
        Always validate generated specs with a tool before using them: <code>npx @redocly/cli lint</code>
        for OpenAPI, <code>buf lint</code> for proto files. Make this part of your CI pipeline so that
        API contract validation is automatic.
      </WarningBlock>

      <NoteBlock type="tip" title="Contract-First Accelerates Parallel Development">
        Once a contract is agreed upon and committed, the provider team and consumer team can work in
        parallel — the provider implements the spec, the consumer mocks it using tools like Prism or
        Mockoon. Ask Claude to generate mock server configurations from your OpenAPI spec so teams
        can start integration work immediately without waiting for the real implementation. This is
        one of the highest-leverage applications of contract-first design in a Vibe Engineering workflow.
      </NoteBlock>
    </article>
  )
}
