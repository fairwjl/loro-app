// src/Pages/JournalPage.jsx
import React, { useState } from "react";

export default function JournalPage() {
  const [entries, setEntries] = useState([
    {
      title: "Reflecting on Today",
      date: new Date().toLocaleDateString(),
      preview:
        "Today was a challenging day but full of learning moments.",
    },
  ]);

  const [text, setText] = useState("");

  const add = () => {
    if (!text.trim()) return;
    setEntries((prev) => [
      { title: text.split("\n")[0].slice(0, 60) || "Untitled", date: new Date().toLocaleDateString(), preview: text.slice(0, 160) },
      ...prev,
    ]);
    setText("");
  };

  return (
    <div className="page">
      <header className="banner">
        <div className="banner-icon">📓</div>
        <h1>Your Journal</h1>
        <p>A safe space to process your thoughts and feelings.</p>
      </header>

      <div className="two-col">
        <div className="panel">
          <h2>New Entry</h2>
          <textarea
            rows={6}
            placeholder="Write what's on your mind..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="controls-row">
            <button className="btn btn-primary" onClick={add}>
              Save Entry
            </button>
          </div>
        </div>

        <aside className="panel">
          <h2>Recent Entries</h2>
          <div className="entry-list">
            {entries.map((e, i) => (
              <article key={i} className="entry-card">
                <header>
                  <h3>{e.title}</h3>
                  <time>{e.date}</time>
                </header>
                <p>{e.preview}</p>
                <button className="btn btn-ghost">Read full entry</button>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}