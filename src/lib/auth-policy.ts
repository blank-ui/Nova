export function canOpenAdmin(role: string | null | undefined, twoFactorEnabled?: boolean | null | undefined) {
  void twoFactorEnabled;
  return role === "ADMIN";
}

export function canOpenAdminSecurity(role: string | null | undefined) {
  return role === "ADMIN";
}

export function canOpenDeveloper(role: string | null | undefined) {
  return role === "DEVELOPER" || role === "ADMIN";
}

export function canOpenFinance(role: string | null | undefined) {
  return role === "FINANCE" || role === "ADMIN";
}

export function canOpenClientResource(role: string | null | undefined, sessionUserId: string | undefined, ownerId: string | undefined) {
  if (role === "ADMIN") return true;
  return role === "CLIENT" && Boolean(sessionUserId) && sessionUserId === ownerId;
}
