"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HostEntryPage() {
  const router = useRouter();

  const handleCardClick = (type: string) => {
    router.push(`/host/create?type=${type}`);
  };

  return (
    <div className="page-load-animate" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
      {/* TOP */}
      <div style={{ padding: "40px 60px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ color: "var(--gold)", fontSize: 24 }}>✦</span>
          <span style={{ fontSize: 16, fontWeight: 500, color: "#FFF" }}>afterly</span>
        </Link>
        <Link href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          ← back
        </Link>
      </div>

      {/* CENTER CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 24px 80px" }}>
        
        <div className="label" style={{ marginBottom: 16 }}>WHAT ARE YOU HOSTING?</div>
        <h1 style={{ fontWeight: 700, fontSize: 56, color: "#FFF", letterSpacing: -2, marginBottom: 8, textAlign: "center" }}>
          choose your night.
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, marginBottom: 56, textAlign: "center", maxWidth: 400 }}>
          every event type has its own vibe, crowd, and setup. pick yours.
        </p>

        {/* THREE CATEGORY CARDS */}
        <div className="host-cards-grid">
          
          {/* FAREWELL CARD */}
          <div className="host-card farewell-card" onClick={() => handleCardClick("farewell")}>
            <div style={{ fontSize: 28, color: "var(--gold)" }}>✦</div>
            <div style={{ fontSize: 24, fontWeight: 500, color: "#FFF", marginTop: 16, letterSpacing: -0.5 }}>Farewell</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginTop: 8, flex: 1 }}>
              the last night with your batch. emotional, themed, unforgettable.
            </div>
            
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginTop: 24 }} />
            
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)" }} /> requires college + batch info
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)" }} /> college email verification for guests
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)" }} /> approval-based entry
              </div>
            </div>

            <div className="card-link farewell-link">
              host a farewell →
            </div>
          </div>

          {/* FRESHERS CARD */}
          <div className="host-card freshers-card" onClick={() => handleCardClick("freshers")}>
            <div style={{ fontSize: 28, color: "var(--teal)" }}>◈</div>
            <div style={{ fontSize: 24, fontWeight: 500, color: "#FFF", marginTop: 16, letterSpacing: -0.5 }}>Freshers Night</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginTop: 8, flex: 1 }}>
              welcome the new batch. high energy, first impressions, their night one.
            </div>
            
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginTop: 24 }} />
            
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--teal)" }} /> requires college info
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--teal)" }} /> open or approval-based
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--teal)" }} /> perfect for student councils
              </div>
            </div>

            <div className="card-link freshers-link">
              host a freshers night →
            </div>
          </div>

          {/* HOUSE PARTY CARD */}
          <div className="host-card house-party-card" onClick={() => handleCardClick("house_party")}>
            <div style={{ fontSize: 28, color: "var(--purple)" }}>◉</div>
            <div style={{ fontSize: 24, fontWeight: 500, color: "#FFF", marginTop: 16, letterSpacing: -0.5 }}>House Party</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginTop: 8, flex: 1 }}>
              your space, your rules, your crowd. themed nights done right.
            </div>
            
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginTop: 24 }} />
            
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--purple)" }} /> no college info needed
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--purple)" }} /> strictly invite-only or application
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--purple)" }} /> full theme customisation
              </div>
            </div>

            <div className="card-link house-party-link">
              host a house party →
            </div>
          </div>

        </div>

        <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, marginTop: 32, textAlign: "center" }}>
          not sure? you can change the type later.
        </div>
      </div>

      <style>{`
        .host-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          max-width: 900px;
          width: 100%;
        }
        @media (max-width: 900px) {
          .host-cards-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .host-card {
          background: #111;
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 36px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        
        .card-link {
          font-size: 13px;
          margin-top: 28px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: transform 0.2s ease;
        }

        .farewell-card:hover {
          border-color: rgba(201,160,80,0.4);
          background: rgba(201,160,80,0.04);
          transform: translateY(-4px);
        }
        .farewell-card:hover .farewell-link {
          transform: translateX(4px);
        }
        .farewell-link { color: var(--gold); }

        .freshers-card:hover {
          border-color: rgba(90,191,207,0.4);
          background: rgba(90,191,207,0.04);
          transform: translateY(-4px);
        }
        .freshers-card:hover .freshers-link {
          transform: translateX(4px);
        }
        .freshers-link { color: var(--teal); }

        .house-party-card:hover {
          border-color: rgba(176,122,224,0.4);
          background: rgba(176,122,224,0.04);
          transform: translateY(-4px);
        }
        .house-party-card:hover .house-party-link {
          transform: translateX(4px);
        }
        .house-party-link { color: var(--purple); }
      `}</style>
    </div>
  );
}
