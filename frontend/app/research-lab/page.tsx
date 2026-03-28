"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const BG       = "#F5F0E4";
const CARD_BG  = "#FFFDF6";
const BORDER   = "#DDD5C0";
const PRIMARY  = "#6B7C2D";
const ORANGE   = "#E87722";
const TEXT     = "#2A2A1E";
const MUTED    = "#7A7A60";
const TAG_BG   = "#EDE7D4";

interface Paper {
  title: string;
  year: number;
  journal: string;
  citations: number;
  abstract: string;
  url?: string;
}

interface Lab {
  id: string;
  name: string;
  professor: string;
  professorInitials: string;
  title: string;
  description: string;
  areas: string[];
  university: string;
  openings: number;
  papers: Paper[];
}

const LABS: Lab[] = [
  {
    id: "ai-lab",
    name: "Intelligent Systems & AI Lab",
    professor: "Dr. Sarah Johnson",
    professorInitials: "SJ",
    title: "Associate Professor, Computer Science",
    description: "Researching large language models, multi-modal AI, and reinforcement learning for real-world decision-making. Currently building adaptive AI systems for healthcare diagnostics and autonomous robotics.",
    areas: ["Large Language Models","Reinforcement Learning","Computer Vision","Healthcare AI"],
    university: "UT Dallas",
    openings: 3,
    papers: [
      { title: "Adaptive Reward Shaping for Sample-Efficient Reinforcement Learning in Sparse Environments", year: 2024, journal: "NeurIPS 2024", citations: 142, abstract: "We propose a dynamic reward shaping framework that significantly reduces sample requirements in environments with sparse reward signals, achieving state-of-the-art on 14 of 20 benchmark tasks." },
      { title: "MedVLM: A Vision-Language Foundation Model for Clinical Diagnostics", year: 2024, journal: "Nature Machine Intelligence", citations: 87, abstract: "A multimodal model trained on 4.2M clinical image-report pairs, demonstrating expert-level performance on radiology report generation and disease classification." },
      { title: "Scaling Laws for Healthcare-Specific Language Models", year: 2023, journal: "ICML 2023", citations: 215, abstract: "Empirical analysis of how compute, data, and model size trade-offs differ for domain-specific LLMs versus general-purpose models, with implications for medical AI deployment." },
    ],
  },
  {
    id: "cyber-lab",
    name: "Cybersecurity Research Group",
    professor: "Dr. Michael Chen",
    professorInitials: "MC",
    title: "Professor, Electrical Engineering",
    description: "Focus on adversarial machine learning, zero-trust network architectures, and vulnerability analysis in embedded systems. Partnered with DARPA and NSF on critical infrastructure protection.",
    areas: ["Adversarial ML","Network Security","Embedded Systems","Zero-Trust Architecture"],
    university: "UT Dallas",
    openings: 2,
    papers: [
      { title: "CertifiedRobust: Provably Tight Certification Bounds for Deep Neural Networks Under Adversarial Perturbations", year: 2024, journal: "IEEE S&P 2024", citations: 93, abstract: "We introduce a randomized smoothing variant that tightens certified radius bounds by 38% over prior work while maintaining comparable computational overhead." },
      { title: "Zero-Trust Architecture for Industrial Control Systems: A Practical Framework", year: 2023, journal: "ACM CCS 2023", citations: 178, abstract: "A deployable zero-trust model for ICS/SCADA environments, evaluated across 3 real-world critical infrastructure deployments with sub-50ms authentication latency." },
      { title: "Firmware Vulnerability Discovery at Scale Using Differential Analysis", year: 2023, journal: "USENIX Security 2023", citations: 204, abstract: "Automated pipeline for cross-vendor firmware comparison that discovered 47 previously unreported CVEs across 1,200 embedded device firmware images." },
    ],
  },
  {
    id: "quantum-lab",
    name: "Quantum Computing & Information Lab",
    professor: "Dr. Aisha Patel",
    professorInitials: "AP",
    title: "Assistant Professor, Physics & CS",
    description: "Exploring quantum error correction, variational quantum algorithms, and near-term quantum advantage applications. Collaborating with IBM Quantum and Google Quantum AI on qubit fidelity research.",
    areas: ["Quantum Algorithms","Error Correction","Quantum Cryptography","Qubit Design"],
    university: "UT Dallas",
    openings: 4,
    papers: [
      { title: "Low-Overhead Fault-Tolerant Quantum Memory via Bivariate Bicycle Codes", year: 2024, journal: "Physical Review Letters", citations: 61, abstract: "A new family of quantum LDPC codes achieving threshold error rates above 1% with 40% fewer physical qubits than surface codes at equivalent logical error rates." },
      { title: "Variational Quantum Eigensolver with Noise-Adaptive Ansatz Selection", year: 2023, journal: "Nature Quantum Information", citations: 134, abstract: "Dynamic ansatz circuits that adapt to measured device noise profiles, reducing VQE energy estimation error by 2.3× on current NISQ hardware." },
    ],
  },
  {
    id: "bio-lab",
    name: "Biotech & Computational Biology Lab",
    professor: "Dr. David Kim",
    professorInitials: "DK",
    title: "Professor, Bioengineering",
    description: "Applying computational methods to protein folding, drug discovery, and genomic data analysis. Developing ML pipelines for identifying novel cancer biomarkers and therapeutic targets.",
    areas: ["Protein Folding","Drug Discovery","Genomics","Bioinformatics"],
    university: "UT Dallas",
    openings: 2,
    papers: [
      { title: "BioFormer: Transformer Architectures for De Novo Protein Structure Prediction Beyond AlphaFold", year: 2024, journal: "Cell Systems", citations: 312, abstract: "A sequence-to-structure model incorporating evolutionary co-variation signals that achieves sub-1Å RMSD on 78% of CASP15 hard targets." },
      { title: "Identifying Pan-Cancer Biomarkers via Multi-Omic Graph Neural Networks", year: 2024, journal: "Nature Communications", citations: 189, abstract: "GNN-based integration of transcriptomic, proteomic, and epigenetic profiles across 12,000 tumor samples, identifying 23 novel pan-cancer diagnostic markers." },
      { title: "Generative Models for Lead Compound Optimization in Drug Discovery", year: 2023, journal: "Journal of Medicinal Chemistry", citations: 97, abstract: "A conditional VAE framework for optimizing ADMET properties of drug candidates, reducing experimental iteration cycles by an estimated 60% in a prospective study." },
    ],
  },
  {
    id: "robotics-lab",
    name: "Robotics & Autonomous Systems Lab",
    professor: "Dr. Elena Rodriguez",
    professorInitials: "ER",
    title: "Associate Professor, Mechanical Engineering",
    description: "Building next-generation robots for search and rescue, surgical assistance, and manufacturing automation. Focus on human-robot collaboration, tactile sensing, and sim-to-real transfer learning.",
    areas: ["Human-Robot Interaction","Tactile Sensing","Autonomous Navigation","Sim-to-Real"],
    university: "UT Dallas",
    openings: 3,
    papers: [
      { title: "TactileNet: High-Resolution Tactile Perception for Dexterous Manipulation", year: 2024, journal: "RSS 2024", citations: 74, abstract: "A self-supervised representation learning approach for tactile sensors achieving 94.2% grasp success on unseen objects, compared to 71.4% for vision-only baselines." },
      { title: "Sim-to-Real Transfer via Domain Randomization with Learned Physics Parameters", year: 2023, journal: "ICRA 2023", citations: 156, abstract: "Automated calibration of simulation physics parameters using real-world trajectory data, closing the reality gap for contact-rich manipulation policies by 63%." },
    ],
  },
  {
    id: "energy-lab",
    name: "Sustainable Energy & Smart Grid Lab",
    professor: "Dr. James Wilson",
    professorInitials: "JW",
    title: "Professor, Energy Systems Engineering",
    description: "Researching AI-driven optimization for smart grids, battery storage modeling, and solar energy forecasting. Working with ERCOT on real-time load balancing and distributed energy resource management.",
    areas: ["Smart Grid Optimization","Battery Systems","Solar Forecasting","Energy Storage"],
    university: "UT Dallas",
    openings: 2,
    papers: [
      { title: "Deep Reinforcement Learning for Real-Time Demand Response in Distributed Energy Systems", year: 2024, journal: "Applied Energy", citations: 108, abstract: "A multi-agent RL system deployed on the ERCOT grid that reduces peak demand by 12.4% while maintaining <99.98% uptime across a 6-month field study." },
      { title: "Physics-Informed Neural Networks for Lithium-Ion Battery State-of-Health Estimation", year: 2023, journal: "Journal of Power Sources", citations: 221, abstract: "Integrating electrochemical model constraints into LSTM training achieves 0.8% MAE on SOH estimation across diverse charge/discharge profiles, outperforming pure data-driven approaches." },
    ],
  },
  {
    id: "data-lab",
    name: "Data Science & Analytics Institute",
    professor: "Dr. Nina Okafor",
    professorInitials: "NO",
    title: "Director & Professor, Data Science",
    description: "Advancing causal inference, federated learning, and privacy-preserving analytics. Current projects include bias detection in hiring algorithms and real-time misinformation detection on social platforms.",
    areas: ["Causal Inference","Federated Learning","Fairness in AI","Social Media Analytics"],
    university: "UT Dallas",
    openings: 5,
    papers: [
      { title: "Causal Discovery Under Distribution Shift via Invariant Feature Learning", year: 2024, journal: "ICML 2024", citations: 83, abstract: "A method for learning causal representations that remain stable across distribution shifts, enabling reliable out-of-distribution generalization without access to domain labels." },
      { title: "Federated Learning with Differential Privacy Guarantees at Scale", year: 2024, journal: "ICLR 2024", citations: 147, abstract: "An adaptive clipping and noise injection strategy for federated training that maintains model utility within 2% of centralized training under (ε=1, δ=10⁻⁵)-differential privacy." },
      { title: "Auditing Algorithmic Hiring Tools for Intersectional Bias", year: 2023, journal: "FAccT 2023", citations: 265, abstract: "A large-scale audit of 5 commercial resume screening tools revealing disparate impact across intersections of race and gender that single-attribute analyses fail to surface." },
    ],
  },
  {
    id: "hci-lab",
    name: "Human-Computer Interaction Lab",
    professor: "Dr. Robert Lee",
    professorInitials: "RL",
    title: "Associate Professor, Information Science",
    description: "Designing and evaluating interfaces for AR/VR, accessibility technology, and cognitive augmentation. Running user studies on attention, memory, and decision-making in immersive computing environments.",
    areas: ["Augmented Reality","Accessibility","Cognitive Science","UX Research"],
    university: "UT Dallas",
    openings: 3,
    papers: [
      { title: "CogLoad-Aware UI Adaptation in Mixed Reality Environments", year: 2024, journal: "CHI 2024", citations: 55, abstract: "A real-time system that infers user cognitive load from eye tracking and physiological signals to adaptively simplify AR interfaces, reducing task error rates by 31%." },
      { title: "Accessibility-First Design Patterns for Immersive XR Applications", year: 2023, journal: "ASSETS 2023", citations: 112, abstract: "A pattern language of 24 design primitives derived from co-design sessions with 60 participants with diverse disabilities, validated via controlled usability studies." },
    ],
  },
];

