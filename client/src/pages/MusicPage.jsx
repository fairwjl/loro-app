// client/src/pages/MusicPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * MusicPage
 * - Trauma-informed copy (no clinical claims)
 * - Simple audio player list
 * - Loop toggle + 10-minute session timer (your current behavior)
 *
 * NOTE: Only include tracks that actually exist in /public/audio and are appropriate.
 * You can add more items to TRACKS later once they’re verified.
 */

// List the tracks we know exist in /public/audio right now
// Each track can list multiple sources; the player will pick what the browser can play.
// ▼ EXACT files you copied into /public/audio (kept as-is)
const TRACKS = [
  {
    id: "stone-waves",
    title: "ASMR Stone Beach Waves — Joseph Beg",
    // already percent-encoded in the filename on disk
    srcs: [
      "/audio/ES_ASMR%20Stone%20Beach%20Waves%20-%20Joseph%20Beg%20%28Version%208a7e01fe%29%20-%20fullmix_high_quality.mp3"
    ],
  },
  {
    id: "ever-so-blue",
    title: "Calme — Ever So Blue",
    srcs: [
      "/audio/ES_Calme - Ever So Blue.mp3",
      "/audio/ES_Calme - Ever So Blue.wav",
    ],
  },
  {
    id: "calming-crystals",
    title: "Calming Crystals — Rocket Noise",
    srcs: [
      "/audio/ES_Calming Crystals - Rocket Noise.mp3",
      "/audio/ES_Calming Crystals - Rocket Noise.wav",
    ],
  },
  {
    id: "calming-horizons",
    title: "Calming Horizons — Staffan Carlen",
    srcs: [
      "/audio/ES_Calming Horizons - Staffan Carlen.mp3",
      "/audio/ES_Calming Horizons - Staffan Carlen.wav",
    ],
  },
  {
    id: "raga-stillness",
    title: "Raga for Stillness — Aks & Lakshmi",
    srcs: [
      "/audio/ES_Raga for Stillness - Aks & Lakshmi.mp3",
      "/audio/ES_Raga for Stillness - Aks & Lakshmi.wav",
    ],
  },
  {
    id: "walk-forest",
    title: "Walk in the Forest — Center of Attention",
    srcs: [
      "/audio/ES_Walk in the Forest - Center of Attention.mp3",
      "/audio/ES_Walk in the Forest - Center of Attention.wav",
    ],
  },
];

