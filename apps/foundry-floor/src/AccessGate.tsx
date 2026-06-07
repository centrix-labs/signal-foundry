import { FormEvent, useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";

const defaultAccessHashes = [
  "53207404fc88e92779a36ef497ff4683959e8443b3ff35bb5dc2e2dc45f96af6",
  "773097d41df91c845da1b80c6140bfd52d8f3eaf6ec37258dc07212d893fa251"
];

const accessHashes = ((import.meta.env["VITE_SITE_ACCESS_HASHES"] as string | undefined) ?? defaultAccessHashes.join(","))
  .split(",")
  .map((hash) => hash.trim())
  .filter(Boolean);

type AccessGateProps = {
  onUnlock: () => void;
  theme: "dark" | "light";
  onThemeChange: (theme: "dark" | "light") => void;
};

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value.trim());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function AccessGate({ onUnlock, theme, onThemeChange }: AccessGateProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsChecking(true);
    setError("");
    const candidateHashes = await Promise.all([sha256(code), sha256(code.toUpperCase())]);
    setIsChecking(false);

    if (candidateHashes.some((hash) => accessHashes.includes(hash))) {
      window.sessionStorage.setItem("signal-foundry-access", "granted");
      onUnlock();
      return;
    }

    setCode("");
    setError("Access code not recognized.");
  }

  return (
    <main className={`login-page access-page ${theme === "light" ? "login-light" : ""}`}>
      <div className="login-backplate" aria-hidden="true" />
      <div className="login-vignette" aria-hidden="true" />

      <div className="login-theme-switch" aria-label="Theme">
        <button type="button" className={theme === "dark" ? "active" : ""} onClick={() => onThemeChange("dark")}>Dark</button>
        <button type="button" className={theme === "light" ? "active" : ""} onClick={() => onThemeChange("light")}>Light</button>
      </div>

      <section className="login-card access-card" aria-labelledby="access-title">
        <div className="access-emblem" aria-hidden="true">
          <LockKeyhole size={28} />
        </div>
        <p className="eyebrow">Private demo access</p>
        <h1 id="access-title">Signal Foundry is locked</h1>
        <p className="access-copy">Enter the temporary review code to open the Foundry Floor.</p>

        <form className="login-form access-form" onSubmit={unlock}>
          <label className="login-field">
            <span>Access code</span>
            <span className="login-input">
              <ShieldCheck size={16} />
              <input
                autoComplete="off"
                autoFocus
                inputMode="text"
                onChange={(event) => setCode(event.target.value)}
                placeholder="Enter review code"
                type="password"
                value={code}
              />
            </span>
          </label>
          {error ? <p className="access-error" role="alert">{error}</p> : null}
          <button type="submit" className="login-primary access-unlock-button" disabled={isChecking || code.trim().length === 0}>
            <LockKeyhole size={17} />
            <span>{isChecking ? "Checking..." : "Unlock demo"}</span>
          </button>
        </form>
      </section>
    </main>
  );
}
