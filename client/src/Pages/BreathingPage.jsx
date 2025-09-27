import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * BreathingPage – trauma-informed, reduced-stimulus paced breathing
 * - Patterns: Box (4-4-4-4), 4-7-8, 6-6, 5-5
 * - Visual: expanding circle; reduced-motion shows a progress bar
 * - Start / Pause / Reset controls
 * - Optional soft tone on phase change (OFF by default)
 * - Respects prefers-reduced-motion; user can override with a toggle
 */

const PATTERNS = [
  { key: "box", label: "Box (4-4-4-4)", phases: ["Inhale", "Hold", "Exhale", "Hold"], secs: [4, 4, 4, 4] },
  { key: "478", label: "4-7-8", phases: ["Inhale", "Hold", "Exhale"], secs: [4, 7, 8] },
  { key: "66", label: "Coherent (6-6)", phases: ["Inhale", "Exhale"], secs: [6, 6] },
  { key: "55", label: "Gentle (5-5)", phases: ["Inhale", "Exhale"], secs: [5, 5] },
];

export default function BreathingPage() {
  const [patternKey, setPatternKey] = useState("66");
  // JS-safe: provide a default if not found
  const pattern = useMemo(
    () => PATTERNS.find((p) => p.key === patternKey) || PATTERNS[0],
    [patternKey]
  );

  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [elapsedInPhase, setElapsedInPhase] = useState(0); // seconds (float)
  const [useReducedMotion, setUseReducedMotion] = useState(false); // user override
  const [soundOn, setSoundOn] = useState(false); // OFF by default
  const rafRef = useRef(null);
  const lastTsRef = useRef(null);
  const audioRef = useRef(null);

  // Honor prefers-reduced-motion by default
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setUseReducedMotion(mq.matches);
    const listener = (e) => setUseReducedMotion(e.matches);
    mq.addEventListener?.("change", listener);
    return () => mq.removeEventListener?.("change", listener);
  }, []);

  // WebAudio tone at phase changes (optional)
  function beep() {
    if (!soundOn) return;
    if (!audioRef.current) {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audioRef.current = new Ctx();
      } catch {
        return; // audio not available; fail silently
      }
    }
    const ctx = audioRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    // Slightly softer tone for "Exhale", brighter for "Inhale"/"Hold"
    const phase = pattern.phases[phaseIndex];
    const freq = phase === "Exhale" ? 392 : 523.25; // G4 vs C5
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.28);
  }

  const durationCurrentPhase = pattern.secs[phaseIndex];

  // Animation / timer loop
  useEffect(() => {
    if (!isRunning) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
      return;
    }

    const tick = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000; // seconds
      lastTsRef.current = ts;

      setElapsedInPhase((prev) => {
        const next = prev + dt;
        if (next >= durationCurrentPhase) {
          // advance phase
          const nextIndex = (phaseIndex + 1) % pattern.phases.length;
          setPhaseIndex(nextIndex);
          beep();
          return 0;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, phaseIndex, patternKey, durationCurrentPhase, soundOn]);

  function start() {
    // reset timers but keep the current pattern
    setPhaseIndex(0);
    setElapsedInPhase(0);
    setIsRunning(true);
    beep();
  }

  function pause() {
    setIsRunning(false);
  }

  function reset() {
    setIsRunning(false);
    setPhaseIndex(0);
    setElapsedInPhase(0);
  }

  // Visuals
  const phase = pattern.phases[phaseIndex];
  const progress = Math.min(1, elapsedInPhase / durationCurrentPhase);
  // For the circle: scale from 0.9→1.2 on inhale, 1.2→0.9 on exhale; hold keeps steady.
  const baseScale = 1.0;
  let scale = baseScale;
  if (phase === "Inhale") scale = 0.9 + 0.3 * progress;
  else if (phase === "Exhale") scale = 1.2 - 0.3 * progress;

  return (
    <div
      style={{
        fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        color: "#243a2e",
        maxWidth: 760,
        margin: "0 auto",
        padding: "8px 16px 28px",
      }}
    >
      <h2 className="section-title" style={{ color: "#243a2e" }}>Breathing</h2>
      <p className="card-text" style={{ color: "#4a5e54" }}>
        Paced breathing can help settle the nervous system. Choose a pattern, then press Start.
      </p>

      {/* Controls */}
      <div
        className="panel"
        style={{
          marginTop: 12,
          background: "#ffffff",
          border: "1px solid #d7ece8",
          borderRadius: 16,
          padding: 12,
        }}
      >
        <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, alignItems: "center" }}>
          <label htmlFor="pattern" style={{ color: "#243a2e" }}>Pattern</label>
          <select
            id="pattern"
            value={patternKey}
            onChange={(e) => { setPatternKey(e.target.value); reset(); }}
            style={{ borderRadius: 10, padding: "8px 10px", border: "1px solid #cfe7e3" }}
          >
            {PATTERNS.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>

          <label htmlFor="reduced" style={{ justifySelf: "end", color: "#243a2e" }}>Reduced motion</label>
          <input
            id="reduced"
            type="checkbox"
            checked={useReducedMotion}
            onChange={(e) => setUseReducedMotion(e.target.checked)}
            aria-label="Use reduced-motion visual"
          />
        </div>

        <div className="controls-row" style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {!isRunning ? (
            <button
              className="btn btn-primary"
              onClick={start}
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                backgroundColor: "#0a7d6d",
                border: "1px solid #0a7d6d",
                minWidth: 100,
              }}
            >
              Start
            </button>
          ) : (
            <button
              className="btn"
              onClick={pause}
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                backgroundColor: "#e8f3f1",
                border: "1px solid #cfe7e3",
                minWidth: 100,
              }}
            >
              Pause
            </button>
          )}
          <button
            className="btn"
            onClick={reset}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              backgroundColor: "#f7f7f7",
              border: "1px solid #e5e5e5",
              minWidth: 100,
            }}
          >
            Reset
          </button>

          <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, color: "#243a2e" }}>
            <input
              type="checkbox"
              checked={soundOn}
              onChange={(e) => setSoundOn(e.target.checked)}
              aria-label="Enable soft tone on phase change"
            />
            Soft tone
          </label>
        </div>
      </div>

      {/* Visual area */}
      <div className="panel" style={{ marginTop: 16, padding: 20, border: "1px solid #e6f4f1", borderRadius: 16, background: "#ffffff" }}>
        <div aria-live="polite" role="status" style={{ marginBottom: 8, color: "#243a2e" }}>
          {pattern.label} – <strong>{phase}</strong> ({Math.ceil(durationCurrentPhase - elapsedInPhase)}s)
        </div>

        {!useReducedMotion ? (
          <div style={{ display: "grid", placeItems: "center", padding: 20 }}>
            <div
              aria-hidden="true"
              style={{
                width: 180,
                height: 180,
                borderRadius: "50%",
                border: "8px solid #d7ece8",
                background: "#f6fbfa",
                transform: `scale(${scale})`,
                transition: "transform 0.2s linear",
                boxShadow: "0 1px 2px rgba(10,125,109,0.06)",
              }}
            />
          </div>
        ) : (
          <div style={{ padding: "8px 0" }}>
            <div style={{ fontSize: 14, color: "#4a5e54", marginBottom: 6 }}>{phase}</div>
            <div
              aria-hidden="true"
              style={{
                width: "100%",
                height: 14,
                background: "#f0f6f5",
                borderRadius: 999,
                border: "1px solid #d7ece8",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress * 100}%`,
                  background: "#0a7d6d",
                  transition: "width 0.2s linear",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Compact, non-clinical reminder */}
      <div
        style={{
          backgroundColor: "#f7f7f7",
          border: "1px solid #e5e5e5",
          borderRadius: 8,
          padding: 12,
          marginTop: 20,
          fontSize: 12,
          lineHeight: 1.45,
          color: "#4a5e54",
        }}
      >
        This exercise supports self-regulation and is not medical advice or therapy. If you’re in crisis, call <strong>911</strong> (U.S.) or dial/text <strong>988</strong>, or use your local emergency number.
      </div>
    </div>
  );
}