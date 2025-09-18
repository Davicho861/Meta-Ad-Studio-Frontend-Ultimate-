 
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility audits', () => {
  test('Homepage should have no critical/serious violations', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    const violations = (accessibilityScanResults.violations || []).filter(v => {
      return v.impact === 'critical' || v.impact === 'serious';
    });

    if (violations.length > 0) {
      // Attach details to test output for debugging
      console.error('A11y violations found:', JSON.stringify(violations, null, 2));
    }

    expect(violations.length).toBe(0);
  });

  test('Campaigns page should have no critical/serious violations', async ({ page }) => {
    await page.goto('/campaigns', { waitUntil: 'load' });
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    const violations = (accessibilityScanResults.violations || []).filter(v => {
      return v.impact === 'critical' || v.impact === 'serious';
    });

    if (violations.length > 0) {
      console.error('A11y violations found:', JSON.stringify(violations, null, 2));
    }

    expect(violations.length).toBe(0);
  });
});
