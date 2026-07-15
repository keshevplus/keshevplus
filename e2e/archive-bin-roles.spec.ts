import { expect, test, type Page } from "@playwright/test";

const ownerEmail = process.env.TEST_USER_EMAIL || "dr@keshevplus.co.il";
const ownerPassword = process.env.TEST_USER_PASSWORD || "12345678";
const unique = Date.now();
const managerEmail = `e2e-manager-${unique}@example.com`;
const managerTempPassword = "TempPass123";
const managerRealPassword = "ManagerPass456";

async function loginAndHandleForcedChange(page: Page, email: string, password: string, newPassword?: string) {
  await page.goto("/admin");
  await page.getByTestId("input-admin-email").fill(email);
  await page.getByTestId("input-admin-password").fill(password);
  await page.getByTestId("button-admin-login").click();

  const changePasswordPrompt = page.getByTestId("text-change-password-title");
  if (await changePasswordPrompt.isVisible({ timeout: 5000 }).catch(() => false)) {
    const finalPassword = newPassword || password;
    await page.getByTestId("input-current-password").fill(password);
    await page.getByTestId("input-new-password").fill(finalPassword);
    await page.getByTestId("input-confirm-password").fill(finalPassword);
    await page.getByTestId("button-change-password").click();
  }

  await expect(page.getByTestId("button-signout")).toBeVisible({ timeout: 15000 });
}

async function signOut(page: Page) {
  await page.getByTestId("button-signout").click();
  await expect(page.getByTestId("input-admin-email")).toBeVisible({ timeout: 15000 });
}

