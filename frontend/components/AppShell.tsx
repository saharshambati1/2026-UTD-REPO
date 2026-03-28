"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import Sidebar from "./Sidebar";

const NO_SIDEBAR = ["/", "/sign-in"];

// ── Cursor ─────────────────────────────────────────────────────────────────────
function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const s       = useRef({ mx: -200, my: -200, rx: -200, ry: -200, active: false });
  const rafId   = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      const dx = s.current.mx - s.current.rx;
      const dy = s.current.my - s.current.ry;
      if (Math.abs(dx) < 0.4 && Math.abs(dy) < 0.4) {
        s.current.rx = s.current.mx; s.current.ry = s.current.my;
        s.current.active = false;
        if (ringRef.current)
          ringRef.current.style.transform = `translate3d(${s.current.rx - 20}px,${s.current.ry - 20}px,0)`;
        return;
      }
      s.current.rx += dx * 0.18;
      s.current.ry += dy * 0.18;
      if (ringRef.current)
        ringRef.current.style.transform = `translate3d(${s.current.rx - 20}px,${s.current.ry - 20}px,0)`;
      rafId.current = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      s.current.mx = e.clientX; s.current.my = e.clientY;
      if (dotRef.current)
        dotRef.current.style.transform = `translate3d(${e.clientX - 4}px,${e.clientY - 4}px,0)`;
      if (!s.current.active) { s.current.active = true; rafId.current = requestAnimationFrame(tick); }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(rafId.current); };
  }, []);

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>
      <div ref={dotRef} style={{ position:"fixed", top:0, left:0, zIndex:99999, width:8, height:8, borderRadius:"50%", background:"#6B7C2D", pointerEvents:"none", transform:"translate3d(-200px,-200px,0)", willChange:"transform" }}/>
      <div ref={ringRef} style={{ position:"fixed", top:0, left:0, zIndex:99998, width:40, height:40, borderRadius:"50%", border:"1.5px solid rgba(107,124,45,0.50)", pointerEvents:"none", transform:"translate3d(-200px,-200px,0)", willChange:"transform" }}/>
    </>
  );
}

// ── Blob background ────────────────────────────────────────────────────────────
function BlobBg() {
  return (
    <div aria-hidden style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", background:"#EDE5D0", overflow:"hidden" }}>
      <div style={{ position:"absolute", width:800, height:800, top:-150, right:"0%",  background:"radial-gradient(circle, rgba(107,124,45,0.22) 0%, transparent 65%)", animation:"blobA 22s ease-in-out infinite" }}/>
      <div style={{ position:"absolute", width:600, height:600, bottom:"-5%", left:"-8%", background:"radial-gradient(circle, rgba(232,119,34,0.14) 0%, transparent 65%)", animation:"blobB 28s ease-in-out infinite" }}/>
      <div style={{ position:"absolute", width:500, height:500, top:"35%", right:"35%",  background:"radial-gradient(circle, rgba(200,168,75,0.16) 0%, transparent 65%)", animation:"blobC 20s ease-in-out infinite" }}/>
    </div>
  );
}

// ── Shell ──────────────────────────────────────────────────────────────────────
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = NO_SIDEBAR.includes(pathname);

  if (bare) return (
    <>
      <CustomCursor />
      {children}
    </>
  );

  return (
    <>
      <CustomCursor />
      <BlobBg />
      <div style={{ display:"flex", minHeight:"100vh", position:"relative", zIndex:1 }}>
        <Sidebar />
        <main style={{ flex:1, minHeight:"100vh", position:"relative" }}>
          <div
            key={pathname}
            style={{ padding:"2rem", animation:"pageEnter 0.42s cubic-bezier(0.22,1,0.36,1) both" }}
          >
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
