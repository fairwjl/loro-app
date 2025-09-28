import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Bilateral (grounding) – NOT therapy or EMDR processing
 * - Alternating left/right visual highlight; optional soft tone with stereo pan
 * - Start / Pause / Reset
 * - Tempo (cycles/min) and intensity (visual emphasis) controls
 * - "Sliding Beam" option switches visuals to a single bar with a soft blue pulse
 */

export default function BilateralPage() {
  // Settings
  const [cpm, setCpm] = useState(60); // cycles per minute (L+R = 1 cycle)
  const [intensity, setIntensity] = useState(60); // visual emphasis 0–100
  const [soundOn, setSoundOn] = useState(false); // OFF by default
  const [useReducedMotion, setUseReducedMotion] = useState(false); // system pref (not used to hide circles)

  // Toggle for beam view
  const [useBeam, setUseBeam] = useState(false);

  // State machine
  const [isRunning, setIsRunning] = useState(false);
  const [side, setSide] = useState("L"); // "L" | "R"
  const sideRef = useRef("L");           // keeps loop in sync with strikes
  const rafRef = useRef(null);
  const lastTsRef = useRef(null);
  const accRef = useRef(0);              // seconds within current side
  const audioRef = useRef(null);
  const pannerRef = useRef(null);

  // Beam position 0..1 (left→right)
  const [beamProgress, setBeamProgress] = useState(0);

  // Timing
  const secsPerCycle = useMemo(() => (cpm > 0 ? 60 / cpm : 1), [cpm]); // L+R
  const secsPerSide = secsPerCycle / 2;

  // Respect system reduced motion (for other aspects), but do NOT suppress circles
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setUseReducedMotion(mq.matches);
    const listener = (e) => setUseReducedMotion(e.matches);
    mq.addEventListener?.("change", listener);
    return () => mq.removeEventListener?.("change", listener);
  }, []);

  // Soft tone (optional)
  function ping(pan) {
    if (!soundOn) return;
    try {
      if (!audioRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        audioRef.current = ctx;
        pannerRef.current = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      }
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);

      if (pannerRef.current) {
        // 🔊 FIX: invert stereo so left strike = left ear, right strike = right ear
        pannerRef.current.pan.setValueAtTime(-pan, ctx.currentTime);
        osc.connect(gain).connect(pannerRef.current).connect(ctx.destination);
      } else {
        osc.connect(gain).connect(ctx.destination);
      }

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }

  // Animation / timer loop
  useEffect(() => {
    if (!isRunning) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
      accRef.current = 0;
      setBeamProgress(0);
      return;
    }

    const step = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      // Advance per-side clock
      accRef.current += dt;

      // Beam position FIRST (so it visibly reaches the edge)
      const phaseRatio = Math.min(1, accRef.current / secsPerSide); // 0..1 within side
      const pos = sideRef.current === "L" ? phaseRatio : 1 - phaseRatio; // bounce L→R then R→L
      setBeamProgress(pos);

      // Then check for strike & switch side exactly on tempo
      if (accRef.current >= secsPerSide) {
        accRef.current -= secsPerSide; // carry any tiny overrun
        const next = sideRef.current === "L" ? "R" : "L";
        sideRef.current = next;
        setSide(next);
        ping(next === "L" ? -1 : 1);
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isRunning, secsPerSide]); // no other deps changed

  function start() {
    setIsRunning(true);
    setSide("L");
    sideRef.current = "L";
    accRef.current = 0; // start from left edge and move right
  }
  function pause() {
    setIsRunning(false);
  }
  function reset() {
    setIsRunning(false);
    setSide("L");
    sideRef.current = "L";
    accRef.current = 0;
    setBeamProgress(0);
  }

  // Visual tokens
  const activeColor = "#0a7d6d";
  const inactiveBg = "#f0f6f5";
  const border = "#d7ece8";
  const text = "#243a2e";
  const muted = "#4a5e54";

  const scaleEmphasis = 1 + (intensity / 100) * 0.12; // up to +12%
  const glow = `0 0 ${Math.round(6 + (intensity / 100) * 10)}px rgba(10,125,109,0.35)`;

  return (
    <div
      style={{
        fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        color: text,
        maxWidth: 760,
        margin: "0 auto",
        padding: "8px 16px 28px",
      }}
    >
      <h2 className="section-title" style={{ color: text }}>Bilateral (Grounding)</h2>
      <p className="card-text" style={{ color: muted }}>
        A gentle left–right focus to support grounding. This is a soothing exercise only—
        <strong> not therapy or EMDR processing</strong>. Stop anytime if discomfort increases.
      </p>

      {/* Controls */}
      <div className="panel" style={{ marginTop: 12, background: "#fff", border: `1px solid ${border}`, borderRadius: 16, padding: 12 }}>
        <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, alignItems: "center" }}>
          <label htmlFor="tempo" style={{ color: text }}>Tempo (cycles/min)</label>
          <input
            id="tempo"
            type="range"
            min={20}
            max={120}
            step={5}
            value={cpm}
            onChange={(e) => setCpm(parseInt(e.target.value, 10))}
            aria-label="Tempo cycles per minute"
          />
          <div style={{ fontSize: 14, color: muted }}>{cpm}</div>
        </div>

        <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "center", marginTop: 8 }}>
          <label htmlFor="intensity" style={{ color: text }}>Visual intensity</label>
          <input
            id="intensity"
            type="range"
            min={0}
            max={100}
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
            aria-label="Visual intensity"
          />
          <div style={{ fontSize: 14, color: muted }}>{intensity}%</div>
        </div>

        {/* Right-aligned column with two small checkboxes */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label htmlFor="soft-tone" style={{ display: "flex", alignItems: "center", gap: 6, color: text, fontSize: 14 }}>
              <input
                id="soft-tone"
                type="checkbox"
                checked={soundOn}
                onChange={(e) => setSoundOn(e.target.checked)}
                aria-label="Enable soft stereo tone"
                style={{ transform: "scale(0.9)", transformOrigin: "left center" }}
              />
              Soft tone
            </label>

            <label htmlFor="beam" style={{ display: "flex", alignItems: "center", gap: 6, color: text, fontSize: 14 }}>
              <input
                id="beam"
                type="checkbox"
                checked={useBeam}
                onChange={(e) => setUseBeam(e.target.checked)}
                aria-label="Use sliding beam visual"
                style={{ transform: "scale(0.9)", transformOrigin: "left center" }}
              />
              Sliding Beam
            </label>
          </div>
        </div>

        <div className="controls-row" style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {!isRunning ? (
            <button
              className="btn btn-primary"
              onClick={start}
              style={{ padding: "10px 16px", borderRadius: 12, backgroundColor: "#0a7d6d", border: "1px solid #0a7d6d", minWidth: 100 }}
            >
              Start
            </button>
          ) : (
            <button
              className="btn"
              onClick={pause}
              style={{ padding: "10px 16px", borderRadius: 12, backgroundColor: "#e8f3f1", border: `1px solid ${border}`, minWidth: 100 }}
            >
              Pause
            </button>
          )}
          <button
            className="btn"
            onClick={reset}
            style={{ padding: "10px 16px", borderRadius: 12, backgroundColor: "#f7f7f7", border: "1px solid #e5e5e5", minWidth: 100 }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Visual */}
      <div className="panel" style={{ marginTop: 16, padding: 20, border: `1px solid ${border}`, borderRadius: 16, background: "#fff" }}>
        {useBeam ? (
          <SlidingBeam progress={beamProgress} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "center" }}>
            <Bubble active={side === "L"} label="Left" activeColor="#0a7d6d" inactiveBg={inactiveBg} border={border} scaleEmphasis={scaleEmphasis} glow={glow} />
            <Bubble active={side === "R"} label="Right" activeColor="#0a7d6d" inactiveBg={inactiveBg} border={border} scaleEmphasis={scaleEmphasis} glow={glow} />
          </div>
        )}
      </div>

      <p className="note" style={{ marginTop: 8, color: muted }}>
        If you feel overstimulated, pause and try a slower tempo or the sliding beam view.
      </p>

      <div
        style={{
          backgroundColor: "#f7f7f7",
          border: "1px solid #e5e5e5",
          borderRadius: 8,
          padding: 12,
          marginTop: 16,
          fontSize: 12,
          lineHeight: 1.45,
          color: muted,
        }}
      >
        <strong>Important:</strong> This is a self-soothing/grounding aid only and is{" "}
        <strong>not medical advice, psychotherapy, or EMDR therapy</strong>. If you’re in crisis, call{" "}
        <strong>911</strong> (U.S.) or dial/text <strong>988</strong>, or use your local emergency number.
      </div>
    </div>
  );
}

