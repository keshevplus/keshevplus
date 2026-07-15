import { expect, test } from "@playwright/test";

const ownerEmail = process.env.TEST_USER_EMAIL || "dr@keshevplus.co.il";
const ownerPassword = process.env.TEST_USER_PASSWORD || "12345678";
const unique = Date.now();
const disposableEmail = `e2e-pwtest-${unique}@example.com`;
const disposableTempPassword = "TempPass321";
const disposableNewPassword = "RoundTripPass789";

test("login form's eye icon toggles password visibility", async ({ page }) => {
  await page.goto("/admin");
  const passwordInput = page.getByTestId("input-admin-password");
  await passwordInput.fill("some-password");

  await expect(passwordInput).toHaveAttribute("type", "password");
  await page.getByTestId("button-toggle-admin-password").click();
  await expect(passwordInput).toHaveAttribute("type", "text");
  await page.getByTestId("button-toggle-admin-password").click();
  await expect(passwordInput).toHaveAttribute("type", "password");
});

// Uses a disposable manager-role account created and torn down within the test,
// rather than the shared owner account, so this can run in parallel with other
// spec files that also log in as the owner without racing on its password.
test("a user can change their own password from the Settings tab and log in with the new one", async ({ page }) => {
  await page.goto("/admin");
  await page.getByTestId("input-admin-email").fill(ownerEmail);
  await page.getByTestId("input-admin-password").fill(ownerPassword);
  await page.getByTestId("button-admin-login").click();

  const changePasswordPrompt = page.getByTestId("text-change-password-title");
  const signOutButton = page.getByTestId("button-signout");
  // isVisible() alone doesn't wait/retry, so we'd race the post-login render here without this.
  await expect(changePasswordPrompt.or(signOutButton)).toBeVisible({ timeout: 15000 });

  if (await changePasswordPrompt.isVisible()) {
    await page.getByTestId("input-current-password").fill(ownerPassword);
    await page.getByTestId("input-new-password").fill(ownerPassword);
    await page.getByTestId("input-confirm-password").fill(ownerPassword);
    await page.getByTestId("button-change-password").click();
  }
  await expect(signOutButton).toBeVisible({ timeout: 15000 });

  await page.getByTestId("tab-users").click();
  await page.getByTestId("input-new-user-email").fill(disposableEmail);
  await page.getByTestId("input-new-user-password").fill(disposableTempPassword);
  await page.getByTestId("select-new-user-role").click();
  await page.getByTestId("option-role-manager").click();
  await page.getByTestId("button-add-user").click();
  await expect(page.getByText(disposableEmail)).toBeVisible({ timeout: 10000 });

  await page.getByTestId("button-signout").click();
  await expect(page.getByTestId("input-admin-email")).toBeVisible({ timeout: 15000 });

  // Log in as the disposable account and complete its forced first-login password change.
  await page.getByTestId("input-admin-email").fill(disposableEmail);
  await page.getByTestId("input-admin-password").fill(disposableTempPassword);
  await page.getByTestId("button-admin-login").click();
  await expect(page.getByTestId("text-change-password-title")).toBeVisible({ timeout: 15000 });
  await page.getByTestId("input-current-password").fill(disposableTempPassword);
  await page.getByTestId("input-new-password").fill(disposableTempPassword);
  await page.getByTestId("input-confirm-password").fill(disposableTempPassword);
  await page.getByTestId("button-change-password").click();
  await expect(page.getByTestId("button-signout")).toBeVisible({ timeout: 15000 });

  // Now exercise the voluntary Settings > Change Password flow.
  await page.getByTestId("tab-settings").click();
  await page.getByTestId("input-settings-current-password").fill(disposableTempPassword);
  await page.getByTestId("input-settings-new-password").fill(disposableNewPassword);
  await page.getByTestId("input-settings-confirm-password").fill(disposableNewPassword);
  await page.getByTestId("button-settings-change-password").click();
  await expect(page.getByTestId("text-settings-password-success")).toBeVisible({ timeout: 10000 });

  await page.getByTestId("button-signout").click();
  await expect(page.getByTestId("input-admin-email")).toBeVisible({ timeout: 15000 });

  // Log back in with the new password to prove the change actually took effect.
  await page.getByTestId("input-admin-email").fill(disposableEmail);
  await page.getByTestId("input-admin-password").fill(disposableNewPassword);
  await page.getByTestId("button-admin-login").click();
  await expect(page.getByTestId("button-signout")).toBeVisible({ timeout: 15000 });
  await page.getByTestId("button-signout").click();
  await expect(page.getByTestId("input-admin-email")).toBeVisible({ timeout: 15000 });

  // Cleanup: owner removes the disposable account.
  await page.getByTestId("input-admin-email").fill(ownerEmail);
  await page.getByTestId("input-admin-password").fill(ownerPassword);
  await page.getByTestId("button-admin-login").click();
  await expect(page.getByTestId("button-signout")).toBeVisible({ timeout: 15000 });
  const usersRes = await page.request.get("/api/admin/users");
  const users = await usersRes.json();
  const disposableUser = users.find((u: any) => u.email === disposableEmail);
  if (disposableUser) {
    await page.request.delete(`/api/admin/users/${disposableUser.id}`);
  }
});