const AVATAR_COLORS = ["#6B7C2D","#4A6019","#8A9E3A","#527020","#3D4F17","#7A9030","#5C7025","#3F5515"];

function ProfAvatar({ initials, size = 52 }: { initials: string; size?: number }) {
  const idx = (initials.charCodeAt(0) + initials.charCodeAt(1)) % AVATAR_COLORS.length;
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:AVATAR_COLORS[idx], display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.35, fontWeight:700, color:"#FFF", flexShrink:0, letterSpacing:"0.02em" }}>
      {initials}
    </div>
  );
}

function PapersModal({ lab, onClose }: { lab: Lab; onClose: () => void }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(42,42,30,0.45)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={onClose}>
      <div style={{ background:CARD_BG, border:`1px solid ${BORDER}`, borderRadius:16, padding:"0", maxWidth:680, width:"100%", maxHeight:"85vh", overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 8px 40px rgba(42,42,30,0.18)" }} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding:"22px 26px 18px", borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:11, color:MUTED, fontWeight:600, letterSpacing:"0.08em", marginBottom:4 }}>RESEARCH PAPERS</div>
              <h3 style={{ margin:0, fontSize:17, fontWeight:800, color:TEXT, lineHeight:1.2 }}>{lab.professor}</h3>
              <div style={{ fontSize:12, color:MUTED, marginTop:3 }}>{lab.title}</div>
            </div>
            <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:MUTED, fontSize:22, lineHeight:1, padding:0, marginTop:-2 }}>×</button>
          </div>
          <div style={{ marginTop:10, display:"flex", gap:20 }}>
            <span style={{ fontSize:12, color:MUTED }}><strong style={{ color:PRIMARY }}>{lab.papers.length}</strong> publications</span>
            <span style={{ fontSize:12, color:MUTED }}><strong style={{ color:PRIMARY }}>{lab.papers.reduce((s,p)=>s+p.citations,0).toLocaleString()}</strong> total citations</span>
          </div>
        </div>

        {/* Papers list */}
        <div style={{ flex:1, overflowY:"auto", padding:"18px 26px 24px" }}>
          {lab.papers.map((paper, i) => (
            <PaperCard key={i} paper={paper}/>
          ))}
        </div>
      </div>
    </div>
  );
}

