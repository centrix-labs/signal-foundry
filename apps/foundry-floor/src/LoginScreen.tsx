import { ChevronRight, Lock, Mail, Rocket, ShieldCheck } from "lucide-react";

type LoginScreenProps = {
  onEnter: () => void;
  theme: "dark" | "light";
  onThemeChange: (theme: "dark" | "light") => void;
};

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

function SignalMark() {
  return (
    <span className="login-mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

function microsoftLoginUrl() {
  const clientId = import.meta.env["VITE_MICROSOFT_CLIENT_ID"] as string | undefined;
  if (!clientId) {
    return "https://login.microsoftonline.com/organizations/";
  }
  const redirectUri = import.meta.env["VITE_MICROSOFT_REDIRECT_URI"] as string | undefined;
  const tenant = import.meta.env["VITE_MICROSOFT_TENANT_ID"] as string | undefined;
  const url = new URL(`https://login.microsoftonline.com/${tenant || "organizations"}/oauth2/v2.0/authorize`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri || window.location.origin);
  url.searchParams.set("scope", "openid profile email User.Read");
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("state", "signal-foundry-login");
  return url.toString();
}

export function LoginScreen({ onEnter, theme, onThemeChange }: LoginScreenProps) {
  return (
    <main className={`login-page ${theme === "light" ? "login-light" : ""}`}>
      <div className="login-backplate" aria-hidden="true" />
      <div className="login-vignette" aria-hidden="true" />

      <div className="login-theme-switch" aria-label="Theme">
        <button type="button" className={theme === "dark" ? "active" : ""} onClick={() => onThemeChange("dark")}>Dark</button>
        <button type="button" className={theme === "light" ? "active" : ""} onClick={() => onThemeChange("light")}>Light</button>
      </div>

      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand">
          <SignalMark />
          <h1 id="login-title">Signal Foundry</h1>
        </div>
        <p className="login-tagline"><strong>Forge raw signals.</strong> Build trusted intelligence.</p>

        <form
          className="login-form"
          onSubmit={(event) => {
            event.preventDefault();
            onEnter();
          }}
        >
          <label className="login-field">
            <span>Email</span>
            <span className="login-input">
              <Mail size={16} />
              <input type="email" autoComplete="email" placeholder="you@company.com" aria-label="Email" />
            </span>
          </label>

          <label className="login-field">
            <span>Password</span>
            <span className="login-input">
              <Lock size={16} />
              <input type="password" autoComplete="current-password" placeholder="••••••••••••••" aria-label="Password" />
            </span>
          </label>

          <div className="login-options">
            <label className="remember-row">
              <input type="checkbox" defaultChecked />
              <span>
                Remember me
                <small>Secure session on this device</small>
              </span>
            </label>
            <button type="button" className="login-link">Forgot password?</button>
          </div>

          <button type="submit" className="login-primary">
            <Rocket size={17} />
            Launch Console
            <ChevronRight size={18} />
          </button>
        </form>

        <div className="login-divider"><span>OR</span></div>

        <div className="login-provider-stack">
          <a className="login-provider" href={microsoftLoginUrl()}>
            <MicrosoftMark />
            Continue with Microsoft
          </a>
          <button type="button" className="login-provider" onClick={onEnter}>
            <ShieldCheck size={16} />
            Sign in with SSO
          </button>
        </div>

        <p className="login-legal">
          By continuing, you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
        </p>
      </section>
    </main>
  );
}
