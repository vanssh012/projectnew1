"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { supabase } from "../../../lib/supabase";
import { FALLBACK_EVENTS } from "../../../lib/fallback";

import AuthGuard from "../../components/AuthGuard";

export default function DashboardIndexPage() {
  const [events, setEvents] = useState<{ id: string; title: string; category: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("event_with_stats")
          .select("id, title, name, category")
          .eq("status", "published")
          .order("event_date", { ascending: false });

        if (!error && data && data.length > 0) {
          setEvents(
            data.map((ev: Record<string, string>) => ({
              id: String(ev.id),
              title: String(ev.title || ev.name || "Untitled"),
              category: String(ev.category),
            }))
          );
        } else {
          setEvents(
            FALLBACK_EVENTS.map((ev) => ({
              id: ev.id,
              title: ev.title,
              category: ev.category,
            }))
          );
        }
      } catch {
        setEvents(
          FALLBACK_EVENTS.map((ev) => ({
            id: ev.id,
            title: ev.title,
            category: ev.category,
          }))
        );
      } finally {
        setLoading(false);
      }
    };
    load();

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <AuthGuard>
      <div className="page-load-animate" style={{ background: "#000", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "100px 24px 80px" }}>
        <h1 style={{ fontSize: 40, fontWeight: 700, color: "#FFF", letterSpacing: -1, marginBottom: 8 }}>
          your dashboard.
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 40 }}>manage your hosted events.</p>

        {loading ? (
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>loading events...</div>
        ) : events.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {events.map((ev) => (
              <Link
                key={ev.id}
                href={`/host/dashboard/${ev.id}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#111",
                  border: "0.5px solid rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  padding: "20px 24px",
                  transition: "border-color 0.2s",
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: "#FFF", marginBottom: 4 }}>{ev.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "capitalize" }}>
                    {ev.category.replace("_", " ")}
                  </div>
                </div>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>→</span>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>no events yet.</div>
            <Link href="/host/create" className="btn btn-secondary">
              create your first event →
            </Link>
          </div>
        )}

        <div style={{ marginTop: 40 }}>
          <Link href="/host/create" style={{ color: "#C9A050", fontSize: 14 }}>
            + create new event
          </Link>
        </div>
      </main>
      <Footer />
    </div>
    </AuthGuard>
  );
}
