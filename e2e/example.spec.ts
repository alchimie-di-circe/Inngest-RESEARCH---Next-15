import { test, expect } from '@playwright/test'

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/')
  expect(page).toHaveTitle(/.*/)
})

test('navigation works', async ({ page }) => {
  await page.goto('/')
  // Add your navigation tests here
  expect(page).toBeTruthy()
})
