"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register, user, isLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/games");
    }
  }, [user, isLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    setIsSubmitting(true);
    const result = await register(name.trim(), email.trim(), password);

    if (result.success) {
      router.replace("/games");
    } else {
      setError(result.error);
      setIsSubmitting(false);
    }
  }

  if (isLoading) return null;

  return (
    <div className="bg-auth" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: Math.random() > 0.7 ? "2px" : "1px",
              height: Math.random() > 0.7 ? "2px" : "1px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.6)",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      <div className="animate-fade-in-up" style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>🏆</div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            <span className="text-gradient-gold">AI Quiz</span>{" "}
            <span style={{ color: "var(--text-primary)" }}>Games</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "6px" }}>
            Create your free account
          </p>
        </div>

        <div className="glass-card" style={{ padding: "32px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "24px" }}>
            Join for free
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label htmlFor="register-name" className="form-label">Full Name</label>
              <input
                id="register-name"
                type="text"
                className="form-input"
                placeholder="Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="form-label">Email</label>
              <input
                id="register-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  style={{ paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  style={{
                    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer",
                    fontSize: "1rem", padding: "4px",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="register-confirm" className="form-label">Confirm Password</label>
              <input
                id="register-confirm"
                type={showPassword ? "text" : "password"}
                className={`form-input${confirmPassword && password !== confirmPassword ? " error" : ""}`}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="error-text">Passwords don&apos;t match</p>
              )}
            </div>

            {error && (
              <div style={{
                padding: "10px 14px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "8px",
                color: "var(--red-400)",
                fontSize: "0.875rem",
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              id="register-submit"
              type="submit"
              className="btn-gold"
              disabled={isSubmitting}
              style={{ width: "100%", marginTop: "4px" }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }} />
                  Creating account…
                </>
              ) : (
                "Create Account →"
              )}
            </button>
          </form>

          <div className="section-divider" style={{ margin: "24px 0" }} />

          <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--gold-400)", fontWeight: 600, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
