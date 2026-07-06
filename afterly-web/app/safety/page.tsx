import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function SafetyPage() {
  const sections = [
    {
      title: "verified hosts",
      body: "every host goes through identity verification before listing an event. we check phone numbers, college affiliation, and event details before anything goes live.",
    },
    {
      title: "approval-based entry",
      body: "hosts personally approve every guest who requests to join. no open doors, no random crowds — you know exactly who's coming to your night.",
    },
    {
      title: "reporting",
      body: "coming soon",
    },
  ];

  return (
    <div className="page-load-animate">
      <Navbar />
      <section style={{ minHeight: "80vh", background: "#000", padding: "100px 24px 80px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h1
            style={{
              fontWeight: 700,
              fontSize: "clamp(40px, 6vw, 56px)",
              color: "#FFF",
              letterSpacing: -2,
              marginBottom: 60,
              textAlign: "center",
            }}
          >
            trust & safety.
          </h1>

          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
            {sections.map((section) => (
              <div key={section.title}>
                <h2 style={{ fontSize: 22, fontWeight: 500, color: "#C9A050", marginBottom: 12 }}>
                  {section.title}
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, lineHeight: 1.7 }}>{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
