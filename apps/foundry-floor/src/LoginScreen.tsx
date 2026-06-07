import { ChevronRight, Lock, Mail, Rocket, ShieldCheck } from "lucide-react";
import { microsoftSignInUrl } from "./auth";

type LoginScreenProps = {
  theme: "dark" | "light";
  onThemeChange: (theme: "dark" | "light") => void;
  isCheckingAuth?: boolean;
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

export function LoginScreen({ theme, onThemeChange, isCheckingAuth = false }: LoginScreenProps) {
  const signInUrl = microsoftSignInUrl();

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
            window.location.assign(signInUrl);
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
            {isCheckingAuth ? "Checking Microsoft session" : "Launch Console"}
            <ChevronRight size={18} />
          </button>
        </form>

        <div className="login-divider"><span>OR</span></div>

        <div className="login-provider-stack">
          <a className="login-provider" href={signInUrl}>
            <MicrosoftMark />
            Continue with Microsoft
          </a>
          <a className="login-provider" href={signInUrl}>
            <ShieldCheck size={16} />
            Sign in with SSO
          </a>
        </div>

        <p className="login-legal">
          By continuing, you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
        </p>
      </section>
    </main>
  );
}