function PaperCard({ paper }: { paper: Paper }) {
  const [expanded, setExpanded] = useState(false);
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:hov?"#FFF8EE":BG, border:`1px solid ${hov?"#C5BB9E":BORDER}`, borderRadius:10, padding:"16px 18px", marginBottom:12, transition:"border-color 0.15s, background 0.15s", cursor:"default" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:700, color:TEXT, lineHeight:1.4, marginBottom:5 }}>{paper.title}</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10, alignItems:"center" }}>
            <span style={{ fontSize:11, color:MUTED }}>{paper.journal}</span>
            <span style={{ width:3, height:3, borderRadius:"50%", background:MUTED, opacity:0.5, flexShrink:0 }}/>
            <span style={{ fontSize:11, color:MUTED }}>{paper.year}</span>
            <span style={{ width:3, height:3, borderRadius:"50%", background:MUTED, opacity:0.5, flexShrink:0 }}/>
            <span style={{ fontSize:11, color:PRIMARY, fontWeight:600 }}>
              {paper.citations.toLocaleString()} citations
            </span>
          </div>
        </div>
        <button onClick={()=>setExpanded(v=>!v)}
          style={{ flexShrink:0, background:"none", border:`1px solid ${BORDER}`, borderRadius:6, padding:"4px 10px", fontSize:11, color:MUTED, cursor:"pointer", fontFamily:"Georgia, serif", transition:"all 0.15s", whiteSpace:"nowrap" }}
          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=PRIMARY;(e.currentTarget as HTMLButtonElement).style.color=PRIMARY;}}
          onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=BORDER;(e.currentTarget as HTMLButtonElement).style.color=MUTED;}}>
          {expanded ? "Hide" : "Abstract"}
        </button>
      </div>
      {expanded && (
        <p style={{ fontSize:13, color:MUTED, lineHeight:1.7, margin:"10px 0 0", borderTop:`1px solid ${BORDER}`, paddingTop:10 }}>
          {paper.abstract}
        </p>
      )}
    </div>
  );
}

