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
