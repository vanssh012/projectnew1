"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";
import ScrollReveal from "../components/ScrollReveal";
import { supabase } from "../../lib/supabase";
import { getFallbackCards, fetchEvents } from "../../lib/events";

const CITIES = ["All Cities", "Delhi NCR", "Bangalore", "Mumbai", "Pune", "Goa"];

export default function ExplorePage() {
  const [filter, setFilter] = useState<"all" | "farewell" | "freshers" | "house_party">("all");
  const [city, setCity] = useState("All Cities");
  const [events, setEvents] = useState(() => getFallbackCards("all", "All Cities"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEvents(getFallbackCards(filter, city));
    setLoading(true);

    const load = async () => {
      try {
        const data = await fetchEvents(filter, city);
        const fallback = getFallbackCards(filter, city);
        setEvents(data.length > 0 ? data : fallback);
      } catch {
        setEvents(getFallbackCards(filter, city));
      } finally {
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel("events")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "events" }, () => load())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter, city]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  const filteredEvents = events;

  return (
    <div className="page-load-animate">
      <Navbar />

      <section style={{ padding: "80px 24px 40px", background: "#000" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h1 style={{ fontWeight: 700, fontSize: 56, letterSpacing: -2, color: "#FFF", marginBottom: 8 }}>
            what&apos;s happening.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16 }}>
            curated college events near you.
          </p>
        </div>
      </section>

      <div
        style={{
          position: "sticky",
          top: 52,
          zIndex: 90,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "0.5px solid rgba(255,255,255,0.06)",
          padding: "16px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {[
              { id: "all", label: "All" },
              { id: "farewell", label: "✦ Farewell" },
              { id: "freshers", label: "◈ Freshers" },
              { id: "house_party", label: "◉ House Party" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id as typeof filter)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 100,
                  fontSize: 14,
                  whiteSpace: "nowrap",
                  background: filter === cat.id ? "#FFF" : "transparent",
                  color: filter === cat.id ? "#000" : "rgba(255,255,255,0.5)",
                  border: `0.5px solid ${filter === cat.id ? "transparent" : "rgba(255,255,255,0.15)"}`,
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{
                background: "#111",
                border: "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                padding: "8px 16px",
                color: "rgba(255,255,255,0.6)",
                fontSize: 14,
              }}
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              style={{
                background: "#111",
                border: "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                padding: "8px 16px",
                color: "rgba(255,255,255,0.6)",
                fontSize: 14,
              }}
            >
              <option>Any Date</option>
              <option>This Weekend</option>
            </select>
          </div>
        </div>
      </div>

      <section style={{ padding: "40px 24px 80px", minHeight: "50vh" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {filteredEvents.length > 0 ? (
            <ScrollReveal stagger>
              <div className="events-grid">
                {filteredEvents.map((ev) => (
                  <div key={ev.id} className="fade-section">
                    <EventCard {...ev} />
                  </div>
                ))}
              </div>
            </ScrollReveal>
          ) : !loading ? (
            <div style={{ textAlign: "center", padding: "100px 0" }}>
              <div style={{ fontSize: 24, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>no events yet.</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>
                check back soon or host your own.
              </div>
              <a href="/host" className="btn btn-secondary">
                host an event →
              </a>
            </div>
          ) : null}
        </div>
      </section>

      <Footer />

      <style>{`
        .events-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) {
          .events-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .events-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