function LabCard({ lab, onChat, index = 0 }: { lab: Lab; onChat: (name: string) => void; index?: number }) {
  const [hov, setHov] = useState(false);
  const [btnHov, setBtnHov] = useState(false);
  const [papersHov, setPapersHov] = useState(false);
  const [showPapers, setShowPapers] = useState(false);

  return (
    <>
      {showPapers && <PapersModal lab={lab} onClose={()=>setShowPapers(false)}/>}
      <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{ background:CARD_BG, border:`1px solid ${hov?"#C5BB9E":BORDER}`, borderRadius:14, padding:22, display:"flex", flexDirection:"column", gap:14,
          transition:"border-color 0.2s, box-shadow 0.2s, transform 0.2s",
          boxShadow: hov
            ? "0 8px 32px rgba(107,124,45,0.16), 0 2px 8px rgba(107,124,45,0.08), 0 1px 0 rgba(255,255,255,0.9) inset"
            : "0 2px 10px rgba(107,124,45,0.08), 0 1px 0 rgba(255,255,255,0.9) inset",
          transform: hov ? "translateY(-2px)" : "translateY(0)",
          animation: `cardEnter 0.4s cubic-bezier(0.22,1,0.36,1) ${index * 0.07}s both`,
        }}>
        {/* Lab name */}
        <div>
          <div style={{ fontSize:15, fontWeight:800, color:TEXT, letterSpacing:"-0.01em", marginBottom:2 }}>{lab.name}</div>
          <div style={{ fontSize:11, color:MUTED, fontWeight:500 }}>{lab.university}</div>
        </div>

        {/* Professor row */}
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", background:TAG_BG, borderRadius:10, border:`1px solid ${BORDER}` }}>
          <ProfAvatar initials={lab.professorInitials} size={44}/>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:700, color:TEXT }}>{lab.professor}</div>
            <div style={{ fontSize:11, color:MUTED, marginTop:1 }}>{lab.title}</div>
          </div>
          {/* Papers count badge */}
          <div style={{ flexShrink:0, textAlign:"center" }}>
            <div style={{ fontSize:16, fontWeight:800, color:PRIMARY, lineHeight:1 }}>{lab.papers.length}</div>
            <div style={{ fontSize:9, color:MUTED, fontWeight:600, letterSpacing:"0.05em", marginTop:1 }}>PAPERS</div>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize:13, color:MUTED, lineHeight:1.65, margin:0 }}>{lab.description}</p>

        {/* Research areas */}
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:7 }}>Research Areas</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {lab.areas.map(a=>(
              <span key={a} style={{ fontSize:11, fontWeight:500, color:PRIMARY, background:TAG_BG, border:`1px solid #D0C8A8`, borderRadius:20, padding:"3px 10px" }}>{a}</span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:10, borderTop:`1px solid ${BORDER}`, gap:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:lab.openings>0?"#4CAF50":"#C0B898" }}/>
            <span style={{ fontSize:12, color:MUTED, fontWeight:500 }}>
              {lab.openings>0?`${lab.openings} opening${lab.openings>1?"s":""}` : "No current openings"}
            </span>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>setShowPapers(true)} onMouseEnter={()=>setPapersHov(true)} onMouseLeave={()=>setPapersHov(false)}
              style={{ padding:"7px 14px", borderRadius:8, border:`1px solid ${papersHov?"#C5BB9E":BORDER}`, background:papersHov?"#FFF8EE":"transparent", color:papersHov?TEXT:MUTED, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s", display:"flex", alignItems:"center", gap:5, fontFamily:"Georgia, serif" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              Papers
            </button>
            <button onClick={()=>onChat(lab.professor)} onMouseEnter={()=>setBtnHov(true)} onMouseLeave={()=>setBtnHov(false)}
              style={{ padding:"7px 16px", borderRadius:8, border:"none", background:btnHov?ORANGE:PRIMARY, color:"#FFF", fontSize:12, fontWeight:700, cursor:"pointer", transition:"background 0.15s", display:"flex", alignItems:"center", gap:5, fontFamily:"Georgia, serif" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Chat
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ResearchLabPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const handleChat = (professorName: string) => {
    router.push(`/messages?openThread=${encodeURIComponent(professorName)}`);
  };

  const filtered = LABS.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.professor.toLowerCase().includes(search.toLowerCase()) ||
    l.areas.some(a=>a.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ maxWidth:1000, margin:"0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:800, color:TEXT, letterSpacing:"-0.02em" }}>Research &amp; Lab</h1>
        <p style={{ fontSize:14, color:MUTED, marginTop:4 }}>
          Explore research labs, read publications, and connect directly with professors.
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, background:CARD_BG, border:`1.5px solid ${searchFocused?PRIMARY:BORDER}`, borderRadius:10, padding:"10px 16px", maxWidth:420, transition:"border-color 0.15s" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" placeholder="Search labs, professors, or research areas…" value={search} onChange={e=>setSearch(e.target.value)}
            onFocus={()=>setSearchFocused(true)} onBlur={()=>setSearchFocused(false)}
            style={{ background:"transparent", border:"none", outline:"none", color:TEXT, fontSize:13, flex:1, fontFamily:"Georgia, serif" }}/>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display:"flex", gap:16, marginBottom:20, flexWrap:"wrap" }}>
        {[
          { label:"Total Labs",      value:LABS.length },
          { label:"Open Positions",  value:LABS.reduce((s,l)=>s+l.openings,0) },
          { label:"Publications",    value:LABS.reduce((s,l)=>s+l.papers.length,0) },
          { label:"Showing",         value:filtered.length },
        ].map(({label,value})=>(
          <div key={label} style={{ background:CARD_BG, border:`1px solid ${BORDER}`, borderRadius:10, padding:"10px 18px" }}>
            <div style={{ fontSize:20, fontWeight:800, color:PRIMARY }}>{value}</div>
            <div style={{ fontSize:11, color:MUTED, fontWeight:500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"48px 0", color:MUTED, fontSize:14 }}>No labs found matching your search.</div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(310px, 1fr))", gap:16 }}>
          {filtered.map((lab,i)=><LabCard key={lab.id} lab={lab} onChat={handleChat} index={i}/>)}
        </div>
      )}
    </div>
  );
}
