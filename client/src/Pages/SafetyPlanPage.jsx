// src/Pages/SafetyPlanPage.jsx
import React, { useState } from "react";

export default function SafetyPlanPage() {
  const [contact, setContact] = useState({ name: "", phone: "", hotline: "" });
  const [things, setThings] = useState(["Captured the beauty of nature during a weekend hike."]);

  const save = (e) => {
    e.preventDefault();
    alert("Safety plan saved locally (stub).");
  };

  return (
    <div className="page">
      <header className="banner">
        <div className="banner-icon">🛡️</div>
        <h1>Your Safety Plan</h1>
        <p>
          Create a personalized safety plan with emergency contacts and meaningful
          reminders to support you through difficult moments.
        </p>
      </header>

      <div className="two-col">
        <form className="panel" onSubmit={save}>
          <h2>Emergency Contacts & Crisis Information</h2>

          <div className="form-row">
            <label>Emergency Contact Name</label>
            <input
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              placeholder="Enter contact name"
            />
          </div>
          <div className="form-row">
            <label>Emergency Contact Phone</label>
            <input
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              placeholder="Enter phone number"
            />
          </div>
          <div className="form-row">
            <label>Crisis Hotline Information</label>
            <textarea
              rows={3}
              value={contact.hotline}
              onChange={(e) => setContact({ ...contact, hotline: e.target.value })}
              placeholder="Enter crisis hotline information and notes"
            />
          </div>

          <button className="btn btn-primary" type="submit">
            Save Safety Plan
          </button>
        </form>

        <aside className="panel">
          <h2>Things Worth Living For</h2>
          <div className="gallery">
            {things.map((t, i) => (
              <figure key={i} className="polaroid">
                <div className="thumb" />
                <figcaption>{t}</figcaption>
              </figure>
            ))}
          </div>
          <input
            className="mt"
            placeholder="Add a new reminder"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                setThings((prev) => [...prev, e.target.value.trim()]);
                e.target.value = "";
              }
            }}
          />
        </aside>
      </div>

      <section className="panel">
        <h2>Crisis Resources</h2>
        <div className="resource-grid">
          <article className="resource">
            <div className="resource-icon">📞</div>
            <h3>National Suicide & Crisis Lifeline</h3>
            <div className="hotline">988</div>
            <p>24/7 free and confidential support</p>
          </article>
          <article className="resource">
            <div className="resource-icon">💬</div>
            <h3>Crisis Text Line</h3>
            <div className="hotline">Text HOME to 741741</div>
            <p>Connect with a crisis counselor</p>
          </article>
          <article className="resource">
            <div className="resource-icon">🌐</div>
            <h3>PTSD Foundation</h3>
            <a href="https://ptsdfoundation.org" target="_blank" rel="noreferrer">
              ptsdfoundation.org
            </a>
            <p>Resources and support for trauma survivors</p>
          </article>
        </div>
      </section>
    </div>
  );
}