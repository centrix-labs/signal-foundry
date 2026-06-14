export type StaticWebAppUser = {
  identityProvider: string;
  userDetails: string;
  userId: string;
  userRoles: string[];
};

type AuthResponse = {
  clientPrincipal: StaticWebAppUser | null;
};

export function microsoftSignInUrl() {
  const redirect = encodeURIComponent(`${window.location.origin}/`);
  return `/.auth/login/aad?post_login_redirect_uri=${redirect}`;
}

export function signOutUrl() {
  const redirect = encodeURIComponent(`${window.location.origin}/`);
  return `/.auth/logout?post_logout_redirect_uri=${redirect}`;
}

export async function getStaticWebAppUser() {
  try {
    const response = await fetch("/.auth/me", {
      cache: "no-store",
      credentials: "include"
    });

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as AuthResponse;
    return body.clientPrincipal;
  } catch {
    return null;
  }
}

// Local demo credentials. These run entirely client-side and do not replace the
// Microsoft OAuth path — they exist so the portal can be opened without the
// tenant, in environments where the Static Web Apps auth backend (/.auth/*) is
// not wired up. The credential presents as a real returning operator:
//   alex.kim@asteriadynamics.com / signal-foundry-2026
// (synthetic demo tenant; the credential is intentionally public for reviewers).
// Override the expected hashes with VITE_LOCAL_EMAIL_HASH / VITE_LOCAL_PASSWORD_HASH.
const defaultLocalEmailHash = "033408acfa40c3fbddc8e4555f630f47e4b1590d888ea967b368c54d6587954c";
const defaultLocalPasswordHash = "f6f2e1574897c605ffc911863760323f7198e6335b0343e7f08e75383b2dc77b";

const localEmailHash = ((import.meta.env["VITE_LOCAL_EMAIL_HASH"] as string | undefined) ?? defaultLocalEmailHash).trim();
const localPasswordHash = ((import.meta.env["VITE_LOCAL_PASSWORD_HASH"] as string | undefined) ?? defaultLocalPasswordHash).trim();

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value.trim());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyLocalCredentials(email: string, password: string): Promise<StaticWebAppUser | null> {
  const [emailHash, passwordHash] = await Promise.all([sha256(email.toLowerCase()), sha256(password)]);
  if (emailHash !== localEmailHash || passwordHash !== localPasswordHash) {
    return null;
  }
  return {
    identityProvider: "local",
    userDetails: email.trim(),
    userId: "local-demo",
    userRoles: ["authenticated", "reviewer"]
  };
}
