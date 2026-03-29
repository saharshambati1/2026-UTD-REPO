"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { apiFetch } from "@/lib/api";

const BG = "#F5F0E4";
const CARD_BG = "#FFFDF6";
const BORDER = "#DDD5C0";
const PRIMARY = "#6B7C2D";
const ORANGE = "#E87722";
const TEXT = "#2A2A1E";
const MUTED = "#7A7A60";
const GREEN_LIGHT = "#EBF2D8";
const RED_LIGHT = "#FDECEA";

// ─── Types ─────────────────────────────────────────────────────────────────────

type PageMode = "plan" | "compare";
type PhaseType = "SaaS" | "Marketplace" | "Consumer App";

interface CompanyTemplate {
  id: string;
  company: string;
  description: string;
  distributionChannel: string;
  phaseType: PhaseType;
  founded: string;
}

interface WeekData { week: number; description: string; }

// ─── API response type ─────────────────────────────────────────────────────────

interface ApiTemplate {
  id: string;
  name: string;
  description: string;
  distribution_channel: string;
  created_at: string;
}

function inferPhaseType(description: string): PhaseType {
  const lower = description.toLowerCase();
  if (lower.includes("marketplace") || lower.includes("seller") || lower.includes("buyer") || lower.includes("listing")) return "Marketplace";
  if (lower.includes("app store") || lower.includes("consumer") || lower.includes("mobile") || lower.includes("gamification")) return "Consumer App";
  return "SaaS";
}

function mapApiTemplate(t: ApiTemplate): CompanyTemplate {
  return {
    id: t.id,
    company: t.name,
    description: t.description,
    distributionChannel: t.distribution_channel,
    phaseType: inferPhaseType(t.description),
    founded: t.created_at ? new Date(t.created_at).getFullYear().toString() : "",
  };
}

