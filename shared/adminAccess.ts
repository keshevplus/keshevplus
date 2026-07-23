export const SUPERADMIN_EMAILS = [
  "dr@keshevplus.co.il",
  "office@keshevplus.co.il",
  "pluskeshev@gmail.com",
] as const;

export const OFFICE_PROTECTED_USER_EMAILS = [
  "dr@keshevplus.co.il",
  "office@keshevplus.co.il",
] as const;

export function normalizeAdminEmail(email: string | undefined | null): string {
  return (email || "").trim().toLowerCase();
}

export function isSuperadminEmail(email: string | undefined | null): boolean {
  return (SUPERADMIN_EMAILS as readonly string[]).includes(normalizeAdminEmail(email));
}

export function isOfficeProtectedUserEmail(email: string | undefined | null): boolean {
  return (OFFICE_PROTECTED_USER_EMAILS as readonly string[]).includes(normalizeAdminEmail(email));
}

export function hasPrivilegedAdminRole(role: string | undefined | null): boolean {
  return role === "admin" || role === "owner" || role === "manager" || role === "superadmin";
}

export function hasOwnerLevelAccess(user: { role?: string | null; email?: string | null } | undefined | null): boolean {
  if (!user) return false;
  return user.role === "owner" || user.role === "superadmin" || isSuperadminEmail(user.email);
}
