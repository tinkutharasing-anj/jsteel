const { test, expect } = require('@playwright/test');

test.describe('Simple Welding App Test', () => {
  test('should load the app and show tabs', async ({ page }) => {
    await page.goto('/');
    
    // Check if main tabs are visible
    await expect(page.getByRole('tab', { name: 'Welds' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Settings' })).toBeVisible();
    
    // Verify we're on the Welds tab by default
    await expect(page.getByText('Loading welds...')).toBeVisible();
  });

  test('should navigate to settings', async ({ page }) => {
    await page.goto('/');
    
    // Click on Settings tab
    await page.getByRole('tab', { name: 'Settings' }).click();
    
    // Should show settings options
    await expect(page.getByText('Field Management')).toBeVisible();
    await expect(page.getByText('Import/Export')).toBeVisible();
  });
});