test.describe.serial("role-based archive, recycle bin, and mark-as-test", () => {
  let appointmentAId: number;
  let appointmentBId: number;

  test("owner creates a manager account via the Users panel", async ({ page }) => {
    await loginAndHandleForcedChange(page, ownerEmail, ownerPassword);

    await expect(page.getByTestId("tab-users")).toBeVisible();
    await page.getByTestId("tab-users").click();

    await page.getByTestId("input-new-user-email").fill(managerEmail);
    await page.getByTestId("input-new-user-password").fill(managerTempPassword);
    await page.getByTestId("select-new-user-role").click();
    await page.getByTestId("option-role-manager").click();
    await page.getByTestId("button-add-user").click();

    await expect(page.getByText(managerEmail)).toBeVisible({ timeout: 10000 });

    await signOut(page);
  });

  test("manager cannot see owner-only Users or Bin tabs, or call their APIs directly", async ({ page, request }) => {
    await loginAndHandleForcedChange(page, managerEmail, managerTempPassword, managerRealPassword);

    await expect(page.getByTestId("tab-users")).toHaveCount(0);
    await expect(page.getByTestId("tab-bin")).toHaveCount(0);

    const usersRes = await page.request.get("/api/admin/users");
    expect(usersRes.status()).toBe(403);

    const binRes = await page.request.get("/api/admin/bin");
    expect(binRes.status()).toBe(403);

    await signOut(page);
  });

  test("manager delete archives the item instead of destroying it", async ({ page, request }) => {
    // Create two appointments as the "public" booking flow would.
    const availabilityResponse = await request.get("/api/appointments/availability");
    expect(availabilityResponse.ok()).toBeTruthy();
    const availability = await availabilityResponse.json();
    const date = availability.nextAvailableDate || availability.date;
    const time = availability.availableTimes?.[0];

    const createA = await request.post("/api/appointments", {
      data: {
        clientName: `E2E Archive Target ${unique}`,
        clientEmail: `e2e-archive-${unique}@example.com`,
        clientPhone: `055${String(unique).slice(-7)}`,
        date,
        time,
        type: "diagnosis",
        appointmentFor: "self",
        notes: "E2E: should be archived by manager delete",
      },
    });
    expect(createA.ok()).toBeTruthy();
    appointmentAId = (await createA.json()).appointment.id;

    const createB = await request.post("/api/appointments", {
      data: {
        clientName: `E2E Test-Mark Target ${unique}`,
        clientEmail: `e2e-testmark-${unique}@example.com`,
        clientPhone: `055${String(unique).slice(-6)}9`,
        date,
        time,
        type: "diagnosis",
        appointmentFor: "self",
        notes: "E2E: should be hidden by manager mark-as-test",
      },
    });
    expect(createB.ok()).toBeTruthy();
    appointmentBId = (await createB.json()).appointment.id;

    await loginAndHandleForcedChange(page, managerEmail, managerRealPassword);
    await page.getByTestId("tab-appointments").click();

    // Manager deletes appointment A -> archived, not destroyed.
    await expect(page.getByTestId(`appointment-${appointmentAId}`)).toBeVisible();
    await page.getByTestId(`button-delete-appt-${appointmentAId}`).click();
    page.once("dialog", (dialog) => dialog.accept());
    await expect(page.getByTestId(`appointment-${appointmentAId}`)).toHaveCount(0, { timeout: 10000 });

    // Manager marks appointment B as test -> also hidden from the normal list.
    await expect(page.getByTestId(`appointment-${appointmentBId}`)).toBeVisible();
    await page.getByTestId(`button-mark-test-appt-${appointmentBId}`).click();
    await expect(page.getByTestId(`appointment-${appointmentBId}`)).toHaveCount(0, { timeout: 10000 });

    // The manager's own list confirms both are gone (soft-hidden), not visible via the API either.
    const listRes = await page.request.get("/api/appointments");
    const list = await listRes.json();
    expect(list.find((a: any) => a.id === appointmentAId)).toBeUndefined();
    expect(list.find((a: any) => a.id === appointmentBId)).toBeUndefined();

    await signOut(page);
  });

  test("owner sees both hidden items in the recycle bin and can restore or permanently delete them", async ({ page }) => {
    await loginAndHandleForcedChange(page, ownerEmail, ownerPassword);
    await page.getByTestId("tab-bin").click();

    const archivedRow = page.getByTestId(`row-bin-appointment-${appointmentAId}`);
    const testMarkedRow = page.getByTestId(`row-bin-appointment-${appointmentBId}`);
    await expect(archivedRow).toBeVisible({ timeout: 10000 });
    await expect(testMarkedRow).toBeVisible();

    // Restore the archived one -> should reappear in the normal Appointments list.
    await page.getByTestId(`button-restore-appointment-${appointmentAId}`).click();
    await expect(archivedRow).toHaveCount(0, { timeout: 10000 });

    await page.getByTestId("tab-appointments").click();
    await expect(page.getByTestId(`appointment-${appointmentAId}`)).toBeVisible({ timeout: 10000 });

    // Permanently delete the test-marked one -> gone from the bin for good.
    await page.getByTestId("tab-bin").click();
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByTestId(`button-permanent-delete-appointment-${appointmentBId}`).click();
    await expect(testMarkedRow).toHaveCount(0, { timeout: 10000 });

    const binRes = await page.request.get("/api/admin/bin");
    const binItems = await binRes.json();
    expect(binItems.find((i: any) => i.type === "appointment" && i.id === appointmentBId)).toBeUndefined();

    await signOut(page);
  });

  test("owner deletes are immediate and permanent, bypassing the bin", async ({ page, request }) => {
    const availabilityResponse = await request.get("/api/appointments/availability");
    const availability = await availabilityResponse.json();
    const create = await request.post("/api/appointments", {
      data: {
        clientName: `E2E Owner Hard Delete ${unique}`,
        clientEmail: `e2e-hard-delete-${unique}@example.com`,
        clientPhone: `054${String(unique).slice(-7)}`,
        date: availability.nextAvailableDate || availability.date,
        time: availability.availableTimes?.[0],
        type: "diagnosis",
        appointmentFor: "self",
        notes: "E2E: owner hard delete should skip the bin entirely",
      },
    });
    expect(create.ok()).toBeTruthy();
    const ownerDeleteId = (await create.json()).appointment.id;

    await loginAndHandleForcedChange(page, ownerEmail, ownerPassword);
    await page.getByTestId("tab-appointments").click();
    await expect(page.getByTestId(`appointment-${ownerDeleteId}`)).toBeVisible();
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByTestId(`button-delete-appt-${ownerDeleteId}`).click();
    await expect(page.getByTestId(`appointment-${ownerDeleteId}`)).toHaveCount(0, { timeout: 10000 });

    await page.getByTestId("tab-bin").click();
    await expect(page.getByTestId(`row-bin-appointment-${ownerDeleteId}`)).toHaveCount(0);

    // Cleanup: remove the manager test account.
    await page.getByTestId("tab-users").click();
    const usersRes = await page.request.get("/api/admin/users");
    const users = await usersRes.json();
    const managerUser = users.find((u: any) => u.email === managerEmail);
    if (managerUser) {
      await page.request.delete(`/api/admin/users/${managerUser.id}`);
    }

    await signOut(page);
  });
});
