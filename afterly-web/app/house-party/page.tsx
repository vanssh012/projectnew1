'use client'
import { useState, useEffect } from 'react'
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import EventCard from "../components/EventCard"
import SkeletonCard from "../components/SkeletonCard"
import ScrollReveal from "../components/ScrollReveal"
import { fetchEvents } from "../../lib/fetchEvents"

export default function HousePartyPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000)
    fetchEvents("house_party").then(data => {
      setEvents(data)
      setLoading(false)
      clearTimeout(timer)
    })
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="page-load-animate">
      <Navbar />

      <section style={{ minHeight: "80vh", display: "flex", alignItems: "center", padding: "80px 24px", background: "#000" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", width: "100%" }}>
          <div className="label" style={{ color: "var(--purple)", marginBottom: 24 }}>
            ◉ HOUSE PARTY
          </div>
          <h1 style={{ fontWeight: 700, fontSize: "clamp(56px, 8vw, 110px)", color: "#FFF", letterSpacing: -3, lineHeight: 0.95 }}>
            your space.
            <br />
            your rules.
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", maxWidth: 480, margin: "32px 0 48px", lineHeight: 1.6 }}>
            intimate crowds, zero club restrictions, and a vibe entirely curated by you.
          </p>
          <a href="#events" className="btn" style={{ background: "var(--purple)", color: "#000", padding: "16px 32px", fontSize: 16 }}>
            find house parties →
          </a>
        </div>
      </section>

      <div style={{ height: 1, background: "rgba(176,122,224,0.3)", width: "100%" }} />

      <ScrollReveal>
        <section className="section">
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <h2 className="headline-section fade-section" style={{ marginBottom: 60 }}>
              do it your way.
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 40 }}>
              <div className="fade-section">
                <div style={{ fontSize: 24, fontWeight: 500, color: "#FFF", marginBottom: 16 }}>01 — strict entry</div>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>
                  invite only or strict application. you decide who walks through the door.
                </div>
              </div>
              <div className="fade-section">
                <div style={{ fontSize: 24, fontWeight: 500, color: "#FFF", marginBottom: 16 }}>02 — the cost</div>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>
                  split the budget with your guests securely before the night even begins.
                </div>
              </div>
              <div className="fade-section">
                <div style={{ fontSize: 24, fontWeight: 500, color: "#FFF", marginBottom: 16 }}>03 — the freedom</div>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>no closing time. play your own playlist. make it a theme.</div>
              </div>
            </div>
          </div>
        </section>

        <section id="events" className="section" style={{ background: "var(--bg-secondary)" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <h2 className="headline-section fade-section" style={{ marginBottom: 40 }}>
              current house parties.
            </h2>

            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
                {[0, 1, 2].map((item) => <SkeletonCard key={item} />)}
              </div>
            ) : events.length > 0 ? (
              <div
                className="fade-section"
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}
              >
                {events.map((ev) => (
                  <EventCard key={ev.id}
                    id={ev.id}
                    title={ev.title}
                    date={ev.event_date}
                    location={ev.city || ev.venue}
                    hostInitial={(ev.host_name || 'H')[0]}
                    hostName={ev.host_name || 'Host'}
                    hostId={ev.host_id}
                    category={ev.category}
                    spots={ev.spots_remaining}
                    ticket_price={ev.ticket_price}
                  />
                ))}
              </div>
            ) : !loading ? (
              <div className="fade-section" style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: 20, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>no house party events listed yet.</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>
                  be the first to host one in your city.
                </div>
                <a href="/host" className="btn btn-secondary">
                  host a house party →
                </a>
              </div>
            ) : null}
          </div>
        </section>
      </ScrollReveal>

      <Footer />
    </div>
  );
}