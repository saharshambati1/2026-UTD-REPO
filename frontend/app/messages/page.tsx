"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

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
interface Thread { id: string; title: string; author: string; authorInitials: string; preview: string; tags: string[]; replies: number; views: number; time: string; pinned?: boolean; category: string; }
interface ThreadReply { id: string; author: string; authorInitials: string; text: string; time: string; likes: number; }

// ─── Static data ───────────────────────────────────────────────────────────────
const CONTACTS: Contact[] = [
  { id: "1", name: "Sarah Chen",   role: "Venture Capitalist",   avatar: "SC", lastMessage: "Looking forward to hearing more about your traction.", time: "2m",        unread: 2, online: true  },
  { id: "2", name: "Marcus Reid",  role: "Startup Mentor",        avatar: "MR", lastMessage: "Let's schedule that call for next week.",             time: "1h",        unread: 0, online: true  },
  { id: "3", name: "Priya Nair",   role: "Full-Stack Engineer",   avatar: "PN", lastMessage: "I've been working on a similar stack — happy to help.", time: "3h",       unread: 1, online: false },
  { id: "4", name: "James Wu",     role: "Product Designer",      avatar: "JW", lastMessage: "Here are the updated Figma frames.",                  time: "Yesterday", unread: 0, online: false },
  { id: "5", name: "Leila Hassan", role: "Angel Investor",        avatar: "LH", lastMessage: "Your deck is compelling. Let's talk.",                time: "2d",        unread: 0, online: false },
];

const SEED_MESSAGES: Record<string, Message[]> = {
  "1": [
    { id:"m1", sender:"them", text:"Hi! I saw your startup profile — really interesting space.", time:"10:00 AM" },
    { id:"m2", sender:"me",   text:"Thanks Sarah! We're building a B2B SaaS for startup networking.", time:"10:02 AM" },
    { id:"m3", sender:"them", text:"What's your current ARR and growth rate?", time:"10:05 AM" },
    { id:"m4", sender:"me",   text:"We're pre-revenue but have 200 waitlist signups in 3 weeks.", time:"10:06 AM" },
    { id:"m5", sender:"them", text:"Looking forward to hearing more about your traction.", time:"10:08 AM" },
  ],
  "2": [
    { id:"m1", sender:"them", text:"Hey! I mentor founders at the early stage. What are you working on?", time:"9:00 AM" },
    { id:"m2", sender:"me",   text:"We're building tooling for startup founders to find co-founders and investors.", time:"9:10 AM" },
    { id:"m3", sender:"them", text:"That's a crowded space — what's your differentiation?", time:"9:15 AM" },
    { id:"m4", sender:"me",   text:"AI-powered matching + warm intros through shared connections.", time:"9:17 AM" },
    { id:"m5", sender:"them", text:"Let's schedule that call for next week.", time:"9:20 AM" },
  ],
  "3": [
    { id:"m1", sender:"me",   text:"Hey Priya, I noticed you have experience with Next.js + Supabase?", time:"2:00 PM" },
    { id:"m2", sender:"them", text:"Yeah, 3 years. What do you need help with?", time:"2:05 PM" },
    { id:"m3", sender:"me",   text:"We're running into issues with real-time subscriptions at scale.", time:"2:06 PM" },
    { id:"m4", sender:"them", text:"I've been working on a similar stack — happy to help.", time:"2:10 PM" },
  ],
  "4": [
    { id:"m1", sender:"me",   text:"James, could you share the updated design frames when ready?", time:"Yesterday" },
    { id:"m2", sender:"them", text:"Here are the updated Figma frames.", time:"Yesterday" },
  ],
  "5": [
    { id:"m1", sender:"me",   text:"Hi Leila, I'd love to share what we're building with you.", time:"Mon" },
    { id:"m2", sender:"them", text:"Your deck is compelling. Let's talk.", time:"Tue" },
  ],
};

const TEMPLATES: Template[] = [
  { id:"t1", label:"Introduction",         category:"Networking",    preview:"Hi [Name], I'd love to connect…",           body:"Hi [Name],\n\nI came across your profile and I'd love to connect. I'm [Your Name], currently building [Your Startup] — [one-line description]. Would love to hear about your work too.\n\nLooking forward to connecting!" },
  { id:"t2", label:"Investor Pitch",       category:"Fundraising",   preview:"We're raising a seed round and…",           body:"Hi [Name],\n\nWe're currently raising our seed round for [Your Startup]. We've hit [key milestone] and are looking for a lead investor who understands [space].\n\nWould you be open to a 20-min call this week?" },
  { id:"t3", label:"Mentor Request",       category:"Mentorship",    preview:"I'm looking for guidance on…",              body:"Hi [Name],\n\nI'm building in [space] and I'm navigating [specific challenge]. Your experience with [their background] would be incredibly valuable.\n\nWould you be open to a quick 15-min call?" },
  { id:"t4", label:"Co-founder Outreach",  category:"Team Building", preview:"I'm looking for a technical co-founder…", body:"Hi [Name],\n\nI'm the founder of [Startup Name] and I'm looking for a technical co-founder who's strong in [skills]. I've already [key progress] and have [validation].\n\nWould love to explore whether there's a fit!" },
  { id:"t5", label:"Collaboration",        category:"Partnerships",  preview:"I think our projects complement…",         body:"Hi [Name],\n\nI've been following your work on [their project] and I think there's a natural overlap with what we're building at [Your Startup].\n\nOpen to a quick chat?" },
  { id:"t6", label:"Coffee Chat",          category:"Networking",    preview:"Would you be open to a quick call…",        body:"Hi [Name],\n\nI'd love to pick your brain about [topic]. No agenda — just a casual 15-min chat. Happy to work around your schedule.\n\nLet me know!" },
];

