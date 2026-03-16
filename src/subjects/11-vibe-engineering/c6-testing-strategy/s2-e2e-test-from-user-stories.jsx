import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function E2ETestFromUserStories() {
  return (
    <article className="prose-content">
      <h1>E2E Tests From User Stories</h1>

      <p>
        End-to-end tests are the most expensive tests to write and maintain, but they catch
        a class of bugs that no unit or integration test can: the ones that only appear when
        a real browser drives a real application through a real user journey. They also serve
        as the most unambiguous verification that acceptance criteria are actually met — a
        Playwright test that logs in as a user, adds items to a cart, and completes a purchase
        is proof that the feature works in a way that a passing unit test is not.
      </p>

      <p>
        The challenge with E2E tests is that they are brittle, slow, and require a full
        running stack. AI assistance addresses the writing cost but not the running cost —
        which is why E2E tests in a Vibe Engineering workflow are targeted at user journeys
        that represent real business value, not at exercising every UI component.
      </p>

      <ConceptBlock title="Gherkin to Playwright: The Mapping">
        When you have BDD acceptance criteria written in Gherkin (Given/When/Then), Claude can
        directly translate them into Playwright tests. The Gherkin scenario is a natural-language
        specification of exactly what the E2E test should do. This translation is mechanical
        enough for Claude to do reliably, but it requires that the selectors, page structure,
        and test data setup are also provided — Claude cannot guess your application's DOM
        structure.
      </ConceptBlock>

      <SDKExample
        title="Gherkin to Playwright Test Generation"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'generate-e2e-from-gherkin.sh',
            code: `# Generate Playwright E2E tests from acceptance criteria
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
Run: npx playwright test tests/e2e/checkout.spec.ts"`,
          },
          {
            label: 'typescript',
            language: 'typescript',
            filename: 'tests/e2e/checkout.spec.ts (generated)',
            code: `import { test, expect } from '@playwright/test'
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
    await expect(page).toHaveURL(/\/order-confirmation\//)
    await expect(page.locator('[data-testid="order-confirmation-number"]')).toBeVisible()
    await expect(page.locator('[data-testid="order-confirmation-number"]')).toHaveText(/ORD-\d+/)
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
})`,
          },
        ]}
      />

      <h2>Visual Regression Testing</h2>

      <p>
        Visual regression tests capture screenshots of UI states and compare them against
        baselines, failing if pixels change unexpectedly. They catch a class of bugs that
        functional tests miss — layout shifts, color changes, hidden elements — particularly
        valuable for design system components that are shared across many features.
      </p>

      <SDKExample
        title="Visual Regression with Playwright"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'visual-regression.sh',
            code: `# Ask Claude to add visual regression to existing E2E tests
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
    mask: [page.locator('[data-testid=\"order-number\"]'),
           page.locator('[data-testid=\"order-date\"]')]
  })

Update baseline screenshots:
  npx playwright test --update-snapshots tests/e2e/checkout.spec.ts

Then run normally to compare:
  npx playwright test tests/e2e/checkout.spec.ts"`,
          },
        ]}
      />

      <h2>Maintaining E2E Tests as the UI Evolves</h2>

      <p>
        The hardest problem with E2E tests is maintenance. When selectors change, tests break.
        Claude can help keep tests in sync with the UI, but requires the right context.
      </p>

      <SDKExample
        title="Fixing Broken E2E Tests After UI Changes"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'fix-broken-e2e.sh',
            code: `# E2E tests broke after UI refactor — ask Claude to fix selectors
claude "Our E2E tests are failing after the checkout UI redesign.

Failing test output:
$(npx playwright test tests/e2e/checkout.spec.ts 2>&1 | grep -A5 'Error:')

The current page HTML for the checkout page is:
$(npx playwright codegen --target=html http://localhost:3000/checkout 2>/dev/null || \
  curl -s http://localhost:3000/checkout | grep 'data-testid')

For each failing selector:
1. Find the new data-testid attribute in the current HTML
2. If data-testid is missing, identify the best stable selector (prefer: data-testid > id > role > text)
3. Update the selector in the test file
4. If a new data-testid needs to be added to the component, add it to both the component and test

Run: npx playwright test tests/e2e/checkout.spec.ts after each fix
All tests must pass before stopping."`,
          },
        ]}
      />

      <WarningBlock title="E2E Tests Are Not Unit Tests — Don't Write Hundreds">
        E2E tests should cover critical user journeys, not every UI state. A test suite
        with 500 E2E tests will take 40 minutes to run, be constantly broken by UI changes,
        and provide diminishing returns over a well-structured unit and integration test suite.
        Aim for 20-50 E2E tests that cover the journeys that matter most to the business:
        registration, authentication, primary purchase flow, critical admin workflows. Ask
        Claude to identify which user stories represent critical paths before generating
        E2E tests for them.
      </WarningBlock>

      <BestPracticeBlock title="Use data-testid Attributes as Test Contracts">
        Add <code>data-testid</code> attributes to UI components as part of your development
        standard, not as an afterthought when tests break. Include in CLAUDE.md: "Every
        interactive UI element and data display that E2E tests reference must have a
        data-testid attribute. data-testid values are a public API — they must not be changed
        without updating the corresponding tests." This makes E2E selectors stable and
        makes the relationship between UI and tests explicit.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Playwright Test Generator as Starting Point">
        Use Playwright's built-in test generator to capture user interactions as a starting
        point: <code>npx playwright codegen http://localhost:3000/checkout</code>. This
        generates a raw Playwright script that records your clicks and inputs. Then ask
        Claude: "Refactor this generated Playwright script into a proper test with fixtures,
        assertions for all acceptance criteria, and error state coverage." This is faster
        than writing tests from scratch when you don't have Gherkin scenarios available.
      </NoteBlock>
    </article>
  )
}
