import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AboutPage() {
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
        <div style={{ maxWidth: 640, textAlign: "center" }}>
          <h1
            style={{
              fontWeight: 700,
              fontSize: "clamp(40px, 6vw, 56px)",
              color: "#FFF",
              letterSpacing: -2,
              marginBottom: 32,
            }}
          >
            about afterly.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, lineHeight: 1.7, marginBottom: 32 }}>
            Afterly is a platform built for Indian college students to discover and host curated social events.
            We believe the best nights happen when the right people find each other.
          </p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15 }}>
            built by college students, for college students.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
