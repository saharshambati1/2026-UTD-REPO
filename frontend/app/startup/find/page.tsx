"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

const BG = "#F5F0E4";
const CARD_BG = "#FFFDF6";
const BORDER = "#DDD5C0";
const PRIMARY = "#6B7C2D";
const ORANGE = "#E87722";
const TEXT = "#2A2A1E";
const MUTED = "#7A7A60";
const TAG_BG = "#EDE7D4";

interface CoFounder {
  name: string;
  description: string;
  interests: string[];
  photo: string;
  initials: string;
}

interface Investor {
  name: string;
  description: string;
  companiesInvested: string[];
  photo: string;
  initials: string;
}

type Tab = "co-founders" | "investors";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "8px 20px",
        borderRadius: 7,
        border: "none",
        background: active ? PRIMARY : hovered ? "#D8D0B8" : "transparent",
        color: active ? "#FFFFFF" : TEXT,
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        cursor: "pointer",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {label}
    </button>
  );
}

function Avatar({ initials, size = 64 }: { initials: string; size?: number }) {
  const colors = ["#6B7C2D", "#4A6019", "#527020", "#3D4F17", "#8A9E3A"];
  const idx = initials.charCodeAt(0) % colors.length;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: colors[idx],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: 700,
        color: "#FFFFFF",
        flexShrink: 0,
        letterSpacing: "0.02em",
      }}
    >
      {initials}
    </div>
  );
}

function PersonCard({
  name,
  initials,
  description,
  tags,
  tagLabel,
  onChat,
  index = 0,
}: {
  name: string;
  initials: string;
  description: string;
  tags: string[];
  tagLabel: string;
  onChat: () => void;
  index?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: CARD_BG,
        border: `1px solid ${hovered ? "#C5BB9E" : BORDER}`,
        borderRadius: 14,
        padding: 22,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
        boxShadow: hovered
          ? "0 8px 32px rgba(107,124,45,0.16), 0 2px 8px rgba(107,124,45,0.08), 0 1px 0 rgba(255,255,255,0.9) inset"
          : "0 2px 10px rgba(107,124,45,0.08), 0 1px 0 rgba(255,255,255,0.9) inset",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        animation: `cardEnter 0.4s cubic-bezier(0.22,1,0.36,1) ${index * 0.07}s both`,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <Avatar initials={initials} size={56} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{name}</div>
          <p style={{ fontSize: 13, color: MUTED, marginTop: 4, lineHeight: 1.55 }}>
            {description}
          </p>
        </div>
      </div>

      {/* Tags */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
          {tagLabel}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: PRIMARY,
                background: TAG_BG,
                border: `1px solid #D0C8A8`,
                borderRadius: 20,
                padding: "3px 10px",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Chat button */}
      <button
        onClick={onChat}
        onMouseEnter={() => setBtnHovered(true)}
        onMouseLeave={() => setBtnHovered(false)}
        style={{
          alignSelf: "flex-start",
          padding: "8px 20px",
          borderRadius: 8,
          border: "none",
          background: btnHovered ? ORANGE : PRIMARY,
          color: "#FFFFFF",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          transition: "background 0.15s",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Chat
      </button>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
        gap: 16,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: `3px solid ${BORDER}`,
          borderTopColor: PRIMARY,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <span style={{ fontSize: 14, color: MUTED }}>Loading...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div
      style={{
        background: "#FFF5F5",
        border: "1px solid #E8B4B4",
        borderRadius: 10,
        padding: "16px 20px",
        color: "#8B3030",
        fontSize: 14,
        lineHeight: 1.5,
      }}
    >
      {message}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        background: CARD_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 14,
        padding: "40px 20px",
        textAlign: "center",
        color: MUTED,
        fontSize: 14,
        lineHeight: 1.6,
      }}
    >
      {message}
    </div>
  );
}

