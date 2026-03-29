"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const CARD_BG = "#FFFDF6";
const BORDER  = "#DDD5C0";
const PRIMARY = "#6B7C2D";
const ORANGE  = "#E87722";
const TEXT    = "#2A2A1E";
const MUTED   = "#7A7A60";
const TAG_BG  = "#EDE7D4";

const SHADOW     = "0 2px 10px rgba(107,124,45,0.08), 0 1px 0 rgba(255,255,255,0.9) inset";
const SHADOW_HOV = "0 8px 28px rgba(107,124,45,0.14), 0 2px 8px rgba(107,124,45,0.07), 0 1px 0 rgba(255,255,255,0.9) inset";

function SettingCard({ title, description, children, index = 0 }: { title: string; description?: string; children: React.ReactNode; index?: number }) {
  return (
    <div style={{
      background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14,
      overflow: "hidden",
      boxShadow: SHADOW,
      animation: `cardEnter 0.4s cubic-bezier(0.22,1,0.36,1) ${index * 0.08}s both`,
    }}>
      <div style={{ padding: "18px 22px 14px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{title}</div>
        {description && <div style={{ fontSize: 12, color: MUTED, marginTop: 3, lineHeight: 1.5 }}>{description}</div>}
      </div>
      <div style={{ padding: "18px 22px" }}>{children}</div>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{label}</div>
        {description && <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{description}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
      background: on ? PRIMARY : "#C8C0A8",
      position: "relative", flexShrink: 0,
      transition: "background 0.2s",
    }}>
      <div style={{
        position: "absolute", top: 2, left: on ? 20 : 2,
        width: 18, height: 18, borderRadius: "50%",
        background: "#FFF", boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
        transition: "left 0.2s",
      }}/>
    </button>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        padding: "8px 12px", background: TAG_BG,
        border: `1.5px solid ${focused ? PRIMARY : BORDER}`,
        borderRadius: 8, color: TEXT, fontSize: 13,
        fontFamily: "Georgia, serif", outline: "none",
        width: 200, transition: "border-color 0.15s",
      }}/>
  );
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      padding: "8px 12px", background: TAG_BG, border: `1.5px solid ${BORDER}`,
      borderRadius: 8, color: TEXT, fontSize: 13,
      fontFamily: "Georgia, serif", outline: "none", cursor: "pointer",
    }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

function SaveBtn({ label = "Save changes", onClick }: { label?: string; onClick?: () => void }) {
  const [hov, setHov] = useState(false);
  const [saved, setSaved] = useState(false);
  const handleClick = () => {
    if (onClick) onClick();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  return (
    <button onClick={handleClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "8px 20px", background: saved ? "#4CAF50" : hov ? ORANGE : PRIMARY,
        color: "#FFF", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700,
        cursor: "pointer", transition: "background 0.15s",
        boxShadow: "0 2px 8px rgba(107,124,45,0.18)",
      }}>
      {saved ? "Saved \u2713" : label}
    </button>
  );
}

export default function SettingsPage() {
  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [university, setUniversity] = useState("UT Dallas");
  const [role,       setRole]       = useState("Founder");
  const [emailNtfy,  setEmailNtfy]  = useState(true);
  const [msgNtfy,    setMsgNtfy]    = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);
  const [showEmail,  setShowEmail]  = useState(false);
  const [theme,      setTheme]      = useState("Parchment (default)");

  const [loading, setLoading]   = useState(true);
  const [userId, setUserId]     = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        setUserId(user.id);

        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          setName(profile.full_name ?? "");
          setEmail(profile.email ?? user.email ?? "");
          setUniversity(profile.college ?? "UT Dallas");
          setRole(profile.major ?? "Founder");
        } else {
          // No profile row yet -- fall back to auth email
          setEmail(user.email ?? "");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!userId || saving) return;
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase
        .from("users")
        .update({ full_name: name, college: university })
        .eq("id", userId);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "80px 0", textAlign: "center" }}>
        <div style={{ fontSize: 14, color: MUTED }}>Loading settings...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: TEXT, letterSpacing: "-0.02em" }}>Settings</h1>
        <p style={{ fontSize: 14, color: MUTED, marginTop: 4 }}>Manage your account and preferences.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Profile */}
        <SettingCard title="Profile" description="How you appear to other founders, investors, and researchers." index={0}>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <SettingRow label="Full name" description="Shown on your public profile">
              <TextInput value={name} onChange={setName} placeholder="Your name"/>
            </SettingRow>
            <SettingRow label="Email address" description="Used for login and notifications">
              <TextInput value={email} onChange={setEmail} placeholder="you@email.com"/>
            </SettingRow>
            <SettingRow label="University" description="Your current institution">
              <SelectInput value={university} onChange={setUniversity} options={["UT Dallas","UT Austin","Texas A&M","Rice University","Other"]}/>
            </SettingRow>
            <SettingRow label="Role" description="How others see you on the platform">
              <SelectInput value={role} onChange={setRole} options={["Founder","Student","Researcher","Investor","Mentor"]}/>
            </SettingRow>
          </div>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <SaveBtn onClick={handleSave}/>
          </div>
        </SettingCard>

        {/* Notifications */}
        <SettingCard title="Notifications" description="Control what updates you receive." index={1}>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <SettingRow label="Email notifications" description="New messages and connection requests">
              <Toggle on={emailNtfy} onChange={setEmailNtfy}/>
            </SettingRow>
            <SettingRow label="In-app messages" description="Notify when you receive a new message">
              <Toggle on={msgNtfy} onChange={setMsgNtfy}/>
            </SettingRow>
            <SettingRow label="Weekly digest" description="Summary of new labs, threads, and clubs">
              <Toggle on={weeklyDigest} onChange={setWeeklyDigest}/>
            </SettingRow>
          </div>
        </SettingCard>

        {/* Privacy */}
        <SettingCard title="Privacy" description="Manage your visibility and data." index={2}>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <SettingRow label="Public profile" description="Anyone on ConnectEDU can view your profile">
              <Toggle on={publicProfile} onChange={setPublicProfile}/>
            </SettingRow>
            <SettingRow label="Show email address" description="Display your email on your public profile">
              <Toggle on={showEmail} onChange={setShowEmail}/>
            </SettingRow>
          </div>
        </SettingCard>

        {/* Appearance */}
        <SettingCard title="Appearance" index={3}>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <SettingRow label="Theme" description="Visual theme for the platform">
              <SelectInput value={theme} onChange={setTheme} options={["Parchment (default)"]}/>
            </SettingRow>
          </div>
        </SettingCard>

        {/* Danger zone */}
        <SettingCard title="Account" index={4}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Delete account</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Permanently delete your account and all data.</div>
            </div>
            <button style={{
              padding: "8px 16px", background: "transparent",
              border: "1px solid #DDB5B0", borderRadius: 8,
              color: "#C04040", fontSize: 12, fontWeight: 600, cursor: "pointer",
              transition: "background 0.15s, border-color 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#FDF0F0"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
              Delete account
            </button>
          </div>
        </SettingCard>
      </div>
    </div>
  );
}
