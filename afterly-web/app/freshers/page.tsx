'use client'
import { useState, useEffect } from 'react'
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import EventCard from "../components/EventCard"
import ScrollReveal from "../components/ScrollReveal"
import { fetchEvents } from "../../lib/fetchEvents"
import { FALLBACK_EVENTS } from "../../lib/fallback"

export default function FreshersPage() {
  const [events, setEvents] = useState(FALLBACK_EVENTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000)
    fetchEvents("freshers").then(data => {
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
          <div className="label" style={{ color: "var(--teal)", marginBottom: 24 }}>
            ◈ FRESHERS NIGHT
          </div>
          <h1 style={{ fontWeight: 700, fontSize: "clamp(56px, 8vw, 110px)", color: "#FFF", letterSpacing: -3, lineHeight: 0.95 }}>
            first impressions
            <br />
            matter.
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", maxWidth: 480, margin: "32px 0 48px", lineHeight: 1.6 }}>
            welcome the new batch with a high energy night they will talk about until graduation.
          </p>
          <a href="#events" className="btn" style={{ background: "var(--teal)", color: "#000", padding: "16px 32px", fontSize: 16 }}>
            find freshers events →
          </a>
        </div>
      </section>

      <div style={{ height: 1, background: "rgba(90,191,207,0.3)", width: "100%" }} />

      <ScrollReveal>
        <section className="section">
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <h2 className="headline-section fade-section" style={{ marginBottom: 60 }}>
              the icebreaker.
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 40 }}>
              <div className="fade-section">
                <div style={{ fontSize: 24, fontWeight: 500, color: "#FFF", marginBottom: 16 }}>01 — the energy</div>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>
                  loud music, neon lights, and the excitement of something new.
                </div>
              </div>
              <div className="fade-section">
                <div style={{ fontSize: 24, fontWeight: 500, color: "#FFF", marginBottom: 16 }}>02 — the connections</div>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>
                  games and setups designed to break the ice and start friendships.
                </div>
              </div>
              <div className="fade-section">
                <div style={{ fontSize: 24, fontWeight: 500, color: "#FFF", marginBottom: 16 }}>03 — the safety</div>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>verified college students only. host controls the guest list.</div>
              </div>
            </div>
          </div>
        </section>

        <section id="events" className="section" style={{ background: "var(--bg-secondary)" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <h2 className="headline-section fade-section" style={{ marginBottom: 40 }}>
              current freshers events.
            </h2>

            {events.length > 0 ? (
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
                    category={ev.category}
                    spots={ev.spots_remaining}
                    ticket_price={ev.ticket_price}
                  />
                ))}
              </div>
            ) : !loading ? (
              <div className="fade-section" style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: 20, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>no freshers events listed yet.</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>
                  be the first to host one in your city.
                </div>
                <a href="/host" className="btn btn-secondary">
                  host a freshers night →
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