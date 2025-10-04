// client/src/pages/MusicPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * MusicPage (trauma-informed, non-directive)
 * - Lists tracks and lets user play/stop
 * - Works even if some files 404 (shows 'Upload pending or unavailable')
 * - Handles filenames with spaces/& via encodeURI
 * Files must live under /public/audio so they are served at /audio/...
 */

const TRACKS = [
  {
    id: "stone-beach-waves",
    title: "Stone Beach Waves (ocean)",
    // mp3 only (as provided)
    srcs: [
      "/audio/ES_ASMR%20Stone%20Beach%20Waves%20-%20Joseph%20Beg%20%28Version%208a7e01fe%29%20-%20fullmix_high_quality.mp3",
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
    id: "raga-for-stillness",
    title: "Raga for Stillness — Aks & Lakshmi",
    srcs: [
      "/audio/ES_Raga for Stillness - Aks & Lakshmi.mp3",
      "/audio/ES_Raga for Stillness - Aks & Lakshmi.wav",
    ],
  },
  {
    id: "walk-in-the-forest",
    title: "Walk in the Forest — Center of Attention",
    srcs: [
      "/audio/ES_Walk in the Forest - Center of Attention.mp3",
      "/audio/ES_Walk in the Forest - Center of Attention.wav",
    ],
  },
];

function pickPlayableSrc(audioEl, srcs) {
  const mimeByExt = (src) => {
    if (src.endsWith(".mp3")) return "audio/mpeg";
    if (src.endsWith(".ogg")) return "audio/ogg";
    if (src.endsWith(".wav")) return "audio/wav";
    return "";
  };
  for (const src of srcs || []) {
    const mime = mimeByExt(src);
    if (!mime || audioEl.canPlayType(mime)) return src;
  }
  return null;
}

export default function MusicPage() {
  const [activeId, setActiveId] = useState(null);
  const [unavailable, setUnavailable] = useState({}); // {id: true}
  const audioRef = useRef(null);

  const activeTrack = useMemo(
    () => TRACKS.find((t) => t.id === activeId) || null,
    [activeId]
  );

  useEffect(() => {
    // clean up audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
      }
    };
  }, []);

  function playTrack(track) {
    setActiveId(track.id);

    if (!audioRef.current) {
      audioRef.current = new Audio();
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

    a.src = encodeURI(src); // handle spaces/& etc
    a.loop = false; // simple player for now
    a.load();
    a.play().catch(() => {
      setUnavailable((prev) => ({ ...prev, [track.id]: true }));
      stopPlayback();
    });
  }

  function togglePlayPause() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().catch(() => {});
    } else {
      a.pause();
    }
  }

  function stopPlayback() {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
  }

  return (
    <div className="page-container">
      <h2 className="section-title">Music</h2>
      <p className="card-text" style={{ marginTop: -6 }}>
        A calm space for supportive audio during breathing, meditation, or bilateral activities.
        You choose what helps. Options here aim to be gentle and steady.
      </p>

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