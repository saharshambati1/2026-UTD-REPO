"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

const coFounders: CoFounder[] = [
  {
    name: "Alex Rivera",
    description: "Full-stack engineer with 5 years of experience building SaaS products. Ex-Stripe, loves developer tools.",
    interests: ["Web development", "Open source", "Developer tools", "EdTech"],
    photo: "",
    initials: "AR",
  },
  {
    name: "Priya Nair",
    description: "Product designer and UX researcher focused on consumer apps. Previously at Figma and Notion.",
    interests: ["Product design", "User research", "Mobile apps", "Accessibility"],
    photo: "",
    initials: "PN",
  },
  {
    name: "Jordan Kim",
    description: "Growth marketer and data analyst. Scaled two startups from 0 to 10k users organically.",
    interests: ["Growth hacking", "Content marketing", "Analytics", "B2B SaaS"],
    photo: "",
    initials: "JK",
  },
  {
    name: "Maya Chen",
    description: "AI/ML engineer specializing in NLP and recommendation systems. PhD dropout turned startup founder.",
    interests: ["Machine learning", "NLP", "Research", "HealthTech"],
    photo: "",
    initials: "MC",
  },
];

const investors: Investor[] = [
  {
    name: "Sandra Lee",
    description: "Partner at Horizon Ventures. Focuses on pre-seed and seed-stage consumer and enterprise startups.",
    companiesInvested: ["Notion", "Linear", "Loom"],
    photo: "",
    initials: "SL",
  },
  {
    name: "Marcus Webb",
    description: "Angel investor and former founder. Invests in deep tech, AI, and developer infrastructure.",
    companiesInvested: ["Replit", "Supabase", "Railway"],
    photo: "",
    initials: "MW",
  },
  {
    name: "Diana Flores",
    description: "General Partner at SeedSpark Fund. Passionate about marketplace businesses and fintech.",
    companiesInvested: ["Brex", "Plaid", "Mercury"],
    photo: "",
    initials: "DF",
  },
  {
    name: "James Okafor",
    description: "Managing Partner at NextWave Capital. Focus on climate tech and sustainable consumer goods.",
    companiesInvested: ["Watershed", "Pachama", "Climeworks"],
    photo: "",
    initials: "JO",
  },
];

type Tab = "co-founders" | "investors";

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

export default function FindPage() {
  const [activeTab, setActiveTab] = useState<Tab>("co-founders");
  const router = useRouter();

  const handleChat = (name: string) => {
    router.push(`/messages?openThread=${encodeURIComponent(name)}`);
  };

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
        {activeTab === "co-founders"
          ? coFounders.map((person, i) => (
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
            ))
          : investors.map((person, i) => (
              <PersonCard
                key={person.name}
                name={person.name}
                initials={person.initials}
                description={person.description}
                tags={person.companiesInvested}
                tagLabel="Companies Invested In"
                onChat={() => handleChat(person.name)}
                index={i}
              />
            ))}
      </div>
    </div>
  );
}
