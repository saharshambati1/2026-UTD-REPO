"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { apiFetch } from "@/lib/api";

// ─── Theme ─────────────────────────────────────────────────────────────────────
const BG         = "#F5F0E4";
const SIDEBAR_BG = "#FFFDF6";
const CARD_BG    = "#FFFDF6";
const BORDER     = "#DDD5C0";
const PRIMARY    = "#6B7C2D";
const ORANGE     = "#E87722";
const TEXT       = "#2A2A1E";
const MUTED      = "#7A7A60";
const MSG_ME_BG  = "#6B7C2D";
const MSG_THEM   = "#EDE7D4";
const TAG_BG     = "#EDE7D4";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Contact { id: string; name: string; role: string; avatar: string; lastMessage: string; time: string; unread: number; online: boolean; }
interface Message { id: string; sender: "me" | "them"; text: string; time: string; }
interface Template { id: string; label: string; category: string; preview: string; body: string; }
interface Thread { id: string; title: string; author: string; authorInitials: string; preview: string; tags: string[]; replies: number; views: number; time: string; pinned?: boolean; category: string; channelId?: string; }
interface ThreadReply { id: string; author: string; authorInitials: string; text: string; time: string; likes: number; }

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function timeAgo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.max(0, now.getTime() - d.getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return days === 1 ? "Yesterday" : `${days}d`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w`;
  } catch {
    return dateStr || "";
  }
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function Avatar({ initials, size = 40, online }: { initials: string; size?: number; online?: boolean }) {
  const colors = ["#6B7C2D","#4A6019","#8A9E3A","#527020","#3D4F17"];
  const safeInitials = initials || "??";
  const idx = (safeInitials.charCodeAt(0) + (safeInitials.length > 1 ? safeInitials.charCodeAt(1) : 0)) % colors.length;
  return (
    <div style={{ position:"relative", flexShrink:0 }}>
      <div style={{ width:size, height:size, borderRadius:"50%", background:colors[idx], display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.35, fontWeight:700, color:"#FFF", letterSpacing:"0.02em" }}>
        {safeInitials}
      </div>
      {online !== undefined && (
        <div style={{ position:"absolute", bottom:1, right:1, width:size*0.26, height:size*0.26, borderRadius:"50%", background:online?"#4CAF50":"#C0B898", border:`2px solid ${SIDEBAR_BG}` }}/>
      )}
    </div>
  );
}

function ContactRow({ contact, active, onClick }: { contact:Contact; active:boolean; onClick:()=>void }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 16px", cursor:"pointer", background:active?"#EDE7D4":hov?"#F5F0E4":"transparent", borderLeft:`3px solid ${active?PRIMARY:"transparent"}`, transition:"background 0.1s" }}>
      <Avatar initials={contact.avatar} size={42} online={contact.online}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
          <span style={{ fontSize:14, fontWeight:600, color:TEXT, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{contact.name}</span>
          <span style={{ fontSize:11, color:MUTED, flexShrink:0, marginLeft:8 }}>{contact.time}</span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:2 }}>
          <span style={{ fontSize:12, color:MUTED, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"85%" }}>{contact.lastMessage}</span>
          {contact.unread>0 && <div style={{ minWidth:18, height:18, borderRadius:9, background:PRIMARY, color:"#FFF", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{contact.unread}</div>}
        </div>
      </div>
    </div>
  );
}

function ThreadRow({ thread, active, onClick }: { thread:Thread; active:boolean; onClick:()=>void }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ padding:"12px 16px", cursor:"pointer", background:active?"#EDE7D4":hov?"#F5F0E4":"transparent", borderLeft:`3px solid ${active?PRIMARY:"transparent"}`, borderBottom:`1px solid ${BORDER}`, transition:"background 0.1s" }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
        <Avatar initials={thread.authorInitials} size={32}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
            {thread.pinned && <span style={{ fontSize:9, fontWeight:700, color:ORANGE, background:"rgba(232,119,34,0.10)", borderRadius:3, padding:"1px 5px", letterSpacing:"0.06em" }}>PINNED</span>}
            <span style={{ fontSize:10, color:MUTED, letterSpacing:"0.05em" }}>{thread.category.toUpperCase()}</span>
          </div>
          <div style={{ fontSize:13, fontWeight:600, color:TEXT, lineHeight:1.35, marginBottom:4, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as const }}>{thread.title}</div>
          <div style={{ display:"flex", gap:12, marginTop:4 }}>
            <span style={{ fontSize:11, color:MUTED, display:"flex", alignItems:"center", gap:3 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {thread.replies}
            </span>
            <span style={{ fontSize:11, color:MUTED }}>{thread.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ template, onUse }: { template:Template; onUse:(body:string)=>void }) {
  const [hov, setHov] = useState(false);
  const [btnHov, setBtnHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ border:`1px solid ${hov?"#C5BB9E":BORDER}`, borderRadius:10, padding:"14px 16px", background:hov?"#FFF8EE":CARD_BG, transition:"border-color 0.15s, background 0.15s" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
        <span style={{ fontSize:13, fontWeight:600, color:TEXT }}>{template.label}</span>
        <span style={{ fontSize:10, fontWeight:500, color:MUTED, background:TAG_BG, border:`1px solid ${BORDER}`, borderRadius:4, padding:"2px 7px", whiteSpace:"nowrap" }}>{template.category}</span>
      </div>
      <p style={{ fontSize:12, color:MUTED, margin:"0 0 10px", lineHeight:1.5 }}>{template.preview}</p>
      <button onClick={()=>onUse(template.body)} onMouseEnter={()=>setBtnHov(true)} onMouseLeave={()=>setBtnHov(false)}
        style={{ fontSize:12, fontWeight:600, color:"#FFF", background:btnHov?ORANGE:PRIMARY, border:"none", borderRadius:5, padding:"5px 12px", cursor:"pointer", transition:"background 0.15s" }}>
        Use Template
      </button>
    </div>
  );
}

function ChatBubble({ message }: { message:Message }) {
  const isMe = message.sender === "me";
  return (
    <div style={{ display:"flex", justifyContent:isMe?"flex-end":"flex-start", marginBottom:8 }}>
      <div style={{ maxWidth:"65%", padding:"10px 14px", borderRadius:isMe?"16px 16px 4px 16px":"16px 16px 16px 4px", background:isMe?MSG_ME_BG:MSG_THEM, color:isMe?"#FFF":TEXT, border:isMe?"none":`1px solid ${BORDER}`, fontSize:14, lineHeight:1.5 }}>
        {message.text}
        <div style={{ fontSize:10, color:isMe?"rgba(255,255,255,0.6)":MUTED, marginTop:4, textAlign:"right" }}>{message.time}</div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:32, color:MUTED, fontSize:13 }}>
      Loading...
    </div>
  );
}

// ─── Thread Detail View ─────────────────────────────────────────────────────────
function ThreadDetail({ thread, onBack }: { thread:Thread; onBack:()=>void }) {
  const [reply, setReply] = useState("");
  const [localReplies, setLocalReplies] = useState<ThreadReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingReplies(true);
    apiFetch(`/chat/threads/${thread.id}/messages?limit=50`)
      .then((data: any[]) => {
        if (cancelled) return;
        const mapped: ThreadReply[] = (data || []).map((msg: any) => ({
          id: String(msg.id),
          author: msg.sender_name || msg.sender_id || "User",
          authorInitials: getInitials(msg.sender_name || msg.sender_id || "User"),
          text: msg.content || msg.text || "",
          time: timeAgo(msg.created_at || msg.timestamp || ""),
          likes: msg.likes ?? 0,
        }));
        setLocalReplies(mapped);
      })
      .catch(() => {
        if (!cancelled) setLocalReplies([]);
      })
      .finally(() => { if (!cancelled) setLoadingReplies(false); });
    return () => { cancelled = true; };
  }, [thread.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [localReplies]);

  const submitReply = () => {
    const text = reply.trim();
    if (!text) return;
    const optimistic: ThreadReply = { id:`r${Date.now()}`, author:"You", authorInitials:"ME", text, time:"Just now", likes:0 };
    setLocalReplies(prev => [...prev, optimistic]);
    setReply("");

    apiFetch(`/chat/threads/${thread.id}/messages`, {
      method: "POST",
      body: JSON.stringify({ content: text }),
    }).catch(() => {
      // On failure, remove the optimistic reply
      setLocalReplies(prev => prev.filter(r => r.id !== optimistic.id));
    });
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
      {/* Header */}
      <div style={{ padding:"14px 20px", borderBottom:`1px solid ${BORDER}`, background:SIDEBAR_BG, display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", color:MUTED, display:"flex", alignItems:"center", gap:4, fontSize:12, padding:0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          Back
        </button>
        <div style={{ width:1, height:20, background:BORDER }}/>
        <span style={{ fontSize:11, color:MUTED, letterSpacing:"0.06em" }}>COMMUNITY</span>
      </div>

      {/* Thread content */}
      <div style={{ flex:1, overflowY:"auto", padding:"24px" }}>
        {/* Original post */}
        <div style={{ background:CARD_BG, border:`1px solid ${BORDER}`, borderRadius:12, padding:"20px 24px", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <Avatar initials={thread.authorInitials} size={38}/>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:TEXT }}>{thread.author}</div>
              <div style={{ fontSize:11, color:MUTED }}>{thread.time} ago</div>
            </div>
            {thread.pinned && <span style={{ marginLeft:"auto", fontSize:9, fontWeight:700, color:ORANGE, background:"rgba(232,119,34,0.10)", borderRadius:3, padding:"2px 6px", letterSpacing:"0.06em" }}>PINNED</span>}
          </div>
          <h2 style={{ fontSize:18, fontWeight:800, color:TEXT, lineHeight:1.3, marginBottom:14, letterSpacing:"-0.01em" }}>{thread.title}</h2>
          <p style={{ fontSize:14, color:MUTED, lineHeight:1.7, margin:"0 0 16px" }}>{thread.preview} Lorem ipsum, this is the full thread content where the author elaborates on their question or insight in detail.</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {thread.tags.map(t => (
              <span key={t} style={{ fontSize:11, color:PRIMARY, background:"rgba(107,124,45,0.10)", border:`1px solid rgba(107,124,45,0.20)`, borderRadius:20, padding:"2px 10px" }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Replies */}
        {loadingReplies ? (
          <LoadingSpinner />
        ) : localReplies.length > 0 ? (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, color:MUTED, letterSpacing:"0.07em", marginBottom:12, fontWeight:600 }}>
              {localReplies.length} {localReplies.length === 1 ? "REPLY" : "REPLIES"}
            </div>
            {localReplies.map(r => (
              <div key={r.id} style={{ display:"flex", gap:12, marginBottom:16 }}>
                <Avatar initials={r.authorInitials} size={34}/>
                <div style={{ flex:1, background:CARD_BG, border:`1px solid ${BORDER}`, borderRadius:10, padding:"12px 16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:TEXT }}>{r.author}</span>
                    <span style={{ fontSize:11, color:MUTED }}>{r.time}</span>
                  </div>
                  <p style={{ fontSize:14, color:TEXT, lineHeight:1.6, margin:"0 0 10px" }}>{r.text}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:4, color:MUTED, fontSize:12 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                    {r.likes}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        <div ref={bottomRef}/>
      </div>

      {/* Reply input */}
      <div style={{ borderTop:`1px solid ${BORDER}`, padding:"12px 16px", background:SIDEBAR_BG, display:"flex", gap:10, alignItems:"flex-end" }}>
        <textarea
          value={reply} onChange={e=>setReply(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submitReply();}}}
          placeholder="Write a reply… (Enter to post)"
          rows={1}
          style={{ flex:1, background:BG, border:`1.5px solid ${BORDER}`, borderRadius:10, padding:"10px 14px", color:TEXT, fontSize:14, outline:"none", resize:"none", lineHeight:1.5, maxHeight:100, overflowY:"auto", fontFamily:"Georgia, serif" }}
        />
        <button onClick={submitReply} disabled={!reply.trim()}
          style={{ flexShrink:0, width:36, height:36, borderRadius:8, border:"none", background:reply.trim()?PRIMARY:"#C8C0A8", color:"#FFF", cursor:reply.trim()?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.15s" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9l20-7z"/></svg>
        </button>
      </div>
    </div>
  );
}

// ─── New Thread Modal ──────────────────────────────────────────────────────────
function NewThreadModal({ onClose, onSubmit }: { onClose:()=>void; onSubmit:(title:string, body:string, tags:string[])=>void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const addTag = () => {
    const t = tag.trim();
    if (t && !tags.includes(t) && tags.length < 5) { setTags(p=>[...p, t]); setTag(""); }
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(42,42,30,0.45)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={onClose}>
      <div style={{ background:CARD_BG, border:`1px solid ${BORDER}`, borderRadius:16, padding:"28px 28px 24px", maxWidth:560, width:"100%", boxShadow:"0 8px 40px rgba(42,42,30,0.18)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ margin:0, fontSize:17, fontWeight:800, color:TEXT }}>Start a Thread</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:MUTED, fontSize:18, lineHeight:1 }}>×</button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:"0.08em", display:"block", marginBottom:5 }}>TITLE</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="What's your question or insight?" maxLength={120}
              style={{ width:"100%", background:BG, border:`1.5px solid ${BORDER}`, borderRadius:8, padding:"10px 14px", fontSize:14, color:TEXT, outline:"none", fontFamily:"Georgia, serif", boxSizing:"border-box" }}
              onFocus={e=>(e.currentTarget.style.borderColor=PRIMARY)} onBlur={e=>(e.currentTarget.style.borderColor=BORDER)}/>
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:"0.08em", display:"block", marginBottom:5 }}>BODY</label>
            <textarea value={body} onChange={e=>setBody(e.target.value)} rows={5} placeholder="Share context, details, or your full post…"
              style={{ width:"100%", background:BG, border:`1.5px solid ${BORDER}`, borderRadius:8, padding:"10px 14px", fontSize:14, color:TEXT, outline:"none", resize:"vertical", lineHeight:1.6, fontFamily:"Georgia, serif", boxSizing:"border-box" }}
              onFocus={e=>(e.currentTarget.style.borderColor=PRIMARY)} onBlur={e=>(e.currentTarget.style.borderColor=BORDER)}/>
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:"0.08em", display:"block", marginBottom:5 }}>TAGS (up to 5)</label>
            <div style={{ display:"flex", gap:8, marginBottom:8, flexWrap:"wrap" }}>
              {tags.map(t=>(
                <span key={t} style={{ fontSize:12, color:PRIMARY, background:"rgba(107,124,45,0.10)", border:`1px solid rgba(107,124,45,0.20)`, borderRadius:20, padding:"3px 10px", display:"flex", alignItems:"center", gap:5 }}>
                  {t}
                  <button onClick={()=>setTags(p=>p.filter(x=>x!==t))} style={{ background:"none", border:"none", cursor:"pointer", color:MUTED, fontSize:13, lineHeight:1, padding:0 }}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <input value={tag} onChange={e=>setTag(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addTag();}}} placeholder="e.g. Fundraising"
                style={{ flex:1, background:BG, border:`1.5px solid ${BORDER}`, borderRadius:8, padding:"8px 12px", fontSize:13, color:TEXT, outline:"none", fontFamily:"Georgia, serif" }}
                onFocus={e=>(e.currentTarget.style.borderColor=PRIMARY)} onBlur={e=>(e.currentTarget.style.borderColor=BORDER)}/>
              <button onClick={addTag} style={{ padding:"8px 14px", background:PRIMARY, color:"#FFF", border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer" }}>Add</button>
            </div>
          </div>
        </div>

        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:20 }}>
          <button onClick={onClose} style={{ padding:"9px 18px", background:"transparent", border:`1px solid ${BORDER}`, borderRadius:8, fontSize:13, color:MUTED, cursor:"pointer" }}>Cancel</button>
          <button onClick={()=>{ if(title.trim()) onSubmit(title, body, tags); }} disabled={!title.trim()}
            style={{ padding:"9px 22px", background:title.trim()?PRIMARY:"#C8C0A8", color:"#FFF", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:title.trim()?"pointer":"not-allowed", transition:"background 0.15s" }}>
            Post Thread
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
function MessagesContent() {
  const searchParams = useSearchParams();
  const initialThread = searchParams.get("openThread");

  // ── Data state (fetched from APIs) ──────────────────────────────────────────
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  // ── Loading state ───────────────────────────────────────────────────────────
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<"dms"|"community">("dms");
  const [activeId, setActiveId] = useState<string|null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string|null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showNewThread, setShowNewThread] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Fetch DM contacts on mount ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoadingContacts(true);
    apiFetch("/chat/dm")
      .then((data: any[]) => {
        if (cancelled) return;
        const mapped: Contact[] = (data || []).map((thread: any) => {
          const partnerName = thread.partner_name || thread.partner?.name || thread.partner?.email || `Thread ${thread.id}`;
          return {
            id: String(thread.id),
            name: partnerName,
            role: thread.partner_role || thread.partner?.role || "",
            avatar: getInitials(partnerName),
            lastMessage: thread.last_message?.content || thread.last_message?.text || "",
            time: timeAgo(thread.last_message?.created_at || thread.updated_at || thread.created_at || ""),
            unread: thread.unread_count ?? 0,
            online: thread.partner_online ?? thread.partner?.online ?? false,
          };
        });
        setContacts(mapped);

        // If openThread query param matches a contact name, select it
        if (initialThread) {
          const match = mapped.find(c => c.name === initialThread);
          if (match) setActiveId(match.id);
        }
      })
      .catch(() => {
        if (!cancelled) setContacts([]);
      })
      .finally(() => { if (!cancelled) setLoadingContacts(false); });
    return () => { cancelled = true; };
  }, [initialThread]);

  // ── Fetch templates on mount ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoadingTemplates(true);
    apiFetch("/api/templates")
      .then((data: any[]) => {
        if (cancelled) return;
        const mapped: Template[] = (data || []).map((t: any) => ({
          id: String(t.id),
          label: t.label || t.name || t.title || "",
          category: t.category || "",
          preview: t.preview || t.description || "",
          body: t.body || t.content || t.text || "",
        }));
        setTemplates(mapped);
      })
      .catch(() => {
        if (!cancelled) setTemplates([]);
      })
      .finally(() => { if (!cancelled) setLoadingTemplates(false); });
    return () => { cancelled = true; };
  }, []);

  // ── Fetch community threads on mount ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoadingThreads(true);
    apiFetch("/chat/communities")
      .then(async (communities: any[]) => {
        if (cancelled || !communities || communities.length === 0) {
          if (!cancelled) setThreads([]);
          return;
        }
        // Fetch channels for all communities in parallel
        const channelSets = await Promise.all(
          communities.map((c: any) =>
            apiFetch(`/chat/communities/${c.id}/channels`).catch(() => [])
          )
        );
        if (cancelled) return;

        // Flatten all channels
        const allChannels: any[] = channelSets.flat();

        // Fetch threads for all channels in parallel
        const threadSets = await Promise.all(
          allChannels.map((ch: any) =>
            apiFetch(`/chat/channels/${ch.id}/threads?limit=30`)
              .then((threads: any[]) => (threads || []).map((t: any) => ({ ...t, _channelId: ch.id })))
              .catch(() => [])
          )
        );
        if (cancelled) return;

        const allThreads: Thread[] = threadSets.flat().map((t: any) => ({
          id: String(t.id),
          title: t.title || "",
          author: t.author_name || t.author?.name || `User ${t.author_id || ""}`.trim(),
          authorInitials: getInitials(t.author_name || t.author?.name || `U${t.author_id || ""}`),
          preview: t.preview || t.body || t.content || "",
          tags: t.tags || [],
          replies: t.reply_count ?? t.replies ?? 0,
          views: t.view_count ?? t.views ?? 0,
          time: timeAgo(t.created_at || t.timestamp || ""),
          pinned: t.pinned ?? false,
          category: t.category || t.channel_name || "General",
          channelId: String(t._channelId || t.channel_id || ""),
        }));

        setThreads(allThreads);
      })
      .catch(() => {
        if (!cancelled) setThreads([]);
      })
      .finally(() => { if (!cancelled) setLoadingThreads(false); });
    return () => { cancelled = true; };
  }, []);

  // ── Fetch messages when selecting a contact ─────────────────────────────────
  const fetchMessages = useCallback((contactId: string) => {
    if (messages[contactId]) return; // Already cached
    setLoadingMessages(true);
    apiFetch(`/chat/threads/${contactId}/messages?limit=50`)
      .then((data: any[]) => {
        const mapped: Message[] = (data || []).map((msg: any) => ({
          id: String(msg.id),
          sender: msg.is_mine || msg.sender === "me" ? "me" as const : "them" as const,
          text: msg.content || msg.text || "",
          time: msg.created_at
            ? new Date(msg.created_at).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })
            : msg.time || "",
        }));
        setMessages(prev => ({ ...prev, [contactId]: mapped }));
      })
      .catch(() => {
        setMessages(prev => ({ ...prev, [contactId]: [] }));
      })
      .finally(() => setLoadingMessages(false));
  }, [messages]);

  useEffect(() => {
    if (activeId) fetchMessages(activeId);
  }, [activeId, fetchMessages]);

  // ── Derived state ───────────────────────────────────────────────────────────
  const activeContact = contacts.find(c=>c.id===activeId) ?? null;
  const activeThread  = threads.find(t=>t.id===activeThreadId) ?? null;
  const filtered      = contacts.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.role.toLowerCase().includes(search.toLowerCase()));
  const filteredThreads = threads.filter(t=>t.title.toLowerCase().includes(search.toLowerCase())||t.tags.some(tag=>tag.toLowerCase().includes(search.toLowerCase())));

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [activeId, messages]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text || !activeId) return;
    const newMsg: Message = { id:`m${Date.now()}`, sender:"me", text, time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) };
    setMessages(prev=>({...prev,[activeId]:[...(prev[activeId]??[]),newMsg]}));
    setDraft(""); setShowTemplates(false);

    apiFetch(`/chat/threads/${activeId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content: text }),
    }).catch(() => {
      // On failure, remove the optimistic message
      setMessages(prev => {
        const curr = prev[activeId] ?? [];
        return { ...prev, [activeId]: curr.filter(m => m.id !== newMsg.id) };
      });
    });
  };

  const handleKeyDown = (e:React.KeyboardEvent<HTMLTextAreaElement>) => {
    if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}
  };

  const handleNewThread = (title:string, body:string, tags:string[]) => {
    // Find the first channel to post to (if available)
    const firstThread = threads.find(t => t.channelId);
    const channelId = firstThread?.channelId;

    if (channelId) {
      apiFetch(`/chat/channels/${channelId}/threads`, {
        method: "POST",
        body: JSON.stringify({ title }),
      })
        .then((created: any) => {
          const newThread: Thread = {
            id: String(created.id),
            title: created.title || title,
            author: "You",
            authorInitials: "ME",
            preview: body || "No body provided.",
            tags,
            replies: 0,
            views: 0,
            time: "Just now",
            category: created.category || "General",
            channelId,
          };
          setThreads(prev => [newThread, ...prev]);
          setShowNewThread(false);
          setActiveThreadId(newThread.id);
        })
        .catch(() => {
          // Fallback: add optimistically even if API fails
          const newThread: Thread = {
            id: `th${Date.now()}`,
            title, author:"You", authorInitials:"ME",
            preview: body || "No body provided.",
            tags, replies:0, views:0, time:"Just now", category:"General",
          };
          setThreads(prev=>[newThread,...prev]);
          setShowNewThread(false);
          setActiveThreadId(newThread.id);
        });
    } else {
      // No channel available, add locally
      const newThread: Thread = {
        id: `th${Date.now()}`,
        title, author:"You", authorInitials:"ME",
        preview: body || "No body provided.",
        tags, replies:0, views:0, time:"Just now", category:"General",
      };
      setThreads(prev=>[newThread,...prev]);
      setShowNewThread(false);
      setActiveThreadId(newThread.id);
    }
  };

  const tabBtn = (label:string, value:"dms"|"community", badge?:number) => {
    const active = tab === value;
    return (
      <button onClick={()=>{setTab(value);setSearch("");}}
        style={{ flex:1, padding:"10px 0", background:"none", border:"none", borderBottom:`2px solid ${active?PRIMARY:"transparent"}`, color:active?PRIMARY:MUTED, fontSize:13, fontWeight:active?700:500, cursor:"pointer", transition:"all 0.15s", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
        {label}
        {badge&&badge>0 ? <span style={{ minWidth:16, height:16, borderRadius:8, background:ORANGE, color:"#FFF", fontSize:9, fontWeight:700, display:"inline-flex", alignItems:"center", justifyContent:"center" }}>{badge}</span> : null}
      </button>
    );
  };

  const totalUnread = contacts.reduce((s,c)=>s+c.unread,0);

  return (
    <div style={{ margin:"-2rem", height:"100vh", display:"flex", background:BG, overflow:"hidden" }}>
      {showNewThread && <NewThreadModal onClose={()=>setShowNewThread(false)} onSubmit={handleNewThread}/>}

      {/* Left panel */}
      <div style={{ width:290, flexShrink:0, borderRight:`1px solid ${BORDER}`, display:"flex", flexDirection:"column", background:SIDEBAR_BG }}>
        {/* Header */}
        <div style={{ padding:"18px 16px 0", borderBottom:`1px solid ${BORDER}` }}>
          <h2 style={{ margin:"0 0 12px", fontSize:18, fontWeight:700, color:TEXT }}>Messages</h2>
          {/* Tabs */}
          <div style={{ display:"flex", gap:0 }}>
            {tabBtn("Direct", "dms", totalUnread)}
            {tabBtn("Community", "community")}
          </div>
        </div>

        {/* Search */}
        <div style={{ padding:"10px 12px", borderBottom:`1px solid ${BORDER}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:BG, border:`1px solid ${BORDER}`, borderRadius:8, padding:"8px 12px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder={tab==="dms"?"Search people…":"Search threads…"} value={search} onChange={e=>setSearch(e.target.value)}
              style={{ background:"transparent", border:"none", outline:"none", color:TEXT, fontSize:13, flex:1 }}/>
          </div>
        </div>

        {tab === "dms" ? (
          <div style={{ flex:1, overflowY:"auto" }}>
            {loadingContacts ? <LoadingSpinner /> : filtered.length === 0 ? <p style={{ color:MUTED, fontSize:13, padding:16 }}>No contacts found.</p> : filtered.map(c=>(
              <ContactRow key={c.id} contact={c} active={c.id===activeId}
                onClick={()=>{setActiveId(c.id);setShowTemplates(false);setDraft("");}}/>
            ))}
          </div>
        ) : (
          <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"10px 12px", borderBottom:`1px solid ${BORDER}` }}>
              <button onClick={()=>setShowNewThread(true)}
                style={{ width:"100%", padding:"8px 0", background:PRIMARY, color:"#FFF", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"background 0.15s" }}
                onMouseEnter={e=>(e.currentTarget.style.background=ORANGE)} onMouseLeave={e=>(e.currentTarget.style.background=PRIMARY)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                New Thread
              </button>
            </div>
            {loadingThreads ? <LoadingSpinner /> : filteredThreads.length === 0 ? <p style={{ color:MUTED, fontSize:13, padding:16 }}>No threads found.</p> : filteredThreads.map(t=>(
              <ThreadRow key={t.id} thread={t} active={t.id===activeThreadId} onClick={()=>setActiveThreadId(t.id)}/>
            ))}
          </div>
        )}
      </div>

      {/* Right panel */}
      {tab === "community" ? (
        activeThread ? (
          <ThreadDetail thread={activeThread} onBack={()=>setActiveThreadId(null)}/>
        ) : (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, gap:16 }}>
            <div style={{ width:52, height:52, borderRadius:12, background:TAG_BG, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div style={{ textAlign:"center" }}>
              <h3 style={{ margin:"0 0 6px", fontSize:17, fontWeight:700, color:TEXT }}>Community Threads</h3>
              <p style={{ margin:0, fontSize:13, color:MUTED, maxWidth:280, lineHeight:1.6 }}>Select a thread to read and reply, or start a new discussion.</p>
            </div>
            <button onClick={()=>setShowNewThread(true)}
              style={{ padding:"10px 24px", background:PRIMARY, color:"#FFF", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer" }}>
              Start a Thread
            </button>
          </div>
        )
      ) : (
        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, background:BG }}>
          {activeContact ? (
            <>
              <div style={{ padding:"14px 20px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:12, background:SIDEBAR_BG }}>
                <Avatar initials={activeContact.avatar} size={38} online={activeContact.online}/>
                <div>
                  <div style={{ fontSize:15, fontWeight:600, color:TEXT, lineHeight:1.2 }}>{activeContact.name}</div>
                  <div style={{ fontSize:12, color:MUTED, marginTop:1 }}>{activeContact.role} · {activeContact.online?"Online":"Offline"}</div>
                </div>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:"20px 24px", display:"flex", flexDirection:"column" }}>
                {loadingMessages ? <LoadingSpinner /> : (messages[activeContact.id]??[]).map(msg=><ChatBubble key={msg.id} message={msg}/>)}
                <div ref={bottomRef}/>
              </div>
              {showTemplates && (
                <div style={{ borderTop:`1px solid ${BORDER}`, padding:"14px 18px", background:SIDEBAR_BG, maxHeight:300, overflowY:"auto" }}>
                  <p style={{ margin:"0 0 10px", fontSize:11, color:MUTED, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" }}>Message Templates</p>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(230px, 1fr))", gap:10 }}>
                    {loadingTemplates ? <LoadingSpinner /> : templates.map(t=><TemplateCard key={t.id} template={t} onUse={b=>{setDraft(b);setShowTemplates(false);}}/>)}
                  </div>
                </div>
              )}
              <div style={{ borderTop:`1px solid ${BORDER}`, padding:"12px 16px", background:SIDEBAR_BG, display:"flex", gap:10, alignItems:"flex-end" }}>
                <button onClick={()=>setShowTemplates(v=>!v)}
                  style={{ flexShrink:0, width:36, height:36, borderRadius:8, border:`1.5px solid ${showTemplates?PRIMARY:BORDER}`, background:showTemplates?PRIMARY:"transparent", color:showTemplates?"#FFF":MUTED, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                </button>
                <textarea value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message… (Enter to send)" rows={1}
                  style={{ flex:1, background:BG, border:`1.5px solid ${BORDER}`, borderRadius:10, padding:"10px 14px", color:TEXT, fontSize:14, outline:"none", resize:"none", lineHeight:1.5, maxHeight:120, overflowY:"auto", fontFamily:"Georgia, serif" }}/>
                <button onClick={sendMessage} disabled={!draft.trim()}
                  style={{ flexShrink:0, width:36, height:36, borderRadius:8, border:"none", background:draft.trim()?PRIMARY:"#C8C0A8", color:"#FFF", cursor:draft.trim()?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.15s" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9l20-7z"/></svg>
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 24px", gap:28 }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ width:56, height:56, borderRadius:14, background:TAG_BG, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <h3 style={{ margin:"0 0 6px", fontSize:18, fontWeight:600, color:TEXT }}>Your messages</h3>
                <p style={{ margin:0, fontSize:13, color:MUTED, maxWidth:300, lineHeight:1.6 }}>Select a conversation or use a template to start networking.</p>
              </div>
              <div style={{ width:"100%", maxWidth:640 }}>
                <p style={{ margin:"0 0 12px", fontSize:11, color:MUTED, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", textAlign:"center" }}>Quick Templates</p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(230px, 1fr))", gap:10 }}>
                  {loadingTemplates ? <LoadingSpinner /> : templates.map(t=><TemplateCard key={t.id} template={t} onUse={b=>{if(contacts[0]){setActiveId(contacts[0].id);setDraft(b);}}}/>)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div style={{color:MUTED,padding:24}}>Loading messages…</div>}>
      <MessagesContent/>
    </Suspense>
  );
}
