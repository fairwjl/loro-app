// src/Pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-hero">
      <div className="hero-gradient">
        <h1 className="hero-title">Welcome to Your Safe Space</h1>
        <p className="hero-subtitle">
          Loro provides evidence-based tools and gentle guidance to support your
          healing journey. Take your time, move at your pace, and know that
          you're not alone.
        </p>
        <Link to="/breathing" className="btn btn-primary">
          Begin Your Journey
        </Link>
      </div>

      <section className="quick-tools">
        <h2 className="section-title">Quick Access Tools</h2>

        <div className="card-grid">
          <article className="card">
            <div className="card-icon">🟢</div>
            <h3 className="card-title">Guided Breathing</h3>
            <p className="card-text">
              Find your center with customizable breathing exercises designed to
              calm your nervous system.
            </p>
            <Link to="/breathing" className="btn btn-ghost">
              Open
            </Link>
          </article>

          <article className="card">
            <div className="card-icon">↔️</div>
            <h3 className="card-title">Bilateral Stimulus</h3>
            <p className="card-text">
              Engage your brain’s natural processing with gentle bilateral
              stimulation exercises.
            </p>
            <Link to="/bilateral" className="btn btn-ghost">
              Open
            </Link>
          </article>

          <article className="card">
            <div className="card-icon">💬</div>
            <h3 className="card-title">AI Support</h3>
            <p className="card-text">
              Connect with your therapeutic companion for guidance and support
              whenever you need.
            </p>
            <Link to="/journal" className="btn btn-ghost">
              Open
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
}