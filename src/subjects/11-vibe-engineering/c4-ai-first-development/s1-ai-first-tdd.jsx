import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'

export default function AIFirstTDD() {
  return (
    <div>
      <ConceptBlock title="AI-TDD Loop">
        <p>
          AI-First Test-Driven Development reframes the classic TDD cycle around what AI agents
          are actually good at: running code in a loop until an objective criterion is satisfied.
          Tests are that criterion. When you write tests before implementation, you give Claude
          Code a machine-verifiable specification it can execute, evaluate, and iterate against
          without human supervision.
        </p>
        <p>The five-step AI-TDD cycle:</p>
        <ol>
          <li>
            <strong>Write failing tests that specify behavior.</strong> You, the human, write tests
            that encode exactly what the code must do. These tests fail today because the
            implementation does not exist yet. That failure is intentional — it proves the tests
            are real.
          </li>
          <li>
            <strong>Commit tests to git.</strong> Commit the test files before touching any
            implementation code. This creates an immutable, timestamped specification. The git
            history proves you defined the contract before the implementation, and it prevents
            scope creep during the Claude session.
          </li>
          <li>
            <strong>Give Claude Code the tests and requirements.</strong> Open Claude Code and
            provide the test files alongside relevant context: your CLAUDE.md constraints, the
            data models involved, any external API contracts. Claude now has everything it needs
            to work autonomously.
          </li>
          <li>
            <strong>Claude implements until all tests pass.</strong> Claude writes the
            implementation, runs the test suite, reads failures, adjusts the code, and repeats.
            This loop continues until every test passes. You do not need to be present during
            this phase — Claude is working against an objective target.
          </li>
          <li>
            <strong>Human reviews implementation for correctness and security.</strong> When
            Claude reports all tests green, you review the implementation. You are not checking
            whether it works — the tests already verified that. You are checking whether the
            approach is sound, whether there are security concerns the tests did not capture, and
            whether the code is maintainable.
          </li>
        </ol>
        <p>
          The critical insight is that tests transform a vague instruction ("build a user
          registration endpoint") into a precise, executable contract. Claude cannot argue with a
          failing test. It either passes or it does not. This eliminates the ambiguity that makes
          AI-generated code unreliable, and it means you can verify Claude's output without
          reading every line.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Test-First: FastAPI User Service"
        tabs={[
          {
            label: "python",
            language: "python",
            filename: "tests/test_user_service.py",
            code: `# tests/test_user_service.py - Written BEFORE implementation
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
    assert user.password_hash.startswith("$2b$")  # bcrypt prefix`,
          },
          {
            label: "prompt",
            language: "text",
            filename: "Claude Code prompt",
            code: `Implement the /users POST endpoint to make all tests in tests/test_user_service.py pass.

Requirements from CLAUDE.md:
- Passwords: bcrypt with cost factor >= 12
- Never return password fields in response
- Email uniqueness enforced at DB level
- Input validation via Pydantic

Run pytest after implementing. All 4 tests must pass before you stop.`,
          },
        ]}
      />

      <p>
        Notice what these tests specify without saying so explicitly. The 201/422/409 status codes
        define the entire HTTP contract. The <code>assert "password" not in data</code> assertion
        encodes a security requirement. The bcrypt prefix check verifies a cryptographic
        implementation detail. You have written the security policy as code. Claude cannot comply
        with the security requirements without satisfying the tests, and it cannot fake
        compliance — the tests run against real behavior.
      </p>

      <PatternBlock title="Red-Green-Refactor with AI">
        <p>
          The classic Red-Green-Refactor cycle maps cleanly onto the human/AI collaboration model,
          with each phase assigned to whoever is best suited for it.
        </p>
        <dl>
          <dt>
            <strong>RED — Write failing tests (human writes these)</strong>
          </dt>
          <dd>
            You write the tests. This is not a step you can or should delegate to Claude.
            Writing tests requires understanding the business requirements, the security
            constraints, the edge cases that matter for your domain. This is where your expertise
            is irreplaceable. The tests you write in this phase become the specification Claude
            will work against. Invest time here — a shallow test suite produces shallow
            implementations.
          </dd>

          <dt>
            <strong>GREEN — Claude implements code to pass tests (AI does this)</strong>
          </dt>
          <dd>
            Claude takes the failing tests and implements code to make them pass. This is
            mechanical, iterative work — exactly what Claude is fast at. Claude runs{' '}
            <code>pytest</code>, reads the failure output, adjusts the code, runs again. It
            continues until the suite is green. You do not supervise this loop. You gave Claude
            an objective success criterion; let it work.
          </dd>

          <dt>
            <strong>REFACTOR — Human reviews and Claude assists cleanup (collaborative)</strong>
          </dt>
          <dd>
            Once tests are green, you review the implementation for code quality, security
            issues the tests did not cover, and architectural concerns. Claude assists by
            explaining its choices, suggesting cleanup, and implementing refactors you direct.
            This phase is a conversation — you bring judgment, Claude brings execution speed.
          </dd>
        </dl>
        <p>
          The power of this division is that the phases are cleanly separated by verifiability.
          Red phase produces something verifiable. Green phase is verified by running tests.
          Refactor phase preserves test-verified behavior while improving structure. At no point
          does "it seems to work" substitute for a passing test suite.
        </p>
      </PatternBlock>

      <h3>Property-Based Testing with AI</h3>
      <p>
        Example-based tests verify specific inputs. Property-based tests verify invariants across
        thousands of generated inputs. When you combine property-based testing with Claude Code,
        you can specify the mathematical properties a function must satisfy and let hypothesis
        find the edge cases that break your implementation.
      </p>
      <p>
        Ask Claude: "Using hypothesis, generate property-based tests for the Payment model that
        verify the invariant that amount is always positive and never exceeds the account
        balance." Claude will write the hypothesis strategies, run them, and if a counterexample
        is found, it will fix the implementation until the property holds universally.
      </p>

      <CodeBlock language="python" filename="test_payment_processor.py">
        {`from hypothesis import given, strategies as st
import pytest

@given(
    amount=st.decimals(min_value=0.01, max_value=999999.99, places=2),
    currency=st.sampled_from(["USD", "EUR", "GBP"])
)
def test_payment_amount_always_rounds_to_cents(amount, currency):
    """Property: any valid payment amount should round correctly."""
    payment = Payment(amount=amount, currency=currency)
    assert len(str(payment.amount).split(".")[-1]) <= 2`}
      </CodeBlock>

      <p>
        This test will run hundreds of times with different decimal values. If any combination
        produces a Payment where the amount has more than two decimal places — a rounding bug
        that could cause accounting discrepancies — hypothesis finds it and reports the minimal
        failing example. Claude can then fix the rounding logic and re-run until the property
        holds for all inputs.
      </p>

      <h3>Contract Testing Between Microservices</h3>
      <p>
        In a microservices architecture, teams write code against each other's APIs. Contract
        tests let the consumer team define what they expect from a provider before the provider
        implements it. This is the AI-TDD model applied at the service boundary level: write the
        contract first, then let the provider team (or Claude) implement to satisfy it.
      </p>

      <CodeBlock language="python" filename="test_consumer_contract.py">
        {`# Consumer-driven contract test — written by the consumer team
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
        assert result["available"] is True`}
      </CodeBlock>

      <p>
        When you give this contract test to Claude along with the instruction "implement the
        InventoryService <code>/inventory/&#123;product_id&#125;</code> endpoint to satisfy this
        Pact contract", Claude has a precise, machine-verifiable target. The Pact framework will
        run the contract against the real implementation. If it does not match, Claude gets a
        structured failure message and can adjust. The consumer team never needs to coordinate
        synchronously with the provider team — the contract does it.
      </p>

      <WarningBlock>
        Never skip the test review step. Claude can write tests that pass vacuously — for
        example, <code>assert True</code>, or a test that only exercises the happy path and
        ignores the behavior the test name claims to verify. Before committing any Claude-written
        tests to your repository, review each one for: Does it actually test the behavior
        described? Would it catch a real regression if someone removed the relevant code? If the
        answer to either question is no, the test is not a test — it is a false sense of
        security. This applies especially to tests Claude writes during the Green phase when you
        ask it to "add more test coverage."
      </WarningBlock>

      <BestPracticeBlock title="Tests Are the Sacred Spec">
        Commit your tests before asking Claude to implement. This creates an immutable
        specification anchored in git history. If during implementation Claude suggests changing
        a test to make it pass — for example, weakening an assertion or removing a case that
        "seems unnecessary" — reject it. You gave Claude the spec; the spec is sacred. Claude's
        job is to make the existing tests pass, not to redefine what passing means. The one
        exception: if a test is genuinely wrong (it encodes a requirement you misunderstood),
        you can change it — but do that consciously, with a separate commit and a clear comment
        explaining why the requirement changed. Never let Claude quietly weaken a test as a
        shortcut to green.
      </BestPracticeBlock>

      <NoteBlock type="tip">
        The best AI-TDD sessions start with boundary conditions first: empty input, maximum
        values, invalid types, concurrent writes, missing required fields. These edge cases
        constrain the implementation more tightly than happy-path tests and reveal assumptions
        Claude might otherwise make silently. A happy-path test for user creation tells Claude
        what to build. A test for duplicate email, a test for a 10,000-character name, and a
        test for a null password together tell Claude how to build it safely. Write the hard
        cases first, commit them, then let Claude implement.
      </NoteBlock>
    </div>
  )
}
