"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Muted sage-green palette
const SIDEBAR_BG     = "#4A5535";
const SIDEBAR_BORDER = "#3A4428";
const SIDEBAR_TEXT   = "#E8E2D0";
const SIDEBAR_MUTED  = "#9EAA7E";
const SIDEBAR_ACTIVE_BG = "rgba(232,119,34,0.18)";
const HOVER_BG       = "rgba(232,119,34,0.10)";
const ORANGE         = "#E87722";

// ── Icons ─────────────────────────────────────────────────────────────────────

const MessageIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const SettingsIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const ClubsIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ResearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const StartupIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>;

const ChevronLeft  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevronRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const ChevronDown  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const ChevronUp    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>;

// ── Nav item ──────────────────────────────────────────────────────────────────

function NavItem({ href, icon, label, active, collapsed }: {
  href: string; icon: React.ReactNode; label: string; active: boolean; collapsed: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: collapsed ? 0 : 11,
        padding: collapsed ? "10px 0" : "9px 14px",
        borderRadius: 8,
        color: active ? "#FFF" : hov ? SIDEBAR_TEXT : SIDEBAR_MUTED,
        background: active ? SIDEBAR_ACTIVE_BG : hov ? HOVER_BG : "transparent",
        textDecoration: "none",
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        transition: "background 0.15s, color 0.15s",
        borderLeft: active ? `3px solid ${ORANGE}` : "3px solid transparent",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ flexShrink: 0, display: "flex" }}>{icon}</span>
      {!collapsed && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>}
    </Link>
  );
}

function SubNavItem({ href, label, active, collapsed }: {
  href: string; label: string; active: boolean; collapsed: boolean;
}) {
  const [hov, setHov] = useState(false);
  if (collapsed) return null; // hide sub-items when collapsed
  return (
    <Link
      href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "7px 12px", borderRadius: 6,
        color: active ? "#FFF" : hov ? SIDEBAR_TEXT : SIDEBAR_MUTED,
        background: active ? SIDEBAR_ACTIVE_BG : hov ? HOVER_BG : "transparent",
        textDecoration: "none", fontSize: 12, fontWeight: active ? 600 : 400,
        transition: "background 0.15s, color 0.15s",
      }}
    >
      <span style={{
        width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
        background: active ? ORANGE : hov ? SIDEBAR_MUTED : "transparent",
        border: `1.5px solid ${active ? ORANGE : SIDEBAR_MUTED}`,
        transition: "background 0.15s",
      }}/>
      {label}
    </Link>
  );
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [startupExpanded, setStartupExpanded] = useState(pathname.startsWith("/startup"));
  const [startupHov, setStartupHov] = useState(false);

  const isActive = (p: string) => pathname === p;
  const isStartupActive = pathname.startsWith("/startup");

  const W = collapsed ? 68 : 218;

  return (
    <nav style={{
      width: W, minWidth: W, minHeight: "100vh",
      background: SIDEBAR_BG,
      borderRight: `1px solid ${SIDEBAR_BORDER}`,
      display: "flex", flexDirection: "column",
      padding: collapsed ? "0 8px" : "0 10px",
      flexShrink: 0,
      transition: "width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s cubic-bezier(0.4,0,0.2,1), padding 0.22s",
      overflow: "hidden",
    }}>

      {/* Brand */}
      <div style={{
        padding: collapsed ? "20px 0" : "22px 6px 18px",
        borderBottom: `1px solid ${SIDEBAR_BORDER}`,
        marginBottom: 6,
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: 8,
        overflow: "hidden",
      }}>
        {/* Logo mark */}
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: ORANGE, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#FFF",
        }}>C</div>
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#FFF", whiteSpace: "nowrap" }}>ConnectEDU</div>
            <div style={{ fontSize: 10, color: SIDEBAR_MUTED, whiteSpace: "nowrap" }}>Academic Founder Platform</div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        <NavItem href="/messages"    icon={<MessageIcon  />} label="Messages"      active={isActive("/messages")}    collapsed={collapsed} />
        <NavItem href="/settings"    icon={<SettingsIcon />} label="Settings"      active={isActive("/settings")}    collapsed={collapsed} />
        <NavItem href="/clubs"       icon={<ClubsIcon    />} label="Clubs"         active={isActive("/clubs")}       collapsed={collapsed} />
        <NavItem href="/research-lab" icon={<ResearchIcon />} label="Research & Lab" active={isActive("/research-lab")} collapsed={collapsed} />

        {/* Startup expandable */}
        <div>
          <button
            onClick={() => {
              if (collapsed) return; // do nothing on click when collapsed — link handles nav
              setStartupExpanded(v => !v);
            }}
            onMouseEnter={() => setStartupHov(true)}
            onMouseLeave={() => setStartupHov(false)}
            title={collapsed ? "Startup" : undefined}
            style={{
              width: "100%",
              display: "flex", alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: collapsed ? 0 : 11,
              padding: collapsed ? "10px 0" : "9px 14px",
              borderRadius: 8,
              color: isStartupActive ? "#FFF" : startupHov ? SIDEBAR_TEXT : SIDEBAR_MUTED,
              background: isStartupActive ? SIDEBAR_ACTIVE_BG : startupHov ? HOVER_BG : "transparent",
              border: "none",
              borderLeft: isStartupActive ? `3px solid ${ORANGE}` : "3px solid transparent",
              fontSize: 13, fontWeight: isStartupActive ? 600 : 400,
              cursor: "pointer", textAlign: "left",
              transition: "background 0.15s, color 0.15s",
              overflow: "hidden", whiteSpace: "nowrap",
            }}
          >
            <span style={{ flexShrink: 0, display: "flex" }}><StartupIcon /></span>
            {!collapsed && (
              <>
                <span style={{ flex: 1 }}>Startup</span>
                <span style={{ flexShrink: 0 }}>{startupExpanded ? <ChevronUp /> : <ChevronDown />}</span>
              </>
            )}
          </button>

          {/* Sub-items — only when expanded and sidebar not collapsed */}
          {startupExpanded && !collapsed && (
            <div style={{ paddingLeft: 16, paddingTop: 2, paddingBottom: 2, display: "flex", flexDirection: "column", gap: 1 }}>
              <SubNavItem href="/startup/plan" label="AI Plan" active={isActive("/startup/plan") || isActive("/startup/compare")} collapsed={collapsed} />
              <SubNavItem href="/startup/find" label="Find"    active={isActive("/startup/find")} collapsed={collapsed} />
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <div style={{ padding: collapsed ? "12px 0" : "12px 4px", borderTop: `1px solid ${SIDEBAR_BORDER}`, display: "flex", justifyContent: collapsed ? "center" : "flex-end" }}>
        <button
          onClick={() => setCollapsed(v => !v)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            width: 30, height: 30, borderRadius: 6, border: `1px solid ${SIDEBAR_BORDER}`,
            background: "transparent", color: SIDEBAR_MUTED,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = HOVER_BG; (e.currentTarget as HTMLButtonElement).style.color = ORANGE; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = SIDEBAR_MUTED; }}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>
    </nav>
  );
}