export default function FindPage() {
  const [activeTab, setActiveTab] = useState<Tab>("co-founders");
  const router = useRouter();

  const [coFounders, setCoFounders] = useState<CoFounder[]>([]);
  const [coFoundersLoading, setCoFoundersLoading] = useState(true);
  const [coFoundersError, setCoFoundersError] = useState<string | null>(null);

  const [investors, setInvestors] = useState<Investor[]>([]);
  const [investorsLoading, setInvestorsLoading] = useState(true);
  const [investorsError, setInvestorsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCoFounders() {
      setCoFoundersLoading(true);
      setCoFoundersError(null);
      try {
        const data = await apiFetch("/api/cofounders/search", {
          method: "POST",
          body: JSON.stringify({
            startup_profile_id: null,
            needed_roles: [],
            limit: 10,
          }),
        });
        if (cancelled) return;

        const matches = data?.search_result?.matches ?? [];
        const mapped: CoFounder[] = matches.map(
          (m: {
            user_id: string;
            name: string;
            photo_url: string;
            description: string;
            skills: string[];
            interests: string[];
            score: number;
          }) => ({
            name: m.name,
            description: m.description,
            interests: m.interests?.length ? m.interests : m.skills ?? [],
            photo: m.photo_url ?? "",
            initials: getInitials(m.name),
          })
        );
        setCoFounders(mapped);
      } catch (err: unknown) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Failed to load co-founders";
        setCoFoundersError(message);
      } finally {
        if (!cancelled) setCoFoundersLoading(false);
      }
    }

    fetchCoFounders();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchInvestors() {
      setInvestorsLoading(true);
      setInvestorsError(null);
      try {
        const data = await apiFetch("/api/investors?limit=20");
        if (cancelled) return;

        const list = Array.isArray(data) ? data : [];
        const mapped: Investor[] = list.map(
          (inv: {
            id: string;
            name: string;
            firm_name: string;
            photo_url: string;
            description: string;
            sector_focus: string[];
            stage_focus: string[];
            thesis: string;
          }) => ({
            name: inv.name,
            description: inv.description || inv.thesis || "",
            companiesInvested: inv.sector_focus ?? [],
            photo: inv.photo_url ?? "",
            initials: getInitials(inv.name),
          })
        );
        setInvestors(mapped);
      } catch (err: unknown) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Failed to load investors";
        setInvestorsError(message);
      } finally {
        if (!cancelled) setInvestorsLoading(false);
      }
    }

    fetchInvestors();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChat = (name: string) => {
    router.push(`/messages?openThread=${encodeURIComponent(name)}`);
  };

  function renderCoFounders() {
    if (coFoundersLoading) return <LoadingSpinner />;
    if (coFoundersError) return <ErrorMessage message={coFoundersError} />;
    if (coFounders.length === 0)
      return (
        <EmptyState message="No co-founder matches found. Create a startup profile to get personalized co-founder recommendations." />
      );
    return coFounders.map((person, i) => (
      <PersonCard
        key={person.name}
        name={person.name}
        initials={person.initials}
        description={person.description}
        tags={person.interests}
        tagLabel="Interests"
        onChat={() => handleChat(person.name)}
        index={i}
      />
    ));
  }

  function renderInvestors() {
    if (investorsLoading) return <LoadingSpinner />;
    if (investorsError) return <ErrorMessage message={investorsError} />;
    if (investors.length === 0)
      return <EmptyState message="No investors found at the moment." />;
    return investors.map((person, i) => (
      <PersonCard
        key={person.name}
        name={person.name}
        initials={person.initials}
        description={person.description}
        tags={person.companiesInvested}
        tagLabel="Sector Focus"
        onChat={() => handleChat(person.name)}
        index={i}
      />
    ));
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", animation: "pageEnter 0.42s cubic-bezier(0.22,1,0.36,1) both" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: TEXT, letterSpacing: "-0.02em" }}>
          Find
        </h1>
        <p style={{ fontSize: 14, color: MUTED, marginTop: 4 }}>
          Discover co-founders and investors for your startup journey.
        </p>
      </div>

      {/* Tab switcher */}
      <div
        style={{
          display: "inline-flex",
          background: "#EDE7D4",
          borderRadius: 10,
          padding: 4,
          marginBottom: 28,
          border: `1px solid ${BORDER}`,
        }}
      >
        <TabButton label="Co-Founders" active={activeTab === "co-founders"} onClick={() => setActiveTab("co-founders")} />
        <TabButton label="Investors" active={activeTab === "investors"} onClick={() => setActiveTab("investors")} />
      </div>

      {/* Cards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
        }}
      >
        {activeTab === "co-founders" ? renderCoFounders() : renderInvestors()}
      </div>
    </div>
  );
}