/* ---------- Presentational helpers ---------- */

function Bubble({ active, label, activeColor, inactiveBg, border, scaleEmphasis, glow }) {
  return (
    <div style={{ display: "grid", placeItems: "center", padding: 16 }}>
      <div
        aria-hidden="true"
        style={{
          width: 140,
          height: 140,
          borderRadius: "50%",
          border: `8px solid ${border}`,
          background: inactiveBg,
          transform: active ? `scale(${scaleEmphasis})` : "scale(1)",
          transition: "transform 0.18s linear, box-shadow 0.18s linear, background 0.18s linear",
          boxShadow: active ? glow : "none",
        }}
      />
      <div style={{ marginTop: 8, fontSize: 14, color: "#4a5e54" }}>
        {label} {active ? "●" : "○"}
      </div>
    </div>
  );
}

// Sliding beam visual with soft blue pulse; position tied to per-side timer (bounce)
function SlidingBeam({ progress }) {
  const trackBg = "#f1f6ff";
  const trackBorder = "#dbe8ff";
  const pulseBlue = "#9cc3ff";
  const glow = "0 2px 8px rgba(156,195,255,0.45)";
  const pct = Math.max(0, Math.min(1, progress)) * 100;

  return (
    <div style={{ padding: 8 }}>
      <div
        aria-hidden="true"
        style={{
          position: "relative",
          width: "100%",
          height: 18,
          borderRadius: 999,
          background: trackBg,
          border: `1px solid ${trackBorder}`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `${pct}%`,
            transform: "translateX(-50%)",
            width: 90,
            height: "100%",
            borderRadius: 999,
            background: `linear-gradient(90deg, transparent, ${pulseBlue}, transparent)`,
            boxShadow: glow,
            transition: "left 0s linear", // keep movement exact at all tempos
          }}
        />
      </div>
    </div>
  );
}