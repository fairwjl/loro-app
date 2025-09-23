// client/src/ui/AppShell.jsx
import React from "react";

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <header
        className="topbar"
        role="banner"
        style={{
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            "linear-gradient(180deg, rgba(143,211,197,0.35) 0%, rgba(143,211,197,0) 100%)",
        }}
      >
        {/* Brand (left) */}
        <a
          href="/"
          className="brand"
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "#8fd3c5",
              boxShadow: "0 0 0 2px #256f5b inset",
            }}
          />
          <span className="brand-name" style={{ fontWeight: 600, color: "#2f3a40" }}>
            Loro
          </span>
        </a>

        {/* Nav (right) */}
        <nav
          className="topnav"
          role="navigation"
          aria-label="Primary"
          style={{ display: "flex", gap: "24px" }}
        >
          <a href="/">Home</a>
          <a href="/breathe">Breathing</a>
          <a href="/bls">Bilateral</a>
          <a href="/safety">Safety Plan</a>
          <a href="/journal">Journal</a>
        </nav>
      </header>

      {/* Page content */}
      <main role="main" className="page" style={{ minHeight: "60vh" }}>
        {children}
      </main>

      <footer role="contentinfo" style={{ padding: "16px 20px", opacity: 0.7 }}>
        {/* optional footer */}
      </footer>
    </div>
  );
}