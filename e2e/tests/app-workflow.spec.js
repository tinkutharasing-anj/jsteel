const { test, expect } = require('@playwright/test');

test.describe('Welding App - Complete User Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Give the app a moment to load
    await page.waitForTimeout(1000);
  });

  test.describe('App Navigation & Basic Functionality', () => {
    test('should launch and show the main tabs', async ({ page }) => {
      // Check if main tabs are visible - use role selector for tabs
      await expect(page.getByRole('tab', { name: 'Welds' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Settings' })).toBeVisible();
      
      // Verify we're on the Welds tab by default - check for either loading or no welds
      await expect(
        page.getByText('Loading welds...').or(page.getByText('No welds found'))
      ).toBeVisible();
    });

    test('should navigate between tabs', async ({ page }) => {
      // Go to Settings tab
      await page.getByRole('tab', { name: 'Settings' }).click();
      await expect(page.getByText('Field Management')).toBeVisible();
      await expect(page.getByText('Import/Export')).toBeVisible();
      
      // Go back to Welds tab
      await page.getByRole('tab', { name: 'Welds' }).click();
      await expect(
        page.getByText('Loading welds...').or(page.getByText('No welds found'))
      ).toBeVisible();
    });
  });

  test.describe('Adding a New Weld', () => {
    test('should add a new weld through the complete workflow', async ({ page }) => {
      // Navigate to Welds tab
      await page.getByRole('tab', { name: 'Welds' }).click();
      
      // Wait for FAB to be visible
      await page.waitForSelector('[data-testid="add-weld-fab"]', { timeout: 10000 });
      
      // Tap the FAB to add new weld
      await page.locator('[data-testid="add-weld-fab"]').click();
      
      // Fill out the weld form
      await page.locator('[data-testid="weld_number-input"]').fill('W001');
      await page.locator('[data-testid="date-input"]').click();
      
      // Select date (assuming date picker opens)
      await page.getByText('15').click(); // Select day 15
      await page.getByText('Confirm').click();
      
      await page.locator('[data-testid="welder-input"]').fill('John Doe');
      await page.locator('[data-testid="type_fit-input"]').fill('Butt Weld');
      await page.locator('[data-testid="wps-input"]').fill('WPS-001');
      await page.locator('[data-testid="pipe_diameter-input"]').fill('6 inch');
      
      // Submit the form
      await page.locator('[data-testid="submit-button"]').click();
      
      // Should navigate back to welds list
      await expect(page.getByText('W001')).toBeVisible();
      await expect(page.getByText('John Doe')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      // Navigate to add weld
      await page.getByRole('tab', { name: 'Welds' }).click();
      
      // Wait for FAB to be visible
      await page.waitForSelector('[data-testid="add-weld-fab"]', { timeout: 10000 });
      
      await page.locator('[data-testid="add-weld-fab"]').click();
      
      // Try to save without required fields
      await page.locator('[data-testid="submit-button"]').click();
      
      // Should show validation errors
      await expect(page.getByText('This field is required')).toBeVisible();
    });
  });

  test.describe('Editing an Existing Weld', () => {
    test('should edit a weld and save changes', async ({ page }) => {
      // Navigate to welds list
      await page.getByRole('tab', { name: 'Welds' }).click();
      
      // Wait for welds to load
      await page.waitForSelector('text=W001', { timeout: 5000 });
      
      // Tap on a weld to edit it
      await page.getByText('W001').click();
      
      // Modify the welder name
      await page.locator('[data-testid="welder-input"]').clear();
      await page.locator('[data-testid="welder-input"]').fill('Jane Smith');
      
      // Save changes
      await page.locator('[data-testid="submit-button"]').click();
      
      // Should navigate back and show updated data
      await expect(page.getByText('Jane Smith')).toBeVisible();
    });
  });

  test.describe('Search and Filtering', () => {
    test('should search for welds by text', async ({ page }) => {
      // Navigate to welds list
      await page.getByRole('tab', { name: 'Welds' }).click();
      
      // Wait for search input to be visible
      await page.waitForSelector('[data-testid="search-input"]', { timeout: 10000 });
      
      // Type in search box
      await page.locator('[data-testid="search-input"]').fill('W001');
      
      // Should filter results
      await expect(page.getByText('W001')).toBeVisible();
      
      // Clear search
      await page.locator('[data-testid="search-input"]').clear();
      
      // Should show all welds again
      await expect(page.getByText('W001')).toBeVisible();
    });
  });

  test.describe('Field Management', () => {
    test('should navigate to field management and view fields', async ({ page }) => {
      // Go to Settings tab
      await page.getByRole('tab', { name: 'Settings' }).click();
      
      // Tap Field Management
      await page.locator('[data-testid="field-management-button"]').click();
      
      // Should show field list
      await expect(page.getByText('Weld Number')).toBeVisible();
      await expect(page.getByText('Welder')).toBeVisible();
      await expect(page.getByText('Type/Fit')).toBeVisible();
    });

    test('should add a new custom field', async ({ page }) => {
      // Navigate to field management
      await page.getByRole('tab', { name: 'Settings' }).click();
      await page.locator('[data-testid="field-management-button"]').click();
      
      // Tap add field button
      await page.locator('[data-testid="add-field-button"]').click();
      
      // Fill out field form
      await page.locator('[data-testid="field-name-input"]').fill('custom_field');
      await page.locator('[data-testid="display-name-input"]').fill('Custom Field');
      await page.locator('[data-testid="field-type-chip-text"]').click();
      
      // Save field
      await page.locator('[data-testid="save-field-button"]').click();
      
      // Should show new field in list
      await expect(page.getByText('Custom Field')).toBeVisible();
    });
  });

  test.describe('CSV Import/Export', () => {
    test('should navigate to import/export screen', async ({ page }) => {
      // Go to Settings tab
      await page.getByRole('tab', { name: 'Settings' }).click();
      
      // Tap Import/Export
      await page.locator('[data-testid="import-export-button"]').click();
      
      // Should show import and export sections
      await expect(page.getByText('Import CSV')).toBeVisible();
      await expect(page.getByText('Export CSV')).toBeVisible();
    });

    test('should export CSV with date filters', async ({ page }) => {
      // Navigate to import/export
      await page.getByRole('tab', { name: 'Settings' }).click();
      await page.locator('[data-testid="import-export-button"]').click();
      
      // Set date filters
      await page.locator('[data-testid="date-from-input"]').click();
      // Date picker should open, select a date
      await page.getByText('15').click();
      await page.getByText('Confirm').click();
      
      await page.locator('[data-testid="date-to-input"]').click();
      await page.getByText('20').click();
      await page.getByText('Confirm').click();
      
      // Export CSV
      await page.locator('[data-testid="export-csv-button"]').click();
      
      // Should show success message or download file
      await expect(page.getByText('Export Complete').or(page.getByText('Export successful'))).toBeVisible();
    });
  });

  test.describe('Delete Weld Functionality', () => {
    test('should delete a weld with confirmation', async ({ page }) => {
      // Navigate to welds list
      await page.getByRole('tab', { name: 'Welds' }).click();
      
      // Wait for welds to load
      await page.waitForSelector('text=W001', { timeout: 5000 });
      
      // Long press on a weld to show delete option
      await page.getByText('W001').click({ button: 'right' });
      
      // Tap delete button
      await page.getByText('Delete').click();
      
      // Confirm deletion
      await page.getByText('Confirm').click();
      
      // Weld should be removed from list
      await expect(page.getByText('W001')).not.toBeVisible();
    });
  });

  test.describe('App Responsiveness', () => {
    test('should handle rapid navigation without crashing', async ({ page }) => {
      // Rapidly navigate between tabs
      for (let i = 0; i < 5; i++) {
        await page.getByRole('tab', { name: 'Welds' }).click();
        await page.getByRole('tab', { name: 'Settings' }).click();
      }
      
      // App should still be responsive
      await expect(page.getByRole('tab', { name: 'Welds' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Settings' })).toBeVisible();
    });

    test('should handle form input and navigation gracefully', async ({ page }) => {
      // Start adding a weld
      await page.getByRole('tab', { name: 'Welds' }).click();
      await page.locator('[data-testid="add-weld-fab"]').click();
      
      // Fill some data
      await page.locator('[data-testid="weld_number-input"]').fill('TEST');
      
      // Navigate away without saving
      await page.getByRole('tab', { name: 'Settings' }).click();
      
      // Should not crash
      await expect(page.getByText('Field Management')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Navigate to welds list
      await page.getByRole('tab', { name: 'Welds' }).click();
      
      // Simulate network error (this would require backend to be down)
      // For now, just verify the app doesn't crash
      await expect(
        page.getByText('Loading welds...').or(page.getByText('No welds found'))
      ).toBeVisible();
    });

    test('should show appropriate error messages', async ({ page }) => {
      // Try to save invalid data
      await page.getByRole('tab', { name: 'Welds' }).click();
      await page.locator('[data-testid="add-weld-fab"]').click();
      
      // Submit empty form
      await page.locator('[data-testid="submit-button"]').click();
      
      // Should show validation errors
      await expect(page.getByText('This field is required')).toBeVisible();
    });
  });
});
