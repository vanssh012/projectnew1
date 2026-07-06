import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PricingPage() {
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
              marginBottom: 48,
            }}
          >
            simple pricing.
          </h1>

          <div
            style={{
              background: "#111",
              border: "0.5px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: "48px 32px",
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 600, color: "#C9A050", marginBottom: 12 }}>
              7.5% per ticket sold
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, lineHeight: 1.6 }}>
              no monthly fees. no setup costs.
              <br />
              you only pay when you earn.
            </p>
          </div>

          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
            free events: always free to list.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
