import "server-only";
import { sessionIdentity, SESSION_COOKIE } from "./auth";
export async function getAdminEmailFromCookies(cookies: { get(name: string): { value?: string } | undefined }) {
  const identity = await sessionIdentity(cookies.get(SESSION_COOKIE)?.value);
  return identity?.admin ? identity.user.email : null;
}
