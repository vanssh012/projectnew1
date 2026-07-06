"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthGuard from "../components/AuthGuard";
import { supabase, getStoredUser } from "../../lib/supabase";

export default function ProfilePage() {
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setPhone(stored.phone);
      return;
    }
    (supabase.auth.getSession() as any).then(({ data }: any) => {
      const session = data?.session;
      if (session?.user?.phone) {
        setPhone(session.user.phone);
      }
    });
  }, []);

  return (
    <AuthGuard>
      <div className="page-load-animate" style={{ background: "#000", minHeight: "100vh" }}>
        <Navbar />
        <main style={{ maxWidth: 640, margin: "0 auto", padding: "100px 24px 80px" }}>
          <h1 style={{ fontSize: 40, fontWeight: 700, color: "#FFF", letterSpacing: -1, marginBottom: 40 }}>
            your profile.
          </h1>

          <div
            style={{
              background: "#111",
              border: "0.5px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: 32,
              marginBottom: 32,
            }}
          >
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>phone</div>
            <div style={{ fontSize: 18, color: "#FFF" }}>{phone ? `+91 ${phone}` : "—"}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link
              href="/tickets"
              style={{
                display: "block",
                background: "#111",
                border: "0.5px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: "20px 24px",
                color: "#FFF",
                fontSize: 15,
              }}
            >
              your tickets →
            </Link>
            <Link
              href="/host/dashboard"
              style={{
                display: "block",
                background: "#111",
                border: "0.5px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: "20px 24px",
                color: "#FFF",
                fontSize: 15,
              }}
            >
              host dashboard →
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
