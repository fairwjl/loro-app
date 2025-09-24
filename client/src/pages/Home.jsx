import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <header className="hero-landing">
        <div className="container hero-inner">
          <div className="brand-row">
            {/* If your AppShell already shows a top nav, this brand row is visually harmless */}
            <div className="brand-mark">
              <span className="brand-icon" aria-hidden="true">★</span>
              <span className="brand-text">Loro</span>
            </div>
          </div>

          <h1 className="hero-title">Welcome to Your Safe Space</h1>
          <p className="hero-sub">
            Loro provides evidence-based tools and gentle guidance to support your healing journey.
            Take your time, move at your pace, and know that you're not alone.
          </p>

          <Link to="/breathing" className="btn-primary hero-cta">
            Begin Your Journey
          </Link>
        </div>
      </header>

      {/* Quick Access */}
      <main>
        <section className="container quick-tools">
          <h2 className="section-heading">
            <span>Quick Access Tools</span>
          </h2>

          <div className="card-grid">
            {/* Guided Breathing */}
            <article className="tool-card">
              <div className="tool-icon" aria-hidden="true">🫁</div>
              <h3 className="tool-title">Guided Breathing</h3>
              <p className="tool-copy">
                Find your center with customizable breathing exercises designed to calm your nervous system.
              </p>
              <Link to="/breathing" className="btn-outline">Open</Link>
            </article>

            {/* Bilateral Stimulus */}
            <article className="tool-card">
              <div className="tool-icon" aria-hidden="true">↔️</div>
              <h3 className="tool-title">Bilateral Stimulus</h3>
              <p className="tool-copy">
                Engage your brain’s natural processing with gentle bilateral stimulation exercises.
              </p>
              <Link to="/bilateral" className="btn-outline">Open</Link>
            </article>

            {/* AI Support */}
            <article className="tool-card">
              <div className="tool-icon" aria-hidden="true">💬</div>
              <h3 className="tool-title">AI Support</h3>
              <p className="tool-copy">
                Connect with your therapeutic companion for guidance and support whenever you need.
              </p>
              <Link to="/journal" className="btn-outline">Open</Link>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}