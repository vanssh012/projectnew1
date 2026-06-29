"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";
import ScrollReveal from "../components/ScrollReveal";
import { supabase } from "../../lib/supabase";

const SEED_EVENTS = [
  { id: "seed_1", title: "The Last Dance '25", date: "June 14", location: "Delhi NCR", hostInitial: "A", hostName: "Arjun M.", category: "farewell" as const, spots: 12, price: "₹1,500" },
  { id: "seed_2", title: "Neon Freshers Night", date: "July 2", location: "Bangalore", hostInitial: "S", hostName: "Sneha R.", category: "freshers" as const, spots: 28, price: "₹999" },
  { id: "seed_3", title: "Midnight Mirage", date: "Aug 15", location: "Mumbai", hostInitial: "K", hostName: "Kabir", category: "house_party" as const, spots: 5, price: "₹2,000" },
];

export default function ExplorePage() {
  const [filter, setFilter] = useState<"all" | "farewell" | "freshers" | "house_party">("all");
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('event_with_stats')
        .select('*')
        .eq('status', 'published')
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
      .channel('events')
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
  const filteredEvents = allEvents.filter(e => filter === "all" || e.category === filter);

  return (
    <div className="page-load-animate">
      <Navbar />

      {/* HEADER */}
      <section style={{ padding: "80px 24px 40px", background: "#000" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h1 style={{ fontWeight: 700, fontSize: 56, letterSpacing: -2, color: "#FFF", marginBottom: 8 }}>
            what's happening.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16 }}>
            curated college events near you.
          </p>
        </div>
      </section>

      {/* STICKY FILTER BAR */}
      <div style={{ 
        position: "sticky", 
        top: 52,
        zIndex: 90, 
        background: "rgba(0,0,0,0.85)", 
        backdropFilter: "blur(20px)",
        borderBottom: "0.5px solid rgba(255,255,255,0.06)",
        padding: "16px 24px"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center" }}>
          
          {/* Category Pills */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {[
              { id: "all", label: "All" },
              { id: "farewell", label: "✦ Farewell" },
              { id: "freshers", label: "◈ Freshers" },
              { id: "house_party", label: "◉ House Party" },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id as any)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 100,
                  fontSize: 14,
                  whiteSpace: "nowrap",
                  background: filter === cat.id ? "#FFF" : "transparent",
                  color: filter === cat.id ? "#000" : "rgba(255,255,255,0.5)",
                  border: `0.5px solid ${filter === cat.id ? "transparent" : "rgba(255,255,255,0.15)"}`
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Right filters */}
          <div style={{ display: "flex", gap: 12 }}>
            <select style={{ background: "#111", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 16px", color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
              <option>All Cities</option>
              <option>Delhi NCR</option>
              <option>Bangalore</option>
            </select>
            <select style={{ background: "#111", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 16px", color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
              <option>Any Date</option>
              <option>This Weekend</option>
            </select>
          </div>
        </div>
      </div>

      {/* EVENTS GRID */}
      <section style={{ padding: "40px 24px 80px", minHeight: "50vh" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "100px 0", color: "rgba(255,255,255,0.5)" }}>
              loading events...
            </div>
          ) : filteredEvents.length > 0 ? (
            <ScrollReveal stagger>
              <div className="events-grid">
                {filteredEvents.map((ev) => (
                  <div key={ev.id} className="fade-section">
                    <EventCard {...ev} />
                  </div>
                ))}
              </div>
            </ScrollReveal>
          ) : (
            <div style={{ textAlign: "center", padding: "100px 0" }}>
              <div style={{ fontSize: 24, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>no events yet.</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>check back soon or host your own.</div>
              <a href="/host" className="btn btn-secondary">host an event →</a>
            </div>
          )}

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
