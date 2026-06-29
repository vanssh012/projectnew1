"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";
import ScrollReveal from "../components/ScrollReveal";
import { supabase } from "../../lib/supabase";

const SEED_EVENTS = [
  { id: "seed_3", title: "Midnight Mirage", date: "Aug 15", location: "Mumbai", hostInitial: "K", hostName: "Kabir", category: "house_party" as const, spots: 5, price: "₹2,000" },
  { id: "seed_5", title: "Rooftop Sundowner", date: "Sept 10", location: "Goa", hostInitial: "M", hostName: "Maya", category: "house_party" as const, spots: 15, price: "₹3,500" },
];

export default function HousePartyPage() {
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('event_with_stats')
        .select('*')
        .eq('status', 'published')
        .eq('category', 'house_party')
        .order('event_date', { ascending: true });
        
      if (error) throw error;
      if (data) {
        const mapped = data.map(ev => ({
          id: ev.id,
          title: ev.name || ev.title,
          date: ev.event_date || ev.date,
          location: ev.city || ev.venue,
          hostInitial: (ev.host_name || "H")[0],
          hostName: ev.host_name || "Host",
          category: ev.category as any,
          spots: ev.spots_left || 0,
          price: ev.ticket_price && ev.ticket_price > 0 ? `₹${ev.ticket_price / 100}` : "Free",
        }));
        setLiveEvents(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    const channel = supabase
      .channel('events_house_party')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'events' },
        () => fetchEvents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const allEvents = [...liveEvents, ...SEED_EVENTS];

  return (
    <div className="page-load-animate">
      <Navbar />

      {/* HERO */}
      <section style={{ minHeight: "80vh", display: "flex", alignItems: "center", padding: "80px 24px", background: "#000" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", width: "100%" }}>
          <div className="label" style={{ color: "var(--purple)", marginBottom: 24 }}>◉ HOUSE PARTY</div>
          <h1 style={{ fontWeight: 700, fontSize: "clamp(56px, 8vw, 110px)", color: "#FFF", letterSpacing: -3, lineHeight: 0.95 }}>
            your space.<br />
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
        {/* WHAT MAKES IT GREAT */}
        <section className="section">
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <h2 className="headline-section fade-section" style={{ marginBottom: 60 }}>do it your way.</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 40 }}>
              <div className="fade-section">
                <div style={{ fontSize: 24, fontWeight: 500, color: "#FFF", marginBottom: 16 }}>01 — strict entry</div>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>invite only or strict application. you decide who walks through the door.</div>
              </div>
              <div className="fade-section">
                <div style={{ fontSize: 24, fontWeight: 500, color: "#FFF", marginBottom: 16 }}>02 — the cost</div>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>split the budget with your guests securely before the night even begins.</div>
              </div>
              <div className="fade-section">
                <div style={{ fontSize: 24, fontWeight: 500, color: "#FFF", marginBottom: 16 }}>03 — the freedom</div>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>no closing time. play your own playlist. make it a theme.</div>
              </div>
            </div>
          </div>
        </section>

        {/* EVENTS */}
        <section id="events" className="section" style={{ background: "var(--bg-secondary)" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <h2 className="headline-section fade-section" style={{ marginBottom: 40 }}>current house parties.</h2>
            
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "100px 0", color: "rgba(255,255,255,0.5)" }}>
                loading events...
              </div>
            ) : allEvents.length > 0 ? (
              <div className="fade-section" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
                {allEvents.map(ev => (
                  <EventCard key={ev.id} {...ev} />
                ))}
              </div>
            ) : (
              <div className="fade-section" style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: 20, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>no house party events listed yet.</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>be the first to host one in your city.</div>
                <a href="/host" className="btn btn-secondary">host a house party →</a>
              </div>
            )}
          </div>
        </section>
      </ScrollReveal>

      <Footer />
    </div>
  );
}
