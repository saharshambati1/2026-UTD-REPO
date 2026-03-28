"use client";

import { useState, useMemo } from "react";

const CARD_BG  = "#FFFDF6";
const BORDER   = "#DDD5C0";
const PRIMARY  = "#6B7C2D";
const ORANGE   = "#E87722";
const TEXT     = "#2A2A1E";
const MUTED    = "#7A7A60";
const TAG_BG   = "#EDE7D4";

// ─── Club data ─────────────────────────────────────────────────────────────────

interface Club {
  id: string; name: string; tagline: string; description: string; fullBio: string;
  category: string; members: number; meetingTime: string; established: string;
  tags: string[]; color: string; applicationQuestions: string[];
}

const CLUBS: Club[] = [
  { id:"hackutd",      name:"HackUTD",               tagline:"Build something amazing in 24 hours.",          description:"UTD's premier hackathon organization. We host one of Texas' largest hackathons every fall and run year-round workshops.",                                                   fullBio:"HackUTD is the student-run org behind one of Texas' most-attended collegiate hackathons. Founded in 2014, we've grown from 200 to 1,200+ participants. Beyond the flagship 24-hour event, we run monthly workshops on web dev, AI/ML, hardware, and entrepreneurship. Sponsors have included Google, Microsoft, Capital One, and Goldman Sachs. Everyone belongs here — no experience required.",                                              category:"Technology",  members:240, meetingTime:"Thursdays 7:00 PM — ECSN 2.120",    established:"2014", tags:["Hackathon","Web Dev","AI/ML","Networking"],           color:"#6B7C2D", applicationQuestions:["What's a project you've built or want to build?","Which role interests you — organizing, sponsorship, marketing, or development?"] },
  { id:"acm",          name:"ACM @ UTD",              tagline:"Advancing computing as a science and profession.", description:"The largest CS org on campus. Workshops, coding contests, ICPC training, and industry networking events for all skill levels.",                                           fullBio:"ACM @ UTD has 600+ active members and something for everyone — beginner-friendly intro sessions to advanced ICPC training. Special interest groups include ACM-W, SIGAI, SIGGRAPH, and SIGGame. We host an annual career fair, resume workshops, and mock interviews with engineers from top tech companies.",                                                                                                                                       category:"Technology",  members:620, meetingTime:"Tuesdays 6:30 PM — SCI 1.225",    established:"1998", tags:["Competitive Programming","ICPC","Career","Workshops"], color:"#2255A4", applicationQuestions:["What drew you to computer science?","Which ACM special interest group interests you most, and why?"] },
  { id:"entrepreneurship", name:"Entrepreneurship Club", tagline:"From idea to IPO — every stage, every founder.", description:"UTD's hub for founders. Pitch competitions, startup showcases, and one-on-one mentorship from successful entrepreneurs in DFW.",                                        fullBio:"The UTD Entrepreneurship Club has been the launchpad for dozens of startups since 2008. Members have raised $40M+ in venture funding and been accepted to YC, Techstars, and more. We host weekly founder talks, monthly pitch nights, and an annual startup weekend. Whether you have a formed startup or a napkin idea — you belong here.",                                                                                                         category:"Business",    members:310, meetingTime:"Wednesdays 7:00 PM — JSOM 2.803", established:"2008", tags:["Startups","Pitch Competitions","Mentorship","VC"],     color:"#E87722", applicationQuestions:["Describe a startup idea you've had (doesn't need to be polished).","What excites you most — product, fundraising, growth, or operations?"] },
  { id:"design",       name:"UTD Design Society",     tagline:"Where creativity meets intention.",              description:"A community for UX designers, graphic artists, and product thinkers. Weekly critiques, guest speakers, and real design sprints.",                                         fullBio:"UTD Design Society gives design-minded students a home at a STEM-heavy university. We welcome everyone from seasoned UX designers to people who just discovered Figma. Meetings alternate between design critiques, guest speakers, and collaborative sprints. We run an annual design challenge with real company briefs and portfolio review nights.",                                                                                                 category:"Arts & Design",members:180,meetingTime:"Mondays 6:00 PM — ATC 1.202",       established:"2016", tags:["UX Design","Figma","Product Design","Visual Design"],  color:"#9B4DCA", applicationQuestions:["Share a design you're proud of — what problem did it solve?","What design tool are you most comfortable with?"] },
  { id:"robotics",     name:"UTD Robotics Club",      tagline:"Building machines that think, move, and compete.", description:"Hands-on robotics for every level. We compete in VEX U, RoboSub, and NASA Lunabotics — and our build lab is open 24/7.",                                            fullBio:"UTD Robotics gives students the chance to design, build, and program real robots. We compete in VEX U, RoboSub, and NASA Lunabotics. Workshops cover CAD (Fusion 360/SolidWorks), embedded programming (Arduino/ROS), and motor control. The build lab has 3D printers, laser cutters, and electronics benches, open to members 24/7.",                                                                                                           category:"Engineering", members:145, meetingTime:"Fridays 5:00 PM — ECSW 1.365",      established:"2011", tags:["Robotics","CAD","Embedded Systems","Competition"],     color:"#CC3333", applicationQuestions:["What role interests you — mechanical, electrical, or software?","Describe a time you built or fixed something physical."] },
  { id:"finance",      name:"Finance & Investment Club",tagline:"Learn to invest. Think like an analyst.",      description:"Stock pitches, financial modeling boot camps, and case competitions. Networking with Goldman Sachs, JP Morgan, Blackstone, and DFW investment firms.",                   fullBio:"The UTD Finance & Investment Club prepares students for IB, PE, VC, and asset management. Our core program: a 10-week financial modeling boot camp, weekly stock pitch competitions, and a student-managed paper portfolio. We send teams to national case competitions and have placed top 10 at CFA Institute events.",                                                                                                                            category:"Business",    members:270, meetingTime:"Tuesdays 7:00 PM — JSOM 11.210",   established:"2005", tags:["Investing","Financial Modeling","Case Competitions","VC"],color:"#1A6B5A",applicationQuestions:["What sector of the market interests you most, and why?","Walk us through a recent financial news story that caught your attention."] },
  { id:"ai-society",   name:"AI Society @ UTD",       tagline:"Exploring the frontier of artificial intelligence.", description:"Paper reading groups, hands-on ML project sprints, and a semester-long AI capstone. Speaker series from OpenAI, DeepMind, and top universities.",               fullBio:"AI Society @ UTD is the fastest-growing club on campus. Founded in 2019, we run weekly paper reading groups, project sprints, and a semester-long capstone where teams build and deploy real ML products. Our speaker series has brought in researchers from OpenAI, DeepMind, and Google Brain. Members have landed internships at top AI labs.",                                                                                                       category:"Technology",  members:380, meetingTime:"Wednesdays 6:00 PM — SCI 2.804",   established:"2019", tags:["Machine Learning","Deep Learning","Research","Kaggle"],  color:"#4A4A8A", applicationQuestions:["What ML concept or paper has excited you recently?","Do you have a project idea you'd want to build with a team?"] },
  { id:"volunteering", name:"Comet Cupboard & Volunteers",tagline:"Giving back to campus and the DFW community.",description:"UTD's volunteer coordination hub. We manage the campus food pantry and coordinate placements with 30+ nonprofit partners across DFW.",                              fullBio:"Comet Cupboard & Volunteers manages the campus food pantry serving 400+ students/month, and coordinates volunteer placements with 30+ DFW nonprofits — from tutoring in Garland ISD to habitat restoration at White Rock Lake. We also run 'Tech for Good' events pairing CS students with nonprofits that need technical help.",                                                                                                                  category:"Community",   members:520, meetingTime:"Sundays 2:00 PM — Student Union 2.410",established:"2003",tags:["Volunteering","Community Service","Food Pantry","Nonprofits"],color:"#C0392B",applicationQuestions:["What cause are you most passionate about, and why?","Describe a time you went out of your way to help someone."] },
];