function useTemplates() {
  const [templates, setTemplates] = useState<CompanyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      try {
        setLoading(true);
        setError(null);
        const data: ApiTemplate[] = await apiFetch("/api/templates");
        if (!cancelled) {
          setTemplates(data.map(mapApiTemplate));
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Failed to load templates");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  }, []);

  return { templates, loading, error };
}

// ─── Weekly phases ─────────────────────────────────────────────────────────────

const WEEKLY_PHASES: Record<PhaseType, string[]> = {
  SaaS: ["Define ICP and core problem statement","Technical architecture planning","Set up dev environment and CI/CD pipeline","Build authentication and user management","Core feature development — Sprint 1","Core feature development — Sprint 2","Internal alpha testing and bug fixes","Beta onboarding — first 10 users","Collect feedback and prioritize backlog","Implement top feedback items","Pricing model finalization","Landing page and marketing site","Integration with payment processor","Load testing and performance tuning","Soft launch to waitlist","Customer success playbook setup","Referral program development","Analytics dashboard implementation","Public launch announcement","Post-launch iteration and growth sprint"],
  Marketplace: ["Define buyer and seller personas","Map marketplace transaction flow","Set up project infrastructure","Build seller onboarding flow","Build buyer browse and search UI","Implement listing creation for sellers","Implement checkout and escrow logic","Recruit first 5 pilot sellers","Onboard pilot buyers and run test transactions","Fix critical issues from pilot","Build review and rating system","Trust and safety policies","Mobile-responsive design polish","SEO and organic discovery setup","Soft launch via distribution channel","Seller incentive program","Buyer acquisition campaigns","Analytics and GMV tracking","Public marketplace launch","Expansion to second category or region"],
  "Consumer App": ["User research and journey mapping","Wireframes and UX flow design","Set up React Native / mobile stack","Core screens implementation — Sprint 1","Core screens implementation — Sprint 2","Push notification system","Social sharing features","Internal dogfooding and QA","TestFlight / Play Store beta","Iterate on onboarding flow","In-app analytics integration","Content or data seeding","App Store submission preparation","Performance optimization pass","Soft launch via distribution channel","Community building and early adopter program","Influencer / creator partnership outreach","Feature flag system for A/B tests","Public App Store / Play Store launch","Growth hacking sprint and retention loop"],
};

function generateWeeklyPlan(template: CompanyTemplate, title: string, distribution: string): WeekData[] {
  return WEEKLY_PHASES[template.phaseType].map((desc, i) => ({
    week: i + 1,
    description: `${desc}${desc.includes("distribution channel") || desc.includes("waitlist") ? ` via ${distribution}` : ""}`,
  }));
}

// ─── Compare helpers ────────────────────────────────────────────────────────────

interface RoadmapMonth { month: string; milestone: string; }
interface CompanyAnalysis { wentRight: string[]; wentWrong: string[]; }

function genRoadmap(company: string): RoadmapMonth[] {
  return [
    { month: "Month 1", milestone: "Define product vision and hire core team" },
    { month: "Month 2", milestone: "Complete MVP and begin beta testing" },
    { month: "Month 3", milestone: "Launch beta, gather user feedback" },
    { month: "Month 4", milestone: "Iterate on product, onboard first 100 users" },
    { month: "Month 5", milestone: "Secure seed funding, scale marketing" },
  ];
}

function genAnalysis(a: string, b: string): { a: CompanyAnalysis; b: CompanyAnalysis } {
  return {
    a: { wentRight: [`${a} built a strong founding team early on`, `${a} achieved product-market fit within 3 months`, `${a} successfully raised a seed round`], wentWrong: [`${a} underestimated customer acquisition costs`, `${a} delayed key features due to scope creep`] },
    b: { wentRight: [`${b} leveraged existing networks for early traction`, `${b} maintained lean operations and low burn rate`, `${b} built a loyal early adopter community`], wentWrong: [`${b} struggled with churn in the first two months`, `${b} faced technical debt from rapid early development`] },
  };
}

// ─── Vertical animated wave timeline ──────────────────────────────────────────

const ITEM_H = 88;        // px between milestones
const WAVE_SVG_W = 72;    // width of the SVG column
const CX = 36;            // center x of wave
const AMP = 18;           // horizontal amplitude
const WLEN = 320;         // wavelength (vertical pixels per full sine cycle)
const T_PAD = 24;         // top padding

function waveX(y: number) {
  return CX + AMP * Math.sin((y / WLEN) * 2 * Math.PI);
}

function buildPath(count: number): { pathD: string; totalLen: number; dotFracs: number[] } {
  const totalY = (count - 1) * ITEM_H;
  const steps = count * 30;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const y = T_PAD + (i / steps) * totalY;
    pts.push({ x: waveX(y), y });
  }
  // cumulative lengths
  const cumLens = [0];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    cumLens.push(cumLens[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  const totalLen = cumLens[cumLens.length - 1];

  // fraction of path at each dot's y position
  const dotFracs: number[] = [];
  for (let d = 0; d < count; d++) {
    const dotY = T_PAD + d * ITEM_H;
    // find closest point index
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < pts.length; i++) {
      const dist = Math.abs(pts[i].y - dotY);
      if (dist < bestDist) { bestDist = dist; best = i; }
    }
    dotFracs.push(cumLens[best] / totalLen);
  }

  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  return { pathD, totalLen, dotFracs };
}

function VerticalTimeline({ weeks }: { weeks: WeekData[] }) {
  const [progress, setProgress] = useState(0); // 0→1
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const DURATION = 4200; // ms for full animation

  const count = weeks.length;
  const { pathD, totalLen, dotFracs } = buildPath(count);
  const svgH = T_PAD + (count - 1) * ITEM_H + T_PAD;

  // Start animation on mount
  useEffect(() => {
    setProgress(0);
    startRef.current = null;
    function tick(now: number) {
      if (!startRef.current) startRef.current = now;
      const t = Math.min((now - startRef.current) / DURATION, 1);
      // ease-in-out cubic
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setProgress(eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [weeks]);

  const dashOffset = totalLen * (1 - progress);

  return (
    <div style={{ display: "flex", gap: 0 }}>
      {/* SVG wave column */}
      <div style={{ flexShrink: 0, width: WAVE_SVG_W, position: "relative" }}>
        <svg width={WAVE_SVG_W} height={svgH} style={{ display: "block", overflow: "visible" }}>
          {/* Background track */}
          <path d={pathD} fill="none" stroke={BORDER} strokeWidth="4" strokeLinecap="round" />
          {/* Animated foreground */}
          <path
            d={pathD}
            fill="none"
            stroke={PRIMARY}
            strokeWidth="5"
            strokeLinecap="round"
            style={{
              strokeDasharray: totalLen,
              strokeDashoffset: dashOffset,
              transition: "none",
            }}
          />
          {/* Dots */}
          {weeks.map((w, i) => {
            const dotY = T_PAD + i * ITEM_H;
            const dotX = waveX(dotY);
            const revealed = progress >= dotFracs[i];
            return (
              <g key={w.week}>
                {/* Pulse ring when just revealed */}
                {revealed && (
                  <circle cx={dotX} cy={dotY} r={13} fill={PRIMARY} opacity={0.12} />
                )}
                <circle
                  cx={dotX}
                  cy={dotY}
                  r={revealed ? 8 : 5}
                  fill={revealed ? PRIMARY : BORDER}
                  stroke={revealed ? CARD_BG : "transparent"}
                  strokeWidth={2}
                  style={{ transition: "r 0.3s ease, fill 0.3s ease" }}
                />
                {revealed && (
                  <text
                    x={dotX}
                    y={dotY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="7"
                    fontWeight="700"
                    fill="#fff"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {w.week}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Labels column */}
      <div style={{ flex: 1, paddingTop: T_PAD }}>
        {weeks.map((w, i) => {
          const revealed = progress >= dotFracs[i];
          return (
            <div
              key={w.week}
              style={{
                height: ITEM_H,
                display: "flex",
                alignItems: "center",
                opacity: revealed ? 1 : 0,
                transform: revealed ? "translateX(0)" : "translateX(-10px)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
              }}
            >
              <div
                style={{
                  background: revealed ? CARD_BG : "transparent",
                  border: `1px solid ${revealed ? BORDER : "transparent"}`,
                  borderRadius: 10,
                  padding: "10px 16px",
                  marginLeft: 8,
                  width: "100%",
                  transition: "background 0.3s",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: ORANGE, marginBottom: 3, letterSpacing: "0.05em" }}>
                  WEEK {w.week}
                </div>
                <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.5 }}>
                  {w.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Shared input field ─────────────────────────────────────────────────────────

function Field({ id, label, value, onChange, placeholder, multiline }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  placeholder: string; multiline?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const shared: React.CSSProperties = {
    padding: "10px 14px", borderRadius: 8,
    border: `1.5px solid ${focused ? PRIMARY : BORDER}`,
    background: CARD_BG, color: TEXT, fontSize: 14, outline: "none",
    transition: "border-color 0.15s", width: "100%",
    fontFamily: "Georgia, serif",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{label}</label>
      {multiline
        ? <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ ...shared, resize: "vertical" }} />
        : <input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={shared} />
      }
    </div>
  );
}

// ─── Template card ──────────────────────────────────────────────────────────────

const PILL: Record<PhaseType, { bg: string; text: string; border: string }> = {
  SaaS:          { bg: "#EBF2D8", text: "#4A6019", border: "#C8D8A0" },
  Marketplace:   { bg: "#FEF3E2", text: "#8B5E14", border: "#F5D49A" },
  "Consumer App":{ bg: "#E8F0FE", text: "#2255A4", border: "#B8CFF5" },
};

function TemplateCard({ t, active, onClick }: { t: CompanyTemplate; active: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const pill = PILL[t.phaseType];
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: active ? "#EBF2D8" : CARD_BG,
        border: `2px solid ${active ? PRIMARY : hov ? "#C5BB9E" : BORDER}`,
        borderRadius: 12, padding: "14px 16px", cursor: "pointer",
        transition: "border-color 0.15s, background 0.15s, box-shadow 0.15s",
        boxShadow: active ? "0 0 0 3px rgba(107,124,45,0.18)" : hov ? "0 2px 10px rgba(61,79,23,0.08)" : "none",
        display: "flex", flexDirection: "column", gap: 6,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: active ? PRIMARY : TEXT }}>{t.company}</div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>Founded {t.founded}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          {active && <span style={{ fontSize: 10, fontWeight: 600, color: "#FFF", background: PRIMARY, borderRadius: 20, padding: "2px 8px" }}>Selected</span>}
          <span style={{ fontSize: 10, fontWeight: 600, color: pill.text, background: pill.bg, border: `1px solid ${pill.border}`, borderRadius: 20, padding: "2px 8px", whiteSpace: "nowrap" }}>{t.phaseType}</span>
        </div>
      </div>
      <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, margin: 0 }}>{t.description}</p>
      <div style={{ fontSize: 11, color: active ? PRIMARY : MUTED, fontWeight: 500 }}>
        <span style={{ fontWeight: 700 }}>Channel: </span>{t.distributionChannel}
      </div>
    </div>
  );
}

// ─── Btn helper ─────────────────────────────────────────────────────────────────

function Btn({ children, onClick, disabled, style }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; style?: React.CSSProperties }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "10px 28px", borderRadius: 8, border: "none",
        background: disabled ? "#C8C0A8" : hov ? ORANGE : PRIMARY,
        color: "#FFF", fontSize: 14, fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer", transition: "background 0.15s",
        fontFamily: "Georgia, serif",
        ...style,
      }}
    >{children}</button>
  );
}

// ─── Plan view ──────────────────────────────────────────────────────────────────

function PlanView({ templates }: { templates: CompanyTemplate[] }) {
  const [selected, setSelected] = useState<CompanyTemplate | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [dist, setDist] = useState("");
  const [plan, setPlan] = useState<WeekData[] | null>(null);

  const ready = selected !== null && title.trim() && desc.trim() && dist.trim();

  return (
    <div>
      {/* Template grid */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 10 }}>Choose a Company Template</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 12 }}>
          {templates.map((t) => (
            <TemplateCard key={t.id} t={t} active={selected?.id === t.id}
              onClick={() => { setSelected(t); setDist(t.distributionChannel); setPlan(null); }}
            />
          ))}
        </div>
      </div>

      {/* Form */}
      {selected && (
        <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24, marginBottom: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>
            Your Startup — following the <span style={{ color: PRIMARY }}>{selected.company}</span> playbook
          </h2>
          <Field id="title" label="Title" value={title} onChange={(v) => { setTitle(v); setPlan(null); }} placeholder="Your startup name" />
          <Field id="desc" label="Description" value={desc} onChange={(v) => { setDesc(v); setPlan(null); }} placeholder="What does your startup do? Who is it for?" multiline />
          <Field id="dist" label="Distribution Channel" value={dist} onChange={(v) => { setDist(v); setPlan(null); }} placeholder="e.g. Product Hunt, Twitter, Word of Mouth" />
          <Btn onClick={() => ready && setPlan(generateWeeklyPlan(selected, title, dist))} disabled={!ready}>
            Generate 20-Week Plan
          </Btn>
        </div>
      )}

      {/* Vertical animated timeline */}
      {plan && (
        <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: TEXT, marginBottom: 4 }}>20-Week Roadmap</h2>
          <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>
            Watch each milestone reveal as the roadmap builds.
          </p>
          <VerticalTimeline weeks={plan} />
        </div>
      )}
    </div>
  );
}

// ─── Compact template card (used in Compare) ───────────────────────────────────

function CompactTemplateCard({ t, active, accent, onClick }: { t: CompanyTemplate; active: boolean; accent: string; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const pill = PILL[t.phaseType];
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 12px", borderRadius: 10, cursor: "pointer",
        background: active ? (accent === PRIMARY ? "#EBF2D8" : "#FEF3E2") : CARD_BG,
        border: `2px solid ${active ? accent : hov ? "#C5BB9E" : BORDER}`,
        transition: "border-color 0.15s, background 0.15s",
        boxShadow: active ? `0 0 0 3px ${accent}28` : "none",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: active ? accent : TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {t.company}
        </div>
        <div style={{ fontSize: 10, color: MUTED, marginTop: 1 }}>Founded {t.founded}</div>
      </div>
      <span style={{ fontSize: 9, fontWeight: 600, color: pill.text, background: pill.bg, border: `1px solid ${pill.border}`, borderRadius: 20, padding: "2px 7px", whiteSpace: "nowrap", flexShrink: 0 }}>
        {t.phaseType}
      </span>
      {active && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  );
}

// ─── Compare view ───────────────────────────────────────────────────────────────

function CompareView({ templates }: { templates: CompanyTemplate[] }) {
  const [selectedA, setSelectedA] = useState<CompanyTemplate | null>(null);
  const [selectedB, setSelectedB] = useState<CompanyTemplate | null>(null);
  const [results, setResults] = useState(false);
  const ready = selectedA !== null && selectedB !== null;

  const compA = selectedA?.company ?? "";
  const compB = selectedB?.company ?? "";
  const roadmapA = genRoadmap(compA);
  const roadmapB = genRoadmap(compB);
  const analysis = genAnalysis(compA, compB);

  return (
    <div>
      {/* Two-column card selection */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {(["A", "B"] as const).map((side) => {
          const selected = side === "A" ? selectedA : selectedB;
          const setSelected = side === "A"
            ? (t: CompanyTemplate) => { setSelectedA(t); setResults(false); }
            : (t: CompanyTemplate) => { setSelectedB(t); setResults(false); };
          return (
            <div key={side}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: side === "A" ? PRIMARY : ORANGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#FFF", flexShrink: 0 }}>
                  {side}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>
                  {selected ? selected.company : `Pick Company ${side}`}
                </span>
                {selected && (
                  <span style={{ fontSize: 11, color: MUTED, background: "#EDE7D4", border: `1px solid ${BORDER}`, borderRadius: 20, padding: "2px 8px" }}>
                    {selected.phaseType}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 520, overflowY: "auto", paddingRight: 4 }}>
                {templates.map((t) => (
                  <CompactTemplateCard
                    key={t.id}
                    t={t}
                    active={selected?.id === t.id}
                    accent={side === "A" ? PRIMARY : ORANGE}
                    onClick={() => setSelected(t)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginBottom: 24 }}>
        <Btn onClick={() => ready && setResults(true)} disabled={!ready}>Compare</Btn>
      </div>

      {results && (
        <>
          {/* Roadmap table */}
          <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER}` }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>First 5-Month Roadmap</h2>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#EDE7D4" }}>
                    <th style={{ padding: "11px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", width: 90 }}>Month</th>
                    <th style={{ padding: "11px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: PRIMARY, textTransform: "uppercase", letterSpacing: "0.06em" }}>{compA}</th>
                    <th style={{ padding: "11px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#8B6914", textTransform: "uppercase", letterSpacing: "0.06em" }}>{compB}</th>
                  </tr>
                </thead>
                <tbody>
                  {roadmapA.map((row, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${BORDER}`, background: i % 2 === 0 ? CARD_BG : BG }}>
                      <td style={{ padding: "11px 18px", fontSize: 13, fontWeight: 600, color: MUTED }}>{row.month}</td>
                      <td style={{ padding: "11px 18px", fontSize: 13, color: TEXT }}>{row.milestone}</td>
                      <td style={{ padding: "11px 18px", fontSize: 13, color: TEXT }}>{roadmapB[i].milestone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Analysis */}
          <h2 style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 12 }}>Analysis</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[{ name: compA, data: analysis.a }, { name: compB, data: analysis.b }].map(({ name, data }) => (
              <div key={name} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: "12px 18px", borderBottom: `1px solid ${BORDER}`, background: "#EDE7D4" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{name}</h3>
                </div>
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#3A6B1A", marginBottom: 8 }}>✓ What Went Right</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {data.wentRight.map((item, i) => <div key={i} style={{ fontSize: 12, color: TEXT, background: GREEN_LIGHT, border: "1px solid #C8E0A0", borderRadius: 6, padding: "7px 10px", lineHeight: 1.5 }}>{item}</div>)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#8B2020", marginBottom: 8 }}>✗ What Went Wrong</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {data.wentWrong.map((item, i) => <div key={i} style={{ fontSize: 12, color: TEXT, background: RED_LIGHT, border: "1px solid #F5C0B8", borderRadius: 6, padding: "7px 10px", lineHeight: 1.5 }}>{item}</div>)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────────

function PlanPageContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "compare" ? "compare" : "plan";
  const [mode, setMode] = useState<PageMode>(initialMode);
  const { templates, loading, error } = useTemplates();

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Header + mode toggle */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: TEXT, letterSpacing: "-0.02em" }}>
            {mode === "plan" ? "AI Plan" : "Compare Companies"}
          </h1>
          <p style={{ fontSize: 14, color: MUTED, marginTop: 4 }}>
            {mode === "plan"
              ? "Pick a real company playbook and generate a personalized 20-week roadmap."
              : "Compare two startups' early roadmaps and see what worked and what didn't."}
          </p>
        </div>

        {/* Toggle */}
        <div style={{ display: "inline-flex", background: "#EDE7D4", borderRadius: 10, padding: 4, border: `1px solid ${BORDER}`, flexShrink: 0 }}>
          {(["plan", "compare"] as PageMode[]).map((m) => (
            <ModeTab key={m} label={m === "plan" ? "AI Plan" : "Compare"} active={mode === m} onClick={() => setMode(m)} />
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: 48, color: MUTED, fontSize: 14 }}>
          Loading templates...
        </div>
      )}

      {error && (
        <div style={{ textAlign: "center", padding: 48 }}>
          <div style={{ color: "#8B2020", fontSize: 14, marginBottom: 8 }}>
            Failed to load templates: {error}
          </div>
          <Btn onClick={() => window.location.reload()}>Retry</Btn>
        </div>
      )}

      {!loading && !error && (
        mode === "plan" ? <PlanView templates={templates} /> : <CompareView templates={templates} />
      )}
    </div>
  );
}

function ModeTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "8px 22px", borderRadius: 7, border: "none",
        background: active ? PRIMARY : hov && !active ? "#D8D0B8" : "transparent",
        color: active ? "#FFF" : TEXT, fontSize: 13, fontWeight: active ? 700 : 500,
        cursor: "pointer", transition: "background 0.15s, color 0.15s",
        fontFamily: "Georgia, serif",
      }}
    >{label}</button>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={<div style={{ color: MUTED, padding: 24 }}>Loading…</div>}>
      <PlanPageContent />
    </Suspense>
  );
}