// --- helpers ---
function secondsToMMSS(s) {
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${mm}:${ss}`;
}

// Pick the first playable source and ensure it’s URL-safe (spaces, UTF-8, etc.)
function pickPlayableSrc(audioEl, srcs) {
  const mimeByExt = (src) => {
    if (src.toLowerCase().endsWith(".mp3")) return "audio/mpeg";
    if (src.toLowerCase().endsWith(".ogg")) return "audio/ogg";
    if (src.toLowerCase().endsWith(".wav")) return "audio/wav";
    return "";
  };
  for (const raw of srcs) {
    // encodeURI keeps existing % sequences (so filenames that already contain %28/%29 remain valid)
    const encoded = encodeURI(raw);
    const mime = mimeByExt(encoded);
    if (!mime || audioEl.canPlayType(mime)) return encoded;
  }
  return null;
}

export default function MusicPage() {
  const [activeId, setActiveId] = useState(null);
  const [isLoop, setIsLoop] = useState(false);
  const [useTenMinutes, setUseTenMinutes] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [unavailable, setUnavailable] = useState({}); // {id: true}

  const audioRef = useRef(null);
  const rafRef = useRef(null);
  const sessionStartRef = useRef(null);

  const activeTrack = useMemo(
    () => TRACKS.find((t) => t.id === activeId) || null,
    [activeId]
  );

  // clear RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function startSessionClock() {
    sessionStartRef.current = performance.now();
    setElapsed(0);
    const tick = (ts) => {
      const started = sessionStartRef.current ?? ts;
      const delta = (ts - started) / 1000;
      setElapsed(delta);
      if (useTenMinutes && delta >= 600) {
        // Stop exactly at 10:00
        stopPlayback();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function stopSessionClock() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    sessionStartRef.current = null;
    setElapsed(0);
  }

  function playTrack(track) {
    setActiveId(track.id);
    setElapsed(0);

    // (re)use one audio element
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener("ended", () => {
        // loop is handled by element.loop if enabled
      });
      audioRef.current.addEventListener("error", () => {
        setUnavailable((prev) => ({ ...prev, [track.id]: true }));
        stopPlayback();
      });
    }

    const a = audioRef.current;
    const src = pickPlayableSrc(a, track.srcs);
    if (!src) {
      setUnavailable((prev) => ({ ...prev, [track.id]: true }));
      stopPlayback();
      return;
    }

    a.src = src;
    a.loop = isLoop;
    a.load();

    a.play()
      .then(() => {
        startSessionClock();
      })
      .catch(() => {
        setUnavailable((prev) => ({ ...prev, [track.id]: true }));
        stopPlayback();
      });
  }

  function togglePlayPause() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().catch(() => {});
      if (!rafRef.current) startSessionClock();
    } else {
      a.pause();
      stopSessionClock();
    }
  }

  function stopPlayback() {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
    stopSessionClock();
    setActiveId(null);
  }

  function setLoop(checked) {
    setIsLoop(checked);
    if (audioRef.current) audioRef.current.loop = checked;
  }

  // --- render ---
  return (
    <div className="page-container">
      <h2 className="section-title">Music</h2>
      <p className="card-text" style={{ marginTop: -6 }}>
        A calm space for supportive audio during breathing, meditation, or bilateral activities.
        You choose what helps. Options here aim to be gentle and steady.
      </p>

      {/* Controls */}
      <div className="panel" style={{ padding: 12, marginTop: 12 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={useTenMinutes}
              onChange={(e) => setUseTenMinutes(e.target.checked)}
            />
            10-minute session
          </label>
          <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={isLoop} onChange={(e) => setLoop(e.target.checked)} />
            Loop track
          </label>

          <div
            className="note"
            aria-live="polite"
            style={{ marginLeft: "auto", minWidth: 120, textAlign: "right" }}
          >
            {useTenMinutes ? `${secondsToMMSS(elapsed)} / 10:00` : secondsToMMSS(elapsed)}
          </div>
        </div>
      </div>

      {/* Track list */}
      <div className="panel" style={{ padding: 12, marginTop: 12 }}>
        <div style={{ display: "grid", gap: 10 }}>
          {TRACKS.map((t) => {
            const isActive = activeId === t.id;
            const disabled = !!unavailable[t.id];

            return (
              <div
                key={t.id}
                className="panel"
                style={{
                  padding: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  opacity: disabled ? 0.6 : 1,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div className="card-title" style={{ margin: 0 }}>
                    {t.title}
                  </div>
                  {t.credit && (
                    <div className="note" style={{ fontSize: 12, marginTop: 2 }}>
                      {t.credit}
                    </div>
                  )}
                  {disabled && (
                    <div className="note">
                      Upload pending or unavailable. {(t.srcs || []).join(" or ")}
                    </div>
                  )}
                </div>

                {!isActive ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => !disabled && playTrack(t)}
                    disabled={disabled}
                    aria-label={`Play ${t.title}`}
                  >
                    Play
                  </button>
                ) : (
                  <>
                    <button
                      className="btn"
                      onClick={togglePlayPause}
                      aria-label="Play/pause"
                      style={{ minWidth: 92 }}
                    >
                      Play/Pause
                    </button>
                    <button className="btn" onClick={stopPlayback} aria-label="Stop">
                      Stop
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scope / safety microcopy */}
      <div
        className="panel"
        style={{
          marginTop: 16,
          fontSize: 12,
          color: "var(--text-muted)",
          background: "var(--surface-muted)",
        }}
      >
        <p style={{ margin: "4px 0" }}>
          This feature supports grounding and self-regulation. It isn’t medical advice or therapy.
          If you’re in crisis, call <strong>911</strong> (U.S.), dial or text <strong>988</strong>,
          or use your local emergency number.
        </p>
      </div>
    </div>
  );
}