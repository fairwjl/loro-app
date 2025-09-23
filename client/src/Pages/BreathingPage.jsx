// src/Pages/BreathingPage.jsx
import React, { useState, useRef, useEffect } from "react";

export default function BreathingPage() {
  const [inhale, setInhale] = useState(4);
  const [hold, setHold] = useState(2);
  const [exhale, setExhale] = useState(6);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState("Ready to begin");
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const runCycle = () => {
    setPhase("Inhale");
    timeoutRef.current = setTimeout(() => {
      setPhase("Hold");
      timeoutRef.current = setTimeout(() => {
        setPhase("Exhale");
        timeoutRef.current = setTimeout(() => {
          if (running) runCycle();
          else setPhase("Ready to begin");
        }, exhale * 1000);
      }, hold * 1000);
    }, inhale * 1000);
  };

  const start = () => {
    if (running) return;
    setRunning(true);
    runCycle();
  };

  const stop = () => {
    setRunning(false);
    clearTimeout(timeoutRef.current);
    setPhase("Ready to begin");
  };

  return (
    <div className="page">
      <header className="banner">
        <div className="banner-icon">🫁</div>
        <h1>Guided Breathing Exercises</h1>
        <p>
          Find your center with personalized breathing techniques designed to
          calm your nervous system and restore inner peace.
        </p>
      </header>

      <div className="two-col">
        <div className="panel">
          <div className="breath-circle">
            <div className={`dot ${running ? "anim" : ""}`} />
            <div className="label">{phase}</div>
          </div>

          <div className="controls-row">
            <button className="btn btn-primary" onClick={start} disabled={running}>
              Start Breathing
            </button>
            <button className="btn" onClick={stop} disabled={!running}>
              Stop
            </button>
          </div>
        </div>

        <aside className="panel">
          <h2>Customize Your Practice</h2>
          <div className="form-row">
            <label>Inhale Duration (seconds)</label>
            <input
              type="range"
              min="2"
              max="8"
              value={inhale}
              onChange={(e) => setInhale(+e.target.value)}
            />
            <div className="note">{inhale} seconds</div>
          </div>

          <div className="form-row">
            <label>Hold Duration (seconds)</label>
            <input
              type="range"
              min="0"
              max="8"
              value={hold}
              onChange={(e) => setHold(+e.target.value)}
            />
            <div className="note">{hold} seconds</div>
          </div>

          <div className="form-row">
            <label>Exhale Duration (seconds)</label>
            <input
              type="range"
              min="2"
              max="12"
              value={exhale}
              onChange={(e) => setExhale(+e.target.value)}
            />
            <div className="note">{exhale} seconds</div>
          </div>
        </aside>
      </div>

      <section className="panel">
        <h2>Popular Techniques</h2>
        <ul className="bullets">
          <li>4-7-8 Technique — Inhale 4, Hold 7, Exhale 8</li>
          <li>Box Breathing — 4s inhale, 4s hold, 4s exhale, 4s hold</li>
          <li>Triangle Breathing — Inhale 4, Hold 4, Exhale 4</li>
        </ul>
      </section>
    </div>
  );
}