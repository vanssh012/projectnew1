"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollReveal from "./components/ScrollReveal";

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="page-load-animate">
      <Navbar />

      {/* ════════ HERO ════════ */}
      <section 
        style={{ 
          minHeight: "100vh", 
          display: "flex", 
          alignItems: "center", 
          padding: "80px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", width: "100%", alignItems: "center" }}>
          
          <div style={{ flex: "1 1 500px", zIndex: 10 }}>
            <h1 className="headline-hero">
              your people.<br />
              your night.
            </h1>
            <p style={{ marginTop: 24, maxWidth: 440 }}>
              discover and host curated college events — farewells, freshers
              nights, and themed house parties.
            </p>
            <div style={{ display: "flex", gap: 16, marginTop: 40, flexWrap: "wrap" }}>
              <a href="/explore" className="btn btn-primary">
                explore events →
              </a>
              <a href="/host" className="btn btn-secondary">
                host an event
              </a>
            </div>
          </div>

          {/* PARALLAX CARDS */}
          <div 
            style={{ 
              flex: "1 1 400px", 
              position: "relative", 
              height: 400, 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center",
              transform: `translateY(${scrollY * 0.15}px)`, // Parallax effect
              marginTop: "40px"
            }}
          >
            {/* Card 1 */}
            <div style={{
              width: 280,
              background: "var(--bg-card)",
              border: "0.5px solid var(--border)",
              borderRadius: 20,
              position: "absolute",
              transform: "rotate(-4deg) translateX(-20px)",
              zIndex: 2,
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              overflow: "hidden"
            }}>
              <div style={{ height: 140, background: "linear-gradient(135deg, #1A1408 0%, #0E0A04 100%)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 40, opacity: 0.1, color: "#FFF" }}>✦</span>
                <span style={{ position: "absolute", top: 12, left: 12, background: "#FFF", color: "#000", fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 100, textTransform: "uppercase" }}>Farewell</span>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: "#FFF", marginBottom: 8 }}>The Last Dance '25</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>June 14 · Delhi NCR</div>
              </div>
            </div>

            {/* Card 2 */}
            <div style={{
              width: 280,
              background: "var(--bg-card)",
              border: "0.5px solid var(--border)",
              borderRadius: 20,
              position: "absolute",
              transform: "rotate(2deg) translateX(40px) translateY(40px)",
              zIndex: 1,
              overflow: "hidden"
            }}>
              <div style={{ height: 140, background: "linear-gradient(135deg, #0A1A1E 0%, #050D0F 100%)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 40, opacity: 0.1, color: "#FFF" }}>◈</span>
                <span style={{ position: "absolute", top: 12, left: 12, background: "#FFF", color: "#000", fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 100, textTransform: "uppercase" }}>Freshers</span>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: "#FFF", marginBottom: 8 }}>Neon Night</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>July 2 · Bangalore</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-container">
        <div className="marquee-content">
          FAREWELLS · FRESHERS NIGHTS · HOUSE PARTIES · DELHI NCR · BANGALORE · MUMBAI · PUNE · GOA · FAREWELLS · FRESHERS NIGHTS · HOUSE PARTIES · DELHI NCR · BANGALORE · MUMBAI · PUNE · GOA · FAREWELLS · FRESHERS NIGHTS · HOUSE PARTIES ·
        </div>
      </div>

      <ScrollReveal stagger>
        {/* ════════ CATEGORIES ════════ */}
        <section className="section" id="categories">
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <h2 className="headline-section fade-section" style={{ textAlign: "center" }}>three kinds of nights.</h2>
            <p className="fade-section" style={{ textAlign: "center", margin: "16px auto 60px", maxWidth: 500 }}>
              every event on afterly fits one of three moods.
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
              
              <a href="/farewell" className="fade-section" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: 20, padding: 40, transition: "all 0.3s ease", display: "block" }}>
                <div style={{ fontSize: 32, color: "var(--gold)" }}>✦</div>
                <div style={{ fontSize: 24, fontWeight: 500, color: "#FFF", marginTop: 24 }}>Farewell</div>
                <div style={{ marginTop: 12, color: "rgba(255,255,255,0.5)" }}>the last night together. make it count.</div>
              </a>

              <a href="/freshers" className="fade-section" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: 20, padding: 40, transition: "all 0.3s ease", display: "block" }}>
                <div style={{ fontSize: 32, color: "var(--teal)" }}>◈</div>
                <div style={{ fontSize: 24, fontWeight: 500, color: "#FFF", marginTop: 24 }}>Freshers</div>
                <div style={{ marginTop: 12, color: "rgba(255,255,255,0.5)" }}>your first real college memory starts here.</div>
              </a>

              <a href="/house-party" className="fade-section" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: 20, padding: 40, transition: "all 0.3s ease", display: "block" }}>
                <div style={{ fontSize: 32, color: "var(--purple)" }}>◉</div>
                <div style={{ fontSize: 24, fontWeight: 500, color: "#FFF", marginTop: 24 }}>House Party</div>
                <div style={{ marginTop: 12, color: "rgba(255,255,255,0.5)" }}>themed. curated. invite-only. unforgettable.</div>
              </a>

            </div>
          </div>
        </section>

        {/* ════════ HOW IT WORKS ════════ */}
        <section className="section" id="how-it-works">
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <h2 className="headline-section fade-section" style={{ textAlign: "center" }}>simple.</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 40, marginTop: 80 }}>
              <div className="fade-section" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: -2, color: "var(--gold)", lineHeight: 1 }}>01</div>
                <div style={{ fontSize: 20, fontWeight: 500, color: "#FFF", margin: "16px 0 8px" }}>discover</div>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>browse events by category, city, and vibe. see who's going before you request.</div>
              </div>
              <div className="fade-section" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: -2, color: "var(--teal)", lineHeight: 1 }}>02</div>
                <div style={{ fontSize: 20, fontWeight: 500, color: "#FFF", margin: "16px 0 8px" }}>request</div>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>apply to join. send the host a message. get approved and your spot is locked.</div>
              </div>
              <div className="fade-section" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: -2, color: "var(--purple)", lineHeight: 1 }}>03</div>
                <div style={{ fontSize: 20, fontWeight: 500, color: "#FFF", margin: "16px 0 8px" }}>attend</div>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>show your QR ticket at the door. no printouts. no hassle.</div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════ TRUST ════════ */}
        <section className="section" style={{ background: "var(--bg-secondary)" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <h2 className="headline-section fade-section" style={{ textAlign: "center", fontSize: "clamp(28px, 4vw, 40px)" }}>everyone's verified.</h2>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 40, marginTop: 60 }}>
              <div className="fade-section" style={{ flex: "1 1 250px", textAlign: "center" }}>
                <div style={{ fontSize: 20, color: "var(--gold)", marginBottom: 12 }}>✓</div>
                <div style={{ fontSize: 18, fontWeight: 500, color: "#FFF", marginBottom: 8 }}>verified hosts</div>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>every host is reviewed before listing</div>
              </div>
              <div className="fade-section" style={{ flex: "1 1 250px", textAlign: "center" }}>
                <div style={{ fontSize: 20, color: "var(--gold)", marginBottom: 12 }}>✓</div>
                <div style={{ fontSize: 18, fontWeight: 500, color: "#FFF", marginBottom: 8 }}>approval-based</div>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>hosts approve every guest personally</div>
              </div>
              <div className="fade-section" style={{ flex: "1 1 250px", textAlign: "center" }}>
                <div style={{ fontSize: 20, color: "var(--gold)", marginBottom: 12 }}>✓</div>
                <div style={{ fontSize: 18, fontWeight: 500, color: "#FFF", marginBottom: 8 }}>college verified</div>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>college email required for farewells</div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════ CITIES ════════ */}
        <section className="section">
          <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
            <h2 className="headline-section fade-section">launching in.</h2>
            <div className="fade-section" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 40 }}>
              {["Delhi NCR", "Bangalore", "Mumbai", "Pune", "Goa"].map(city => (
                <div key={city} style={{ padding: "10px 24px", borderRadius: 100, border: "0.5px solid var(--border)", color: "rgba(255,255,255,0.5)" }}>
                  {city}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ CTA ════════ */}
        <section className="section">
          <div className="fade-section" style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            <h2 className="headline-section">ready for your next night?</h2>
            <div style={{ marginTop: 40 }}>
              <a href="/explore" className="btn btn-primary">
                find events near you →
              </a>
              <div className="label" style={{ marginTop: 24, textTransform: "none", letterSpacing: "normal" }}>
                free to join · no credit card required
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <Footer />
    </div>
  );
}
