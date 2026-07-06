import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PrivacyPage() {
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
            privacy policy.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, lineHeight: 1.7 }}>
            we collect your phone number for verification. we never sell your data.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
