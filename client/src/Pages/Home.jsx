// client/src/pages/Home.jsx
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main style={{ background: "var(--surface)", minHeight: "100%" }}>
      <section
        style={{
          background:
            "linear-gradient(180deg, rgba(61,151,116,0.32) 0%, rgba(61,151,116,0.14) 70%, rgba(61,151,116,0) 100%)",
          borderBottom: "1px solid #e9ecef",
        }}
      >
        <div className="container" style={{ padding: "64px 16px 56px" }}>
          <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.15, fontWeight: 700, color: "#2c3e50", textAlign: "center" }}>
            Welcome to Your Safe Space
          </h1>
          <p style={{ margin: "14px auto 28px", maxWidth: 820, fontSize: 18, lineHeight: 1.55, color: "#4b5563", textAlign: "center" }}>
            Loro provides evidence-based tools and gentle guidance to support your healing journey.
            Take your time, move at your pace, and know that you’re not alone.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Link
              to="/breathe"
              style={{
                padding: "12px 18px",
                borderRadius: 8,
                background: "#3d9774",
                color: "white",
                fontWeight: 600,
                border: "1px solid #2f7a5d",
                textDecoration: "none",
              }}
            >
              Begin Your Journey
            </Link>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: "36px 16px 64px" }}>
        <h2 style={{ textAlign: "center", fontSize: 24, color: "#374151", margin: "0 0 22px" }}>
          Quick Access Tools
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 20 }}>
          {[
            {
              title: "Guided Breathing",
              text:
                "Find your center with customizable breathing exercises designed to calm your nervous system.",
              to: "/breathe",
              icon: "●",
            },
            {
              title: "Bilateral Stimulus",
              text:
                "Engage your brain’s natural processing with gentle bilateral stimulation exercises.",
              to: "/bls",
              icon: "↔",
            },
            {
              title: "AI Support",
              text:
                "Connect with your therapeutic companion for guidance and support whenever you need.",
              to: "/journal",
              icon: "💬",
            },
          ].map((c) => (
            <article
              key={c.title}
              style={{
                background: "#fff",
                border: "1px solid #e6e7eb",
                borderRadius: 12,
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                aria-hidden
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 999,
                  background: "#e7f3ee",
                  display: "grid",
                  placeItems: "center",
                  color: "#3d9774",
                  fontWeight: 700,
                  fontSize: 18,
                  userSelect: "none",
                }}
              >
                {c.icon}
              </div>
              <h3 style={{ margin: 0, fontSize: 18, color: "#1f2937" }}>{c.title}</h3>
              <p style={{ margin: 0, color: "#6b7280" }}>{c.text}</p>
              <div style={{ marginTop: "auto" }}>
                <Link
                  to={c.to}
                  style={{
                    display: "inline-block",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    color: "#1f2937",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Open
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}