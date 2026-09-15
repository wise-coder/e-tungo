/** Accept local or international Rwanda mobile numbers and store E.164. */
export function normalizeRwandaMobile(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const compact = value.trim().replace(/[\s().-]/g, "");
  if (/^07\d{8}$/.test(compact)) return `+250${compact.slice(1)}`;
  if (/^(?:\+250|250)7\d{8}$/.test(compact)) return `+250${compact.replace(/^\+?250/, "")}`;
  return null;
}
