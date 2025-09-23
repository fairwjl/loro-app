// src/Pages/BilateralPage.jsx
import React, { useEffect, useRef, useState } from "react";

export default function BilateralPage() {
  const [speed, setSpeed] = useState(1.5); // pixels per frame
  const [size, setSize] = useState(14);
  const [color, setColor] = useState("#3A8D6D");
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const reqRef = useRef(null);
  const startRef = useRef(0);
  const posRef = useRef(0);
  const dirRef = useRef(1);
  const canvasRef = useRef(null);

  const draw = () => {
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);

    posRef.current += dirRef.current * speed;
    if (posRef.current > c.width - size * 2) dirRef.current = -1;
    if (posRef.current < 0) dirRef.current = 1;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(posRef.current + size, c.height / 2, size, 0, Math.PI * 2);
    ctx.fill();

    reqRef.current = requestAnimationFrame(draw);
  };

  const start = () => {
    if (running) return;
    setRunning(true);
    reqRef.current = requestAnimationFrame(draw);
    startRef.current = performance.now();
  };

  const stop = () => {
    setRunning(false);
    cancelAnimationFrame(reqRef.current);
  };

  useEffect(() => {
    const id = setInterval(() => {
      if (running) {
        const sec = Math.floor((performance.now() - startRef.current) / 1000);
        setTime(sec);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  return (
    <div className="page">
      <header className="banner">
        <div className="banner-icon">↔️</div>
        <h1>Bilateral Stimulus</h1>
        <p>
          Engage your mind and body with rhythmic bilateral stimulation. These
          exercises help process emotions and reduce stress through alternating,
          gentle movements.
        </p>
      </header>

      <div className="two-col">
        <div className="panel">
          <div className="canvas-wrap">
            <canvas
              ref={canvasRef}
              width={560}
              height={280}
              className="bls-canvas"
            />
          </div>
          <div className="controls-row">
            <button className="btn btn-primary" onClick={start} disabled={running}>
              Start Exercise
            </button>
            <button className="btn" onClick={stop} disabled={!running}>
              Stop
            </button>
            <div className="timer">{String(Math.floor(time / 60)).padStart(2, "0")}:
              {String(time % 60).padStart(2, "0")}
            </div>
          </div>
        </div>

        <aside className="panel">
          <h2>Customize Your Experience</h2>

          <div className="form-row">
            <label>Movement Speed</label>
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(+e.target.value)}
            />
            <div className="note">Current: {speed.toFixed(1)}</div>
          </div>

          <div className="form-row">
            <label>Stimulus Size</label>
            <input
              type="range"
              min="6"
              max="24"
              step="1"
              value={size}
              onChange={(e) => setSize(+e.target.value)}
            />
            <div className="note">Current: {size}px</div>
          </div>

          <div className="form-row">
            <label>Stimulus Color</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
        </aside>
      </div>

      <section className="two-col">
        <div className="panel">
          <h2>How to Use Bilateral Stimulus</h2>
          <ol className="numbered">
            <li>Find a comfortable, quiet space where you won’t be disturbed.</li>
            <li>Adjust the settings to match your comfort level.</li>
            <li>Focus on the moving stimulus with your eyes.</li>
            <li>Allow thoughts and feelings to come and go naturally.</li>
            <li>Start with 2–5 minutes and gradually increase duration.</li>
          </ol>
        </div>
        <div className="panel">
          <h2>Therapeutic Benefits</h2>
          <ul className="bullets">
            <li>Reduces emotional intensity of difficult memories</li>
            <li>Supports natural processing of trauma</li>
            <li>Helps integrate thoughts and feelings</li>
            <li>Creates a calming, meditative state</li>
          </ul>
        </div>
      </section>
    </div>
  );
}