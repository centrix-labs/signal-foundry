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
// Microsoft OAuth path — they exist so the portal can be opened in environments
// where the Static Web Apps auth backend (/.auth/*) is not wired up. Override the
// expected hashes with VITE_LOCAL_EMAIL_HASH / VITE_LOCAL_PASSWORD_HASH.
const defaultLocalEmailHash = "b1b69df47ac427a5a69f213ee9ab71e8428280e1a47f6de008507cd5a411b73d";
const defaultLocalPasswordHash = "c6a8dc6fc183cbf6877c05f26fdd4f3117e4bd7ea6b77560922063b9053bd1f0";

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