const CATEGORIES = ["All", ...Array.from(new Set(CLUBS.map(c => c.category)))];

// ─── Confetti ──────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ["#6B7C2D","#E87722","#F5D450","#E05080","#4A90D9","#8A4FCC","#3DAA70","#F07030"];

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 55 }, (_, i) => ({
      id: i,
      x: 5 + Math.random() * 90,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      w: 5 + Math.random() * 9,
      h: 7 + Math.random() * 11,
      delay: Math.random() * 0.7,
      dur: 1.3 + Math.random() * 0.9,
      rot: Math.random() * 360,
      circle: Math.random() > 0.55,
    })), []
  );

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 20 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: "absolute",
          left: `${p.x}%`,
          bottom: "8%",
          width: p.w,
          height: p.circle ? p.w : p.h,
          background: p.color,
          borderRadius: p.circle ? "50%" : 2,
          animationName: p.id % 2 === 0 ? "confettiRise" : "confettiWiggle",
          animationDuration: `${p.dur}s`,
          animationDelay: `${p.delay}s`,
          animationTimingFunction: "ease-out",
          animationFillMode: "both",
          transform: `rotate(${p.rot}deg)`,
        } as React.CSSProperties} />
      ))}
    </div>
  );
}

// ─── Application modal ─────────────────────────────────────────────────────────

