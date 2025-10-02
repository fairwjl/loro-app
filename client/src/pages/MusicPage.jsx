// client/src/pages/MusicPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * MusicPage
 * - Trauma-informed copy (no clinical claims)
 * - Simple audio player list
 * - Loop toggle, and 10-minute session mode (auto-stop at 10:00)
 *
 * To add tracks, place MP3/OGG files in /public/audio and update the TRACKS array below.
 * Example path: client/public/audio/soft-waves.mp3  ->  src: "/audio/soft-waves.mp3"
 */

// ▼ Add or rename files in /public/audio, then update these:
// ▼ List multiple sources per track (order = preference)
const TRACKS = [
  {
    id: "soft-waves",
    title: "Soft Waves (calming)",
    srcs: ["/audio/soft-waves.mp3", "/audio/soft-waves.wav"],
  },
  {
    id: "slow-binaural",
    title: "Slow Binaural (gentle bilateral feel)",
    srcs: ["/audio/slow-binaural.mp3", "/audio/slow-binaural.wav"],
  },
  {
    id: "warm-drone",
    title: "Warm Drone (steady)",
    srcs: ["/audio/warm-drone.mp3", "/audio/warm-drone.wav"],
  },
];

function secondsToMMSS(s) {
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${mm}:${ss}`;
}
// Pick the first playable source based on browser support
function pickPlayableSrc(audioEl, srcs) {
  const mimeByExt = (src) => {
    if (src.endsWith(".mp3")) return "audio/mpeg";
    if (src.endsWith(".ogg")) return "audio/ogg";
    if (src.endsWith(".wav")) return "audio/wav";
    return "";
  };
  for (const src of srcs) {
    const mime = mimeByExt(src);
    // If we don't know the MIME, try anyway; otherwise ask the browser.
    if (!mime || audioEl.canPlayType(mime)) return src;
  }
  return null;
}
export default function MusicPage() {
  const [activeId, setActiveId] = useState(null);
  const [isLoop, setIsLoop] = useState(false);
  const [useTenMinutes, setUseTenMinutes] = useState(true);
  const [elapsed, setElapsed] = useState(0); // session clock
  const [unavailable, setUnavailable] = useState({}); // {id: true} for files that 404, etc.

  const audioRef = useRef(null);
  const rafRef = useRef(null);
  const sessionStartRef = useRef(null);

  const activeTrack = useMemo(
    () => TRACKS.find(t => t.id === activeId) || null,
    [activeId]
  );

  // Clear RAF on unmount
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
        // stop at 10:00
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

  // Create or reuse audio element
  if (!audioRef.current) {
    audioRef.current = new Audio();
    audioRef.current.addEventListener("ended", () => {
      // Loop is handled by HTMLAudioElement.loop; session clock stops at 10:00 if enabled.
    });
    audioRef.current.addEventListener("error", () => {
      setUnavailable((prev) => ({ ...prev, [track.id]: true }));
      stopPlayback();
    });
  }

  const a = audioRef.current;
  const src = pickPlayableSrc(a, track.srcs || []);
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
  }

  function setLoop(checked) {
    setIsLoop(checked);
    if (audioRef.current) audioRef.current.loop = checked;
  }

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
                  {disabled && (
  <div className="note">
    Upload pending or unavailable. ({(t.srcs || []).join(" or ")})
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