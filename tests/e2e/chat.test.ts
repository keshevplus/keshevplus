import { test, expect } from '@playwright/test';

test('chat conversation creation and admin visibility', async ({ page }) => {
  // 1. Go to home page
  await page.goto('/');
  
  // 2. Open chat
  const chatButton = page.getByTestId('button-open-chat');
  await chatButton.click();
  
  // 3. Fill visitor info
  const testName = `Test User ${Date.now()}`;
  const testEmail = `test-${Date.now()}@example.com`;
  
  await page.getByTestId('input-chat-name').fill(testName);
  await page.getByTestId('input-chat-email').fill(testEmail);
  await page.getByTestId('button-start-chat').click();
  
  // 4. Send a message (this triggers conversation creation in DB)
  const testMessage = "Hello, this is a test message for admin verification.";
  await page.getByTestId('input-chat-message').fill(testMessage);
  await page.getByTestId('button-send-chat').click();
  
  // Wait for AI response
  await expect(page.getByTestId(/chat-message-assistant/)).toBeVisible({ timeout: 15000 });

  // 5. Login to Admin and check conversations
  await page.goto('/admin');
  
  // Fill login (assuming seed credentials)
  await page.getByPlaceholder(/Email/i).fill('admin@keshevplus.co.il');
  await page.getByPlaceholder(/Password/i).fill('admin123');
  await page.getByTestId('button-login').click();
  
  // Navigate to Conversations tab
  await page.getByRole('tab', { name: /Conversations/i }).click();
  
  // Verify our test conversation is there
  await expect(page.getByText(testName)).toBeVisible();
  await expect(page.getByText(testMessage)).toBeVisible();
});
