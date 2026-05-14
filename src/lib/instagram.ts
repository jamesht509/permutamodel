// Instagram handle helpers.
// Accepts: "@username", "username", "user.name", "user_123".
// Persists without the leading "@" so the DB has one canonical form.
// Display via formatHandle() always prefixes "@" for the UI.

export const INSTAGRAM_REGEX = /^@?[\w.]{1,30}$/;

export function isValidHandle(value: string): boolean {
  return INSTAGRAM_REGEX.test(value.trim());
}

/** Strip leading "@" and trim — what we store. */
export function normalizeHandle(value: string): string {
  return value.trim().replace(/^@/, "");
}

/** Display form: always "@handle". Returns "" for empty input. */
export function formatHandle(handle: string | null | undefined): string {
  const v = (handle ?? "").trim();
  if (!v) return "";
  return v.startsWith("@") ? v : `@${v}`;
}
