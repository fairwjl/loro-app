import { useState } from "react";

export default function Breathe() {
  const [duration, setDuration] = useState(60);
  const [running, setRunning] = useState(false);

  return (
    <div className="page-section">
      <h2>Guided Breathing Exercises</h2>
      <p>
        Find your center with personalized breathing techniques designed to
        calm your nervous system and restore inner balance.
      </p>

      <section className="card">
        <label>
          Duration (seconds)
          <input
            type="range"
            min="30"
            max="300"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
          <div className="muted">{duration}s</div>
        </label>

        <div className="actions">
          {!running ? (
            <button onClick={() => setRunning(true)}>Start</button>
          ) : (
            <button className="secondary danger" onClick={() => setRunning(false)}>
              Stop
            </button>
          )}
        </div>
      </section>
    </div>
  );
}