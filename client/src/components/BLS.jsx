import { useState } from "react";

export default function BLS() {
  const [speed, setSpeed] = useState(60);
  const [running, setRunning] = useState(false);

  return (
    <div className="page-section">
      <h2>Bilateral Stimulation</h2>
      <p>
        Engage your mind and body with rhythmic bilateral stimulation. These
        gentle left-right cues can help reduce arousal and support emotional
        processing.
      </p>

      <section className="card">
        <label>
          Speed (sweeps/min)
          <input
            type="range"
            min="10"
            max="180"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <div className="muted">{speed} SPM</div>
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