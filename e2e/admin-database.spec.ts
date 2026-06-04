import { expect, test } from "@playwright/test";

const testUserEmail = process.env.TEST_USER_EMAIL || "dr@keshevplus.co.il";
const testUserPassword = process.env.TEST_USER_PASSWORD || "12345678";
const changedPassword = process.env.TEST_CHANGED_PASSWORD || testUserPassword;

test("owner can view database-backed appointments and clients in admin", async ({ page, request }) => {
  const unique = Date.now();
  const clientName = `E2E Admin DB ${unique}`;
  const clientEmail = `e2e-admin-db-${unique}@example.com`;
  const clientPhone = "0552739927";
  const childName = `E2E Child ${unique}`;

  const response = await request.post("/api/appointments", {
    data: {
      clientName,
      clientEmail,
      clientPhone,
      childName,
      date: "2030-01-15",
      time: "10:00",
      type: "diagnosis",
      notes: "Created by E2E admin database smoke test",
    },
  });

  expect(response.ok()).toBeTruthy();

  await page.goto("/admin");
  await page.getByTestId("input-admin-email").fill(testUserEmail);
  await page.getByTestId("input-admin-password").fill(testUserPassword);
  await page.getByTestId("button-admin-login").click();

  const changePasswordPrompt = page.getByTestId("text-change-password-title");
  if (await changePasswordPrompt.isVisible().catch(() => false)) {
    await page.getByTestId("input-current-password").fill(testUserPassword);
    await page.getByTestId("input-new-password").fill(changedPassword);
    await page.getByTestId("input-confirm-password").fill(changedPassword);
    await page.getByTestId("button-change-password").click();
  }

  await expect(page.getByTestId("tab-appointments")).toBeVisible();
  await page.getByTestId("tab-appointments").click();
  await expect(page.getByText(clientName)).toBeVisible();
  await expect(page.getByText(clientEmail)).toBeVisible();
  await expect(page.getByText(clientPhone)).toBeVisible();
  await expect(page.getByText("10:00")).toBeVisible();

  await page.getByTestId("tab-clients").click();
  await expect(page.getByText(clientName)).toBeVisible();
  await expect(page.getByText(clientEmail)).toBeVisible();
});
