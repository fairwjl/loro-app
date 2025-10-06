import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * BreathingPage – trauma-informed, reduced-stimulus paced breathing
 */

const PATTERNS = [
  { key: "box", label: "Box (4-4-4-4)", phases: ["Inhale", "Hold", "Exhale", "Hold"], secs: [4, 4, 4, 4] },
  { key: "478", label: "4-7-8", phases: ["Inhale", "Hold", "Exhale"], secs: [4, 7, 8] },
  { key: "66", label: "Coherent (6-6)", phases: ["Inhale", "Exhale"], secs: [6, 6] },
  { key: "55", label: "Gentle (5-5)", phases: ["Inhale", "Exhale"], secs: [5, 5] },
];

const THEME_KEY = "loro_theme_breathing"; // scoped key so it doesn't affect the whole app

export default function BreathingPage() {
  const [patternKey, setPatternKey] = useState("66");
  const pattern = useMemo(() => PATTERNS.find(p => p.key === patternKey), [patternKey]);

  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [elapsedInPhase, setElapsedInPhase] = useState(0);
  const [useReducedMotion, setUseReducedMotion] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [nightMode, setNightMode] = useState(false); // page-scoped only

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

  // Init page-scoped night mode: use saved value if present,
// otherwise fall back to the global app theme (<html data-theme>).
useEffect(() => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark") return setNightMode(true);
    if (saved === "light") return setNightMode(false);

    const globalTheme = document.documentElement.getAttribute("data-theme");
    setNightMode(globalTheme === "dark");
  } catch {
    const globalTheme = document.documentElement.getAttribute("data-theme");
    setNightMode(globalTheme === "dark");
  }
}, []);

  // WebAudio tone at phase changes (optional)
  function beep() {
    if (!soundOn) return;
    if (!audioRef.current) {
      try {
        audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch { return; }
    }
    const ctx = audioRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
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
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      setElapsedInPhase((prev) => {
        const next = prev + dt;
        if (next >= durationCurrentPhase) {
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
    setPhaseIndex(0);
    setElapsedInPhase(0);
    setIsRunning(true);
    beep();
  }
  function pause() { setIsRunning(false); }
  function reset() { setIsRunning(false); setPhaseIndex(0); setElapsedInPhase(0); }

  // Visuals
  const phase = pattern.phases[phaseIndex];
  const progress = Math.min(1, elapsedInPhase / durationCurrentPhase);
  const baseScale = 1.0;
  let scale = baseScale;
  if (phase === "Inhale") scale = 0.9 + 0.3 * progress;
  else if (phase === "Exhale") scale = 1.2 - 0.3 * progress;

  // Night mode: override CSS variables only within this page wrapper
  const darkVars = nightMode
    ? {
        /* surfaces & text */
        "--bg": "#0f1412",
        "--surface": "#141a18",
        "--surface-muted": "#18201d",
        "--border": "#23302b",
        "--text": "#e7f1ec",
        "--text-muted": "#cbdad4",
        /* accents */
        "--accent": "#4bc1b2",
        "--accent-contrast": "#04110e",
        "--accent-muted": "#10332e",
        "--focus": "#7ee2d6",
        "--panel-shadow": "none",
      }
    : {};

  function toggleNightMode(checked) {
    setNightMode(checked);
    try { localStorage.setItem(THEME_KEY, checked ? "dark" : "light"); } catch {}
  }

  return (
    <div
  style={{
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    color: "var(--text)",
    background: "var(--bg)",          // <-- add this line
    maxWidth: 760,
    margin: "0 auto",
    padding: "8px 16px 28px",
    ...darkVars, // <— page-scoped variable overrides
  }}
    >
      <h2 className="section-title">Breathing</h2>
      <p className="card-text">
  Paced breathing can help settle the nervous system. Choose a pattern, then press Start.
</p>

<div
  style={{
    backgroundColor: "#fff3cd",
    border: "2px solid #856404",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    fontSize: 14,
    lineHeight: 1.5,
    color: "#856404",
  }}
>
  <strong>Important:</strong> For some people, focused breathing can increase anxiety, cause dizziness, 
  or trigger uncomfortable body sensations. This is a normal response for some nervous systems.
  <ul style={{ marginTop: 8, marginBottom: 8, paddingLeft: 20 }}>
    <li>Start with just 1-2 minutes to see how your body responds</li>
    <li>Stop immediately if you feel lightheaded, panicky, or disconnected</li>
    <li>If breathing exercises don't feel right, try other grounding methods instead</li>
  </ul>
  <strong>Skip this tool if:</strong> You have panic disorder, recent trauma involving breathing/choking, 
  or notice that focusing on your breath makes anxiety worse rather than better.
</div>

      {/* Controls */}
      <div
        className="panel"
        style={{
          marginTop: 12,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: 12,
        }}
      >
        <div
          className="form-row"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr auto auto",
            gap: 8,
            alignItems: "center",
          }}
        >
          <label htmlFor="pattern">Pattern</label>
          <select
            id="pattern"
            value={patternKey}
            onChange={(e) => { setPatternKey(e.target.value); reset(); }}
            style={{ borderRadius: 10, padding: "8px 10px", border: "1px solid var(--border)" }}
          >
            {PATTERNS.map(p => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>

          <label htmlFor="reduced" style={{ justifySelf: "end" }}>Reduced motion</label>
          <input
            id="reduced"
            type="checkbox"
            checked={useReducedMotion}
            onChange={(e) => setUseReducedMotion(e.target.checked)}
            aria-label="Use reduced-motion visual"
          />
        </div>

        {/* Night mode toggle (page-scoped) */}
        <div
          className="form-row"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 8,
            color: "var(--text)",
          }}
        >
          <label htmlFor="nightmode" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              id="nightmode"
              type="checkbox"
              checked={nightMode}
              onChange={(e) => toggleNightMode(e.target.checked)}
              aria-label="Toggle night mode (dark theme) for this page"
              style={{ transform: "scale(0.9)", transformOrigin: "left center" }}
            />
            Night mode
          </label>

          <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={soundOn}
              onChange={(e) => setSoundOn(e.target.checked)}
              aria-label="Enable soft tone on phase change"
              style={{ transform: "scale(0.9)", transformOrigin: "left center" }}
            />
            Soft tone
          </label>
        </div>

        <div className="controls-row" style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {!isRunning ? (
            <button className="btn btn-primary" onClick={start} style={{ padding: "10px 16px", borderRadius: 12, minWidth: 100 }}>
              Start
            </button>
          ) : (
            <button className="btn" onClick={pause} style={{ padding: "10px 16px", borderRadius: 12, backgroundColor: "var(--surface-muted)", border: "1px solid var(--border)", minWidth: 100 }}>
              Pause
            </button>
          )}
          <button className="btn" onClick={reset} style={{ padding: "10px 16px", borderRadius: 12, backgroundColor: "var(--surface-muted)", border: "1px solid var(--border)", minWidth: 100 }}>
            Reset
          </button>
        </div>
      </div>

      {/* Visual area */}
      <div className="panel" style={{ marginTop: 16, padding: 20, border: "1px solid var(--border)", borderRadius: 16, background: "var(--surface)" }}>
        <div aria-live="polite" role="status" style={{ marginBottom: 8 }}>
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
                border: "8px solid var(--accent-muted)",
                background: "var(--accent-muted)",
                transform: `scale(${scale})`,
                transition: "transform 0.2s linear",
                boxShadow: "var(--panel-shadow)",
              }}
            />
          </div>
        ) : (
          <div style={{ padding: "8px 0" }}>
            <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 6 }}>{phase}</div>
            <div
              aria-hidden="true"
              style={{
                width: "100%",
                height: 14,
                background: "var(--surface-muted)",
                borderRadius: 999,
                border: "1px solid var(--border)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress * 100}%`,
                  background: "var(--accent)",
                  transition: "width 0.2s linear",
                }}
              />
            </div>
          </div>
        )}
      </div>
<div style={{ 
  marginTop: 12, 
  padding: 10, 
  backgroundColor: 'var(--surface-muted)', 
  border: '1px solid var(--border)', 
  borderRadius: 8,
  fontSize: 13,
  color: 'var(--text-muted)'
}}>
  Remember: You can stop anytime. If this doesn't feel helpful, that's okay—different tools work for different people.
</div>
      {/* Compact reminder */}
      <div
        style={{
          backgroundColor: "var(--surface-muted)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 12,
          marginTop: 20,
          fontSize: 12,
          lineHeight: 1.45,
          color: "var(--text-muted)",
        }}
      >
        This exercise supports self-regulation and is not medical advice or therapy. If you’re in crisis, call <strong>911</strong> (U.S.) or dial/text <strong>988</strong>, or use your local emergency number.
      </div>
    </div>
  );
}