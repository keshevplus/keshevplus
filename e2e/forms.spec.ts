import { expect, test, type Page } from "@playwright/test";

const testDate = "2026-07-01";
const testTime = "09:00";

async function stubFormApis(page: Page) {
  await page.route("**/api/settings/widgets", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ showChat: true, showWhatsApp: false }),
    });
  });

  await page.route("**/api/appointments/availability**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        date: testDate,
        nextAvailableDate: testDate,
        availableTimes: [testTime, "10:00"],
      }),
    });
  });

  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ success: true, message: "Form submitted successfully" }),
    });
  });

  await page.route("**/api/appointments", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ success: true, appointment: { id: 9001 } }),
    });
  });

  await page.route("**/api/questionnaires/submit", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ success: true, questionnaire: { id: 9002 } }),
    });
  });

  await page.route("**/api/conversations", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ id: 9003 }),
    });
  });
}

async function selectByText(page: Page, triggerTestId: string, optionText: string | RegExp) {
  await page.getByTestId(triggerTestId).click();
  await page.getByRole("option", { name: optionText }).click();
}

async function answerVisibleQuestionnaireSection(page: Page) {
  const questionIds = await page
    .locator('[data-testid^="modal-question-"]')
    .evaluateAll((nodes) =>
      nodes
        .map((node) => node.getAttribute("data-testid")?.replace("modal-question-", ""))
        .filter(Boolean),
    );

  for (const id of questionIds) {
    await page.getByTestId(`modal-answer-${id}-1`).click();
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("kp_cookies_accepted", "true");
  });
  await stubFormApis(page);
});

test("contact modal validates required fields and submits", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("button-contact-cta").scrollIntoViewIfNeeded();
  await page.getByTestId("button-contact-cta").click();

  await page.getByTestId("button-modal-submit").click();
  await expect(page.getByText("Name must be at least 2 characters")).toBeVisible();

  await page.getByTestId("input-modal-name").fill("Form Tester");
  await page.getByTestId("input-modal-phone").fill("0551234567");
  await page.getByTestId("input-modal-email").fill("forms@example.com");
  await selectByText(page, "select-modal-topic", /diagnosis|אבחון/i);
  await page.getByTestId("input-modal-message").fill("This is a test contact message.");
  await page.getByTestId("button-modal-submit").click();

  await expect(page.getByTestId("button-close-success")).toBeVisible();
});

test("booking modal validates required fields and submits an appointment", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("button-nav-booking").click();
  await expect(page.getByTestId("booking-modal-content")).toBeVisible();

  await page.getByTestId("button-submit-booking").click();
  await expect(page.getByTestId("booking-modal-content")).toBeVisible();

  await page.getByTestId("input-booking-name").fill("Appointment Tester");
  await page.getByTestId("input-booking-phone").fill("0551234567");
  await page.getByTestId("input-booking-email").fill("appointment@example.com");
  await page.getByTestId("toggle-appointment-for-child").click();
  await page.getByTestId("input-booking-child-name").fill("Child Tester");
  await page.getByTestId("input-booking-child-age").fill("9");
  await page.getByTestId("input-booking-date").fill(testDate);
  await selectByText(page, "select-booking-time", testTime);
  await page.getByTestId("textarea-booking-notes").fill("Playwright appointment test.");
  await page.getByTestId("button-submit-booking").click();

  await expect(page.getByTestId("button-close-booking-success")).toBeVisible();
});

test("questionnaire modal validates registration and submits all answers", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("button-start-diagnosis").click();
  await page.getByTestId("button-fill-online-parent-form").click();
  await expect(page.getByTestId("questionnaire-modal-content")).toBeVisible();

  await page.getByTestId("button-modal-start-questionnaire").click();
  await expect(
    page.locator("p.text-destructive").filter({ hasText: /Full name is required|שם מלא הוא שדה חובה/ }),
  ).toBeVisible();

  await page.getByTestId("input-modal-respondent-name").fill("Questionnaire Tester");
  await page.getByTestId("input-modal-respondent-email").fill("questionnaire@example.com");
  await page.getByTestId("input-modal-respondent-phone").fill("0551234567");
  await page.getByTestId("input-modal-child-name").fill("Child Tester");
  await page.getByTestId("input-modal-child-age").fill("10");
  await page.getByTestId("button-modal-start-questionnaire").click();

  while (await page.getByTestId("button-modal-next-section").isVisible().catch(() => false)) {
    await answerVisibleQuestionnaireSection(page);
    await page.getByTestId("button-modal-next-section").click();
  }

  await answerVisibleQuestionnaireSection(page);
  await page.getByTestId("input-modal-notes").fill("Playwright questionnaire test.");
  await page.getByTestId("button-modal-submit-questionnaire").click();

  await expect(page.getByTestId("text-modal-success-title")).toBeVisible();
});

test("chat visitor form starts a conversation", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("button-open-chat").click();
  await page.getByTestId("input-chat-name").fill("Chat Tester");
  await page.getByTestId("input-chat-email").fill("chat@example.com");
  await page.getByTestId("input-chat-phone").fill("0551234567");
  await page.getByTestId("button-start-chat").click();

  await expect(page.getByTestId("input-chat-message")).toBeVisible();
});

test("admin auth forms validate login, forgot password, and reset password", async ({ page }) => {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: "{}" });
  });
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "Invalid credentials" }),
    });
  });
  await page.route("**/api/auth/forgot-password", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ message: "If the email exists, a reset link was sent." }),
    });
  });
  await page.route("**/api/auth/reset-password", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  await page.goto("/admin");
  await page.getByTestId("input-admin-email").fill("admin@example.com");
  await page.getByTestId("input-admin-password").fill("wrong-password");
  await page.getByTestId("button-admin-login").click();
  await expect(page.getByText("Invalid credentials")).toBeVisible();

  await page.getByTestId("button-forgot-password").click();
  await page.getByTestId("input-admin-email").fill("admin@example.com");
  await page.getByTestId("button-forgot-password-submit").click();
  await expect(page.getByText("If the email exists, a reset link was sent.")).toBeVisible();

  await page.goto("/admin/reset-password?email=admin@example.com&token=test-token");
  await page.getByTestId("input-admin-password").fill("new-password");
  await page.getByTestId("input-admin-confirm-password").fill("different-password");
  await page.getByTestId("button-reset-password-submit").click();
  await expect(page.getByText("Passwords do not match")).toBeVisible();

  await page.getByTestId("input-admin-confirm-password").fill("new-password");
  await page.getByTestId("button-reset-password-submit").click();
  await expect(page.getByText("Password updated. You can sign in now.")).toBeVisible();
});