function ClubModal({ club, onClose }: { club: Club; onClose: () => void }) {
  const [form, setForm]         = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused]   = useState<string | null>(null);

  const allAnswered = ["full-name","email",...club.applicationQuestions.map((_,i) => `q${i}`)].every(k => (form[k] ?? "").trim());

  return (
    <div
      onClick={onClose}
      style={{ position:"fixed", inset:0, background:"rgba(42,42,30,0.55)", backdropFilter:"blur(4px)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:CARD_BG, borderRadius:18, width:"100%", maxWidth:580, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 80px rgba(0,0,0,0.25)", border:`1px solid ${BORDER}` }}
      >
        {/* Header */}
        <div style={{ background:club.color, borderRadius:"18px 18px 0 0", padding:"26px 26px 18px" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.7)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:5 }}>{club.category}</div>
              <h2 style={{ fontSize:21, fontWeight:800, color:"#FFF", margin:0, letterSpacing:"-0.02em" }}>{club.name}</h2>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.85)", marginTop:5, lineHeight:1.5 }}>{club.tagline}</p>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:"50%", width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#FFF", flexShrink:0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div style={{ display:"flex", gap:20, marginTop:14 }}>
            {[{l:"Members",v:club.members.toLocaleString()},{l:"Est.",v:club.established},{l:"Meets",v:club.meetingTime.split("—")[0].trim()}].map(({l,v}) => (
              <div key={l}><div style={{ fontSize:14, fontWeight:800, color:"#FFF" }}>{v}</div><div style={{ fontSize:10, color:"rgba(255,255,255,0.65)", fontWeight:500 }}>{l}</div></div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:"22px 26px", display:"flex", flexDirection:"column", gap:20 }}>
          <div>
            <h3 style={{ fontSize:13, fontWeight:700, color:TEXT, marginBottom:8 }}>About</h3>
            <p style={{ fontSize:13, color:MUTED, lineHeight:1.8 }}>{club.fullBio}</p>
          </div>
          <div style={{ background:TAG_BG, border:`1px solid ${BORDER}`, borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"center", gap:8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span style={{ fontSize:12, color:TEXT, fontWeight:500 }}>{club.meetingTime}</span>
          </div>
          <div>
            <h3 style={{ fontSize:12, fontWeight:700, color:TEXT, marginBottom:7 }}>Focus Areas</h3>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
              {club.tags.map(t => <span key={t} style={{ fontSize:11, fontWeight:500, color:PRIMARY, background:TAG_BG, border:`1px solid #D0C8A8`, borderRadius:20, padding:"3px 10px" }}>{t}</span>)}
            </div>
          </div>

          {/* Application */}
          <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:18 }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:TEXT, marginBottom:4 }}>Apply to Join</h3>
            <p style={{ fontSize:12, color:MUTED, marginBottom:14 }}>Answer the questions below to submit your application.</p>

            {submitted ? (
              <div style={{ position:"relative", background:"#EBF2D8", border:"1px solid #C8E0A0", borderRadius:12, padding:"24px 20px", textAlign:"center", overflow:"hidden" }}>
                <Confetti />
                <div style={{ fontSize:16, fontWeight:700, color:PRIMARY, marginBottom:4, position:"relative", zIndex:5 }}>Application submitted!</div>
                <div style={{ fontSize:13, color:MUTED, position:"relative", zIndex:5 }}>The {club.name} team will reach out within 5–7 days.</div>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {[["full-name","Full Name","text","Your full name"],["email","Email","email","you@utdallas.edu"]].map(([fid,lbl,type,ph]) => (
                    <div key={fid} style={{ display:"flex", flexDirection:"column", gap:4 }}>
                      <label style={{ fontSize:12, fontWeight:600, color:TEXT }}>{lbl}</label>
                      <input type={type} placeholder={ph} value={form[fid]??""} onChange={e=>setForm(p=>({...p,[fid]:e.target.value}))} onFocus={()=>setFocused(fid)} onBlur={()=>setFocused(null)}
                        style={{ padding:"8px 11px", borderRadius:7, border:`1.5px solid ${focused===fid?PRIMARY:BORDER}`, background:"#F7F2E8", color:TEXT, fontSize:13, outline:"none", fontFamily:"Georgia,serif", transition:"border-color 0.15s" }} />
                    </div>
                  ))}
                </div>
                {club.applicationQuestions.map((q,i) => {
                  const fid=`q${i}`;
                  return (
                    <div key={i} style={{ display:"flex", flexDirection:"column", gap:4 }}>
                      <label style={{ fontSize:12, fontWeight:600, color:TEXT }}>{q}</label>
                      <textarea rows={3} value={form[fid]??""} onChange={e=>setForm(p=>({...p,[fid]:e.target.value}))} placeholder="Your answer…" onFocus={()=>setFocused(fid)} onBlur={()=>setFocused(null)}
                        style={{ padding:"8px 11px", borderRadius:7, border:`1.5px solid ${focused===fid?PRIMARY:BORDER}`, background:"#F7F2E8", color:TEXT, fontSize:13, outline:"none", resize:"vertical", fontFamily:"Georgia,serif", lineHeight:1.6, transition:"border-color 0.15s" }} />
                    </div>
                  );
                })}
                <SubmitBtn allAnswered={allAnswered} onSubmit={()=>setSubmitted(true)} color={club.color} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmitBtn({ allAnswered, onSubmit, color }: { allAnswered:boolean; onSubmit:()=>void; color:string }) {
  const [hov,setHov]=useState(false);
  return (
    <button onClick={onSubmit} disabled={!allAnswered} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ alignSelf:"flex-start", padding:"9px 24px", borderRadius:8, border:"none", background:!allAnswered?"#C8C0A8":hov?ORANGE:color, color:"#FFF", fontSize:13, fontWeight:700, cursor:allAnswered?"pointer":"not-allowed", transition:"background 0.15s", fontFamily:"Georgia,serif" }}>
      Submit Application
    </button>
  );
}

