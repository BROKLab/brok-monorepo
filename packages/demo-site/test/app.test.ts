import { test, expect } from '@playwright/test'

test('should see home page and title', async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto('http://localhost:3000/')
  // Find an element with the text 'About Page' and click on it
  // The new url should be "/about" (baseURL is used there)
  await expect(page).toHaveURL('http://localhost:3000')
  // The new page should contain an h1 with "About Page"
  await expect(page.locator('title')).toContainText('BRØK')
})