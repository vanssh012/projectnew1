"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function BlogPage() {
  const [email, setEmail] = useState("");

  return (
    <div className="page-load-animate">
      <Navbar />
      <section
        style={{
          minHeight: "80vh",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1
            style={{
              fontWeight: 700,
              fontSize: "clamp(40px, 6vw, 56px)",
              color: "#FFF",
              letterSpacing: -2,
              marginBottom: 16,
            }}
          >
            blog.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 18, marginBottom: 40 }}>
            stories from the night. coming soon.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            style={{ display: "flex", gap: 8, maxWidth: 360, margin: "0 auto" }}
          >
            <input
              type="email"
              placeholder="your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1,
                background: "#111",
                border: "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: "14px 16px",
                color: "#FFF",
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                background: "#FFF",
                color: "#000",
                borderRadius: 12,
                padding: "14px 20px",
                fontSize: 14,
                fontWeight: 500,
                border: "none",
              }}
            >
              notify me
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}
