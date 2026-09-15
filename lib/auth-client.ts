export function safeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\s\u0000-\u001f]/.test(value)) return "/account";
  try {
    const url = new URL(value, "https://local.invalid");
    return url.origin === "https://local.invalid" ? url.pathname + url.search + url.hash : "/account";
  } catch { return "/account"; }
}