const THREADS: Thread[] = [
  { id:"th1", title:"How do you handle technical co-founder equity splits?", author:"Alex Kim", authorInitials:"AK", preview:"We're at the stage where I need to bring in a CTO. I've been debating 50/50 vs a vesting cliff arrangement...", tags:["Co-founders","Equity","Legal"], replies:23, views:412, time:"2h", pinned:true, category:"Advice" },
  { id:"th2", title:"Best cold email templates that actually get VC responses", author:"Mia Torres", authorInitials:"MT", preview:"After 200+ cold emails I found 3 formats that consistently get replies. Sharing what worked for me...", tags:["Fundraising","Cold Email","VC"], replies:41, views:890, time:"5h", category:"Fundraising" },
  { id:"th3", title:"How we hit $10k MRR in 90 days — lessons learned", author:"Dev Patel", authorInitials:"DP", preview:"We launched on Product Hunt, got featured, and used that momentum to close our first 40 paying customers...", tags:["Revenue","Growth","B2B"], replies:56, views:1240, time:"1d", category:"Growth" },
  { id:"th4", title:"Open source or not? Decision framework for early-stage SaaS", author:"Yuna Park", authorInitials:"YP", preview:"We went open-core after 6 months. Here's the decision tree we used and what we'd do differently...", tags:["Open Source","SaaS","Strategy"], replies:18, views:320, time:"2d", category:"Product" },
  { id:"th5", title:"Finding your first 10 beta users without a network", author:"Omar Farouk", authorInitials:"OF", preview:"No connections, no audience. Here's how I recruited 10 engaged beta users in 2 weeks using Reddit + LinkedIn...", tags:["Beta Testing","Growth","Community"], replies:34, views:670, time:"3d", category:"Growth" },
  { id:"th6", title:"When should you apply to YC vs other accelerators?", author:"Priya Menon", authorInitials:"PM", preview:"Applied to 4 accelerators simultaneously. Here's what each is really looking for and how to calibrate your timing...", tags:["Accelerators","YC","Fundraising"], replies:29, views:540, time:"4d", category:"Advice" },
  { id:"th7", title:"Lessons from shutting down my first startup", author:"Jake Sullivan", authorInitials:"JS", preview:"Two years in, $180k burned, one tough decision. What I'd tell my past self and what I'm doing differently now...", tags:["Failure","Lessons","Resilience"], replies:62, views:1580, time:"5d", category:"Advice" },
  { id:"th8", title:"AI wrappers — is there real defensibility here?", author:"Ravi Nath", authorInitials:"RN", preview:"Investors keep asking about moats. I've been stress-testing different AI wrapper business models — here's my analysis...", tags:["AI","Product","Strategy"], replies:47, views:820, time:"1w", category:"Product" },
];

const THREAD_REPLIES: Record<string, ThreadReply[]> = {
  "th1": [
    { id:"r1", author:"Sofia Lee",  authorInitials:"SL", text:"We did 60/40 with a 4-year vest and 1-year cliff for both founders. The asymmetry reflected that I had been working on it 6 months longer. Works well so far.", time:"1h 45m ago", likes:12 },
    { id:"r2", author:"Raj Mehta",  authorInitials:"RM", text:"Whatever you do — get a lawyer. We tried to DIY our founder agreement and it caused huge problems when we later onboarded an investor. Not worth cutting corners.", time:"1h 30m ago", likes:28 },
    { id:"r3", author:"Emma Clark", authorInitials:"EC", text:"I'd recommend reading 'Venture Deals' by Brad Feld before finalizing anything. The chapter on founder equity is really practical.", time:"55m ago", likes:9 },
  ],
  "th2": [
    { id:"r1", author:"James Tan",  authorInitials:"JT", text:"The key for me was personalizing the first line with something specific from their portfolio — shows you've done your homework.", time:"4h ago", likes:19 },
    { id:"r2", author:"Ana Rivera", authorInitials:"AR", text:"Subject line is everything. I A/B tested 20 subject lines and the ones that referenced a specific portfolio company got 3x the open rate.", time:"3h ago", likes:31 },
  ],
  "th3": [
    { id:"r1", author:"Tyler Brooks", authorInitials:"TB", text:"Product Hunt is so underrated for B2B. We got 800 upvotes and 60 signups in 24 hours. The key is having your community ready to upvote in the first hour.", time:"20h ago", likes:22 },
    { id:"r2", author:"Nina Osei",    authorInitials:"NO", text:"What was your onboarding like? We struggle with activation after sign-up — people sign up but don't actually use the product.", time:"18h ago", likes:8 },
    { id:"r3", author:"Dev Patel",    authorInitials:"DP", text:"@Nina We built an in-app checklist with 5 steps. Users who complete step 3 (first real action) have 80% retention at 30 days. Nail that activation moment.", time:"17h ago", likes:35 },
  ],
};

