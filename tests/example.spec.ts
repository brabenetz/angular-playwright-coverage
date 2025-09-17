import { test, expect } from './_shared/app-fixtures';
import { TestUtils } from './_shared/test-utils';


test.beforeEach(async ({ page }) => {
  // TODO: Mock backend:
  //  await page.route(/\/my-backend\/my-service/, async (route) => {
  //    const json = TestUtils.readObjectFromFile('my-backend/my-service.json');
  //    await route.fulfill({ json, headers: { 'Content-Type': 'application/json' } });
  //  });

  // page should be optimized for ...
  await page.setViewportSize({ width: 800, height: 600 });
})

test('has title', async ({ page }) => {
  //  await page.coverage.startJSCoverage(); // Start V8 coverage

  await page.goto('http://localhost:4200/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/AngularPlaywrightCoverage/);
  await expect(page.getByRole('heading', { name: 'Hello, angular-playwright-' })).toContainText('Hello, angular-playwright-coverage');

  await TestUtils.makePageScreenshot(page, 'StartPage - Overview');
});
