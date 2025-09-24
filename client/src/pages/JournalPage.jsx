// client/src/pages/JournalPage.jsx
import { useState } from "react";

export default function JournalPage() {
  const [text, setText] = useState("");

  return (
    <>
      {/* Soft green hero, matches Home/Reflections theme */}
      <header className="journal-hero hero-landing">
        <div className="container hero-inner">
          <h1 className="hero-title">Journal</h1>
          <p className="hero-sub">
            A quiet space to write freely. Your words stay with you.
          </p>
        </div>
      </header>

      <main className="container">
        <section className="journal-panel">
          <h2 className="section-title">Journal</h2>
          <p className="card-text">
            Write what’s on your mind. (We can add saving/export later.)
          </p>

          <div className="form-row">
            <textarea
              rows={10}
              placeholder="Start writing..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ borderRadius: 12 }}
            />
          </div>
        </section>
      </main>
    </>
  );
}