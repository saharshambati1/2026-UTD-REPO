"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const PARCHMENT = "#EDE5D0";
const PAPER     = "#FAF7F0";
const INK       = "#2A2A1E";
const INK_MUTED = "#7A7060";
const OLIVE     = "#6B7C2D";
const ORANGE    = "#E87722";
const GOLD      = "#C8A84B";
const BORDER    = "#DDD5C0";
const CARD_BG   = "#FFFDF6";

const GRAIN_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E`;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={INK}>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

export default function SignInPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: PARCHMENT,
      backgroundImage: `
        radial-gradient(ellipse 70% 50% at 30% 0%, rgba(250,247,240,0.9) 0%, transparent 60%),
        radial-gradient(ellipse 50% 60% at 80% 100%, rgba(200,168,75,0.10) 0%, transparent 55%)
      `,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
      fontFamily: "Georgia, serif",
    }}>
      {/* Grain */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        opacity: 0.055, mixBlendMode: "multiply",
        backgroundImage: `url("${GRAIN_SVG}")`,
        backgroundRepeat: "repeat", backgroundSize: "180px 180px",
      }}/>

      {/* Back link */}
      <div style={{ position: "fixed", top: "1.5rem", left: "1.75rem", zIndex: 10 }}>
        <Link href="/" style={{
          color: INK_MUTED, fontSize: "0.78rem",
          fontFamily: "var(--font-mono, 'Courier New'), monospace",
          letterSpacing: "0.08em", textDecoration: "none",
          display: "flex", alignItems: "center", gap: "0.4rem",
          transition: "color 0.18s",
        }}
          onMouseEnter={e => (e.currentTarget.style.color = OLIVE)}
          onMouseLeave={e => (e.currentTarget.style.color = INK_MUTED)}>
          ← CONNECTEDU
        </Link>
      </div>

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 2,
        width: "100%", maxWidth: "420px",
        margin: "0 1rem",
        background: CARD_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: "10px",
        padding: "2.75rem 2.5rem",
        boxShadow: "0 4px 32px rgba(107,124,45,0.08), 0 1px 0 rgba(255,255,255,0.9) inset",
        animation: "fadeInUp 0.5s cubic-bezier(0.22,1,0.36,1) both",
      }}>
        {/* Olive top accent line */}
        <div style={{
          position: "absolute", top: 0, left: "2.5rem", right: "2.5rem",
          height: "2px", borderRadius: "0 0 2px 2px",
          background: `linear-gradient(90deg, transparent, ${OLIVE}, transparent)`,
          opacity: 0.5,
        }}/>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "2rem" }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(232,119,34,0.25)" }}>
            <span style={{ color: "#FFF", fontWeight: 800, fontSize: "0.85rem" }}>C</span>
          </div>
          <span style={{ color: INK_MUTED, fontSize: "0.75rem", letterSpacing: "0.14em", fontFamily: "var(--font-mono, monospace)" }}>
            CONNECTEDU
          </span>
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: "var(--font-editorial, Georgia), Georgia, serif",
          fontSize: "2rem", fontWeight: 800, fontStyle: "italic",
          color: INK, lineHeight: 1.15, marginBottom: "0.4rem",
          letterSpacing: "-0.02em",
        }}>
          Welcome back,<br/>
          <span style={{ color: OLIVE }}>founder.</span>
        </h1>

        {/* Decorative rule */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0.85rem 0 1.25rem" }}>
          <div style={{ height: 1, width: 28, background: GOLD, opacity: 0.5 }}/>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: ORANGE, opacity: 0.6 }}/>
          <div style={{ height: 1, flex: 1, background: GOLD, opacity: 0.2 }}/>
        </div>

        <p style={{ color: INK_MUTED, fontSize: "0.88rem", marginBottom: "1.75rem", lineHeight: 1.65, fontStyle: "italic" }}>
          Sign in to access your roadmap, connections, and community.
        </p>

        {/* OAuth buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          <OAuthButton icon={<GoogleIcon/>} label="Continue with Google"
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
            }}/>
          <OAuthButton icon={<GitHubIcon/>} label="Continue with GitHub"
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signInWithOAuth({ provider: "github", options: { redirectTo: `${window.location.origin}/auth/callback` } });
            }}/>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", margin: "1.5rem 0" }}>
          <div style={{ flex: 1, height: "1px", background: BORDER }}/>
          <span style={{ color: INK_MUTED, fontSize: "0.68rem", fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.1em", opacity: 0.6 }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: BORDER }}/>
        </div>

        {/* Email form */}
        <form onSubmit={async e => {
          e.preventDefault();
          const supabase = createClient();
          const emailEl = (e.currentTarget as HTMLFormElement).querySelector("input[type=email]") as HTMLInputElement;
          const passEl  = (e.currentTarget as HTMLFormElement).querySelector("input[type=password]") as HTMLInputElement;
          const { error } = await supabase.auth.signInWithPassword({ email: emailEl.value, password: passEl.value });
          if (!error) window.location.href = "/messages";
        }} style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
          <InputField type="email"    placeholder="your@email.com" label="Email"/>
          <InputField type="password" placeholder="••••••••"       label="Password"/>
          <button type="submit" style={{
            marginTop: "0.2rem", padding: "0.75rem 1rem",
            background: OLIVE, color: "#FFF", border: "none", borderRadius: "7px",
            fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.04em",
            cursor: "pointer", fontFamily: "Georgia, serif",
            boxShadow: "0 2px 10px rgba(107,124,45,0.22)",
            transition: "background 0.15s, box-shadow 0.15s, transform 0.12s",
          }}
            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = ORANGE; b.style.transform = "translateY(-1px)"; b.style.boxShadow = "0 4px 14px rgba(232,119,34,0.28)"; }}
            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = OLIVE; b.style.transform = "translateY(0)"; b.style.boxShadow = "0 2px 10px rgba(107,124,45,0.22)"; }}>
            Sign In →
          </button>
        </form>

        <p style={{ marginTop: "1.5rem", textAlign: "center", color: INK_MUTED, fontSize: "0.73rem", lineHeight: 1.7, opacity: 0.6 }}>
          By continuing you agree to our <span style={{ textDecoration: "underline", cursor: "pointer" }}>Terms</span> and <span style={{ textDecoration: "underline", cursor: "pointer" }}>Privacy Policy</span>.
        </p>
      </div>

      {/* Footer */}
      <p style={{
        position: "relative", zIndex: 2, marginTop: "1.75rem",
        color: INK_MUTED, fontSize: "0.68rem", opacity: 0.45,
        fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.08em",
      }}>
        © MMXXVI CONNECTEDU — HACKUTD
      </p>
    </div>
  );
}

function OAuthButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: "0.65rem",
      padding: "0.7rem 1rem",
      background: PAPER, border: `1px solid ${BORDER}`, borderRadius: "7px",
      fontSize: "0.88rem", color: INK, cursor: "pointer",
      fontFamily: "Georgia, serif", letterSpacing: "0.01em",
      transition: "background 0.15s, border-color 0.15s, transform 0.12s",
      boxShadow: "0 1px 3px rgba(107,124,45,0.06)",
    }}
      onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "#FFF8EE"; b.style.borderColor = "#C5BB9E"; b.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = PAPER; b.style.borderColor = BORDER; b.style.transform = "translateY(0)"; }}>
      {icon}
      {label}
    </button>
  );
}

function InputField({ type, placeholder, label }: { type: string; placeholder: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <label style={{ color: INK_MUTED, fontSize: "0.68rem", letterSpacing: "0.1em", fontFamily: "var(--font-mono, monospace)", opacity: 0.75 }}>
        {label.toUpperCase()}
      </label>
      <input type={type} placeholder={placeholder} style={{
        padding: "0.65rem 0.9rem",
        background: PARCHMENT, border: `1.5px solid ${BORDER}`,
        borderRadius: "7px", color: INK, fontSize: "0.9rem",
        fontFamily: "Georgia, serif", outline: "none",
        transition: "border-color 0.18s",
      }}
        onFocus={e => (e.currentTarget.style.borderColor = OLIVE)}
        onBlur={e  => (e.currentTarget.style.borderColor = BORDER)}/>
    </div>
  );
}
