// client/src/components/BLS.jsx
import { useEffect, useRef, useState } from "react";
import { loadJSON, saveJSON } from "../lib/storage.js";

/**
 * BLS (Bilateral Stimulation)
 * - Visual: CSS keyframes move the dot L↔R continuously (no JS motion)
 * - Audio: short pulses each side toggle (clicks or sine burst)
 * - Haptics: optional brief vibration each side toggle
 * - SUDS logging → Effectiveness
 */

const EFFECT_KEY = "effect:sessions";
const PREFS_KEY  = "bls:prefs";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function BLS() {
  // Preferences (persisted)
  const [speed, setSpeed]       = useState(60);        // sweeps/min (L→R→L)
  const [duration, setDuration] = useState(120);       // seconds
  const [dotSize, setDotSize]   = useState(18);
  const [dotColor, setDotColor] = useState("#22d3ee");
  const [audioOn, setAudioOn]   = useState(false);
  const [volume, setVolume]     = useState(0.3);
  const [toneHz, setToneHz]     = useState(440);       // 0=clicks, >0 short sine
  const [invertAudio, setInvertAudio] = useState(true); // always ON
  const [vibrateOn, setVibrateOn]     = useState(false);

  // Session
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // SUDS
  const [before, setBefore] = useState(6);
  const [after,  setAfter]  = useState(3);
  const [msg, setMsg]       = useState("");

  // Refs for timers/audio
  const secondTimerRef = useRef(null);
  const stopTimerRef   = useRef(null);

  // NEW: sync with CSS animation
  const dotRef           = useRef(null);
  const halfTimeoutRef   = useRef(null);
  const halfMsRef        = useRef((60 / clamp(speed, 10, 180)) * 500); // ms

  // Audio chain refs
  const audioCtxRef = useRef(null);
  const gainRef     = useRef(null);
  const panRef      = useRef(null);
  const clickBufRef = useRef(null);
  const currentSideRef = useRef("left");

  // Live value refs for real-time adjustments
  const toneHzRef  = useRef(toneHz);
  const volumeRef  = useRef(volume);
  const speedRef   = useRef(speed);

  useEffect(() => { toneHzRef.current = toneHz; }, [toneHz]);
  useEffect(() => { speedRef.current  = speed;  }, [speed]);
  useEffect(() => {
    volumeRef.current = volume;
    if (gainRef.current && audioCtxRef.current) {
      try { gainRef.current.gain.setValueAtTime(clamp(volume, 0, 1), audioCtxRef.current.currentTime); } catch {}
    }
  }, [volume]);

  // Keep half-duration (ms) updated
  useEffect(() => {
    const sweepSec = 60 / clamp(speed, 10, 180);
    halfMsRef.current = (sweepSec / 2) * 1000;
  }, [speed]);

  // Load prefs (force invertAudio true)
  useEffect(() => {
    const p = loadJSON(PREFS_KEY, null);
    if (p) {
      setSpeed(p.speed ?? 60);
      setDuration(p.duration ?? 120);
      setDotSize(p.dotSize ?? 18);
      setDotColor(p.dotColor ?? "#22d3ee");
      setAudioOn(!!p.audioOn);
      setVolume(p.volume ?? 0.3);
      setToneHz(p.toneHz ?? 440);
      setInvertAudio(true); // forced ON
      setVibrateOn(!!p.vibrateOn);
    }
  }, []);

  // Save prefs (invertAudio always true)
  useEffect(() => {
    saveJSON(PREFS_KEY, {
      speed, duration, dotSize, dotColor,
      audioOn, volume, toneHz, invertAudio, vibrateOn
    });
  }, [speed, duration, dotSize, dotColor, audioOn, volume, toneHz, invertAudio, vibrateOn]);

  // Build a tiny click buffer **in the given context**
  const buildClickBuffer = (ctx) => {
    const len = Math.floor(ctx.sampleRate * 0.02); // 20ms
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch  = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      ch[i] = (1 - i / len) * Math.sin(2 * Math.PI * 1000 * (i / ctx.sampleRate));
    }
    return buf;
  };

  const start = async () => {
    stop(); // clean any previous
    setElapsed(0);
    currentSideRef.current = "left";

    // Audio
    if (audioOn && (window.AudioContext || window.webkitAudioContext)) {
      const AC  = window.AudioContext || window.webkitAudioContext;
      const ctx = audioCtxRef.current ?? new AC();
      audioCtxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.value = clamp(volumeRef.current, 0, 1);
      gainRef.current = gain;

      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      panRef.current = panner;

      if (panner) panner.connect(gain), gain.connect(ctx.destination);
      else gain.connect(ctx.destination);

      clickBufRef.current = buildClickBuffer(ctx);

      if (ctx.state === "suspended") {
        try { await ctx.resume(); } catch {}
      }
    }

    // Kick off left-edge pulse immediately to align with animation
    if (audioOn) pulse("left");

    // Count elapsed seconds + auto-stop
    secondTimerRef.current = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        return next >= duration ? duration : next;
      });
    }, 1000);

    stopTimerRef.current = setTimeout(() => {
      stop();
    }, duration * 1000);

    setRunning(true);
  };

  const stop = () => {
    setRunning(false);
    if (secondTimerRef.current) clearInterval(secondTimerRef.current);
    if (stopTimerRef.current)   clearTimeout(stopTimerRef.current);
    if (halfTimeoutRef.current) clearTimeout(halfTimeoutRef.current);
    secondTimerRef.current = null;
    stopTimerRef.current   = null;
    halfTimeoutRef.current = null;
  };

  useEffect(() => () => stop(), []);

  // === SYNC WITH CSS ANIMATION ===
  // Left edge = animation start/iteration. Right edge = half-duration later.
  useEffect(() => {
    const el = dotRef.current;
    if (!el) return;

    const atLeft = () => {
      currentSideRef.current = "left";
      if (audioOn) pulse("left");
      if (halfTimeoutRef.current) clearTimeout(halfTimeoutRef.current);
      halfTimeoutRef.current = setTimeout(() => {
        currentSideRef.current = "right";
        if (audioOn) pulse("right");
        if (vibrateOn && "vibrate" in navigator) navigator.vibrate?.(10);
      }, halfMsRef.current);
    };

    if (running) {
      // When animation (re)starts, treat as left-edge
      el.addEventListener("animationstart", atLeft);
      el.addEventListener("animationiteration", atLeft);
    }

    return () => {
      el.removeEventListener("animationstart", atLeft);
      el.removeEventListener("animationiteration", atLeft);
      if (halfTimeoutRef.current) clearTimeout(halfTimeoutRef.current);
    };
  }, [running, audioOn, vibrateOn]); // speed is handled via halfMsRef

  // Audio pulse on a side
  const pulse = (side) => {
    if (!audioOn || !audioCtxRef.current || !gainRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    // Pan (inverted permanently for correct alignment)
    if (panRef.current) {
      const dir = side === "left" ? +1 : -1; // inverted always ON
      panRef.current.pan.setValueAtTime(dir, now);
    }

    const hz  = toneHzRef.current;
    const vol = clamp(volumeRef.current, 0, 1);

    if (hz > 0) {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(hz, now);

      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.01);
      g.gain.linearRampToValueAtTime(0,   now + 0.09);

      osc.connect(g);
      if (panRef.current) g.connect(panRef.current);
      else g.connect(gainRef.current);

      osc.start(now);
      osc.stop(now + 0.1);
    } else if (clickBufRef.current) {
      const src = ctx.createBufferSource();
      src.buffer = clickBufRef.current;
      if (panRef.current) src.connect(panRef.current);
      else src.connect(gainRef.current);
      src.start(now);
    }
  };

  // Logging
  const logEffect = () => {
    const b = Number(before);
    const a = Number(after);
    const delta = b - a;
    const now = new Date();
    const row = {
      tool: "Bilateral Stim",
      before: b,
      after: a,
      delta,
      dateISO: now.toISOString().slice(0, 10),
      ts: now.getTime(),
      origin: "manual",
      notes: `SPM ${speed}, dur ${duration}s, ${toneHz > 0 ? `${toneHz}Hz` : "clicks"}`,
    };
    const cur  = loadJSON(EFFECT_KEY, []);
    const next = [row, ...cur].slice(0, 1000);
    saveJSON(EFFECT_KEY, next);
    setMsg("Logged to Effectiveness ✓");
    setTimeout(() => setMsg(""), 1100);
  };

  // Render
  const sweepSeconds = 60 / clamp(speed, 10, 180);

  return (
    <section className="card">
      {/* Keyframes injected once (scoped) */}
      <style>
        {`
        @keyframes bls-sweep {
          0%   { left: 8px; }
          50%  { left: calc(100% - 8px); transform: translate(-100%, -50%); }
          100% { left: 8px; transform: translate(0, -50%); }
        }
        `}
      </style>

      <h2>Bilateral Stimulation</h2>
      <p className="muted" style={{ marginTop: -6 }}>
        Visual dot alternates left ↔ right. Optional audio pulses and brief vibration on side change.
      </p>

      {/* SUDS */}
      <div className="form-grid" style={{ marginTop: 6 }}>
        <label>
          SUDS before (0–10)
          <input type="range" min="0" max="10" value={before} onChange={(e) => setBefore(e.target.value)} />
          <div className="muted">Current: {before}</div>
        </label>
        <label>
          SUDS after (0–10)
          <input type="range" min="0" max="10" value={after} onChange={(e) => setAfter(e.target.value)} />
          <div className="muted">Current: {after} (Δ {Number(before) - Number(after)})</div>
        </label>
      </div>
      <div className="actions" style={{ gap: 8 }}>
        <button onClick={logEffect}>Save to Effectiveness</button>
        {msg && <span className="muted">{msg}</span>}
      </div>

      {/* Settings */}
      <h3 style={{ marginTop: 12 }}>Settings</h3>
      <div className="form-grid">
        <label>
          Speed (sweeps per minute)
          <input type="range" min="10" max="180" value={speed} onChange={(e)=>setSpeed(Number(e.target.value))} />
          <div className="muted">{speed} SPM</div>
        </label>
        <label>
          Duration (seconds)
          <input type="range" min="30" max="600" value={duration} onChange={(e)=>setDuration(Number(e.target.value))} />
          <div className="muted">{duration}s</div>
        </label>
        <label>
          Dot size
          <input type="range" min="10" max="36" value={dotSize} onChange={(e)=>setDotSize(Number(e.target.value))} />
          <div className="muted">{dotSize}px</div>
        </label>
        <label>
          Dot color
          <input type="color" value={dotColor} onChange={(e)=>setDotColor(e.target.value)} />
        </label>

        <div style={{ gridColumn: "1 / -1" }}>
          <div className="list">
            <div className="list-row" style={{ justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
              <label style={{ display:"flex", alignItems:"center", gap:8 }}>
                <input type="checkbox" checked={audioOn} onChange={(e)=>setAudioOn(e.target.checked)} />
                Enable audio pulses
              </label>
              <div className="muted">Tip: tap “Test Audio” once on iPhone to unlock audio.</div>
            </div>

            <div className="list-row" style={{ gap:16, flexWrap:"wrap" }}>
              <label>
                Volume
                <input type="range" min="0" max="1" step="0.05"
                       value={volume} onChange={(e)=>setVolume(Number(e.target.value))} />
              </label>

              <label>
                Tone Frequency (Hz, 0 = clicks)
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <button type="button" aria-label="Decrease tone"
                          onClick={()=>setToneHz(h=>clamp(h-10,0,1200))}
                          style={{ width:28, height:32, borderRadius:8, border:"1px solid var(--border)",
                                   background:"var(--panel)", color:"var(--text)",
                                   display:"inline-flex", alignItems:"center", justifyContent:"center",
                                   lineHeight:1, padding:0, fontSize:16, fontWeight:600 }}>-</button>
                  <input type="number" min="0" max="1200" step="10" value={toneHz}
                         onChange={(e)=>setToneHz(clamp(Number(e.target.value),0,1200))}
                         style={{ width:90, textAlign:"center" }} />
                  <button type="button" aria-label="Increase tone"
                          onClick={()=>setToneHz(h=>clamp(h+10,0,1200))}
                          style={{ width:28, height:32, borderRadius:8, border:"1px solid var(--border)",
                                   background:"var(--panel)", color:"var(--text)",
                                   display:"inline-flex", alignItems:"center", justifyContent:"center",
                                   lineHeight:1, padding:0, fontSize:16, fontWeight:600 }}>+</button>
                </div>
              </label>

              {/* Invert audio UI removed earlier (always on) */}
              <button type="button" onClick={start} className="secondary">Test Audio</button>
              <span className="muted">Audio: {audioOn ? "on" : "off"}</span>
            </div>

            <label className="list-row" style={{ alignItems:"center", gap:8 }}>
              <input type="checkbox" checked={vibrateOn} onChange={(e)=>setVibrateOn(e.target.checked)} />
              Enable brief vibration (mobile)
            </label>
          </div>
        </div>
      </div>

      {/* Track + Dot (animated by CSS) */}
      <div
        aria-label="bls visual track"
        style={{
          position: "relative",
          height: 56,
          borderRadius: 16,
          border: "1px solid var(--border)",
          background: "linear-gradient(90deg, rgba(255,255,255,.02), rgba(255,255,255,.04))",
          marginTop: 12,
          overflow: "hidden",
        }}
      >
        <div
          ref={dotRef}
          style={{
            position: "absolute",
            top: "50%",
            transform: "translate(0, -50%)",
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize,
            background: dotColor,
            boxShadow: `0 0 ${Math.floor(dotSize / 1.5)}px ${dotColor}80`,
            animationName: "bls-sweep",
            animationDuration: `${sweepSeconds.toFixed(3)}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationPlayState: running ? "running" : "paused",
          }}
        />
      </div>

      {/* Transport */}
      <div className="actions" style={{ gap: 8, marginTop: 12 }}>
        {!running ? (
          <button onClick={start}>Start</button>
        ) : (
          <button className="secondary danger" onClick={stop}>Stop</button>
        )}
        <span className="muted">Elapsed: {elapsed}s / {duration}s</span>
      </div>

      <p className="note" style={{ marginTop: 10 }}>
        Safety: Use a comfortable speed. Stop if you feel dizzy, nauseous, or strained.
      </p>
    </section>
  );
}