"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";
import ScrollReveal from "../components/ScrollReveal";
import { supabase } from "../../lib/supabase";
import { getFallbackCards, fetchEvents } from "../../lib/events";

export default function HousePartyPage() {
  const [events, setEvents] = useState(() => getFallbackCards("house_party"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchEvents("house_party");
        const fallback = getFallbackCards("house_party");
        setEvents(data.length > 0 ? data : fallback);
      } catch {
        setEvents(getFallbackCards("house_party"));
      } finally {
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel("events_house_party")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "events" }, () => load())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);

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

            {events.length > 0 ? (
              <div
                className="fade-section"
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}
              >
                {events.map((ev) => (
                  <EventCard key={ev.id} {...ev} />
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
