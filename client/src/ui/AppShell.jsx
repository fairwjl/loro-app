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
    </div>
  );
}