import React from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/breathing", label: "Breathing" },
  { to: "/bilateral", label: "Bilateral" },
  { to: "/safety-plan", label: "Safety Plan" },
  { to: "/reflections", label: "Reflections" },
  { to: "/journal", label: "Journal" },
  { to: "/worksheets", label: "Worksheets" },
  { to: "/symptoms", label: "Symptom Tracking" },
  { to: "/moods", label: "Moods" },
  { to: "/music", label: "Music" }
];

export default function AppShell({ children }) {
  const { pathname } = useLocation();


  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">★</span>
            <span className="brand-name">Loro</span>
          </Link>

          <nav className="main-nav" aria-label="Main">
            {navItems.map((item) => {
              const isActive =
                item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`nav-link ${isActive ? "active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="page-container">{children}</main>

      <footer className="site-footer" role="contentinfo" aria-label="Site information">
  <div style={{
    maxWidth: '900px',
    margin: '0 auto',
    padding: '24px 16px',
    textAlign: 'center',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    color: 'var(--text-muted)',
    borderTop: '1px solid var(--border)'
  }}>
    <p style={{ margin: '0 0 8px 0' }}>
      Loro is a wellness tool, not therapy or medical care.
    </p>
    <p style={{ margin: 0 }}>
      If you're in crisis, call <strong style={{ color: 'var(--text)' }}>911</strong> (U.S.), 
      dial or text <strong style={{ color: 'var(--text)' }}>988</strong>, 
      or use your local emergency number.
    </p>
  </div>
</footer>
           
    </div>
  );
}