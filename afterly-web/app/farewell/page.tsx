"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";
import ScrollReveal from "../components/ScrollReveal";
import { supabase } from "../../lib/supabase";

const SEED_EVENTS = [
  { id: "seed_1", title: "The Last Dance '25", date: "June 14", location: "Delhi NCR", hostInitial: "A", hostName: "Arjun M.", category: "farewell" as const, spots: 12, price: "₹1,500" },
  { id: "seed_4", title: "CS Dept Farewell", date: "June 20", location: "Pune", hostInitial: "R", hostName: "Rahul", category: "farewell" as const, spots: 40, price: "₹1,200" },
];

export default function FarewellPage() {
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('event_with_stats')
        .select('*')
        .eq('status', 'published')
        .eq('category', 'farewell')
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
      .channel('events_farewell')
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
          <div className="label" style={{ color: "var(--gold)", marginBottom: 24 }}>✦ FAREWELL</div>
          <h1 style={{ fontWeight: 700, fontSize: "clamp(56px, 8vw, 110px)", color: "#FFF", letterSpacing: -3, lineHeight: 0.95 }}>
            the last night<br />
            together.
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", maxWidth: 480, margin: "32px 0 48px", lineHeight: 1.6 }}>
            don't let the batch of 2025 scatter without one last unforgettable night.
          </p>
          <a href="#events" className="btn" style={{ background: "var(--gold)", color: "#000", padding: "16px 32px", fontSize: 16 }}>
            find farewell events →
          </a>
        </div>
      </section>

      <div style={{ height: 1, background: "rgba(201,160,80,0.3)", width: "100%" }} />

      <ScrollReveal>
        {/* WHAT MAKES A GREAT FAREWELL */}
        <section className="section">
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <h2 className="headline-section fade-section" style={{ marginBottom: 60 }}>what makes a great farewell.</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 40 }}>
              <div className="fade-section">
                <div style={{ fontSize: 24, fontWeight: 500, color: "#FFF", marginBottom: 16 }}>01 — the venue</div>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>a private space that feels like yours. not a club. not a banquet hall.</div>
              </div>
              <div className="fade-section">
                <div style={{ fontSize: 24, fontWeight: 500, color: "#FFF", marginBottom: 16 }}>02 — the crowd</div>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>only your batch. everyone verified. no randoms.</div>
              </div>
              <div className="fade-section">
                <div style={{ fontSize: 24, fontWeight: 500, color: "#FFF", marginBottom: 16 }}>03 — the memory</div>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>photo booth. dinner. performances. the works.</div>
              </div>
            </div>
          </div>
        </section>

        {/* EVENTS */}
        <section id="events" className="section" style={{ background: "var(--bg-secondary)" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <h2 className="headline-section fade-section" style={{ marginBottom: 40 }}>current farewell events.</h2>
            
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
                <div style={{ fontSize: 20, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>no farewell events listed yet.</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>be the first to host one in your city.</div>
                <a href="/host" className="btn btn-secondary">host a farewell →</a>
              </div>
            )}
          </div>
        </section>
      </ScrollReveal>

      <Footer />
    </div>
  );
}