// ─── Sub-components ────────────────────────────────────────────────────────────
function Avatar({ initials, size = 40, online }: { initials: string; size?: number; online?: boolean }) {
  const colors = ["#6B7C2D","#4A6019","#8A9E3A","#527020","#3D4F17"];
  const idx = (initials.charCodeAt(0) + initials.charCodeAt(1)) % colors.length;
  return (
    <div style={{ position:"relative", flexShrink:0 }}>
      <div style={{ width:size, height:size, borderRadius:"50%", background:colors[idx], display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.35, fontWeight:700, color:"#FFF", letterSpacing:"0.02em" }}>
        {initials}
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

// ─── Thread Detail View ─────────────────────────────────────────────────────────
function ThreadDetail({ thread, onBack }: { thread:Thread; onBack:()=>void }) {
  const [reply, setReply] = useState("");
  const [localReplies, setLocalReplies] = useState<ThreadReply[]>(THREAD_REPLIES[thread.id] ?? []);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [localReplies]);

  const submitReply = () => {
    const text = reply.trim();
    if (!text) return;
    setLocalReplies(prev => [...prev, { id:`r${Date.now()}`, author:"You", authorInitials:"ME", text, time:"Just now", likes:0 }]);
    setReply("");
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
        {localReplies.length > 0 && (
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
        )}
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

  const [tab, setTab] = useState<"dms"|"community">("dms");
  const [activeId, setActiveId] = useState<string|null>(
    initialThread ? (CONTACTS.find(c=>c.name===initialThread)?.id ?? null) : null
  );
  const [activeThreadId, setActiveThreadId] = useState<string|null>(null);
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState<Record<string, Message[]>>(SEED_MESSAGES);
  const [draft, setDraft] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [threads, setThreads] = useState<Thread[]>(THREADS);
  const [showNewThread, setShowNewThread] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeContact = CONTACTS.find(c=>c.id===activeId) ?? null;
  const activeThread  = threads.find(t=>t.id===activeThreadId) ?? null;
  const filtered      = CONTACTS.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.role.toLowerCase().includes(search.toLowerCase()));
  const filteredThreads = threads.filter(t=>t.title.toLowerCase().includes(search.toLowerCase())||t.tags.some(tag=>tag.toLowerCase().includes(search.toLowerCase())));

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [activeId, messages]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text || !activeId) return;
    const newMsg: Message = { id:`m${Date.now()}`, sender:"me", text, time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) };
    setMessages(prev=>({...prev,[activeId]:[...(prev[activeId]??[]),newMsg]}));
    setDraft(""); setShowTemplates(false);
  };

  const handleKeyDown = (e:React.KeyboardEvent<HTMLTextAreaElement>) => {
    if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}
  };

  const handleNewThread = (title:string, body:string, tags:string[]) => {
    const newThread: Thread = {
      id: `th${Date.now()}`,
      title, author:"You", authorInitials:"ME",
      preview: body || "No body provided.",
      tags, replies:0, views:0, time:"Just now", category:"General",
    };
    setThreads(prev=>[newThread,...prev]);
    setShowNewThread(false);
    setActiveThreadId(newThread.id);
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

  const totalUnread = CONTACTS.reduce((s,c)=>s+c.unread,0);

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
            {filtered.length === 0 ? <p style={{ color:MUTED, fontSize:13, padding:16 }}>No contacts found.</p> : filtered.map(c=>(
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
            {filteredThreads.length === 0 ? <p style={{ color:MUTED, fontSize:13, padding:16 }}>No threads found.</p> : filteredThreads.map(t=>(
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
                {(messages[activeContact.id]??[]).map(msg=><ChatBubble key={msg.id} message={msg}/>)}
                <div ref={bottomRef}/>
              </div>
              {showTemplates && (
                <div style={{ borderTop:`1px solid ${BORDER}`, padding:"14px 18px", background:SIDEBAR_BG, maxHeight:300, overflowY:"auto" }}>
                  <p style={{ margin:"0 0 10px", fontSize:11, color:MUTED, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" }}>Message Templates</p>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(230px, 1fr))", gap:10 }}>
                    {TEMPLATES.map(t=><TemplateCard key={t.id} template={t} onUse={b=>{setDraft(b);setShowTemplates(false);}}/>)}
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
                  {TEMPLATES.map(t=><TemplateCard key={t.id} template={t} onUse={b=>{if(CONTACTS[0]){setActiveId(CONTACTS[0].id);setDraft(b);}}}/>)}
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
