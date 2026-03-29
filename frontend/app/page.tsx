"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// ── Palette — Academic Parchment ───────────────────────────────────────────────
const PARCHMENT  = "#EDE5D0";
const PAPER      = "#FAF7F0";
const INK        = "#2A2A1E";
const INK_MUTED  = "#7A7060";
const OLIVE      = "#6B7C2D";
const ORANGE     = "#E87722";
const GOLD       = "#C8A84B";
const BORDER     = "rgba(180,168,140,0.45)";
const GLASS_BG   = "rgba(250,247,240,0.58)";
const GLASS_BDR  = "rgba(255,255,255,0.70)";

// ── Grain ──────────────────────────────────────────────────────────────────────
const GRAIN_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E`;

function Grain() {
  return (
    <div aria-hidden style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9000,
      opacity: 0.055,
      backgroundImage: `url("${GRAIN_SVG}")`,
      backgroundRepeat: "repeat", backgroundSize: "180px 180px",
      mixBlendMode: "multiply",
    }} />
  );
}

// ── Animated blobs (fluid glass background) ───────────────────────────────────
function FloatingBlobs() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{
        position: "absolute", width: 680, height: 680,
        background: "radial-gradient(circle at 40% 40%, rgba(107,124,45,0.26) 0%, rgba(107,124,45,0.08) 50%, transparent 75%)",
        top: -160, left: -140,
        animation: "blobA 20s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: 560, height: 560,
        background: "radial-gradient(circle at 50% 50%, rgba(232,119,34,0.20) 0%, rgba(232,119,34,0.06) 50%, transparent 75%)",
        top: "10%", right: -100,
        animation: "blobB 24s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: 460, height: 460,
        background: "radial-gradient(circle at 60% 60%, rgba(200,168,75,0.22) 0%, rgba(200,168,75,0.06) 55%, transparent 75%)",
        bottom: -60, left: "25%",
        animation: "blobC 17s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: 340, height: 340,
        background: "radial-gradient(circle at 50% 50%, rgba(107,124,45,0.14) 0%, transparent 70%)",
        bottom: "15%", right: "15%",
        animation: "blobA 28s ease-in-out infinite reverse",
      }} />
    </div>
  );
}

// ── Frosted glass layer ────────────────────────────────────────────────────────
function GlassLayer() {
  return (
    <div aria-hidden style={{
      position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
      backdropFilter: "blur(48px) saturate(1.5)",
      WebkitBackdropFilter: "blur(48px) saturate(1.5)",
      background: "rgba(237,229,208,0.30)",
    }} />
  );
}

// ── Decorative academic seal ───────────────────────────────────────────────────
function AcademicSeal() {
  return (
    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 380, opacity: 0.60, pointerEvents: "none", display: "block" }}>
      {/* Outer rings */}
      <circle cx="200" cy="200" r="185" stroke={OLIVE} strokeWidth="0.8" opacity="0.30" strokeDasharray="4 6"/>
      <circle cx="200" cy="200" r="168" stroke={GOLD}  strokeWidth="0.5" opacity="0.25"/>
      <circle cx="200" cy="200" r="148" stroke={OLIVE} strokeWidth="1.2" opacity="0.22"/>
      <circle cx="200" cy="200" r="120" stroke={INK}   strokeWidth="0.5" opacity="0.12"/>
      <circle cx="200" cy="200" r="88"  stroke={GOLD}  strokeWidth="0.7" opacity="0.20" strokeDasharray="2 4"/>
      <circle cx="200" cy="200" r="58"  stroke={OLIVE} strokeWidth="0.6" opacity="0.18"/>

      {/* Cross-hatch grid lines */}
      {[0, 30, 60, 90, 120, 150].map(a => {
        const rad = (a * Math.PI) / 180;
        const x1 = 200 + 185 * Math.cos(rad); const y1 = 200 + 185 * Math.sin(rad);
        const x2 = 200 - 185 * Math.cos(rad); const y2 = 200 - 185 * Math.sin(rad);
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={OLIVE} strokeWidth="0.35" opacity="0.12"/>;
      })}

      {/* Tick marks */}
      {Array.from({ length: 36 }, (_, i) => {
        const a = (i * 10 * Math.PI) / 180;
        const r1 = i % 3 === 0 ? 162 : 166;
        const r2 = 168;
        return <line key={i} x1={200 + r1 * Math.cos(a)} y1={200 + r1 * Math.sin(a)} x2={200 + r2 * Math.cos(a)} y2={200 + r2 * Math.sin(a)} stroke={OLIVE} strokeWidth="0.8" opacity="0.22"/>;
      })}

      {/* Radial spokes inside */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
        const rad = (a * Math.PI) / 180;
        return <line key={a} x1={200 + 62 * Math.cos(rad)} y1={200 + 62 * Math.sin(rad)} x2={200 + 116 * Math.cos(rad)} y2={200 + 116 * Math.sin(rad)} stroke={GOLD} strokeWidth="0.5" opacity="0.18"/>;
      })}

      {/* Centre mark */}
      <circle cx="200" cy="200" r="14" fill={OLIVE} opacity="0.12"/>
      <circle cx="200" cy="200" r="6"  fill={OLIVE} opacity="0.45"/>
      <circle cx="200" cy="200" r="2"  fill={ORANGE} opacity="0.7"/>

      {/* Corner dots at ring intersections */}
      {[0, 60, 120, 180, 240, 300].map((a, i) => {
        const rad = (a * Math.PI) / 180;
        return <circle key={i} cx={200 + 148 * Math.cos(rad)} cy={200 + 148 * Math.sin(rad)} r="2.2" fill={GOLD} opacity="0.35"/>;
      })}

      {/* Text annotation */}
      <text x="200" y="310" textAnchor="middle" fontSize="7.5" fill={INK} opacity="0.22"
        fontFamily="'Courier New', monospace" letterSpacing="0.22em">CONNECTEDU · EST. MMXXIV</text>
      <text x="200" y="298" textAnchor="middle" fontSize="6" fill={INK} opacity="0.15"
        fontFamily="'Courier New', monospace" letterSpacing="0.14em">INNOVATION &amp; ENTERPRISE</text>
    </svg>
  );
}

// ── Nav ────────────────────────────────────────────────────────────────────────
function HeroNav({ scrolled }: { scrolled: boolean }) {
  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "0 48px",
      height: 64,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled
        ? "rgba(237,229,208,0.72)"
        : "rgba(237,229,208,0.42)",
      backdropFilter: "blur(22px) saturate(1.6)",
      WebkitBackdropFilter: "blur(22px) saturate(1.6)",
      borderBottom: `1px solid ${scrolled ? BORDER : "rgba(180,168,140,0.22)"}`,
      boxShadow: scrolled
        ? "0 1px 0 rgba(255,255,255,0.70), 0 4px 24px rgba(107,124,45,0.08)"
        : "0 1px 0 rgba(255,255,255,0.55)",
      transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#FFF", boxShadow: "0 2px 8px rgba(232,119,34,0.30)" }}>C</div>
        <span style={{ fontSize: 16, fontWeight: 700, color: INK, fontFamily: "var(--font-editorial)", letterSpacing: "-0.01em" }}>ConnectEDU</span>
      </div>

      {/* CTA only — no nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/sign-in" style={{ fontSize: 13, color: INK_MUTED, textDecoration: "none", fontFamily: "Georgia, serif", letterSpacing: "0.01em", transition: "color 0.18s" }}
          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = INK)}
          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = INK_MUTED)}>
          Sign In
        </Link>
        <Link href="/sign-in" style={{
          padding: "8px 20px", borderRadius: 7,
          background: OLIVE, color: "#FFF", fontSize: 13,
          fontWeight: 700, textDecoration: "none",
          letterSpacing: "0.02em", fontFamily: "Georgia, serif",
          boxShadow: "0 2px 10px rgba(107,124,45,0.22)",
          transition: "background 0.15s, box-shadow 0.15s",
        }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = ORANGE; el.style.boxShadow = "0 2px 14px rgba(232,119,34,0.30)"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = OLIVE; el.style.boxShadow = "0 2px 10px rgba(107,124,45,0.22)"; }}>
          Get Started →
        </Link>
      </div>
    </header>
  );
}

// ── Hero section ───────────────────────────────────────────────────────────────
function HeroSection() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  const anim = (delay: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.9s ease ${delay}s, transform 0.9s ease ${delay}s`,
  });

  return (
    <section style={{
      minHeight: "100vh", position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "120px 40px 80px",
      overflow: "hidden",
      background: PARCHMENT,
    }}>
      <FloatingBlobs />
      <GlassLayer />

      {/* Centered content */}
      <div style={{ width: "100%", maxWidth: 800, position: "relative", zIndex: 2, textAlign: "center" }}>
        {/* Academic label */}
        <div style={{ ...anim(0.05), marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <div style={{ width: 32, height: 1, background: OLIVE, opacity: 0.5 }}/>
          <span style={{ fontSize: 10, color: OLIVE, fontFamily: "var(--font-mono, 'Courier New'), monospace", letterSpacing: "0.20em", opacity: 0.75 }}>
            CONNECTEDU · EST. MMXXIV
          </span>
          <div style={{ width: 32, height: 1, background: OLIVE, opacity: 0.5 }}/>
        </div>

        {/* Headline */}
        <h1 style={{
          ...anim(0.14),
          fontFamily: "var(--font-editorial, Georgia), Georgia, serif",
          fontSize: "clamp(52px, 7vw, 92px)",
          fontWeight: 800,
          fontStyle: "italic",
          lineHeight: 1.0,
          letterSpacing: "-0.04em",
          color: INK,
          marginBottom: 28,
        }}>
          The Platform<br/>
          <span style={{ color: OLIVE }}>Built for</span><br/>
          Tomorrow&apos;s<br/>
          Founders.
        </h1>

        {/* Decorative rule */}
        <div style={{ ...anim(0.22), display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ height: 1, width: 60, background: GOLD, opacity: 0.5 }}/>
          <div style={{ height: 5, width: 5, borderRadius: "50%", background: ORANGE, opacity: 0.7 }}/>
          <div style={{ height: 1, width: 60, background: GOLD, opacity: 0.5 }}/>
        </div>

        {/* Subheadline */}
        <p style={{
          ...anim(0.28),
          fontSize: 18,
          lineHeight: 1.80,
          color: INK_MUTED,
          marginBottom: 44,
          maxWidth: 560,
          marginLeft: "auto",
          marginRight: "auto",
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
        }}>
          AI-powered 20-week roadmaps, warm introductions to investors and
          co-founders, and real playbooks from the companies that shaped your industry.
        </p>

        {/* CTAs */}
        <div style={{ ...anim(0.38), display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 52, justifyContent: "center" }}>
          <ParchmentCta href="/sign-in" primary>Start Building →</ParchmentCta>
          <ParchmentCta href="/sign-in">Sign In</ParchmentCta>
        </div>

        {/* Joined-by footnote */}
        <div style={{ ...anim(0.50), display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <div style={{ display: "flex" }}>
            {[OLIVE, ORANGE, GOLD, "#8A9E3A"].map((c, i) => (
              <div key={i} style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${PAPER}`, background: c, marginLeft: i === 0 ? 0 : -9, boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}/>
            ))}
          </div>
          <span style={{ fontSize: 13, color: INK_MUTED, fontFamily: "Georgia, serif", fontStyle: "italic" }}>
            Joined by <strong style={{ color: INK, fontStyle: "normal" }}>1,200+</strong> founders this year
          </span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        opacity: 0.35,
        animation: "scrollBounce 2s ease-in-out infinite",
        zIndex: 2,
      }}>
        <span style={{ fontSize: 9, color: INK, letterSpacing: "0.15em", fontFamily: "var(--font-mono, monospace)" }}>SCROLL</span>
        <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
          <path d="M6 0v14M1 9l5 6 5-6" stroke={INK} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </section>
  );
}

function ParchmentCta({ href, children, primary }: { href: string; children: React.ReactNode; primary?: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <Link href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "13px 28px", borderRadius: 8,
        fontSize: 14, fontWeight: 700, textDecoration: "none",
        fontFamily: "Georgia, serif",
        letterSpacing: "-0.01em",
        transition: "all 0.18s",
        ...(primary ? {
          background: hov ? ORANGE : OLIVE,
          color: "#FFF",
          boxShadow: hov ? "0 4px 20px rgba(232,119,34,0.30)" : "0 4px 14px rgba(107,124,45,0.22)",
        } : {
          background: hov ? "rgba(107,124,45,0.10)" : GLASS_BG,
          color: hov ? OLIVE : INK_MUTED,
          border: `1px solid ${hov ? "rgba(107,124,45,0.35)" : BORDER}`,
          backdropFilter: "blur(8px)",
        }),
      }}>
      {children}
    </Link>
  );
}

// ── Stats bar ──────────────────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: "1,200+", label: "Founders Onboarded" },
    { value: "42",     label: "Startups Funded" },
    { value: "8",      label: "Accelerator Partners" },
    { value: "3",      label: "Countries Active" },
  ];
  return (
    <div style={{
      background: PAPER, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`,
      padding: "32px 80px", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 24,
    }}>
      {stats.map(({ value, label }) => (
        <div key={label} style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-editorial, Georgia), Georgia, serif", fontSize: 40, fontWeight: 800, fontStyle: "italic", color: OLIVE, lineHeight: 1.0 }}>{value}</div>
          <div style={{ fontSize: 10, color: INK_MUTED, fontFamily: "var(--font-mono, 'Courier New'), monospace", letterSpacing: "0.12em", marginTop: 6, textTransform: "uppercase" }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Quote ──────────────────────────────────────────────────────────────────────
function QuoteSection() {
  return (
    <div style={{ background: "#F4EDD8", borderTop: `1px solid ${BORDER}`, padding: "88px 80px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
        {/* Decorative rule */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ height: 1, width: 40, background: GOLD, opacity: 0.5 }}/>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: OLIVE, opacity: 0.4 }}/>
          <div style={{ height: 1, width: 40, background: GOLD, opacity: 0.5 }}/>
        </div>
        <div style={{ fontSize: 72, color: OLIVE, lineHeight: 0.4, fontFamily: "Georgia, serif", marginBottom: 28, opacity: 0.35 }}>&quot;</div>
        <blockquote style={{
          fontFamily: "var(--font-editorial, Georgia), Georgia, serif",
          fontSize: "clamp(20px, 2.8vw, 30px)",
          fontStyle: "italic", fontWeight: 400,
          color: INK, lineHeight: 1.6,
          letterSpacing: "-0.02em", marginBottom: 32,
        }}>
          We picked the Stripe playbook on Monday. By Friday we had a working MVP
          and our first investor call booked through the platform.
        </blockquote>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: OLIVE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#FFF" }}>AK</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>Arjun Kapoor</div>
            <div style={{ fontSize: 11, color: INK_MUTED, fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.05em" }}>Founder @ FlowStack · YC W25</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CTA section ────────────────────────────────────────────────────────────────
function CtaSection() {
  return (
    <section style={{
      background: PARCHMENT, padding: "96px 80px",
      borderTop: `1px solid ${BORDER}`,
      position: "relative", overflow: "hidden",
    }}>
      {/* Subtle inner blob */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 55% 55% at 50% 50%, rgba(107,124,45,0.08) 0%, transparent 65%)`,
      }}/>

      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
        <span style={{ fontSize: 10, color: OLIVE, fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.18em", display: "block", marginBottom: 20, opacity: 0.75 }}>
          ◦ JOIN THE PLATFORM
        </span>
        <h2 style={{
          fontFamily: "var(--font-editorial, Georgia), Georgia, serif",
          fontSize: "clamp(38px, 5vw, 62px)",
          fontWeight: 800, fontStyle: "italic",
          color: INK, lineHeight: 1.0,
          letterSpacing: "-0.04em", marginBottom: 20,
        }}>
          Ready to launch your<br/>
          <span style={{ color: OLIVE }}>next big thing?</span>
        </h2>
        <p style={{ fontSize: 16, color: INK_MUTED, lineHeight: 1.75, marginBottom: 40, maxWidth: 400, margin: "0 auto 40px", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
          Free to start. No credit card. Join 1,200+ founders already building on ConnectEDU.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <ParchmentCta href="/sign-in" primary>Create Free Account →</ParchmentCta>
          <ParchmentCta href="/sign-in">Sign In</ParchmentCta>
        </div>
        <p style={{ marginTop: 36, fontSize: 11, color: INK_MUTED, fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.05em", opacity: 0.65 }}>
          ¹ All company playbooks are derived from public information and founder interviews.<br/>
          ² Platform analytics as of Q1 2026.
        </p>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function HeroFooter() {
  return (
    <footer style={{ background: "#E8E0CC", borderTop: `1px solid ${BORDER}`, padding: "32px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#FFF" }}>C</div>
          <span style={{ fontSize: 13, color: INK_MUTED, fontFamily: "var(--font-editorial, Georgia), Georgia, serif", fontStyle: "italic" }}>ConnectEDU</span>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          {["Privacy", "Terms", "Contact"].map(l => (
            <a key={l} href="#" style={{ fontSize: 11, color: INK_MUTED, textDecoration: "none", fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.07em", opacity: 0.7, transition: "opacity 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.7")}>
              {l.toUpperCase()}
            </a>
          ))}
        </div>
        <span style={{ fontSize: 10, color: INK_MUTED, fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.06em", opacity: 0.55 }}>
          © MMXXVI CONNECTEDU PLATFORM
        </span>
      </div>
    </footer>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function HeroPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ background: PARCHMENT, color: INK, minHeight: "100vh" }}>
      <Grain />
      <HeroNav scrolled={scrolled} />
      <HeroSection />
      <StatsBar />
      <QuoteSection />
      <CtaSection />
      <HeroFooter />
    </div>
  );
}
