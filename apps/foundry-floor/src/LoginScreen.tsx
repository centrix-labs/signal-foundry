import { useState } from "react";
import { ChevronRight, Lock, Mail, Rocket, ShieldCheck } from "lucide-react";
import { microsoftSignInUrl, verifyLocalCredentials, type StaticWebAppUser } from "./auth";

type LoginScreenProps = {
  isCheckingAuth?: boolean;
  onLocalLogin?: (user: StaticWebAppUser) => void;
};

// Demo credential, pre-filled so the portal opens in one click and reads as a
// real returning operator session. Synthetic tenant; matches the default hashes
// in auth.ts. Documented for reviewers in JUDGE-GUIDE.md / README.md.
const DEMO_EMAIL = "alex.kim@asteriadynamics.com";
const DEMO_PASSWORD = "signal-foundry-2026";

function MicrosoftMark() {
  return (
    <span className="microsoft-mark" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

function showMicrosoftMark() {
  const envValue = import.meta.env["VITE_SHOW_MICROSOFT_MARK"] as string | undefined;
  if (envValue?.toLowerCase() === "false") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("hideMicrosoftLogo") !== "1";
}

function SignalMark() {
  return (
    <span className="login-mark" aria-hidden="true">
      <svg viewBox="0 0 40 40" width="34" height="34" role="img" aria-label="Signal Foundry">
        <path
          d="M6 20 H12 l2.6 -7 4.2 13 3.1 -8.4 2.1 2.4 H30"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="29" cy="20" r="3.6" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="29" cy="20" r="1.3" fill="currentColor" />
      </svg>
    </span>
  );
}

export function LoginScreen({ isCheckingAuth = false, onLocalLogin }: LoginScreenProps) {
  const signInUrl = microsoftSignInUrl();
  const includeMicrosoftMark = showMicrosoftMark();
  const [email, setEmail] = useState(onLocalLogin ? DEMO_EMAIL : "");
  const [password, setPassword] = useState(onLocalLogin ? DEMO_PASSWORD : "");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  async function submitLocalLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // No local handler wired up (e.g. production) — fall back to Microsoft OAuth.
    if (!onLocalLogin) {
      window.location.assign(signInUrl);
      return;
    }
    setIsVerifying(true);
    setError("");
    const user = await verifyLocalCredentials(email, password);
    setIsVerifying(false);
    if (user) {
      onLocalLogin(user);
      return;
    }
    setPassword("");
    setError("Email or password not recognized.");
  }

  return (
    <main className="login-page login-light">
      <div className="login-backplate" aria-hidden="true" />
      <div className="login-vignette" aria-hidden="true" />

      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand">
          <SignalMark />
          <h1 id="login-title">Signal Foundry</h1>
        </div>
        <p className="login-tagline"><strong>Forge summary signals.</strong> Build trusted intelligence.</p>

        <form className="login-form" onSubmit={submitLocalLogin}>
          <label className="login-field">
            <span>Email</span>
            <span className="login-input">
              <Mail size={16} />
              <input
                type="email"
                autoComplete="email"
                placeholder="you@asteria.example"
                aria-label="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </span>
          </label>

          <label className="login-field">
            <span>Password</span>
            <span className="login-input">
              <Lock size={16} />
              <input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••••••"
                aria-label="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </span>
          </label>

          {error ? <p className="access-error" role="alert">{error}</p> : null}

          <div className="login-options">
            <label className="remember-row">
              <input type="checkbox" defaultChecked />
              <span>
                Remember me
                <small>Secure session on this device</small>
              </span>
            </label>
            <span className="login-hint">Use SSO below</span>
          </div>

          <button type="submit" className="login-primary" disabled={isVerifying}>
            <Rocket size={17} />
            {isVerifying ? "Signing in" : isCheckingAuth ? "Checking Microsoft session" : "Launch Console"}
            <ChevronRight size={18} />
          </button>
        </form>

        <div className="login-divider"><span>OR</span></div>

        <div className="login-provider-stack">
          <a className="login-provider" href={signInUrl}>
            {includeMicrosoftMark ? <MicrosoftMark /> : null}
            Continue with Microsoft
          </a>
          <a className="login-provider" href={signInUrl}>
            <ShieldCheck size={16} />
            Sign in with SSO
          </a>
        </div>

        <p className="login-legal">
          By continuing, you agree to the Signal Foundry demo terms and privacy boundary.
        </p>
      </section>
    </main>
  );
}