// ─── Card stack ────────────────────────────────────────────────────────────────

type SwipeDir = "left" | "right" | null;

function StackCard({ club, stackIndex, swipeDir }: { club: Club; stackIndex: number; swipeDir: SwipeDir }) {
  const isTop = stackIndex === 0;
  const offset  = stackIndex * 13;
  const scale   = 1 - stackIndex * 0.045;
  const rotate  = stackIndex === 1 ? -1.5 : stackIndex === 2 ? 1.8 : 0;

  let topTransform = `translateY(${offset}px) scale(${scale}) rotate(${rotate}deg)`;
  if (isTop && swipeDir === "left")  topTransform = "translateX(-140%) rotate(-22deg) scale(0.95)";
  if (isTop && swipeDir === "right") topTransform = "translateX(140%)  rotate(22deg)  scale(0.95)";

  // When top card exits, second card advances
  const advanceTransform = swipeDir && stackIndex === 1
    ? `translateY(0px) scale(1) rotate(0deg)`
    : swipeDir && stackIndex === 2
    ? `translateY(13px) scale(${1 - 0.045}) rotate(-1.5deg)`
    : topTransform;

  const finalTransform = isTop ? topTransform : advanceTransform;

  return (
    <div style={{
      position: "absolute",
      top: 0, left: 0, right: 0,
      zIndex: 10 - stackIndex,
      transform: finalTransform,
      opacity: swipeDir && isTop ? 0 : stackIndex >= 3 ? 0 : 1,
      transition: swipeDir
        ? isTop ? "transform 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.38s ease"
                : "transform 0.38s cubic-bezier(0.4,0,0.2,1)"
        : "none",
      transformOrigin: "bottom center",
      pointerEvents: isTop ? "auto" : "none",
    }}>
      <div style={{
        background: CARD_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: isTop
          ? "0 16px 48px rgba(107,124,45,0.22), 0 4px 16px rgba(107,124,45,0.12), 0 1px 0 rgba(255,255,255,0.9) inset"
          : "0 4px 20px rgba(107,124,45,0.10), 0 1px 0 rgba(255,255,255,0.8) inset",
      }}>
        {/* Color band */}
        <div style={{ height: 7, background: club.color }} />

        <div style={{ padding: "18px 20px 20px" }}>
          {/* Header */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, letterSpacing: "-0.02em" }}>{club.name}</div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{club.category} · Est. {club.established} · {club.members} members</div>
          </div>

          {/* Tagline */}
          <p style={{ fontSize: 13, fontStyle: "italic", color: MUTED, marginBottom: 10, lineHeight: 1.5 }}>{club.tagline}</p>

          {/* Description */}
          <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.65, marginBottom: 14 }}>{club.description}</p>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
            {club.tags.map(t => (
              <span key={t} style={{ fontSize: 10, fontWeight: 500, color: PRIMARY, background: TAG_BG, border: `1px solid #D0C8A8`, borderRadius: 20, padding: "2px 9px" }}>{t}</span>
            ))}
          </div>

          {/* Meeting */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span style={{ fontSize: 11, color: MUTED }}>{club.meetingTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function ClubsPage() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [openClub, setOpenClub]   = useState<Club | null>(null);
  const [category, setCategory]   = useState("All");
  const [swipeDir, setSwipeDir]   = useState<SwipeDir>(null);
  const [catHov, setCatHov]       = useState<string | null>(null);

  const filtered = CLUBS.filter(c => category === "All" || c.category === category);
  const queue    = filtered.filter(c => !dismissed.has(c.id));

  const dismiss = (dir: SwipeDir, openModal?: boolean) => {
    if (!queue[0] || swipeDir) return;
    setSwipeDir(dir);
    if (openModal) {
      setTimeout(() => setOpenClub(queue[0]), 180);
    }
    setTimeout(() => {
      setDismissed(prev => { const n = new Set(Array.from(prev)); n.add(queue[0].id); return n; });
      setSwipeDir(null);
    }, 400);
  };

  const reset = () => {
    setDismissed(new Set());
    setSwipeDir(null);
  };

  // When category changes, reset dismissed
  const changeCategory = (cat: string) => {
    setCategory(cat);
    setDismissed(new Set());
    setSwipeDir(null);
  };

  const remaining = queue.length;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: TEXT, letterSpacing: "-0.02em" }}>Clubs</h1>
        <p style={{ fontSize: 13, color: MUTED, marginTop: 3 }}>
          Swipe through clubs — <strong style={{ color: TEXT }}>✕</strong> to skip, <strong style={{ color: "#E05080" }}>♥</strong> to apply.
        </p>
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
        {CATEGORIES.map(cat => {
          const active = category === cat;
          const hov    = catHov === cat;
          return (
            <button key={cat} onClick={() => changeCategory(cat)} onMouseEnter={() => setCatHov(cat)} onMouseLeave={() => setCatHov(null)}
              style={{ padding:"6px 14px", borderRadius:20, border:`1.5px solid ${active?PRIMARY:hov?"#C5BB9E":BORDER}`, background:active?PRIMARY:hov?TAG_BG:CARD_BG, color:active?"#FFF":TEXT, fontSize:11, fontWeight:active?700:500, cursor:"pointer", transition:"all 0.15s", fontFamily:"Georgia,serif" }}>
              {cat}
            </button>
          );
        })}
      </div>

      {/* Card stack */}
      {queue.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 40 }}>✓</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>You've seen all clubs!</div>
          <p style={{ fontSize: 13, color: MUTED, maxWidth: 280 }}>
            {dismissed.size > 0 ? `You skipped ${dismissed.size} club${dismissed.size > 1 ? "s" : ""}. Start over to see them again.` : "No clubs in this category."}
          </p>
          {dismissed.size > 0 && (
            <ResetBtn onClick={reset} />
          )}
        </div>
      ) : (
        <>
          {/* Counter */}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>
              {remaining} club{remaining !== 1 ? "s" : ""} remaining
            </span>
          </div>

          {/* Stack container */}
          <div style={{ position: "relative", height: 420, marginBottom: 36 }}>
            {queue.slice(0, 3).map((club, i) => (
              <StackCard key={club.id} club={club} stackIndex={i} swipeDir={swipeDir} />
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 32 }}>
            {/* Skip / Discard */}
            <ActionBtn
              onClick={() => dismiss("left")}
              disabled={!!swipeDir}
              label="Skip"
              color="#888"
              hoverColor="#E05040"
              hoverBg="#FDE8E8"
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              }
            />

            {/* Apply */}
            <ActionBtn
              onClick={() => dismiss("right", true)}
              disabled={!!swipeDir}
              label="Apply"
              color="#E05080"
              hoverColor="#C0104A"
              hoverBg="#FDE8EF"
              large
              icon={
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              }
            />
          </div>
        </>
      )}

      {/* Modal */}
      {openClub && <ClubModal club={openClub} onClose={() => setOpenClub(null)} />}
    </div>
  );
}

function ActionBtn({ onClick, disabled, label, color, hoverColor, hoverBg, icon, large }: {
  onClick: () => void; disabled: boolean; label: string; color: string;
  hoverColor: string; hoverBg: string; icon: React.ReactNode; large?: boolean;
}) {
  const [hov, setHov] = useState(false);
  const size = large ? 72 : 58;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          width: size, height: size, borderRadius: "50%",
          border: `2px solid ${hov ? hoverColor : color}`,
          background: hov ? hoverBg : CARD_BG,
          color: hov ? hoverColor : color,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.18s",
          boxShadow: hov ? `0 4px 18px ${hoverColor}30` : "0 2px 8px rgba(0,0,0,0.08)",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {icon}
      </button>
      <span style={{ fontSize: 10, color: MUTED, fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function ResetBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding:"9px 24px", borderRadius:8, border:"none", background:hov?ORANGE:PRIMARY, color:"#FFF", fontSize:13, fontWeight:700, cursor:"pointer", transition:"background 0.15s", fontFamily:"Georgia,serif" }}>
      Start Over
    </button>
  );
}
