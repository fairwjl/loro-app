// src/Pages/WorksheetsPage.jsx
import React from "react";

export default function WorksheetsPage() {
  return (
    <div className="page">
      <header className="banner">
        <div className="banner-icon">🧩</div>
        <h1>Therapeutic Worksheets</h1>
        <p>
          Structured exercises based on evidence-based practices to support
          your healing journey through CBT, CPT, and DBT techniques.
        </p>
      </header>

      <div className="two-col">
        <aside className="panel">
          <h2>Filter by Type</h2>
          <select defaultValue="all">
            <option value="all">All Worksheets</option>
            <option value="cbt">CBT</option>
            <option value="cpt">CPT</option>
            <option value="dbt">DBT</option>
            <option value="mindfulness">Mindfulness</option>
          </select>

          <h2 className="mt">Your Progress</h2>
          <ul className="bullets">
            <li>Completed</li>
            <li>In Progress</li>
          </ul>

          <button className="btn btn-primary">Start New Worksheet</button>
        </aside>

        <div className="panel">
          <h2>Available Worksheets</h2>
          <div className="card-grid">
            <article className="card">
              <h3>Mindfulness Meditation Template</h3>
              <p>Guides through a meditation practice to enhance focus.</p>
              <button className="btn btn-ghost">Open</button>
            </article>

            <article className="card">
              <h3>CBT Worksheet for Thought Patterns</h3>
              <p>Helps users identify and change negative thought patterns.</p>
              <button className="btn btn-ghost">Open</button>
            </article>
          </div>

          <h2 className="mt">Your Worksheets</h2>
          <article className="card">
            <div className="badge-row">
              <span className="badge">Cognitive Behavioral</span>
              <span className="badge badge-green">Completed</span>
            </div>
            <h3>CBT Worksheet for Thought Patterns</h3>
            <p>Realized distortions in thought process, aiming for positive reframing.</p>
            <div className="controls-row">
              <button className="btn btn-primary">Continue Working</button>
              <button className="btn">Rename</button>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}